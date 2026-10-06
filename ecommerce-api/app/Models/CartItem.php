<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = ['cart_id', 'product_id', 'quantity'];

    // Un item appartient à un cart
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    // Un item pointe vers un product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
