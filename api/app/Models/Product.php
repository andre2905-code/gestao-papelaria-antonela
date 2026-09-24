<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    public function orderItems() {
        return $this->hasMany(OrderItem::class);
    }

    public function depositItems() {
        return $this->hasMany(OrderItem::class);
    }

    public function category() {
        return $this->belongsTo(Category::class);
    }
}
