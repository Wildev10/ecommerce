<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderCouponTest extends TestCase
{
    use RefreshDatabase;

    private User $buyer;
    private Product $product;
    private Address $address;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->buyer = User::factory()->create(['role' => 'buyer']);
        $this->token = $this->buyer->createToken('auth_token')->plainTextToken;

        $seller   = User::factory()->create(['role' => 'seller']);
        $category = Category::create(['name' => 'Test', 'slug' => 'test', 'is_active' => true]);

        $this->product = Product::create([
            'seller_id'   => $seller->id,
            'category_id' => $category->id,
            'name'        => 'Produit test',
            'slug'        => 'produit-test',
            'description' => 'desc',
            'price'       => 20000,
            'stock'       => 10,
            'is_active'   => true,
        ]);

        $this->address = Address::create([
            'user_id'        => $this->buyer->id,
            'label'          => 'Maison',
            'full_name'      => 'Test User',
            'phone'          => '97000000',
            'city'           => 'Cotonou',
            'quarter'        => 'Akpakpa',
            'street_address' => '123 rue test',
        ]);
    }

    private function putItemInCart(int $quantity = 1): Cart
    {
        $cart = Cart::create(['user_id' => $this->buyer->id]);
        CartItem::create([
            'cart_id'    => $cart->id,
            'product_id' => $this->product->id,
            'quantity'   => $quantity,
        ]);
        return $cart;
    }

    private function placeOrder(array $extra = []): \Illuminate\Testing\TestResponse
    {
        return $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/orders', array_merge([
                'address_id'     => $this->address->id,
                'payment_method' => 'cash_on_delivery',
            ], $extra));
    }

    // --- Coupon tests ---

    public function test_order_with_valid_fixed_coupon_applies_discount(): void
    {
        $coupon = Coupon::create([
            'code'       => 'PROMO2000',
            'type'       => 'fixed',
            'discount'   => 2000,
            'min_amount' => 0,
            'is_active'  => true,
            'used_count' => 0,
        ]);

        $this->putItemInCart(3); // subtotal = 60000, shipping = 0 (≥ 50000)

        $response = $this->placeOrder(['coupon_code' => 'PROMO2000']);

        $response->assertStatus(201)->assertJson(['success' => true]);

        $this->assertDatabaseHas('orders', [
            'user_id'  => $this->buyer->id,
            'discount' => 2000,
            'total'    => 58000,
        ]);
    }

    public function test_valid_coupon_increments_used_count(): void
    {
        Coupon::create([
            'code'       => 'PROMO10PCT',
            'type'       => 'percent',
            'discount'   => 10,
            'min_amount' => 0,
            'is_active'  => true,
            'used_count' => 0,
        ]);

        $this->putItemInCart(1);
        $this->placeOrder(['coupon_code' => 'PROMO10PCT'])->assertStatus(201);

        $this->assertDatabaseHas('coupons', [
            'code'       => 'PROMO10PCT',
            'used_count' => 1,
        ]);
    }

    public function test_expired_coupon_returns_400(): void
    {
        Coupon::create([
            'code'       => 'EXPIRED',
            'type'       => 'fixed',
            'discount'   => 1000,
            'min_amount' => 0,
            'is_active'  => true,
            'expires_at' => now()->subDay(),
            'used_count' => 0,
        ]);

        $this->putItemInCart(1);
        $response = $this->placeOrder(['coupon_code' => 'EXPIRED']);

        $response->assertStatus(400)->assertJson(['success' => false]);
    }

    public function test_inactive_coupon_returns_400(): void
    {
        Coupon::create([
            'code'       => 'INACTIVE',
            'type'       => 'fixed',
            'discount'   => 1000,
            'min_amount' => 0,
            'is_active'  => false,
            'used_count' => 0,
        ]);

        $this->putItemInCart(1);
        $response = $this->placeOrder(['coupon_code' => 'INACTIVE']);

        $response->assertStatus(400)->assertJson(['success' => false]);
    }

    public function test_coupon_at_max_uses_returns_400(): void
    {
        Coupon::create([
            'code'       => 'MAXED',
            'type'       => 'fixed',
            'discount'   => 1000,
            'min_amount' => 0,
            'is_active'  => true,
            'max_uses'   => 3,
            'used_count' => 3,
        ]);

        $this->putItemInCart(1);
        $response = $this->placeOrder(['coupon_code' => 'MAXED']);

        $response->assertStatus(400)->assertJson(['success' => false]);
    }

    public function test_nonexistent_coupon_returns_400(): void
    {
        $this->putItemInCart(1);
        $response = $this->placeOrder(['coupon_code' => 'DOESNOTEXIST']);

        $response->assertStatus(400)->assertJson(['success' => false]);
    }

    public function test_coupon_below_min_amount_applies_zero_discount(): void
    {
        Coupon::create([
            'code'       => 'MIN50K',
            'type'       => 'fixed',
            'discount'   => 3000,
            'min_amount' => 50000,
            'is_active'  => true,
            'used_count' => 0,
        ]);

        $this->putItemInCart(1); // subtotal = 20000 < 50000
        // isValid() passes (min_amount is not checked there), discount = 0
        $response = $this->placeOrder(['coupon_code' => 'MIN50K']);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', [
            'user_id'  => $this->buyer->id,
            'discount' => 0,
        ]);
    }

    // --- Stock tests ---

    public function test_stock_is_decremented_after_order(): void
    {
        $this->putItemInCart(3);

        $this->placeOrder()->assertStatus(201);

        $this->assertDatabaseHas('products', [
            'id'    => $this->product->id,
            'stock' => 7,
        ]);
    }

    public function test_order_with_insufficient_stock_returns_400(): void
    {
        // Cart requests 20 but only 10 in stock
        $this->putItemInCart(20);

        $response = $this->placeOrder();

        $response->assertStatus(400)->assertJson(['success' => false]);

        // Stock unchanged
        $this->assertDatabaseHas('products', [
            'id'    => $this->product->id,
            'stock' => 10,
        ]);
    }

    public function test_cart_is_cleared_after_successful_order(): void
    {
        $cart = $this->putItemInCart(2);

        $this->placeOrder()->assertStatus(201);

        $this->assertDatabaseMissing('cart_items', ['cart_id' => $cart->id]);
    }

    public function test_unauthenticated_user_cannot_create_order(): void
    {
        $this->putItemInCart(1);

        $response = $this->postJson('/api/orders', [
            'address_id'     => $this->address->id,
            'payment_method' => 'cash_on_delivery',
        ]);

        $response->assertStatus(401);
    }
}
