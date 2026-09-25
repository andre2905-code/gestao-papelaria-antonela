<?php

namespace Database\Factories;

use App\Models\Customer;
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
        $statuses = ["pending", "confirmed", "cancelled"];
        return [
            'customer_id' => Customer::factory(),
            'status' => fake()->randomElement($statuses),
            'total' => 0
        ];
    }

    public function withItens(int $count = 3): static {
        return $this->has(
            OrderItem::factory()
                ->count($count)
                ->state(function (array $attrs, Order $order) {
                    $product = Product::factory()->create();

                    return [
                        'product_id' => $product->id,
                        'unit_price' => $product->promo_price ?? $product->price,
                    ];
                }),
            'items'
        )->afterCreating(function (Order $order) {
            $total = $order->items->sum(fn ($item) => $item->quantity * $item->unit_price);
            $order->updateQuietly(['total' => $total]);
        });
    }
}
