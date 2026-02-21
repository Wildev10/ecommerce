<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/search?q=xxx — Recherche globale (produits + catégories)
     * Accès : Public
     */
    public function index(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $query = $request->q;

        $products = Product::where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            })
            ->with(['category', 'seller'])
            ->take(20)
            ->get();

        $categories = Category::where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            })
            ->withCount('products')
            ->take(10)
            ->get();

        return $this->success([
            'products'   => $products,
            'categories' => $categories,
            'query'      => $query,
            'counts'     => [
                'products'   => $products->count(),
                'categories' => $categories->count(),
            ],
        ], 'Résultats de recherche');
    }
}
