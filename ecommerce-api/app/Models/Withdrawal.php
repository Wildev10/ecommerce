<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    protected $fillable = [
        'user_id', 'amount', 'method', 'phone_number',
        'status', 'transaction_id', 'note', 'processed_by', 'processed_at',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function user()        { return $this->belongsTo(User::class); }
    public function processedBy() { return $this->belongsTo(User::class, 'processed_by'); }
}
