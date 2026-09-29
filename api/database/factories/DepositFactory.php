<?php

namespace Database\Factories;

use App\Models\Deposit;
use App\Models\DepositItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Deposit>
 */
class DepositFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company(),
            'is_active' => true,
        ];
    }

    public function withItems(int $count = 3): static
    {
        return $this->has(DepositItem::factory()->count($count), 'items');
    }
}
