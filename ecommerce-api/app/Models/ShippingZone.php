<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingZone extends Model
{
    protected $fillable = ['seller_id', 'name', 'price', 'estimated_days', 'is_active'];

    protected $casts = [
        'price'      => 'decimal:2',
        'is_active'  => 'boolean',
    ];

    public function seller() { return $this->belongsTo(User::class, 'seller_id'); }
}
