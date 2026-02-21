<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/orders — Liste des commandes
     * Accès : Authentifié (filtre automatique par rôle)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            $orders = Order::with(['user', 'items', 'address'])
                ->latest()
                ->paginate($request->get('per_page', 15));
        } elseif ($user->role === 'seller') {
            $orders = Order::whereHas('items', function ($q) use ($user) {
                $q->whereHas('product', fn ($p) => $p->where('seller_id', $user->id));
            })->with(['user', 'items' => function ($q) use ($user) {
                $q->whereHas('product', fn ($p) => $p->where('seller_id', $user->id));
            }, 'address'])->latest()->paginate($request->get('per_page', 15));
        } else {
            $orders = Order::where('user_id', $user->id)
                ->with(['items', 'address'])
                ->latest()
                ->paginate($request->get('per_page', 15));
        }

        return $this->paginated($orders, 'Liste des commandes');
    }

    /**
     * POST /api/orders — Créer une commande depuis le panier
     * Accès : Authentifié (buyer)
     */
    public function store(Request $request)
    {
        $request->validate([
            'address_id'     => 'required|exists:addresses,id',
            'payment_method' => 'required|in:cash_on_delivery,mobile_money,card',
            'coupon_code'    => 'nullable|string',
            'notes'          => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Vérifier que l'adresse appartient à l'utilisateur
        $address = $user->addresses()->find($request->address_id);
        if (!$address) {
            return $this->error('Adresse non trouvée', 404);
        }

        // Récupérer les articles du panier
        $cart = \App\Models\Cart::where('user_id', $user->id)->first();
        $cartItems = $cart ? CartItem::where('cart_id', $cart->id)
            ->with('product')
            ->get() : collect([]);

        if ($cartItems->isEmpty()) {
            return $this->error('Votre panier est vide', 400);
        }

        // Vérifier le stock de chaque produit
        foreach ($cartItems as $item) {
            if (!$item->product || !$item->product->is_active) {
                return $this->error("Le produit '{$item->product->name}' n'est plus disponible", 400);
            }
            if ($item->quantity > $item->product->stock) {
                return $this->error(
                    "Stock insuffisant pour '{$item->product->name}'. Disponible: {$item->product->stock}",
                    400
                );
            }
        }

        // Calculer le sous-total
        $subtotal = $cartItems->sum(fn ($item) => $item->quantity * $item->product->price);

        // Coupon
        $discount = 0;
        $couponId = null;

        if ($request->coupon_code) {
            $coupon = Coupon::where('code', $request->coupon_code)->first();

            if (!$coupon || !$coupon->isValid()) {
                return $this->error('Code promo invalide ou expiré', 400);
            }

            $discount = $coupon->calculateDiscount($subtotal);
            $couponId = $coupon->id;
        }

        // Frais de livraison
        $shippingFee = $subtotal >= 50000 ? 0 : 2000;
        $total = $subtotal - $discount + $shippingFee;

        // Créer la commande dans une transaction
        $order = DB::transaction(function () use (
            $user, $cart, $cartItems, $subtotal, $discount, $shippingFee, $total,
            $couponId, $request
        ) {
            $order = Order::create([
                'user_id'        => $user->id,
                'address_id'     => $request->address_id,
                'coupon_id'      => $couponId,
                'order_number'   => Order::generateOrderNumber(),
                'status'         => Order::STATUS_PENDING,
                'payment_status' => Order::PAYMENT_PENDING,
                'payment_method' => $request->payment_method,
                'subtotal'       => $subtotal,
                'discount'       => $discount,
                'shipping_fee'   => $shippingFee,
                'total'          => $total,
                'notes'          => $request->notes,
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id'      => $order->id,
                    'product_id'    => $item->product_id,
                    'product_name'  => $item->product->name,
                    'product_price' => $item->product->price,
                    'quantity'      => $item->quantity,
                    'total'         => $item->quantity * $item->product->price,
                ]);

                $item->product->decrement('stock', $item->quantity);
            }

            if ($couponId) {
                Coupon::where('id', $couponId)->increment('used_count');
            }

            $order->statusHistory()->create([
                'old_status' => null,
                'new_status' => Order::STATUS_PENDING,
                'note'       => 'Commande créée',
                'changed_by' => $user->id,
            ]);

            if ($cart) {
                CartItem::where('cart_id', $cart->id)->delete();
            }

            return $order;
        });

        $order->load(['items', 'address', 'statusHistory']);

        return $this->success($order, 'Commande créée avec succès', 201);
    }

    /**
     * GET /api/orders/{id} — Détails d'une commande
     * Accès : Authentifié (propriétaire, seller concerné, ou admin)
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $query = Order::with(['items.product', 'address', 'coupon', 'statusHistory.changedBy', 'user', 'payment']);

        if ($user->role === 'admin') {
            $order = $query->findOrFail($id);
        } elseif ($user->role === 'seller') {
            $order = $query->whereHas('items', function ($q) use ($user) {
                $q->whereHas('product', fn ($p) => $p->where('seller_id', $user->id));
            })->findOrFail($id);
        } else {
            $order = $query->where('user_id', $user->id)->findOrFail($id);
        }

        return $this->success($order, 'Détail de la commande');
    }

    /**
     * PUT /api/orders/{id}/status — Mettre à jour le statut
     * Accès : Admin ou Seller concerné
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status'  => 'required|in:confirmed,processing,shipped,delivered,cancelled',
            'comment' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $order = Order::findOrFail($id);

        // Sauvegarder l'ancien statut AVANT la mise à jour
        $oldStatus = $order->status;

        // Vérification des permissions
        if ($user->role === 'seller') {
            $hasSellerItems = $order->items()
                ->whereHas('product', fn ($p) => $p->where('seller_id', $user->id))
                ->exists();
            if (!$hasSellerItems) {
                return $this->error('Non autorisé', 403);
            }
        } elseif ($user->role !== 'admin') {
            return $this->error('Non autorisé', 403);
        }

        // Annulation : remettre le stock
        if ($request->status === 'cancelled' && $oldStatus !== Order::STATUS_CANCELLED) {
            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)->increment('stock', $item->quantity);
            }
        }

        $order->update(['status' => $request->status]);

        // Si livré, marquer comme payé (cash on delivery)
        if ($request->status === 'delivered' && $order->payment_method === 'cash_on_delivery') {
            $order->update(['payment_status' => Order::PAYMENT_PAID]);
        }

        // Historique
        $order->statusHistory()->create([
            'old_status' => $oldStatus,
            'new_status' => $request->status,
            'note'       => $request->comment ?? 'Statut mis à jour vers ' . $request->status,
            'changed_by' => $user->id,
        ]);

        $order->load(['items', 'statusHistory']);

        return $this->success($order, 'Statut mis à jour');
    }

    /**
     * POST /api/orders/{id}/cancel — Annuler une commande (client)
     * Accès : Authentifié (propriétaire, commande pending/confirmed)
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::where('user_id', $user->id)->findOrFail($id);

        if (!in_array($order->status, [Order::STATUS_PENDING, Order::STATUS_CONFIRMED])) {
            return $this->error('Cette commande ne peut plus être annulée', 400);
        }

        $oldStatus = $order->status;

        DB::transaction(function () use ($order, $user, $oldStatus) {
            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)->increment('stock', $item->quantity);
            }

            $order->update(['status' => Order::STATUS_CANCELLED]);

            $order->statusHistory()->create([
                'old_status' => $oldStatus,
                'new_status' => Order::STATUS_CANCELLED,
                'note'       => 'Commande annulée par le client',
                'changed_by' => $user->id,
            ]);
        });

        $order->load(['items', 'statusHistory']);

        return $this->success($order, 'Commande annulée avec succès');
    }

    /**
     * POST /api/orders/apply-coupon — Vérifier un coupon avant commande
     * Accès : Authentifié
     */
    public function applyCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon || !$coupon->isValid()) {
            return $this->error('Code promo invalide ou expiré', 400);
        }

        // Calculer le total du panier (correction: utiliser cart_id et non user_id)
        $cart = \App\Models\Cart::where('user_id', $request->user()->id)->first();
        $cartItems = $cart
            ? CartItem::where('cart_id', $cart->id)->with('product')->get()
            : collect([]);

        $subtotal = $cartItems->sum(fn ($item) => $item->quantity * $item->product->price);
        $discount = $coupon->calculateDiscount($subtotal);

        return $this->success([
            'coupon' => [
                'code'  => $coupon->code,
                'type'  => $coupon->type,
                'value' => $coupon->discount,
            ],
            'subtotal'             => $subtotal,
            'discount'             => $discount,
            'total_after_discount' => $subtotal - $discount,
        ], 'Code promo valide');
    }
}
