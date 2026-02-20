<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Liste des avis d'un produit
     */
    public function index(Product $product)
    {
        $reviews = $product->reviews()
            ->with('user:id,name,avatar')
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * Ajouter un avis (buyer uniquement)
     */
    public function store(Request $request, Product $product)
    {
        // Vérifier que c'est un buyer
        if (!$request->user()->isBuyer()) {
            return response()->json([
                'message' => 'Seuls les acheteurs peuvent laisser un avis.'
            ], 403);
        }

        // Vérifier qu'il n'a pas déjà laissé un avis
        $existingReview = Review::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'Vous avez déjà laissé un avis sur ce produit.'
            ], 409);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        $review->load('user:id,name,avatar');

        return response()->json([
            'message' => 'Avis ajouté avec succès.',
            'review' => $review,
        ], 201);
    }

    /**
     * Modifier son avis
     */
    public function update(Request $request, Review $review)
    {
        // Vérifier que c'est bien son avis
        if ($review->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.'
            ], 403);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review->update([
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        $review->load('user:id,name,avatar');

        return response()->json([
            'message' => 'Avis modifié avec succès.',
            'review' => $review,
        ]);
    }

    /**
     * Supprimer son avis (ou admin)
     */
    public function destroy(Request $request, Review $review)
    {
        // Le propriétaire ou l'admin peut supprimer
        if ($review->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Non autorisé.'
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Avis supprimé avec succès.',
        ]);
    }
}
