<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::create([
            'code'       => 'WELCOME10',
            'type'       => 'percent',
            'discount'   => 10,
            'min_amount' => 0,
            'max_uses'   => null,
            'used_count' => 0,
            'starts_at'  => now(),
            'expires_at' => now()->addYear(),
            'is_active'  => true,
        ]);

        Coupon::create([
            'code'       => 'SAVE20',
            'type'       => 'fixed',
            'discount'   => 20000,
            'min_amount' => 100000,
            'max_uses'   => null,
            'used_count' => 0,
            'starts_at'  => now(),
            'expires_at' => now()->addMonths(6),
            'is_active'  => true,
        ]);

        Coupon::create([
            'code'       => 'FIRST50',
            'type'       => 'percent',
            'discount'   => 50,
            'min_amount' => 0,
            'max_uses'   => 1,
            'used_count' => 0,
            'starts_at'  => now(),
            'expires_at' => now()->addMonths(3),
            'is_active'  => true,
        ]);

        Coupon::create([
            'code'       => 'SUMMER25',
            'type'       => 'percent',
            'discount'   => 25,
            'min_amount' => 0,
            'max_uses'   => 100,
            'used_count' => 0,
            'starts_at'  => now(),
            'expires_at' => now()->addDays(30),
            'is_active'  => true,
        ]);

        Coupon::create([
            'code'       => 'EXPIRED1',
            'type'       => 'percent',
            'discount'   => 10,
            'min_amount' => 0,
            'max_uses'   => null,
            'used_count' => 0,
            'starts_at'  => now()->subMonths(2),
            'expires_at' => now()->subDay(),
            'is_active'  => true,
        ]);
    }
}
