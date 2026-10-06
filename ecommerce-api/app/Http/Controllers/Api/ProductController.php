<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/products — Liste paginée des produits actifs
     * Accès : Public
     * Params : category, min_price, max_price, search, sort, per_page, page
     */
    public function index(Request $request)
    {
        $query = Product::where('is_active', true)
            ->with(['category', 'seller']);

        // Filtre par catégorie
        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filtre par prix min/max
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Recherche full-text
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Tri
        $sortMap = [
            'price_asc'  => ['price', 'asc'],
            'price_desc' => ['price', 'desc'],
            'newest'     => ['created_at', 'desc'],
            'oldest'     => ['created_at', 'asc'],
            'name_asc'   => ['name', 'asc'],
            'name_desc'  => ['name', 'desc'],
        ];

        if ($request->filled('sort') && isset($sortMap[$request->sort])) {
            [$col, $dir] = $sortMap[$request->sort];
            $query->orderBy($col, $dir);
        } else {
            $query->latest();
        }

        $products = $query->paginate($request->get('per_page', 12));

        return $this->paginated($products, 'Liste des produits');
    }

    /**
     * GET /api/products/{product} — Détail d'un produit (par id ou slug)
     * Accès : Public
     */
    public function show($id)
    {
        $product = Product::where('id', $id)
            ->orWhere('slug', $id)
            ->with(['category', 'seller', 'reviews.user'])
            ->firstOrFail();

        return $this->success($product, 'Détail du produit');
    }

    /**
     * POST /api/products — Créer un produit
     * Accès : Seller ou Admin (middleware seller)
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_id'   => 'required|exists:categories,id',
            'name'          => 'required|string|max:255',
            'description'   => 'required|string',
            'price'         => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'stock'         => 'required|integer|min:0',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'gallery.*'     => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $data = [
            'seller_id'     => auth()->id(),
            'category_id'   => $request->category_id,
            'name'          => $request->name,
            'slug'          => Str::slug($request->name) . '-' . uniqid(),
            'description'   => $request->description,
            'price'         => $request->price,
            'compare_price' => $request->compare_price,
            'stock'         => $request->stock,
        ];

        // Upload image principale
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        // Upload galerie
        if ($request->hasFile('gallery')) {
            $galleryPaths = [];
            foreach ($request->file('gallery') as $file) {
                $galleryPaths[] = $file->store('products/gallery', 'public');
            }
            $data['gallery'] = $galleryPaths;
        }

        $product = Product::create($data);

        return $this->success(
            $product->load('category', 'seller'),
            'Produit créé avec succès',
            201
        );
    }

    /**
     * PUT /api/products/{product} — Mettre à jour un produit
     * Accès : Propriétaire (seller) ou Admin
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Vérifier que c'est bien le vendeur ou admin
        if ($product->seller_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return $this->error('Non autorisé', 403);
        }

        $request->validate([
            'category_id'   => 'sometimes|exists:categories,id',
            'name'          => 'sometimes|string|max:255',
            'description'   => 'sometimes|string',
            'price'         => 'sometimes|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'stock'         => 'sometimes|integer|min:0',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'gallery.*'     => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_active'     => 'sometimes|boolean',
        ]);

        $data = $request->only([
            'category_id', 'name', 'description',
            'price', 'compare_price', 'stock', 'is_active',
        ]);

        // Nouveau slug si nom modifié
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . uniqid();
        }

        // Upload nouvelle image principale
        if ($request->hasFile('image')) {
            if ($product->image && !str_starts_with($product->image, 'http')) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        // Upload nouvelle galerie
        if ($request->hasFile('gallery')) {
            if ($product->gallery) {
                foreach ($product->gallery as $oldImg) {
                    if (!str_starts_with($oldImg, 'http')) {
                        Storage::disk('public')->delete($oldImg);
                    }
                }
            }
            $galleryPaths = [];
            foreach ($request->file('gallery') as $file) {
                $galleryPaths[] = $file->store('products/gallery', 'public');
            }
            $data['gallery'] = $galleryPaths;
        }

        $product->update($data);

        return $this->success(
            $product->fresh('category', 'seller'),
            'Produit mis à jour'
        );
    }

    /**
     * DELETE /api/products/{id} — Supprimer un produit
     * Accès : Propriétaire (seller) ou Admin
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($product->seller_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return $this->error('Non autorisé', 403);
        }

        // Vérifier les dépendances (commandes existantes)
        if ($product->orderItems()->exists()) {
            return $this->error(
                'Ce produit ne peut pas être supprimé car il est lié à des commandes existantes. Vous pouvez le désactiver.',
                409
            );
        }

        // Supprimer l'image principale
        if ($product->image && !str_starts_with($product->image, 'http')) {
            Storage::disk('public')->delete($product->image);
        }

        // Supprimer la galerie
        if ($product->gallery) {
            foreach ($product->gallery as $img) {
                if (!str_starts_with($img, 'http')) {
                    Storage::disk('public')->delete($img);
                }
            }
        }

        // Supprimer les avis associés
        $product->reviews()->delete();

        $product->delete();

        return $this->success(null, 'Produit supprimé');
    }

    /**
     * GET /api/seller/products — Mes produits (vendeur)
     * Accès : Seller ou Admin
     */
    public function myProducts(Request $request)
    {
        $products = Product::where('seller_id', auth()->id())
            ->with(['category'])
            ->latest()
            ->paginate($request->get('per_page', 15));

        return $this->paginated($products, 'Mes produits');
    }

    /**
     * GET /api/products/featured — Produits mis en avant
     * Accès : Public
     */
    public function featured(Request $request)
    {
        $products = Product::where('is_active', true)
            ->whereNotNull('compare_price')
            ->whereColumn('compare_price', '>', 'price')
            ->with(['category', 'seller'])
            ->latest()
            ->take($request->get('limit', 12))
            ->get();

        return $this->success($products, 'Produits en vedette');
    }
}
