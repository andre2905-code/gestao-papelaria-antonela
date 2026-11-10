<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('INITIAL_ADMIN_EMAIL', 'admin@antonela.test')],
            [
                'name' => env('INITIAL_ADMIN_NAME', 'Administrador'),
                'password' => env('INITIAL_ADMIN_PASSWORD', 'password'),
                'role' => Role::SuperAdmin,
            ],
        );
    }
}
