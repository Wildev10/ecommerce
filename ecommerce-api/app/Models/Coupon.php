<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'discount',
        'type',
        'min_amount',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'discount' => 'decimal:2',
        'min_amount' => 'decimal:2',
        'expires_at' => 'date',
        'is_active' => 'boolean',
    ];
}
