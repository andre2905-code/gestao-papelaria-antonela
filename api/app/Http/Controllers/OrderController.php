<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        return response()->json(
            Order::with(['customer', 'items.product', 'items.deposit'])->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedData($request);

        $order = DB::transaction(function () use ($data): Order {
            $order = Order::create([
                'customer_id' => $data['customer_id'],
                'status' => $data['status'] ?? 'pending',
                'payment_method' => $data['payment_method'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            $this->syncItems($order, $data['items']);

            return $order->fresh()->load(['customer', 'items.product', 'items.deposit']);
        });

        return response()->json($order, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order): JsonResponse
    {
        $data = $this->validatedData($request, true);

        $order = DB::transaction(function () use ($data, $order): Order {
            $attributes = collect($data)
                ->only(['customer_id', 'status', 'payment_method', 'notes'])
                ->all();

            if ($attributes !== []) {
                $order->update($attributes);
            }

            if (array_key_exists('items', $data)) {
                $this->syncItems($order, $data['items']);
            }

            return $order->fresh()->load(['customer', 'items.product', 'items.deposit']);
        });

        return response()->json($order);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order): JsonResponse
    {
        $order->delete();

        return response()->json([
            'success' => true,
            'data' => [],
            'message' => 'Pedido excluído com sucesso.',
            'errors' => [],
        ]);
    }

    private function validatedData(Request $request, bool $isUpdate = false): array
    {
        $presence = $isUpdate ? 'sometimes' : 'required';

        return $request->validate([
            'customer_id' => [
                $presence,
                'integer',
                Rule::exists('customers', 'id')
                    ->where('is_active', true),
            ],
            'status' => ['sometimes', Rule::in([
                'pending',
                'confirmed',
                'cancelled',
            ])],
            'payment_method' => [
                $isUpdate ? 'sometimes' : 'nullable',
                'nullable',
                Rule::in(['cash', 'credit_card', 'debit_card', 'pix']),
            ],
            'notes' => [$isUpdate ? 'sometimes' : 'nullable', 'nullable', 'string'],
            'items' => [
                $isUpdate ? 'sometimes' : 'required',
                'array',
                'min:1',
            ],
            'items.*' => ['required', 'array:product_id,deposit_id,quantity'],
            'items.*.product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')
                    ->where('is_active', true),
            ],
            'items.*.deposit_id' => [
                'required',
                'integer',
                Rule::exists('deposits', 'id')
                    ->where('is_active', true),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);
    }

    private function syncItems(Order $order, array $items): void
    {
        $products = Product::query()
            ->whereIn('id', collect($items)->pluck('product_id'))
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        $order->items()->delete();

        $order->items()->createMany(collect($items)->map(function (array $item) use ($products): array {
            $quantity = (int) $item['quantity'];
            $product = $products->get($item['product_id']);

            if ($product === null) {
                throw (new ModelNotFoundException)->setModel(Product::class, [$item['product_id']]);
            }

            $unitPrice = (float) ($product->promo_price ?? $product->price);

            return [
                'product_id' => $item['product_id'],
                'deposit_id' => $item['deposit_id'],
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'subtotal' => round($quantity * $unitPrice, 2),
            ];
        })->all());

        $order->update([
            'total' => round((float) $order->items()->sum('subtotal'), 2),
        ]);
    }
}
