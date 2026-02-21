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
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'image'       => 'nullable|string',
        ]);

        $category->update([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name),
            'description' => $request->description,
            'image'       => $request->image,
        ]);

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
}
