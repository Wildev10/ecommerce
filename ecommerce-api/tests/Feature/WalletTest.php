<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

    private User $seller;
    private User $admin;
    private string $sellerToken;
    private string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seller = User::factory()->create(['role' => 'seller']);
        $this->admin  = User::factory()->create(['role' => 'admin']);

        $this->sellerToken = $this->seller->createToken('auth_token')->plainTextToken;
        $this->adminToken  = $this->admin->createToken('auth_token')->plainTextToken;
    }

    // --- requestWithdrawal() ---

    public function test_seller_can_request_withdrawal(): void
    {
        $wallet = $this->seller->getOrCreateWallet();
        $wallet->update(['balance' => 50000]);

        $response = $this->withHeader('Authorization', "Bearer {$this->sellerToken}")
            ->postJson('/api/seller/withdrawals', [
                'amount'       => 10000,
                'method'       => 'mtn_momo',
                'phone_number' => '97000000',
            ]);

        $response->assertStatus(201)->assertJson(['success' => true]);

        $this->assertDatabaseHas('withdrawals', [
            'user_id' => $this->seller->id,
            'amount'  => 10000,
            'status'  => 'pending',
        ]);

        // Balance is reserved at request time
        $wallet->refresh();
        $this->assertEquals(40000, $wallet->balance);
    }

    public function test_seller_cannot_request_withdrawal_with_insufficient_balance(): void
    {
        $wallet = $this->seller->getOrCreateWallet();
        $wallet->update(['balance' => 5000]);

        $response = $this->withHeader('Authorization', "Bearer {$this->sellerToken}")
            ->postJson('/api/seller/withdrawals', [
                'amount'       => 10000,
                'method'       => 'mtn_momo',
                'phone_number' => '97000000',
            ]);

        $response->assertStatus(400)->assertJson(['success' => false]);
    }

    public function test_seller_cannot_have_two_pending_withdrawals(): void
    {
        $wallet = $this->seller->getOrCreateWallet();
        $wallet->update(['balance' => 100000]);

        // First request
        $this->withHeader('Authorization', "Bearer {$this->sellerToken}")
            ->postJson('/api/seller/withdrawals', [
                'amount'       => 10000,
                'method'       => 'mtn_momo',
                'phone_number' => '97000000',
            ])->assertStatus(201);

        $wallet->refresh();

        // Second request before first is processed
        $response = $this->withHeader('Authorization', "Bearer {$this->sellerToken}")
            ->postJson('/api/seller/withdrawals', [
                'amount'       => 5000,
                'method'       => 'mtn_momo',
                'phone_number' => '97000000',
            ]);

        $response->assertStatus(409)->assertJson(['success' => false]);
    }

    // --- process() — admin ---

    public function test_admin_completing_withdrawal_increments_total_withdrawn(): void
    {
        $wallet = $this->seller->getOrCreateWallet();
        $wallet->update(['balance' => 0]); // already reserved

        $withdrawal = Withdrawal::create([
            'user_id'      => $this->seller->id,
            'amount'       => 15000,
            'method'       => 'mtn_momo',
            'phone_number' => '97000000',
            'status'       => 'pending',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->putJson("/api/admin/withdrawals/{$withdrawal->id}/process", [
                'status'         => 'completed',
                'transaction_id' => 'TXN-123456',
            ]);

        $response->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseHas('withdrawals', [
            'id'     => $withdrawal->id,
            'status' => 'completed',
        ]);

        $wallet->refresh();
        $this->assertEquals(15000, $wallet->total_withdrawn);
        $this->assertEquals(0, $wallet->balance); // balance unchanged (was already reserved)
    }

    public function test_admin_rejecting_withdrawal_refunds_balance(): void
    {
        $wallet = $this->seller->getOrCreateWallet();
        $wallet->update(['balance' => 0]); // reserved when withdrawal was requested

        $withdrawal = Withdrawal::create([
            'user_id'      => $this->seller->id,
            'amount'       => 15000,
            'method'       => 'mtn_momo',
            'phone_number' => '97000000',
            'status'       => 'pending',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->putJson("/api/admin/withdrawals/{$withdrawal->id}/process", [
                'status' => 'rejected',
                'note'   => 'Numéro incorrect',
            ]);

        $response->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseHas('withdrawals', [
            'id'     => $withdrawal->id,
            'status' => 'rejected',
        ]);

        $wallet->refresh();
        $this->assertEquals(15000, $wallet->balance); // refunded
        $this->assertEquals(0, $wallet->total_withdrawn); // not incremented
    }

    public function test_already_processed_withdrawal_cannot_be_processed_again(): void
    {
        $wallet = $this->seller->getOrCreateWallet();

        $withdrawal = Withdrawal::create([
            'user_id'      => $this->seller->id,
            'amount'       => 10000,
            'method'       => 'mtn_momo',
            'phone_number' => '97000000',
            'status'       => 'completed',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->putJson("/api/admin/withdrawals/{$withdrawal->id}/process", [
                'status'         => 'completed',
                'transaction_id' => 'TXN-DUP',
            ]);

        $response->assertStatus(400)->assertJson(['success' => false]);
    }

    public function test_non_admin_cannot_process_withdrawal(): void
    {
        $withdrawal = Withdrawal::create([
            'user_id'      => $this->seller->id,
            'amount'       => 10000,
            'method'       => 'mtn_momo',
            'phone_number' => '97000000',
            'status'       => 'pending',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->sellerToken}")
            ->putJson("/api/admin/withdrawals/{$withdrawal->id}/process", [
                'status'         => 'completed',
                'transaction_id' => 'TXN-123',
            ]);

        $response->assertStatus(403);
    }

    // --- Wallet display ---

    public function test_seller_can_view_own_wallet(): void
    {
        $this->seller->getOrCreateWallet();

        $response = $this->withHeader('Authorization', "Bearer {$this->sellerToken}")
            ->getJson('/api/seller/wallet');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['data' => ['balance', 'pending_balance', 'total_earned', 'total_withdrawn']]);
    }
}
