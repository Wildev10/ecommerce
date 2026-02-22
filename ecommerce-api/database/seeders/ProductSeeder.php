<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $sellers = User::where('role', 'seller')->pluck('id')->toArray();
        $categories = Category::all()->keyBy('slug');

        $products = [
            // ── Électronique / Smartphones ──
            [
                'name' => 'iPhone 15 Pro Max',
                'description' => 'Le dernier iPhone d\'Apple avec puce A17 Pro, écran Super Retina XDR 6,7 pouces, triple caméra 48MP et design en titane. Performances exceptionnelles pour la photo, la vidéo et le gaming.',
                'price' => 850000,
                'compare_price' => 950000,
                'stock' => 15,
                'category_slug' => 'electronique-smartphones',
            ],
            [
                'name' => 'Samsung Galaxy S24 Ultra',
                'description' => 'Smartphone Samsung haut de gamme avec écran Dynamic AMOLED 6,8 pouces, S Pen intégré, caméra 200MP et intelligence artificielle Galaxy AI pour une expérience mobile ultime.',
                'price' => 780000,
                'compare_price' => 850000,
                'stock' => 20,
                'category_slug' => 'electronique-smartphones',
            ],
            [
                'name' => 'Xiaomi Redmi Note 13 Pro',
                'description' => 'Excellent rapport qualité-prix avec écran AMOLED 120Hz, caméra 200MP, batterie 5100mAh et charge rapide 67W. Idéal pour un usage quotidien intensif.',
                'price' => 125000,
                'compare_price' => 150000,
                'stock' => 50,
                'category_slug' => 'electronique-smartphones',
            ],
            [
                'name' => 'Tecno Spark 20 Pro+',
                'description' => 'Smartphone Tecno avec écran 6,78 pouces FHD+, processeur Helio G99, 256Go de stockage et caméra 108MP. Parfait pour les budgets modérés.',
                'price' => 95000,
                'compare_price' => null,
                'stock' => 35,
                'category_slug' => 'electronique-smartphones',
            ],
            // ── Électronique / Ordinateurs ──
            [
                'name' => 'MacBook Air M2',
                'description' => 'Ordinateur portable Apple ultra fin avec puce M2, 8Go RAM, 256Go SSD, écran Liquid Retina 13,6 pouces. Autonomie jusqu\'à 18h et design sans ventilateur.',
                'price' => 750000,
                'compare_price' => 820000,
                'stock' => 10,
                'category_slug' => 'electronique-ordinateurs',
            ],
            [
                'name' => 'HP Pavilion 15',
                'description' => 'Laptop polyvalent avec processeur Intel Core i5, 8Go RAM, 512Go SSD, écran 15,6 pouces Full HD. Idéal pour le travail et le multimédia.',
                'price' => 380000,
                'compare_price' => 420000,
                'stock' => 25,
                'category_slug' => 'electronique-ordinateurs',
            ],
            // ── Électronique / Accessoires Tech ──
            [
                'name' => 'AirPods Pro 2ème Génération',
                'description' => 'Écouteurs sans fil Apple avec réduction de bruit active, audio spatial personnalisé, boîtier de charge MagSafe et jusqu\'à 6h d\'autonomie.',
                'price' => 155000,
                'compare_price' => 175000,
                'stock' => 40,
                'category_slug' => 'electronique-accessoires-tech',
            ],
            [
                'name' => 'Chargeur Sans Fil Samsung 15W',
                'description' => 'Chargeur à induction rapide 15W compatible avec tous les smartphones Qi. Design compact et témoin LED de charge.',
                'price' => 15000,
                'compare_price' => 20000,
                'stock' => 100,
                'category_slug' => 'electronique-accessoires-tech',
            ],
            // ── Vêtements / Homme ──
            [
                'name' => 'Chemise Lin Premium',
                'description' => 'Chemise en lin naturel pour homme, coupe regular, col classique. Tissu respirant idéal pour le climat tropical. Disponible en blanc, bleu ciel et beige.',
                'price' => 18000,
                'compare_price' => 25000,
                'stock' => 60,
                'category_slug' => 'vetements-homme',
            ],
            [
                'name' => 'Jean Slim Fit Stretch',
                'description' => 'Jean homme coupe slim en denim stretch confortable. Taille mi-haute, poches classiques. Lavage medium blue.',
                'price' => 22000,
                'compare_price' => null,
                'stock' => 45,
                'category_slug' => 'vetements-homme',
            ],
            [
                'name' => 'Polo Classic Coton',
                'description' => 'Polo homme en coton piqué 100%, col côtelé, logo brodé discret. Coupe régulière confortable pour un style décontracté chic.',
                'price' => 12000,
                'compare_price' => 15000,
                'stock' => 80,
                'category_slug' => 'vetements-homme',
            ],
            // ── Vêtements / Femme ──
            [
                'name' => 'Robe Wax Ankara',
                'description' => 'Magnifique robe en tissu wax africain, coupe évasée, manches courtes. Imprimé coloré unique fait main. Tailles S à XXL.',
                'price' => 25000,
                'compare_price' => 32000,
                'stock' => 30,
                'category_slug' => 'vetements-femme',
            ],
            [
                'name' => 'Sac à Main Cuir Véritable',
                'description' => 'Sac à main en cuir véritable avec bandoulière amovible. Compartiments multiples, fermeture éclair. Coloris noir, marron et cognac.',
                'price' => 35000,
                'compare_price' => 45000,
                'stock' => 20,
                'category_slug' => 'vetements-femme',
            ],
            // ── Maison & Jardin / Mobilier ──
            [
                'name' => 'Canapé 3 Places Moderne',
                'description' => 'Canapé 3 places en tissu gris anthracite, structure bois massif, coussins déhoussables. Style scandinave moderne. Dimensions: 210x85x90cm.',
                'price' => 185000,
                'compare_price' => 220000,
                'stock' => 5,
                'category_slug' => 'maison-jardin-mobilier',
            ],
            [
                'name' => 'Table Basse Bois & Métal',
                'description' => 'Table basse industrielle en bois de manguier et pieds métal noir. Deux plateaux. Dimensions: 110x60x45cm.',
                'price' => 65000,
                'compare_price' => null,
                'stock' => 12,
                'category_slug' => 'maison-jardin-mobilier',
            ],
            // ── Maison & Jardin / Décoration ──
            [
                'name' => 'Lampe de Chevet LED Tactile',
                'description' => 'Lampe de chevet LED avec variateur tactile, 3 niveaux de luminosité, port USB de charge. Design minimaliste en métal brossé.',
                'price' => 18000,
                'compare_price' => 22000,
                'stock' => 40,
                'category_slug' => 'maison-jardin-decoration',
            ],
            // ── Sports / Fitness ──
            [
                'name' => 'Tapis de Yoga Premium',
                'description' => 'Tapis de yoga antidérapant en TPE écologique, épaisseur 6mm, dimensions 183x61cm. Livré avec sangle de transport. Idéal yoga, pilates et fitness.',
                'price' => 15000,
                'compare_price' => 20000,
                'stock' => 55,
                'category_slug' => 'sports-fitness',
            ],
            [
                'name' => 'Kit Haltères Ajustables 20kg',
                'description' => 'Set de 2 haltères ajustables de 1 à 10kg chacun. Disques en fonte revêtus caoutchouc, poignées ergonomiques chromées. Idéal musculation maison.',
                'price' => 45000,
                'compare_price' => 55000,
                'stock' => 18,
                'category_slug' => 'sports-fitness',
            ],
            // ── Sports / Football ──
            [
                'name' => 'Ballon Adidas UCL Pro',
                'description' => 'Ballon officiel de la Champions League, cousu machine, panneaux thermosoudés. Taille 5, FIFA Quality Pro approuvé.',
                'price' => 35000,
                'compare_price' => 42000,
                'stock' => 25,
                'category_slug' => 'sports-football',
            ],
            [
                'name' => 'Maillot PSG Domicile 2025/26',
                'description' => 'Maillot officiel du Paris Saint-Germain, saison 2025/2026. Tissu Dri-FIT respirant, blason brodé, sponsors imprimés.',
                'price' => 55000,
                'compare_price' => 65000,
                'stock' => 0, // Rupture de stock
                'category_slug' => 'sports-football',
            ],
            // ── Livres / Romans ──
            [
                'name' => 'L\'Étranger - Albert Camus',
                'description' => 'Chef-d\'œuvre de la littérature française. Édition de poche, 192 pages. "Aujourd\'hui, maman est morte..." Le roman existentialiste incontournable.',
                'price' => 5000,
                'compare_price' => null,
                'stock' => 100,
                'category_slug' => 'livres-romans',
            ],
            [
                'name' => 'Tout s\'effondre - Chinua Achebe',
                'description' => 'Roman classique de la littérature africaine. L\'histoire d\'Okonkwo et de la confrontation entre traditions Igbo et colonialisme. 224 pages.',
                'price' => 6500,
                'compare_price' => 8000,
                'stock' => 70,
                'category_slug' => 'livres-romans',
            ],
            // ── Beauté / Maquillage ──
            [
                'name' => 'Palette Fenty Beauty Snap Shadows',
                'description' => 'Palette de 6 fards à paupières par Rihanna. Pigments intenses, formule longue tenue, teintes adaptées à toutes les carnations.',
                'price' => 22000,
                'compare_price' => 28000,
                'stock' => 35,
                'category_slug' => 'beaute-maquillage',
            ],
            [
                'name' => 'Rouge à Lèvres MAC Ruby Woo',
                'description' => 'Le rouge à lèvres emblématique de MAC Cosmetics. Fini mat rétro, couleur rouge vif intense. Tenue longue durée.',
                'price' => 16000,
                'compare_price' => null,
                'stock' => 50,
                'category_slug' => 'beaute-maquillage',
            ],
            // ── Beauté / Soins Peau ──
            [
                'name' => 'Sérum Vitamine C The Ordinary',
                'description' => 'Sérum à la Vitamine C 23% + HA Spheres 2%. Illumine le teint, réduit les taches et les signes de l\'âge. 30ml.',
                'price' => 8500,
                'compare_price' => 12000,
                'stock' => 45,
                'category_slug' => 'beaute-soins-peau',
            ],
            // ── Jouets / Jeux Éducatifs ──
            [
                'name' => 'LEGO Classic Boîte 790 Pièces',
                'description' => 'Boîte de briques créatives LEGO Classic avec 790 pièces multicolores. 33 modèles suggérés. Pour enfants de 4 à 99 ans.',
                'price' => 32000,
                'compare_price' => 38000,
                'stock' => 15,
                'category_slug' => 'jouets-jeux-educatifs',
            ],
            // ── Jouets / Jeux de Société ──
            [
                'name' => 'Monopoly Édition Afrique',
                'description' => 'Jeu de société Monopoly édition spéciale Afrique. Parcourez les grandes villes africaines. 2 à 6 joueurs, à partir de 8 ans.',
                'price' => 18000,
                'compare_price' => 22000,
                'stock' => 0, // Rupture de stock
                'category_slug' => 'jouets-jeux-de-societe',
            ],
            // ── Alimentation / Épicerie ──
            [
                'name' => 'Riz Basmati Premium 5kg',
                'description' => 'Riz basmati long grain de qualité supérieure. Grains fins et parfumés idéaux pour accompagner vos plats. Sac de 5kg.',
                'price' => 8000,
                'compare_price' => 9500,
                'stock' => 200,
                'category_slug' => 'alimentation-epicerie',
            ],
            [
                'name' => 'Huile d\'Olive Extra Vierge 1L',
                'description' => 'Huile d\'olive extra vierge première pression à froid. Origine Tunisie. Bouteille en verre 1 litre.',
                'price' => 6500,
                'compare_price' => null,
                'stock' => 80,
                'category_slug' => 'alimentation-epicerie',
            ],
            // ── Alimentation / Boissons ──
            [
                'name' => 'Pack Jus de Fruits Tropicaux x12',
                'description' => 'Pack de 12 briques de jus de fruits tropicaux (mangue, ananas, passion, goyave). 100% pur jus, sans sucre ajouté. 33cl par brique.',
                'price' => 7500,
                'compare_price' => 9000,
                'stock' => 60,
                'category_slug' => 'alimentation-boissons',
            ],
            // ── Alimentation / Produits Locaux ──
            [
                'name' => 'Gari Blanc du Bénin 5kg',
                'description' => 'Gari blanc traditionnel du Bénin, séché au soleil, texture fine. Aliment de base riche en calories, idéal avec du lait, de l\'eau sucrée ou en accompagnement.',
                'price' => 3500,
                'compare_price' => null,
                'stock' => 150,
                'category_slug' => 'alimentation-produits-locaux',
            ],
            // ── Sports / Running ──
            [
                'name' => 'Nike Air Zoom Pegasus 41',
                'description' => 'Chaussure de course Nike avec amorti Zoom Air, semelle React, tige en mesh respirant. Polyvalente pour vos entraînements quotidiens.',
                'price' => 75000,
                'compare_price' => 85000,
                'stock' => 22,
                'category_slug' => 'sports-running',
            ],
            // ── Beauté / Parfums ──
            [
                'name' => 'Dior Sauvage EDP 100ml',
                'description' => 'Eau de parfum masculine iconique de Dior. Notes de bergamote, ambroxan et vanille. Sillage puissant et longue tenue. Flacon 100ml.',
                'price' => 85000,
                'compare_price' => 95000,
                'stock' => 12,
                'category_slug' => 'beaute-parfums',
            ],
        ];

        foreach ($products as $index => $productData) {
            $categorySlug = $productData['category_slug'];
            unset($productData['category_slug']);

            $category = $categories->get($categorySlug);
            if (!$category) {
                continue;
            }

            $sellerId = $sellers[$index % count($sellers)];

            Product::create(array_merge($productData, [
                'seller_id'   => $sellerId,
                'category_id' => $category->id,
                'slug'        => Str::slug($productData['name']) . '-' . ($index + 1),
                'image'       => 'https://via.placeholder.com/640x480.png?text=' . urlencode($productData['name']),
                'gallery'     => [
                    'https://via.placeholder.com/640x480.png?text=' . urlencode($productData['name'] . ' - 1'),
                    'https://via.placeholder.com/640x480.png?text=' . urlencode($productData['name'] . ' - 2'),
                    'https://via.placeholder.com/640x480.png?text=' . urlencode($productData['name'] . ' - 3'),
                ],
                'is_active'   => true,
            ]));
        }
    }
}
