<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DisputeMessage extends Model
{
    protected $fillable = ['dispute_id', 'user_id', 'message', 'is_admin'];

    protected $casts = ['is_admin' => 'boolean'];

    public function dispute() { return $this->belongsTo(Dispute::class); }
    public function user()    { return $this->belongsTo(User::class); }
}
