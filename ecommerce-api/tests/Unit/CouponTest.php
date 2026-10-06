<?php

namespace Tests\Unit;

use App\Models\Coupon;
use Tests\TestCase;

class CouponTest extends TestCase
{
    // --- isValid() ---

    public function test_inactive_coupon_is_not_valid(): void
    {
        $coupon = new Coupon(['is_active' => false, 'used_count' => 0]);
        $this->assertFalse($coupon->isValid());
    }

    public function test_expired_coupon_is_not_valid(): void
    {
        $coupon = new Coupon([
            'is_active'  => true,
            'expires_at' => now()->subDay(),
            'used_count' => 0,
        ]);
        $this->assertFalse($coupon->isValid());
    }

    public function test_coupon_not_started_yet_is_not_valid(): void
    {
        $coupon = new Coupon([
            'is_active'  => true,
            'starts_at'  => now()->addDay(),
            'used_count' => 0,
        ]);
        $this->assertFalse($coupon->isValid());
    }

    public function test_coupon_at_max_uses_is_not_valid(): void
    {
        $coupon = new Coupon([
            'is_active'  => true,
            'max_uses'   => 5,
            'used_count' => 5,
        ]);
        $this->assertFalse($coupon->isValid());
    }

    public function test_coupon_over_max_uses_is_not_valid(): void
    {
        $coupon = new Coupon([
            'is_active'  => true,
            'max_uses'   => 3,
            'used_count' => 4,
        ]);
        $this->assertFalse($coupon->isValid());
    }

    public function test_valid_coupon_with_no_restrictions_is_valid(): void
    {
        $coupon = new Coupon([
            'is_active'  => true,
            'used_count' => 0,
        ]);
        $this->assertTrue($coupon->isValid());
    }

    public function test_coupon_below_max_uses_is_valid(): void
    {
        $coupon = new Coupon([
            'is_active'  => true,
            'max_uses'   => 10,
            'used_count' => 7,
        ]);
        $this->assertTrue($coupon->isValid());
    }

    public function test_coupon_with_future_expiry_is_valid(): void
    {
        $coupon = new Coupon([
            'is_active'  => true,
            'expires_at' => now()->addMonth(),
            'used_count' => 0,
        ]);
        $this->assertTrue($coupon->isValid());
    }

    public function test_coupon_with_past_start_is_valid(): void
    {
        $coupon = new Coupon([
            'is_active'  => true,
            'starts_at'  => now()->subDay(),
            'used_count' => 0,
        ]);
        $this->assertTrue($coupon->isValid());
    }

    // --- calculateDiscount() ---

    public function test_fixed_coupon_returns_flat_discount(): void
    {
        $coupon = new Coupon(['type' => 'fixed', 'discount' => 2000, 'min_amount' => 0]);
        $this->assertEquals(2000, $coupon->calculateDiscount(50000));
    }

    public function test_fixed_coupon_never_exceeds_order_amount(): void
    {
        $coupon = new Coupon(['type' => 'fixed', 'discount' => 9000, 'min_amount' => 0]);
        $this->assertEquals(5000, $coupon->calculateDiscount(5000));
    }

    public function test_percent_coupon_returns_correct_amount(): void
    {
        $coupon = new Coupon(['type' => 'percent', 'discount' => 10, 'min_amount' => 0]);
        $this->assertEquals(5000.00, $coupon->calculateDiscount(50000));
    }

    public function test_percent_coupon_rounds_to_two_decimals(): void
    {
        $coupon = new Coupon(['type' => 'percent', 'discount' => 15, 'min_amount' => 0]);
        $this->assertEquals(1500.00, $coupon->calculateDiscount(10000));
    }

    public function test_coupon_below_min_amount_returns_zero_discount(): void
    {
        $coupon = new Coupon(['type' => 'fixed', 'discount' => 1000, 'min_amount' => 20000]);
        $this->assertEquals(0, $coupon->calculateDiscount(15000));
    }

    public function test_coupon_at_min_amount_applies_discount(): void
    {
        $coupon = new Coupon(['type' => 'fixed', 'discount' => 1000, 'min_amount' => 20000]);
        $this->assertEquals(1000, $coupon->calculateDiscount(20000));
    }
}
