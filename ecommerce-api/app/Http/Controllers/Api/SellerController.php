<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Commission;
use App\Models\ShippingZone;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SellerController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/seller/dashboard — Statistiques du vendeur
     * Accès : Seller (middleware seller)
     */
    public function dashboard()
    {
        $sellerId = auth()->id();

        $productIds = Product::where('seller_id', $sellerId)->pluck('id');

        $totalRevenue = OrderItem::whereIn('product_id', $productIds)
            ->whereHas('order', fn ($q) => $q->where('payment_status', 'paid'))
            ->sum('total');

        $totalOrders = Order::whereHas('items', function ($q) use ($productIds) {
            $q->whereIn('product_id', $productIds);
        })->count();

        $pendingOrders = Order::whereHas('items', function ($q) use ($productIds) {
            $q->whereIn('product_id', $productIds);
        })->where('status', 'pending')->count();

        $topProducts = OrderItem::select('product_id', 'product_name')
            ->selectRaw('SUM(quantity) as total_sold')
            ->selectRaw('SUM(total) as total_revenue')
            ->whereIn('product_id', $productIds)
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_sold')
            ->take(5)
            ->get();

        $monthlySales = OrderItem::whereIn('product_id', $productIds)
            ->whereHas('order', fn ($q) => $q->where('payment_status', 'paid'))
            ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, SUM(total) as revenue')
            ->groupByRaw('YEAR(created_at), MONTH(created_at)')
            ->orderByRaw('YEAR(created_at) DESC, MONTH(created_at) DESC')
            ->take(12)
            ->get();

        return $this->success([
            'total_products'  => Product::where('seller_id', $sellerId)->count(),
            'active_products' => Product::where('seller_id', $sellerId)->where('is_active', true)->count(),
            'total_orders'    => $totalOrders,
            'pending_orders'  => $pendingOrders,
            'total_revenue'   => round($totalRevenue, 2),
            'total_commission'=> round(Commission::where('seller_id', $sellerId)->sum('commission_amount'), 2),
            'net_revenue'     => round(Commission::where('seller_id', $sellerId)->sum('seller_amount'), 2),
            'wallet_balance'  => round(auth()->user()->getOrCreateWallet()->balance, 2),
            'top_products'    => $topProducts,
            'monthly_sales'   => $monthlySales,
        ], 'Dashboard vendeur');
    }

    /**
     * GET /api/seller/orders — Commandes contenant mes produits
     * Accès : Seller
     */
    public function orders(Request $request)
    {
        $sellerId = auth()->id();

        $orders = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->whereHas('product', fn ($p) => $p->where('seller_id', $sellerId));
        })->with(['user', 'items' => function ($q) use ($sellerId) {
            $q->whereHas('product', fn ($p) => $p->where('seller_id', $sellerId));
        }, 'address'])
            ->latest()
            ->paginate($request->get('per_page', 15));

        return $this->paginated($orders, 'Commandes du vendeur');
    }

    /**
     * GET /api/seller/orders/{id} — Détails d'une commande (vendeur)
     * Accès : Seller
     */
    public function orderShow($id)
    {
        $sellerId = auth()->id();

        $order = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->whereHas('product', fn ($p) => $p->where('seller_id', $sellerId));
        })->with(['user', 'items' => function ($q) use ($sellerId) {
            $q->whereHas('product', fn ($p) => $p->where('seller_id', $sellerId));
        }, 'address', 'statusHistory'])
            ->findOrFail($id);

        return $this->success($order, 'Détail commande vendeur');
    }

    /**
     * PUT /api/seller/orders/{id}/status — Mettre à jour le statut (vendeur)
     * Accès : Seller (ses propres commandes)
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status'  => 'required|in:confirmed,processing,shipped',
            'comment' => 'nullable|string|max:500',
        ]);

        $sellerId = auth()->id();

        $order = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->whereHas('product', fn ($p) => $p->where('seller_id', $sellerId));
        })->findOrFail($id);

        $oldStatus = $order->status;

        $order->update(['status' => $request->status]);

        $order->statusHistory()->create([
            'old_status' => $oldStatus,
            'new_status' => $request->status,
            'note'       => $request->comment ?? 'Statut mis à jour par le vendeur',
            'changed_by' => auth()->id(),
        ]);

        $order->load(['items', 'statusHistory']);

        return $this->success($order, 'Statut mis à jour');
    }

    /**
     * PUT /api/seller/orders/{id}/tracking — Ajouter un numéro de suivi
     */
    public function updateTracking(Request $request, $id)
    {
        $request->validate([
            'tracking_number'    => 'required|string|max:100',
            'estimated_delivery' => 'nullable|date|after:today',
        ]);

        $sellerId = auth()->id();

        $order = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->whereHas('product', fn ($p) => $p->where('seller_id', $sellerId));
        })->findOrFail($id);

        $order->update([
            'tracking_number'    => $request->tracking_number,
            'estimated_delivery' => $request->estimated_delivery,
        ]);

        return $this->success($order, 'Numéro de suivi ajouté');
    }

    // ══════════════════════════════════════
    //  SHIPPING ZONES
    // ══════════════════════════════════════

    /**
     * GET /api/seller/shipping-zones — Mes zones de livraison
     */
    public function shippingZones()
    {
        $zones = ShippingZone::where('seller_id', auth()->id())
            ->orderBy('name')
            ->get();

        return $this->success($zones, 'Zones de livraison');
    }

    /**
     * POST /api/seller/shipping-zones — Créer une zone
     */
    public function storeShippingZone(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'price'          => 'required|numeric|min:0',
            'estimated_days' => 'required|integer|min:1',
            'is_active'      => 'boolean',
        ]);

        $zone = ShippingZone::create([
            'seller_id'      => auth()->id(),
            'name'           => $request->name,
            'price'          => $request->price,
            'estimated_days' => $request->estimated_days,
            'is_active'      => $request->get('is_active', true),
        ]);

        return $this->success($zone, 'Zone de livraison créée', 201);
    }

    /**
     * PUT /api/seller/shipping-zones/{id} — Modifier une zone
     */
    public function updateShippingZone(Request $request, $id)
    {
        $zone = ShippingZone::where('seller_id', auth()->id())->findOrFail($id);

        $request->validate([
            'name'           => 'sometimes|string|max:255',
            'price'          => 'sometimes|numeric|min:0',
            'estimated_days' => 'sometimes|integer|min:1',
            'is_active'      => 'boolean',
        ]);

        $zone->update($request->only(['name', 'price', 'estimated_days', 'is_active']));

        return $this->success($zone, 'Zone de livraison mise à jour');
    }

    /**
     * DELETE /api/seller/shipping-zones/{id} — Supprimer une zone
     */
    public function destroyShippingZone($id)
    {
        $zone = ShippingZone::where('seller_id', auth()->id())->findOrFail($id);
        $zone->delete();

        return $this->success(null, 'Zone de livraison supprimée');
    }
}
