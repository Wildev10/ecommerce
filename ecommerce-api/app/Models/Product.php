<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'seller_id',
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'compare_price',
        'stock',
        'image',
        'gallery',
        'is_active',
    ];

    protected $casts = [
        'gallery' => 'array',
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'stock' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $appends = ['image_url', 'gallery_urls'];

    // ===== ACCESSORS =====

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) return null;

        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        return url('storage/' . $this->image);
    }

    public function getGalleryUrlsAttribute(): array
    {
        if (!$this->gallery) return [];

        return collect($this->gallery)->map(function ($img) {
            if (str_starts_with($img, 'http')) return $img;
            return url('storage/' . $img);
        })->toArray();
    }

    // ===== RELATIONS =====

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
