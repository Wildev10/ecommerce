<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $buyers = User::where('role', 'buyer')->pluck('id')->toArray();
        $products = Product::where('is_active', true)->pluck('id')->toArray();

        $comments = [
            5 => [
                'Excellent produit ! Je recommande vivement.',
                'Qualité exceptionnelle, exactement comme décrit.',
                'Livraison rapide et produit parfait. Merci !',
                'Je suis très satisfait de mon achat, rien à redire.',
                'Top qualité ! J\'en rachèterai sans hésiter.',
                'Superbe, mes attentes ont été dépassées.',
            ],
            4 => [
                'Très bon produit, rapport qualité-prix excellent.',
                'Bien dans l\'ensemble, petit défaut d\'emballage mais le produit est nickel.',
                'Bon achat, livraison un peu lente mais produit conforme.',
                'Satisfait de la qualité, je recommande.',
                'Très bien, juste un petit détail à améliorer sur la finition.',
            ],
            3 => [
                'Correct, sans plus. Le produit fait le job.',
                'Moyen, la qualité pourrait être meilleure pour le prix.',
                'Pas mal mais j\'attendais mieux vu les photos.',
                'Produit acceptable, description un peu exagérée.',
            ],
            2 => [
                'Déçu, la qualité n\'est pas au rendez-vous.',
                'Produit arrivé avec un défaut, dommage.',
                'Pas terrible, je m\'attendais à mieux.',
            ],
            1 => [
                'Très mauvaise qualité, ne correspond pas du tout à la description.',
                'Produit défectueux reçu. Service client à améliorer.',
            ],
        ];

        $reviewCount = 0;
        $usedPairs = [];

        while ($reviewCount < 30 && count($usedPairs) < count($buyers) * count($products)) {
            $buyerId = $buyers[array_rand($buyers)];
            $productId = $products[array_rand($products)];

            $pairKey = "{$buyerId}-{$productId}";
            if (isset($usedPairs[$pairKey])) {
                continue;
            }
            $usedPairs[$pairKey] = true;

            // Pondérer les notes : plus de 4/5 que de 1/2
            $weights = [5, 5, 5, 5, 4, 4, 4, 3, 3, 2, 1];
            $rating = $weights[array_rand($weights)];

            $ratingComments = $comments[$rating];
            $comment = $ratingComments[array_rand($ratingComments)];

            Review::create([
                'user_id'    => $buyerId,
                'product_id' => $productId,
                'rating'     => $rating,
                'comment'    => $comment,
            ]);

            $reviewCount++;
        }
    }
}
