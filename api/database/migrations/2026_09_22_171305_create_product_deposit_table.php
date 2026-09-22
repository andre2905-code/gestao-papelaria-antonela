<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_deposit', function (Blueprint $table) {
            $table->id();

            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('deposit_id')
                ->constrained('deposits')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->integer('quantity')->default(0);
            $table->integer('min_quantity')->nullable();

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->unique(
                ['product_id', 'deposit_id'],
                'uq_product_deposit'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_deposit');
    }
};