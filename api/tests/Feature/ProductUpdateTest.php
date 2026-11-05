<?php

use App\Models\Category;
use App\Models\Deposit;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('updates the changed product data and deposit quantities', function () {
    $user = User::factory()->create();
    $oldCategory = Category::factory()->create();
    $newCategory = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $oldCategory->id,
        'title' => 'Caderno antigo',
        'price' => 20,
        'promo_price' => 18,
    ]);
    $deposit = Deposit::factory()->create();

    $product->deposits()->attach($deposit, ['quantity' => 2]);

    $response = $this->actingAs($user)->putJson("/api/products/{$product->id}", [
        'title' => 'Caderno atualizado',
        'price' => 25,
        'promo_price' => 22,
        'is_active' => false,
        'category_id' => $newCategory->id,
        'deposits' => [
            [
                'id' => $deposit->id,
                'quantity' => 5,
            ],
        ],
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('title', 'Caderno atualizado')
        ->assertJsonPath('price', '25.00')
        ->assertJsonPath('promo_price', '22.00')
        ->assertJsonPath('is_active', false)
        ->assertJsonPath('category.id', $newCategory->id)
        ->assertJsonPath('deposits.0.id', $deposit->id)
        ->assertJsonPath('deposits.0.pivot.quantity', 5);

    $product->refresh();

    expect($product->category_id)->toBe($newCategory->id)
        ->and($product->is_active)->toBeFalse()
        ->and($product->deposits()->first()->pivot->quantity)->toBe(5);
});
