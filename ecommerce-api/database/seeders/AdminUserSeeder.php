<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'      => 'Admin',
            'email'     => 'admin@ecommerce.com',
            'password'  => Hash::make('password123'),
            'role'      => 'admin',
            'phone'     => '+229 97 00 00 01',
            'is_active' => true,
        ]);

        User::create([
            'name'      => 'Seller',
            'email'     => 'seller@ecommerce.com',
            'password'  => Hash::make('password123'),
            'role'      => 'seller',
            'phone'     => '+229 97 00 00 02',
            'is_active' => true,
        ]);

        User::create([
            'name'      => 'Seller2',
            'email'     => 'seller2@ecommerce.com',
            'password'  => Hash::make('password123'),
            'role'      => 'seller',
            'phone'     => '+229 97 00 00 05',
            'is_active' => true,
        ]);

        User::create([
            'name'      => 'User',
            'email'     => 'user@ecommerce.com',
            'password'  => Hash::make('password123'),
            'role'      => 'buyer',
            'phone'     => '+229 97 00 00 03',
            'is_active' => true,
        ]);

        User::create([
            'name'      => 'Buyer2',
            'email'     => 'buyer2@ecommerce.com',
            'password'  => Hash::make('password123'),
            'role'      => 'buyer',
            'phone'     => '+229 97 00 00 04',
            'is_active' => true,
        ]);
    }
}
