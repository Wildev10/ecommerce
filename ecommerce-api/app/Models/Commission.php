<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    protected $fillable = [
        'order_id', 'seller_id', 'order_amount',
        'commission_rate', 'commission_amount', 'seller_amount', 'status',
    ];

    protected $casts = [
        'order_amount'      => 'decimal:2',
        'commission_rate'    => 'decimal:2',
        'commission_amount'  => 'decimal:2',
        'seller_amount'      => 'decimal:2',
    ];

    public function order()  { return $this->belongsTo(Order::class); }
    public function seller() { return $this->belongsTo(User::class, 'seller_id'); }
}
