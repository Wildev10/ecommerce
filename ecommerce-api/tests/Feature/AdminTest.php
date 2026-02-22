<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role'     => 'admin',
            'password' => Hash::make('password123'),
        ]);
        $this->adminToken = $this->admin->createToken('auth_token')->plainTextToken;
    }

    public function test_admin_can_access_dashboard(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'data' => [
                    'total_users',
                    'total_products',
                    'total_orders',
                    'total_revenue',
                ],
            ]);
    }

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $buyerToken = $buyer->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$buyerToken}")
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_admin_can_manage_users(): void
    {
        $user = User::factory()->create(['role' => 'buyer']);

        // List users
        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Update role
        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->putJson("/api/admin/users/{$user->id}/role", [
                'role' => 'seller',
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'id'   => $user->id,
            'role' => 'seller',
        ]);
    }
}
