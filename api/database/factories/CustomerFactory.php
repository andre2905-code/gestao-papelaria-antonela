<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'cpf' => fake()->regexify('[0-9]{3}.[0-9]{3}.[0-9]{3}-[0-9]{2}'),
            'birth_date' => fake()->date(),
        ];
    }
}
