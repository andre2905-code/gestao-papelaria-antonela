<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Product::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string'],
            'price' => ['required', 'int'],
            'promo_price' => ['decimal'],
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
                'min:0',
            ],
        ]);

        DB::transaction(function () use ($data) {
            $product = Product::create([
                'title' => $data['title'],
                'category_id' => $data['category_id'],
                'price' => $data['price'],
                'promo_price' => $data['promo_price'] ?? null,
                'sku' => $data['sku'] ?? null,
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
        });
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        //
    }
}
