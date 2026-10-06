<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use App\Services\CommissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommissionServiceTest extends TestCase
{
    use RefreshDatabase;

    private CommissionService $service;
    private User $seller;
    private User $buyer;
    private Product $product;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new CommissionService();

        Setting::set('commission_rate', 10);

        $this->seller = User::factory()->create(['role' => 'seller']);
        $this->buyer  = User::factory()->create(['role' => 'buyer']);

        $category = Category::create(['name' => 'Test', 'slug' => 'test', 'is_active' => true]);

        $this->product = Product::create([
            'seller_id'   => $this->seller->id,
            'category_id' => $category->id,
            'name'        => 'Produit test',
            'slug'        => 'produit-test',
            'description' => 'desc',
            'price'       => 20000,
            'stock'       => 100,
            'is_active'   => true,
        ]);

        $address = Address::create([
            'user_id'        => $this->buyer->id,
            'label'          => 'Maison',
            'full_name'      => 'Test',
            'phone'          => '97000000',
            'city'           => 'Cotonou',
            'quarter'        => 'Akpakpa',
            'street_address' => '12 rue test',
        ]);

        $this->order = Order::create([
            'user_id'        => $this->buyer->id,
            'address_id'     => $address->id,
            'order_number'   => 'ORD-TEST-001',
            'status'         => 'confirmed',
            'payment_status' => 'paid',
            'subtotal'       => 20000,
            'total'          => 20000,
        ]);

        OrderItem::create([
            'order_id'      => $this->order->id,
            'product_id'    => $this->product->id,
            'product_name'  => $this->product->name,
            'product_price' => 20000,
            'quantity'      => 1,
            'total'         => 20000,
        ]);

        $this->order->load('items.product');
    }

    // --- recordForOrder() ---

    public function test_record_creates_commission_for_seller(): void
    {
        $this->service->recordForOrder($this->order);

        $this->assertDatabaseHas('commissions', [
            'order_id'  => $this->order->id,
            'seller_id' => $this->seller->id,
            'status'    => 'pending',
        ]);
    }

    public function test_record_calculates_commission_at_10_percent(): void
    {
        $this->service->recordForOrder($this->order);

        $this->assertDatabaseHas('commissions', [
            'order_id'          => $this->order->id,
            'commission_amount'  => 2000.00,
            'seller_amount'      => 18000.00,
        ]);
    }

    public function test_record_credits_seller_pending_balance(): void
    {
        $this->service->recordForOrder($this->order);

        $wallet = $this->seller->getOrCreateWallet();
        $this->assertEquals(18000.00, $wallet->pending_balance);
        $this->assertEquals(18000.00, $wallet->total_earned);
    }

    public function test_record_creates_one_commission_per_seller(): void
    {
        $seller2   = User::factory()->create(['role' => 'seller']);
        $category  = Category::first();
        $product2  = Product::create([
            'seller_id'   => $seller2->id,
            'category_id' => $category->id,
            'name'        => 'Produit vendeur 2',
            'slug'        => 'produit-vendeur-2',
            'description' => 'desc',
            'price'       => 10000,
            'stock'       => 50,
            'is_active'   => true,
        ]);

        OrderItem::create([
            'order_id'      => $this->order->id,
            'product_id'    => $product2->id,
            'product_name'  => $product2->name,
            'product_price' => 10000,
            'quantity'      => 1,
            'total'         => 10000,
        ]);

        $this->order->load('items.product');
        $this->service->recordForOrder($this->order);

        $this->assertDatabaseCount('commissions', 2);
    }

    // --- settleForOrder() ---

    public function test_settle_moves_commission_to_paid(): void
    {
        $this->service->recordForOrder($this->order);
        $this->service->settleForOrder($this->order);

        $this->assertDatabaseHas('commissions', [
            'order_id' => $this->order->id,
            'status'   => 'paid',
        ]);
    }

    public function test_settle_moves_amount_from_pending_to_balance(): void
    {
        $this->service->recordForOrder($this->order);
        $this->service->settleForOrder($this->order);

        $wallet = $this->seller->fresh()->getOrCreateWallet();
        $this->assertEquals(0.00, $wallet->pending_balance);
        $this->assertEquals(18000.00, $wallet->balance);
        $this->assertEquals(18000.00, $wallet->total_earned);
    }

    public function test_settle_is_idempotent(): void
    {
        $this->service->recordForOrder($this->order);
        $this->service->settleForOrder($this->order);
        $this->service->settleForOrder($this->order); // deuxième appel

        $wallet = $this->seller->fresh()->getOrCreateWallet();
        $this->assertEquals(18000.00, $wallet->balance, 'Double settle ne doit pas doubler le solde');
        $this->assertEquals(0.00, $wallet->pending_balance);
    }

    // --- reverseForOrder() ---

    public function test_reverse_cancels_pending_commission(): void
    {
        $this->service->recordForOrder($this->order);
        $this->service->reverseForOrder($this->order);

        $this->assertDatabaseHas('commissions', [
            'order_id' => $this->order->id,
            'status'   => 'cancelled',
        ]);
    }

    public function test_reverse_decrements_pending_balance_for_pending_commission(): void
    {
        $this->service->recordForOrder($this->order);
        $this->service->reverseForOrder($this->order);

        $wallet = $this->seller->fresh()->getOrCreateWallet();
        $this->assertEquals(0.00, $wallet->pending_balance);
        $this->assertEquals(0.00, $wallet->total_earned);
    }

    public function test_reverse_decrements_balance_for_paid_commission(): void
    {
        $this->service->recordForOrder($this->order);
        $this->service->settleForOrder($this->order);
        $this->service->reverseForOrder($this->order);

        $wallet = $this->seller->fresh()->getOrCreateWallet();
        $this->assertEquals(0.00, $wallet->balance);
        $this->assertEquals(0.00, $wallet->total_earned);
    }

    public function test_reverse_on_already_cancelled_commission_does_nothing(): void
    {
        $this->service->recordForOrder($this->order);
        $this->service->reverseForOrder($this->order);
        $this->service->reverseForOrder($this->order); // deuxième appel

        $wallet = $this->seller->fresh()->getOrCreateWallet();
        $this->assertEquals(0.00, $wallet->pending_balance, 'Double reverse ne doit pas créer de balance négative');
    }
}
