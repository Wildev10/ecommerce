<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'discount',
        'min_amount',
        'max_uses',
        'used_count',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'discount' => 'decimal:2',
        'min_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    const TYPE_FIXED = 'fixed';
    const TYPE_PERCENTAGE = 'percent';

    public function isValid()
    {
        if (!$this->is_active) return false;
        if ($this->max_uses && $this->used_count >= $this->max_uses) return false;
        if ($this->starts_at && now()->lt($this->starts_at)) return false;
        if ($this->expires_at && now()->gt($this->expires_at)) return false;

        return true;
    }

    public function calculateDiscount($amount)
    {
        if ($this->min_amount && $amount < $this->min_amount) {
            return 0;
        }

        if ($this->type === self::TYPE_PERCENTAGE) {
            return round($amount * ($this->discount / 100), 2);
        }

        return min($this->discount, $amount);
    }
}
