<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = ['user_id'];

    // Un cart appartient à un user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Un cart a plusieurs items
    public function items()
    {
        return $this->hasMany(CartItem::class);
    }
}
