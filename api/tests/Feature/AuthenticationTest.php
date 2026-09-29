<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('an authenticated user can access the api user endpoint', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('email', $user->email);
});

test('a user can log in through fortify', function () {
    $user = User::factory()->create([
        'password' => 'password',
    ]);

    $this->withSession([])
        ->postJson('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
        ->assertOk()
        ->assertJson(['two_factor' => false]);

    $this->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('id', $user->id);
});

test('invalid login credentials are rejected', function () {
    $user = User::factory()->create();

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertUnprocessable();
});
