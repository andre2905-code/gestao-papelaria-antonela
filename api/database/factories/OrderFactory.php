<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Deposit;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'confirmed', 'cancelled'];

        return [
            'customer_id' => Customer::factory(),
            'status' => fake()->randomElement($statuses),
            'payment_method' => fake()->optional()->randomElement(['pix', 'card', 'cash']),
            'notes' => fake()->optional()->sentence(),
            'total' => 0,
        ];
    }

    public function withItems(int $count = 3): static
    {
        return $this->has(
            OrderItem::factory()
                ->count($count)
                ->state(function (array $attributes, Order $order) {
                    $product = Product::factory()->create();
                    $deposit = Deposit::factory()->create();
                    $quantity = fake()->numberBetween(1, 5);
                    $unitPrice = $product->promo_price ?? $product->price;

                    return [
                        'product_id' => $product->id,
                        'deposit_id' => $deposit->id,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'subtotal' => $quantity * $unitPrice,
                    ];
                }),
            'orderItems'
        )->afterCreating(function (Order $order) {
            $order->updateQuietly([
                'total' => $order->orderItems->sum('subtotal'),
            ]);
        });
    }
}
