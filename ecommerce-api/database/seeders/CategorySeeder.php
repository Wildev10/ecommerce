<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Électronique',
                'description' => 'Smartphones, ordinateurs, accessoires tech et gadgets électroniques.',
                'image'       => 'https://via.placeholder.com/640x480.png?text=Electronique',
                'children'    => [
                    ['name' => 'Smartphones', 'description' => 'Téléphones portables et smartphones dernière génération.'],
                    ['name' => 'Ordinateurs', 'description' => 'Laptops, desktops et accessoires informatiques.'],
                    ['name' => 'Accessoires Tech', 'description' => 'Écouteurs, chargeurs, coques et câbles.'],
                ],
            ],
            [
                'name'        => 'Vêtements',
                'description' => 'Mode homme, femme et enfant. Vêtements tendance pour toutes les occasions.',
                'image'       => 'https://via.placeholder.com/640x480.png?text=Vetements',
                'children'    => [
                    ['name' => 'Homme', 'description' => 'Vêtements et accessoires pour hommes.'],
                    ['name' => 'Femme', 'description' => 'Vêtements et accessoires pour femmes.'],
                    ['name' => 'Enfant', 'description' => 'Mode enfant et bébé.'],
                ],
            ],
            [
                'name'        => 'Maison & Jardin',
                'description' => 'Mobilier, décoration d\'intérieur et équipements de jardin.',
                'image'       => 'https://via.placeholder.com/640x480.png?text=Maison+Jardin',
                'children'    => [
                    ['name' => 'Mobilier', 'description' => 'Canapés, tables, chaises et rangements.'],
                    ['name' => 'Décoration', 'description' => 'Objets déco, cadres, luminaires et tapis.'],
                    ['name' => 'Jardin', 'description' => 'Outils de jardin, plantes et mobilier extérieur.'],
                ],
            ],
            [
                'name'        => 'Sports',
                'description' => 'Équipements sportifs, vêtements de sport et accessoires fitness.',
                'image'       => 'https://via.placeholder.com/640x480.png?text=Sports',
                'children'    => [
                    ['name' => 'Fitness', 'description' => 'Tapis de sport, haltères, élastiques et vêtements fitness.'],
                    ['name' => 'Football', 'description' => 'Ballons, maillots, chaussures et accessoires de foot.'],
                    ['name' => 'Running', 'description' => 'Chaussures de course, montres GPS et accessoires.'],
                ],
            ],
            [
                'name'        => 'Livres',
                'description' => 'Romans, manuels scolaires, livres de développement personnel et BD.',
                'image'       => 'https://via.placeholder.com/640x480.png?text=Livres',
                'children'    => [
                    ['name' => 'Romans', 'description' => 'Romans français, africains et internationaux.'],
                    ['name' => 'Scolaire', 'description' => 'Manuels scolaires et universitaires.'],
                ],
            ],
            [
                'name'        => 'Beauté',
                'description' => 'Cosmétiques, soins de la peau, maquillage et parfums.',
                'image'       => 'https://via.placeholder.com/640x480.png?text=Beaute',
                'children'    => [
                    ['name' => 'Maquillage', 'description' => 'Fond de teint, rouge à lèvres, mascara et palettes.'],
                    ['name' => 'Soins Peau', 'description' => 'Crèmes, sérums, nettoyants et masques.'],
                    ['name' => 'Parfums', 'description' => 'Parfums homme et femme.'],
                ],
            ],
            [
                'name'        => 'Jouets',
                'description' => 'Jouets pour enfants de tous âges, jeux éducatifs et de société.',
                'image'       => 'https://via.placeholder.com/640x480.png?text=Jouets',
                'children'    => [
                    ['name' => 'Jeux Éducatifs', 'description' => 'Puzzles, jeux de construction et jeux d\'apprentissage.'],
                    ['name' => 'Jeux de Société', 'description' => 'Monopoly, Scrabble, Uno et jeux de cartes.'],
                ],
            ],
            [
                'name'        => 'Alimentation',
                'description' => 'Produits alimentaires, boissons, épicerie fine et produits locaux.',
                'image'       => 'https://via.placeholder.com/640x480.png?text=Alimentation',
                'children'    => [
                    ['name' => 'Épicerie', 'description' => 'Riz, pâtes, conserves et condiments.'],
                    ['name' => 'Boissons', 'description' => 'Jus, sodas, eau et boissons locales.'],
                    ['name' => 'Produits Locaux', 'description' => 'Gari, huile de palme, piment et produits du terroir.'],
                ],
            ],
        ];

        foreach ($categories as $cat) {
            $parent = Category::create([
                'name'        => $cat['name'],
                'slug'        => Str::slug($cat['name']),
                'description' => $cat['description'],
                'image'       => $cat['image'],
                'is_active'   => true,
            ]);

            if (isset($cat['children'])) {
                foreach ($cat['children'] as $child) {
                    Category::create([
                        'parent_id'   => $parent->id,
                        'name'        => $child['name'],
                        'slug'        => Str::slug($cat['name'] . ' ' . $child['name']),
                        'description' => $child['description'],
                        'image'       => 'https://via.placeholder.com/640x480.png?text=' . urlencode($child['name']),
                        'is_active'   => true,
                    ]);
                }
            }
        }
    }
}
