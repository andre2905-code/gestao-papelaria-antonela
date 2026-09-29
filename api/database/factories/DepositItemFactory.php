<?php

namespace Database\Factories;

use App\Models\Deposit;
use App\Models\DepositItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DepositItem>
 */
class DepositItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'deposit_id' => Deposit::factory(),
            'quantity' => fake()->numberBetween(1, 5)
        ];
    }
}
