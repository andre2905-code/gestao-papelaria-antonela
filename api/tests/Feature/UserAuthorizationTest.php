<?php

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('unauthenticated users cannot access user management', function () {
    $this->getJson('/api/users')->assertUnauthorized();
});

test('regular users cannot list or create users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/users')
        ->assertForbidden();

    $this->actingAs($user)
        ->postJson('/api/users', [
            'name' => 'Novo usuário',
            'email' => 'novo@example.com',
            'password' => 'password',
        ])
        ->assertForbidden();
});

test('admins can list and create regular users', function () {
    $admin = User::factory()->create(['role' => Role::Admin]);

    $this->actingAs($admin)
        ->getJson('/api/users')
        ->assertOk();

    $this->actingAs($admin)
        ->postJson('/api/users', [
            'name' => 'Novo usuário',
            'email' => 'novo@example.com',
            'password' => 'password',
            'role' => Role::SuperAdmin->value,
        ])
        ->assertOk();

    $createdUser = User::query()->where('email', 'novo@example.com')->firstOrFail();

    expect($createdUser->role)->toBe(Role::User);
});

test('admins can manage regular users but not other admins', function () {
    $admin = User::factory()->create(['role' => Role::Admin]);
    $regularUser = User::factory()->create();
    $otherAdmin = User::factory()->create(['role' => Role::Admin]);

    $this->actingAs($admin)
        ->putJson("/api/users/{$regularUser->id}", ['name' => 'Nome atualizado'])
        ->assertOk();

    $this->actingAs($admin)
        ->deleteJson("/api/users/{$regularUser->id}")
        ->assertOk();

    $this->actingAs($admin)
        ->putJson("/api/users/{$otherAdmin->id}", ['name' => 'Não permitido'])
        ->assertForbidden();

    $this->actingAs($admin)
        ->deleteJson("/api/users/{$otherAdmin->id}")
        ->assertForbidden();
});

test('only a superadmin can change roles', function () {
    $admin = User::factory()->create(['role' => Role::Admin]);
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->patchJson("/api/users/{$user->id}/role", ['role' => Role::Admin->value])
        ->assertForbidden();

    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin]);

    $this->actingAs($superAdmin)
        ->patchJson("/api/users/{$user->id}/role", ['role' => Role::Admin->value])
        ->assertOk();

    expect($user->fresh()->role)->toBe(Role::Admin);
});

test('the last superadmin cannot be deleted or demoted', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin]);

    $this->actingAs($superAdmin)
        ->deleteJson("/api/users/{$superAdmin->id}")
        ->assertForbidden();

    $this->actingAs($superAdmin)
        ->patchJson("/api/users/{$superAdmin->id}/role", ['role' => Role::Admin->value])
        ->assertForbidden();
});

test('a superadmin can demote a superadmin when another one remains', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin]);
    $otherSuperAdmin = User::factory()->create(['role' => Role::SuperAdmin]);

    $this->actingAs($superAdmin)
        ->patchJson("/api/users/{$otherSuperAdmin->id}/role", ['role' => Role::Admin->value])
        ->assertOk();

    expect($otherSuperAdmin->fresh()->role)->toBe(Role::Admin);
});
