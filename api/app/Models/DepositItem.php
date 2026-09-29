<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepositItem extends Model
{
    use HasFactory;

    protected $table = 'product_deposit';

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function deposit()
    {
        return $this->belongsTo(Deposit::class);
    }
}
