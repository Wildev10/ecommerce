<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Test User',
            'email'                 => 'testuser@example.com',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role'                  => 'buyer',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['user', 'token'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'testuser@example.com',
            'role'  => 'buyer',
        ]);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email'    => 'login@example.com',
            'password' => Hash::make('Password123!'),
            'role'     => 'buyer',
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'login@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['user', 'token'],
            ]);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_user_can_get_profile(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.user.id', $user->id);
    }

    public function test_register_validation_errors(): void
    {
        $response = $this->postJson('/api/register', [
            'name'  => '',
            'email' => 'not-an-email',
        ]);

        $response->assertStatus(422);
    }

    public function test_login_with_wrong_credentials(): void
    {
        User::factory()->create([
            'email'    => 'wrong@example.com',
            'password' => Hash::make('CorrectPassword1!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'wrong@example.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }
}
