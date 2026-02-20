<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;

class OrderController extends Controller
{
    /**
     * PASSER UNE COMMANDE
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Trouver le panier
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Votre panier est vide',
            ], 400);
        }

        $cart->load('items.product');

        // Calculer le total
        $total = 0;
        foreach ($cart->items as $item) {
            $total += $item->product->price * $item->quantity;
        }

        // Créer la commande
        $order = Order::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'total' => $total,
        ]);

        // Créer les items de la commande
        foreach ($cart->items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'price' => $item->product->price,
            ]);
        }

        // Vider le panier
        $cart->items()->delete();

        $order->load('items.product');

        return response()->json([
            'message' => 'Commande passée avec succès',
            'order' => $order,
        ], 201);
    }

    /**
     * LISTE DES COMMANDES
     */
    public function index(Request $request)
    {
        $orders = $request->user()->orders()->with('items.product')->latest()->get();

        return response()->json($orders);
    }

    /**
     * DÉTAIL D'UNE COMMANDE
     */
    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $order->load('items.product');

        return response()->json($order);
    }
}
