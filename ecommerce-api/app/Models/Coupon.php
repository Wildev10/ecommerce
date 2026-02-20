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
        'value',
        'min_order_amount',
        'max_uses',
        'used_count',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    const TYPE_FIXED = 'fixed';
    const TYPE_PERCENTAGE = 'percentage';

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
        if ($this->min_order_amount && $amount < $this->min_order_amount) {
            return 0;
        }

        if ($this->type === self::TYPE_PERCENTAGE) {
            return round($amount * ($this->value / 100), 2);
        }

        return min($this->value, $amount);
    }
}
