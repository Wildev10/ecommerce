<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\ReviewReply;
use App\Models\Product;
use App\Models\OrderItem;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/products/{product}/reviews — Liste des avis d'un produit
     * Accès : Public
     */
    public function index(Product $product)
    {
        $reviews = $product->reviews()
            ->with(['user:id,name,avatar', 'reply.user:id,name'])
            ->latest()
            ->paginate(10);

        return $this->paginated($reviews, 'Avis du produit');
    }

    /**
     * POST /api/products/{product}/reviews — Ajouter un avis
     * Accès : Authentifié (buyer uniquement)
     */
    public function store(Request $request, Product $product)
    {
        if (!$request->user()->isBuyer()) {
            return $this->error('Seuls les acheteurs peuvent laisser un avis.', 403);
        }

        // Vérifier que l'acheteur a bien commandé ce produit (commande livrée)
        $hasPurchased = OrderItem::where('product_id', $product->id)
            ->whereHas('order', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)
                  ->where('status', 'delivered');
            })->exists();

        if (!$hasPurchased) {
            return $this->error('Vous devez avoir acheté et reçu ce produit pour laisser un avis.', 403);
        }

        $existingReview = Review::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existingReview) {
            return $this->error('Vous avez déjà laissé un avis sur ce produit.', 409);
        }

        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'user_id'    => $request->user()->id,
            'product_id' => $product->id,
            'rating'     => $request->rating,
            'comment'    => $request->comment,
        ]);

        $review->load(['user:id,name,avatar']);

        return $this->success($review, 'Avis ajouté avec succès.', 201);
    }

    /**
     * PUT /api/reviews/{review} — Modifier son avis
     * Accès : Authentifié (propriétaire de l'avis)
     */
    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id) {
            return $this->error('Non autorisé.', 403);
        }

        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review->update([
            'rating'  => $request->rating,
            'comment' => $request->comment,
        ]);

        $review->load('user:id,name,avatar');

        return $this->success($review, 'Avis modifié avec succès.');
    }

    /**
     * DELETE /api/reviews/{review} — Supprimer un avis
     * Accès : Propriétaire ou Admin
     */
    public function destroy(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return $this->error('Non autorisé.', 403);
        }

        $review->delete();

        return $this->success(null, 'Avis supprimé avec succès.');
    }

    /**
     * POST /api/reviews/{review}/reply — Répondre à un avis
     * Accès : Vendeur propriétaire du produit
     */
    public function reply(Request $request, Review $review)
    {
        $user = $request->user();

        // Seul le vendeur propriétaire du produit peut répondre
        if (!$user->isSeller() || $review->product->seller_id !== $user->id) {
            return $this->error('Seul le vendeur de ce produit peut répondre.', 403);
        }

        if ($review->reply) {
            return $this->error('Cet avis a déjà une réponse.', 409);
        }

        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $reply = ReviewReply::create([
            'review_id' => $review->id,
            'user_id'   => $user->id,
            'content'   => $request->content,
        ]);

        $reply->load('user:id,name');

        return $this->success($reply, 'Réponse ajoutée avec succès.', 201);
    }
}
