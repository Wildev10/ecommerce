<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Les mots de passe sont lus depuis .env (SEED_*_PASSWORD).
        // Si absent, un mot de passe aléatoire est généré et affiché dans la console.
        $adminPassword  = env('SEED_ADMIN_PASSWORD')  ?: Str::password(20);
        $sellerPassword = env('SEED_SELLER_PASSWORD') ?: Str::password(20);
        $buyerPassword  = env('SEED_BUYER_PASSWORD')  ?: Str::password(20);

        $now = now();

        User::create([
            'name'               => env('SEED_ADMIN_NAME', 'Admin'),
            'email'              => env('SEED_ADMIN_EMAIL', 'admin@ecommerce.com'),
            'password'           => Hash::make($adminPassword),
            'role'               => 'admin',
            'phone'              => '+229 97 00 00 01',
            'is_active'          => true,
            'email_verified_at'  => $now,
        ]);

        User::create([
            'name'               => 'Seller Demo',
            'email'              => env('SEED_SELLER_EMAIL', 'seller@ecommerce.com'),
            'password'           => Hash::make($sellerPassword),
            'role'               => 'seller',
            'phone'              => '+229 97 00 00 02',
            'is_active'          => true,
            'email_verified_at'  => $now,
        ]);

        User::create([
            'name'               => 'Seller Demo 2',
            'email'              => 'seller2@ecommerce.com',
            'password'           => Hash::make($sellerPassword),
            'role'               => 'seller',
            'phone'              => '+229 97 00 00 05',
            'is_active'          => true,
            'email_verified_at'  => $now,
        ]);

        User::create([
            'name'               => 'Acheteur Demo',
            'email'              => env('SEED_BUYER_EMAIL', 'buyer@ecommerce.com'),
            'password'           => Hash::make($buyerPassword),
            'role'               => 'buyer',
            'phone'              => '+229 97 00 00 03',
            'is_active'          => true,
            'email_verified_at'  => $now,
        ]);

        User::create([
            'name'               => 'Acheteur Demo 2',
            'email'              => 'buyer2@ecommerce.com',
            'password'           => Hash::make($buyerPassword),
            'role'               => 'buyer',
            'phone'              => '+229 97 00 00 04',
            'is_active'          => true,
            'email_verified_at'  => $now,
        ]);

        $this->command->info('');
        $this->command->info('=== Comptes créés ===');
        $this->command->info('Admin   : ' . env('SEED_ADMIN_EMAIL', 'admin@ecommerce.com') . ' / ' . $adminPassword);
        $this->command->info('Seller  : ' . env('SEED_SELLER_EMAIL', 'seller@ecommerce.com') . ' / ' . $sellerPassword);
        $this->command->info('Buyer   : ' . env('SEED_BUYER_EMAIL', 'buyer@ecommerce.com') . ' / ' . $buyerPassword);
        $this->command->info('Notez ces mots de passe — ils ne seront plus affichés.');
        $this->command->info('');
    }
}
