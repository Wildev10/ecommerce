<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Services\CommissionService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/delivery/dashboard
     */
    public function dashboard()
    {
        $userId = auth()->id();

        $pendingDeliveries = Order::where('delivery_person_id', $userId)
            ->where('status', 'shipped')
            ->count();

        $activeDeliveries = Order::where('delivery_person_id', $userId)
            ->where('status', 'delivering')
            ->count();

        $completedToday = Order::where('delivery_person_id', $userId)
            ->where('status', 'delivered')
            ->whereDate('updated_at', today())
            ->count();

        $totalCompleted = Order::where('delivery_person_id', $userId)
            ->where('status', 'delivered')
            ->count();

        $currentOrders = Order::where('delivery_person_id', $userId)
            ->whereIn('status', ['shipped', 'delivering'])
            ->with(['user:id,name', 'address:id,quarter,city,phone,street_address,full_name'])
            ->latest()
            ->take(10)
            ->get();

        return $this->success([
            'pending_deliveries' => $pendingDeliveries,
            'active_deliveries' => $activeDeliveries,
            'completed_today' => $completedToday,
            'total_completed' => $totalCompleted,
            'current_orders' => $currentOrders,
        ], 'Tableau de bord livreur');
    }

    /**
     * GET /api/delivery/orders
     */
    public function orders(Request $request)
    {
        $status = $request->get('status', 'shipped');
        $allowedStatuses = ['shipped', 'delivering'];

        if (!in_array($status, $allowedStatuses)) {
            $status = 'shipped';
        }

        $orders = Order::where('delivery_person_id', auth()->id())
            ->where('status', $status)
            ->with(['user:id,name,email', 'address', 'items.product:id,name,price,image_url'])
            ->latest()
            ->paginate($request->get('per_page', 15));

        return $this->paginated($orders, 'Mes livraisons');
    }

    /**
     * PUT /api/delivery/orders/{id}/status
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $order = Order::where('delivery_person_id', auth()->id())->findOrFail($id);

        $request->validate([
            'status' => 'required|in:delivering,delivered',
        ]);

        $newStatus = $request->status;
        $allowed = [
            'shipped' => ['delivering'],
            'delivering' => ['delivered'],
        ];

        if (!isset($allowed[$order->status]) || !in_array($newStatus, $allowed[$order->status])) {
            return $this->error('Transition de statut non autorisée', 422);
        }

        $oldStatus = $order->status;
        $order->update(['status' => $newStatus]);

        // Si livré + cash on delivery, marquer comme payé
        if ($newStatus === 'delivered' && $order->payment_method === 'cash_on_delivery') {
            $order->update(['payment_status' => 'paid']);
        }

        // Si livré, transférer les commissions de pending vers available
        if ($newStatus === 'delivered') {
            app(CommissionService::class)->settleForOrder($order);
        }

        OrderStatusHistory::create([
            'order_id' => $order->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => auth()->id(),
            'note' => $request->get('comment', 'Mis à jour par le livreur'),
        ]);

        return $this->success($order->fresh()->load(['user:id,name', 'address']), 'Statut mis à jour');
    }

    /**
     * GET /api/delivery/history
     */
    public function history(Request $request)
    {
        $orders = Order::where('delivery_person_id', auth()->id())
            ->where('status', 'delivered')
            ->with(['user:id,name', 'address:id,quarter,city'])
            ->latest('updated_at')
            ->paginate($request->get('per_page', 15));

        return $this->paginated($orders, 'Historique des livraisons');
    }
}
