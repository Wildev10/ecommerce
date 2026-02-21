<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    // GET /api/products
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

        // Recherche
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Tri par prix
        if ($request->sort === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($request->sort === 'price_desc') {
            $query->orderBy('price', 'desc');
        } else {
            $query->latest();
        }

        $products = $query->paginate(12);

        return response()->json($products);
    }

    // GET /api/products/{product}
    public function show($id)
    {
        $product = Product::where('id', $id)
            ->orWhere('slug', $id)
            ->with(['category', 'seller', 'reviews.user'])
            ->firstOrFail();

        return response()->json($product);
    }

    // POST /api/products (Seller)
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string',
        ]);

        $product = Product::create([
            'seller_id' => auth()->id(),
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . uniqid(),
            'description' => $request->description,
            'price' => $request->price,
            'compare_price' => $request->compare_price,
            'stock' => $request->stock,
            'image' => $request->image,
            'gallery' => $request->gallery,
        ]);

        return response()->json($product, 201);
    }

    // PUT /api/products/{id}
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Vérifier que c'est bien le vendeur
        if ($product->seller_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
        ]);

        $data = $request->only(['category_id', 'name', 'description', 'price', 'compare_price', 'stock', 'image', 'gallery']);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . uniqid();
        }

        $product->update($data);

        return response()->json($product);
    }

    // DELETE /api/products/{id}
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($product->seller_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $product->delete();

        return response()->json(['message' => 'Produit supprimé']);
    }
}
