<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepositItem extends Model
{
    public function product() {
        return $this->belongsTo(Product::class);
    }

    public function deposit() {
        return $this->belongsTo(Deposit::class);
    }
}
