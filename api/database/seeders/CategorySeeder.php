<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Cadernos', 'Escrita', 'Papelaria criativa', 'Organização', 'Presentes'] as $name) {
            Category::firstOrCreate(['name' => $name], ['is_active' => true]);
        }
    }
}
