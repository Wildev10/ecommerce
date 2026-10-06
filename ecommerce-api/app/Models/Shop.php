<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Shop extends Model
{
    protected $fillable = [
        'user_id', 'name', 'slug', 'description',
        'logo', 'banner', 'phone', 'city', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    protected $appends = ['logo_url', 'banner_url'];

    public function seller()  { return $this->belongsTo(User::class, 'user_id'); }
    public function products() { return $this->hasManyThrough(Product::class, User::class, 'id', 'seller_id', 'user_id', 'id'); }

    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo) return null;
        return str_starts_with($this->logo, 'http') ? $this->logo : asset('storage/' . $this->logo);
    }

    public function getBannerUrlAttribute(): ?string
    {
        if (!$this->banner) return null;
        return str_starts_with($this->banner, 'http') ? $this->banner : asset('storage/' . $this->banner);
    }

    public static function booted(): void
    {
        static::creating(function (Shop $shop) {
            if (empty($shop->slug)) {
                $shop->slug = Str::slug($shop->name);
            }
        });
    }
}
