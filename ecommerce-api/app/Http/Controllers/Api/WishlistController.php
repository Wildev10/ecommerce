<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/wishlist — Liste des favoris
     * Accès : Authentifié
     */
    public function index(Request $request)
    {
        $wishlists = Wishlist::where('user_id', auth()->id())
            ->with(['product.category', 'product.seller'])
            ->latest()
            ->paginate($request->get('per_page', 15));

        return $this->paginated($wishlists, 'Ma liste de favoris');
    }

    /**
     * POST /api/wishlist — Ajouter un produit aux favoris
     * Accès : Authentifié
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $product = Product::findOrFail($request->product_id);

        if (!$product->is_active) {
            return $this->error('Ce produit n\'est pas disponible', 400);
        }

        $existing = Wishlist::where('user_id', auth()->id())
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            return $this->error('Ce produit est déjà dans vos favoris', 409);
        }

        $wishlist = Wishlist::create([
            'user_id'    => auth()->id(),
            'product_id' => $request->product_id,
        ]);

        $wishlist->load('product');

        return $this->success($wishlist, 'Produit ajouté aux favoris', 201);
    }

    /**
     * DELETE /api/wishlist/{productId} — Retirer un produit des favoris
     * Accès : Authentifié
     */
    public function destroy($productId)
    {
        $wishlist = Wishlist::where('user_id', auth()->id())
            ->where('product_id', $productId)
            ->first();

        if (!$wishlist) {
            return $this->error('Produit non trouvé dans vos favoris', 404);
        }

        $wishlist->delete();

        return $this->success(null, 'Produit retiré des favoris');
    }

    /**
     * GET /api/wishlist/check/{productId} — Vérifier si un produit est en favoris
     * Accès : Authentifié
     */
    public function check($productId)
    {
        $exists = Wishlist::where('user_id', auth()->id())
            ->where('product_id', $productId)
            ->exists();

        return $this->success([
            'in_wishlist' => $exists,
        ], $exists ? 'Produit dans les favoris' : 'Produit pas dans les favoris');
    }

    /**
     * DELETE /api/wishlist — Vider les favoris
     * Accès : Authentifié
     */
    public function clear()
    {
        Wishlist::where('user_id', auth()->id())->delete();

        return $this->success(null, 'Liste de favoris vidée');
    }
}
