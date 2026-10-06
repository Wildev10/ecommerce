<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/categories — Liste des catégories actives
     * Accès : Public
     */
    public function index()
    {
        $categories = Category::where('is_active', true)
            ->withCount('products')
            ->get();

        return $this->success($categories, 'Liste des catégories');
    }

    /**
     * GET /api/categories/{slug} — Détail d'une catégorie avec ses produits
     * Accès : Public
     */
    public function show($slug)
    {
        $category = Category::where('slug', $slug)
            ->orWhere('id', $slug)
            ->with(['products' => function ($q) {
                $q->where('is_active', true)->with('seller');
            }])
            ->firstOrFail();

        return $this->success($category, 'Détail de la catégorie');
    }

    /**
     * POST /api/admin/categories — Créer une catégorie
     * Accès : Admin uniquement
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'image'       => 'nullable|string',
        ]);

        try {
            $category = Category::create([
                'name'        => $request->name,
                'slug'        => Str::slug($request->name),
                'description' => $request->description,
                'image'       => $request->image,
            ]);

            return $this->success($category, 'Catégorie créée avec succès', 201);
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            return $this->error('Cette catégorie existe déjà.', 409);
        }
    }

    /**
     * PUT /api/admin/categories/{id} — Modifier une catégorie
     * Accès : Admin uniquement
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name'        => 'sometimes|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
            'image'       => 'nullable|string',
        ]);

        $data = $request->only(['name', 'description', 'image']);
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return $this->success($category, 'Catégorie modifiée');
    }

    /**
     * DELETE /api/admin/categories/{id} — Supprimer une catégorie
     * Accès : Admin uniquement
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->count() > 0) {
            return $this->error('Impossible de supprimer : cette catégorie contient des produits', 409);
        }

        $category->delete();

        return $this->success(null, 'Catégorie supprimée');
    }

    /**
     * GET /api/categories/{slug}/products — Produits d'une catégorie
     * Accès : Public
     */
    public function products(Request $request, $slug)
    {
        $category = Category::where('slug', $slug)
            ->orWhere('id', $slug)
            ->firstOrFail();

        // Inclure les produits des sous-catégories
        $categoryIds = collect([$category->id]);
        $childIds = Category::where('parent_id', $category->id)->pluck('id');
        $categoryIds = $categoryIds->merge($childIds);

        $products = \App\Models\Product::whereIn('category_id', $categoryIds)
            ->where('is_active', true)
            ->with(['category', 'seller'])
            ->latest()
            ->paginate($request->get('per_page', 12));

        return $this->paginated($products, "Produits de la catégorie {$category->name}");
    }

    /**
     * GET /api/admin/categories — Liste de toutes les catégories (admin)
     * Accès : Admin
     */
    public function adminIndex(Request $request)
    {
        $categories = Category::withCount('products')
            ->with('children')
            ->whereNull('parent_id')
            ->latest()
            ->get();

        return $this->success($categories, 'Liste des catégories (admin)');
    }
}
