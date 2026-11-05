<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            Product::with(['category', 'deposits'])->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255', 'unique:products,title'],
            'price' => ['required', 'decimal:0,2', 'min:0'],
            'promo_price' => ['nullable', 'decimal:0,2', 'min:0', 'lt:price'],
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')
                    ->where('is_active', true),
            ],
            'deposits' => ['required', 'array', 'min:1'],
            'deposits.*' => ['required', 'array:id,quantity'],
            'deposits.*.id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('deposits', 'id')
                    ->where('is_active', true),
            ],
            'deposits.*.quantity' => [
                'required',
                'integer',
                'min:1',
            ],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
        ]);

        $product = DB::transaction(function () use ($data): Product {
            $product = Product::create([
                'title' => $data['title'],
                'category_id' => $data['category_id'],
                'price' => $data['price'],
                'promo_price' => $data['promo_price'] ?? null,
                'sku' => $data['sku'],
                'is_active' => true,
            ]);

            $deposits = collect($data['deposits'])
                ->mapWithKeys(fn(array $deposit): array => [
                    $deposit['id'] => [
                        'quantity' => $deposit['quantity'],
                    ],
                ])
                ->all();

            $product->deposits()->sync($deposits);

            return $product->fresh()->load(['category', 'deposits']);
        });

        return response()->json($product, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'title' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('products', 'title')->ignore($product->id),
            ],
            'price' => ['sometimes', 'decimal:0,2', 'min:0'],
            'promo_price' => ['sometimes', 'nullable', 'decimal:0,2', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'category_id' => [
                'sometimes',
                'integer',
                Rule::exists('categories', 'id')
                    ->where('is_active', true),
            ],
            'deposits' => ['sometimes', 'array', 'min:1'],
            'deposits.*' => ['required', 'array:id,quantity'],
            'deposits.*.id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('deposits', 'id')
                    ->where('is_active', true),
            ],
            'deposits.*.quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        if (
            array_key_exists('promo_price', $data)
            && $data['promo_price'] !== null
            && (float) $data['promo_price'] >= (float) ($data['price'] ?? $product->price)
        ) {
            throw ValidationException::withMessages([
                'promo_price' => 'O preço promocional deve ser menor que o preço.',
            ]);
        }

        $product = DB::transaction(function () use ($data, $product): Product {
            $attributes = collect($data)
                ->only(['title', 'price', 'promo_price', 'category_id', 'is_active'])
                ->all();

            if ($attributes !== []) {
                $product->fill($attributes);

                if ($product->isDirty()) {
                    $product->save();
                }
            }

            if (array_key_exists('deposits', $data)) {
                $deposits = collect($data['deposits'])
                    ->mapWithKeys(fn (array $deposit): array => [
                        $deposit['id'] => [
                            'quantity' => $deposit['quantity'],
                        ],
                    ])
                    ->all();

                $product->deposits()->sync($deposits);
            }

            return $product->fresh()->load(['category', 'deposits']);
        });

        return response()->json($product);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'data' => [],
            'message' => 'Produto excluído com sucesso.',
            'errors' => [],
        ]);
    }
}
