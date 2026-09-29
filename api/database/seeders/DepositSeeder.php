<?php

namespace Database\Seeders;

use App\Models\Deposit;
use Illuminate\Database\Seeder;

class DepositSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Loja física', 'Estoque principal', 'Marketplace'] as $name) {
            Deposit::firstOrCreate(['name' => $name], ['is_active' => true]);
        }
    }
}
