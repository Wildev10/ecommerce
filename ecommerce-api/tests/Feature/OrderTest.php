<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
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

        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::create([
            'name' => 'Test', 'slug' => 'test', 'is_active' => true,
        ]);
        $this->product = Product::create([
            'seller_id'   => $seller->id,
            'category_id' => $category->id,
            'name'        => 'Test Product',
            'slug'        => 'test-product',
            'description' => 'A test product',
            'price'       => 10000,
            'stock'       => 50,
            'is_active'   => true,
        ]);

        $this->address = Address::create([
            'user_id'        => $this->buyer->id,
            'label'          => 'Maison',
            'full_name'      => 'Test User',
            'phone'          => '+229 97 00 00 00',
            'city'           => 'Cotonou',
            'quarter'        => 'Akpakpa',
            'street_address' => '123 Rue Test',
            'is_default'     => true,
        ]);
    }

    public function test_authenticated_user_can_create_order(): void
    {
        // Add items to cart first
        $cart = Cart::create(['user_id' => $this->buyer->id]);
        CartItem::create([
            'cart_id'    => $cart->id,
            'product_id' => $this->product->id,
            'quantity'   => 2,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/orders', [
                'address_id'     => $this->address->id,
                'payment_method' => 'cash_on_delivery',
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('orders', [
            'user_id' => $this->buyer->id,
            'status'  => 'pending',
        ]);
    }

    public function test_authenticated_user_can_list_orders(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/orders');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_user_can_cancel_pending_order(): void
    {
        // Create cart & order
        $cart = Cart::create(['user_id' => $this->buyer->id]);
        CartItem::create([
            'cart_id'    => $cart->id,
            'product_id' => $this->product->id,
            'quantity'   => 1,
        ]);

        $orderResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/orders', [
                'address_id'     => $this->address->id,
                'payment_method' => 'cash_on_delivery',
            ]);

        $orderId = $orderResponse->json('data.id');

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/orders/{$orderId}/cancel");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('orders', [
            'id'     => $orderId,
            'status' => 'cancelled',
        ]);
    }
}
