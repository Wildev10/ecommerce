<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/cart — Voir mon panier
     * Accès : Authentifié
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        $cart->load('items.product');

        $total = 0;
        foreach ($cart->items as $item) {
            $total += $item->product->price * $item->quantity;
        }

        return $this->success([
            'cart_id' => $cart->id,
            'items'   => $cart->items->map(function ($item) {
                return [
                    'item_id'       => $item->id,
                    'product_id'    => $item->product->id,
                    'product_name'  => $item->product->name,
                    'product_price' => $item->product->price,
                    'product_image' => $item->product->image_url,
                    'quantity'      => $item->quantity,
                    'subtotal'      => round($item->product->price * $item->quantity, 2),
                ];
            }),
            'items_count' => $cart->items->sum('quantity'),
            'total'       => round($total, 2),
        ], 'Panier récupéré');
    }

    /**
     * POST /api/cart — Ajouter un produit au panier
     * Accès : Authentifié
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $user = $request->user();

        // Vérifier le stock
        $product = Product::findOrFail($request->product_id);
        if (!$product->is_active) {
            return $this->error('Ce produit n\'est plus disponible', 400);
        }

        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->first();

        $newQty = $cartItem ? $cartItem->quantity + $request->quantity : $request->quantity;

        if ($newQty > $product->stock) {
            return $this->error("Stock insuffisant. Disponible: {$product->stock}", 400);
        }

        if ($cartItem) {
            $cartItem->quantity = $newQty;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create([
                'cart_id'    => $cart->id,
                'product_id' => $request->product_id,
                'quantity'   => $request->quantity,
            ]);
        }

        $cartItem->load('product');

        return $this->success([
            'item_id'      => $cartItem->id,
            'product_name' => $cartItem->product->name,
            'quantity'     => $cartItem->quantity,
            'subtotal'     => round($cartItem->product->price * $cartItem->quantity, 2),
        ], 'Produit ajouté au panier', 201);
    }

    /**
     * PUT /api/cart/{cartItem} — Modifier la quantité d'un item
     * Accès : Authentifié (propriétaire du panier)
     */
    public function update(Request $request, CartItem $cartItem)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart || $cartItem->cart_id !== $cart->id) {
            return $this->error('Item non trouvé dans votre panier', 403);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // Vérifier le stock
        if ($request->quantity > $cartItem->product->stock) {
            return $this->error("Stock insuffisant. Disponible: {$cartItem->product->stock}", 400);
        }

        $cartItem->quantity = $request->quantity;
        $cartItem->save();
        $cartItem->load('product');

        return $this->success([
            'item_id'      => $cartItem->id,
            'product_name' => $cartItem->product->name,
            'quantity'     => $cartItem->quantity,
            'subtotal'     => round($cartItem->product->price * $cartItem->quantity, 2),
        ], 'Quantité mise à jour');
    }

    /**
     * DELETE /api/cart/{cartItem} — Supprimer un item du panier
     * Accès : Authentifié (propriétaire du panier)
     */
    public function destroy(Request $request, CartItem $cartItem)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart || $cartItem->cart_id !== $cart->id) {
            return $this->error('Item non trouvé dans votre panier', 403);
        }

        $cartItem->delete();

        return $this->success(null, 'Produit retiré du panier');
    }

    /**
     * DELETE /api/cart — Vider tout le panier
     * Accès : Authentifié
     */
    public function clear(Request $request)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if ($cart) {
            $cart->items()->delete();
        }

        return $this->success(null, 'Panier vidé');
    }
}
