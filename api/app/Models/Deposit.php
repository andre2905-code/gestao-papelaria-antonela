<?php

namespace App\Models;

use Database\Factories\DepositFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'is_active'])]
class Deposit extends Model
{
    /** @use HasFactory<DepositFactory> */
    use HasFactory, SoftDeletes;

    public function items()
    {
        return $this->hasMany(DepositItem::class);
    }
}
