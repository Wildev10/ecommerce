<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    private User $buyer;
    private Product $product;
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
    }

    public function test_authenticated_user_can_add_to_cart(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/cart', [
                'product_id' => $this->product->id,
                'quantity'   => 2,
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'quantity'    => 2,
        ]);
    }

    public function test_authenticated_user_can_view_cart(): void
    {
        $cart = Cart::create(['user_id' => $this->buyer->id]);
        CartItem::create([
            'cart_id'    => $cart->id,
            'product_id' => $this->product->id,
            'quantity'   => 3,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/cart');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.items_count', 3);
    }

    public function test_authenticated_user_can_remove_from_cart(): void
    {
        $cart = Cart::create(['user_id' => $this->buyer->id]);
        $cartItem = CartItem::create([
            'cart_id'    => $cart->id,
            'product_id' => $this->product->id,
            'quantity'   => 1,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson("/api/cart/{$cartItem->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('cart_items', ['id' => $cartItem->id]);
    }

    public function test_unauthenticated_user_cannot_access_cart(): void
    {
        $response = $this->getJson('/api/cart');

        $response->assertStatus(401);
    }
}
