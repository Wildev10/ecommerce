<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
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
}
