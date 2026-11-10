<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Deposit;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categoryIds = Category::query()->pluck('id')->all();
        $depositIds = Deposit::query()->pluck('id')->all();

        $products = Product::factory()
            ->count(30)
            ->state(fn () => ['category_id' => fake()->randomElement($categoryIds)])
            ->create();

        $products->each(function (Product $product) use ($depositIds): void {
            $deposits = collect($depositIds)
                ->mapWithKeys(fn (int $depositId) => [
                    $depositId => ['quantity' => fake()->numberBetween(1, 5)],
                ])
                ->all();

            $product->deposits()->sync($deposits);
        });
    }
}
