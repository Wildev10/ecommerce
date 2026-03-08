<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dispute extends Model
{
    protected $fillable = [
        'order_id', 'user_id', 'subject', 'description',
        'status', 'resolution', 'resolved_by', 'resolved_at',
    ];

    protected $casts = ['resolved_at' => 'datetime'];

    public function order()    { return $this->belongsTo(Order::class); }
    public function user()     { return $this->belongsTo(User::class); }
    public function resolvedBy() { return $this->belongsTo(User::class, 'resolved_by'); }
    public function messages()  { return $this->hasMany(DisputeMessage::class)->orderBy('created_at'); }
}
