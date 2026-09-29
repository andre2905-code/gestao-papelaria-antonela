<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $adjectives = ['Azul', 'Preto', 'Vermelho', 'Premium', 'Comum', 'Grande', 'Pequeno', 'Fino', 'Grosso'];
        $nouns = ['Caderno', 'Livro', 'Sketchbook', 'Marca Páginas', 'Lápis', 'Apontador', 'Apagador'];
        $price = fake()->randomFloat(2, 10, 100);

        return [
            'category_id' => Category::factory(),
            'title' => fake()->randomElement($nouns).' '.fake()->randomElement($adjectives),
            'price' => $price,
            'promo_price' => fake()->optional(0.3)->randomFloat(2, 5, $price),
            'sku' => fake()->unique()->regexify('[A-Z]{3}-[0-9]{4}'),
            'is_active' => true,
        ];
    }
}
