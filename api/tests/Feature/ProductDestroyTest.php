<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('soft deletes a product', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($user)->deleteJson("/api/products/{$product->id}");

    $response
        ->assertOk()
        ->assertJson([
            'success' => true,
            'data' => [],
            'message' => 'Produto excluído com sucesso.',
            'errors' => [],
        ]);

    $this->assertSoftDeleted('products', [
        'id' => $product->id,
    ]);
});
