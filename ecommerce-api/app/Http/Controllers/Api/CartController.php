<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;

class CartController extends Controller
{
    /**
     * VOIR MON PANIER
     * GET /api/cart
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

        return response()->json([
            'cart_id' => $cart->id,
            'items' => $cart->items->map(function ($item) {
                return [
                    'item_id' => $item->id,
                    'product_id' => $item->product->id,
                    'product_name' => $item->product->name,
                    'product_price' => $item->product->price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->product->price * $item->quantity,
                ];
            }),
            'total' => $total,
        ]);
    }

    /**
     * AJOUTER UN PRODUIT AU PANIER
     * POST /api/cart
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();

        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $request->quantity;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        $cartItem->load('product');

        return response()->json([
            'message' => 'Produit ajouté au panier',
            'item' => [
                'item_id' => $cartItem->id,
                'product_name' => $cartItem->product->name,
                'quantity' => $cartItem->quantity,
                'subtotal' => $cartItem->product->price * $cartItem->quantity,
            ],
        ], 201);
    }

    /**
     * MODIFIER LA QUANTITÉ D'UN ITEM
     * PUT /api/cart/{cartItem}
     */
    public function update(Request $request, CartItem $cartItem)
    {
        $user = $request->user();

        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart || $cartItem->cart_id !== $cart->id) {
            return response()->json([
                'message' => 'Item non trouvé dans votre panier',
            ], 403);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem->quantity = $request->quantity;
        $cartItem->save();

        $cartItem->load('product');

        return response()->json([
            'message' => 'Quantité mise à jour',
            'item' => [
                'item_id' => $cartItem->id,
                'product_name' => $cartItem->product->name,
                'quantity' => $cartItem->quantity,
                'subtotal' => $cartItem->product->price * $cartItem->quantity,
            ],
        ]);
    }

    /**
     * SUPPRIMER UN ITEM DU PANIER
     * DELETE /api/cart/{cartItem}
     */
    public function destroy(Request $request, CartItem $cartItem)
    {
        $user = $request->user();

        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart || $cartItem->cart_id !== $cart->id) {
            return response()->json([
                'message' => 'Item non trouvé dans votre panier',
            ], 403);
        }

        $cartItem->delete();

        return response()->json([
            'message' => 'Produit retiré du panier',
        ]);
    }

    /**
     * VIDER TOUT LE PANIER
     * DELETE /api/cart
     */
    public function clear(Request $request)
    {
        $user = $request->user();

        $cart = Cart::where('user_id', $user->id)->first();

        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json([
            'message' => 'Panier vidé',
        ]);
    }
}
