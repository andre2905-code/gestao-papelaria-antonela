<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Deposit;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customerIds = Customer::query()->pluck('id')->all();
        $productIds = Product::query()->pluck('id')->all();
        $depositIds = Deposit::query()->pluck('id')->all();

        Order::factory()
            ->count(20)
            ->state(fn () => ['customer_id' => fake()->randomElement($customerIds)])
            ->withItems(3, $productIds, $depositIds)
            ->create();
    }
}
