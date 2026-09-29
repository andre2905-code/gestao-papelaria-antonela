<?php

namespace App\Models;

use Database\Factories\DepositFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Deposit extends Model
{
    /** @use HasFactory<DepositFactory> */
    use HasFactory;

    public function items()
    {
        return $this->hasMany(DepositItem::class);
    }
}
