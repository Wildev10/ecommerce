<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // Dashboard stats
    public function dashboard()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'total_revenue' => Order::where('payment_status', 'paid')->sum('total'),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'recent_orders' => Order::with('user')->latest()->take(5)->get(),
        ]);
    }

    // Liste des utilisateurs
    public function users()
    {
        $users = User::latest()->paginate(15);
        return response()->json($users);
    }

    // Changer le rôle d'un utilisateur
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:buyer,seller,admin',
        ]);

        $user = User::findOrFail($id);
        $user->update(['role' => $request->role]);

        return response()->json([
            'message' => 'Rôle mis à jour',
            'user' => $user,
        ]);
    }

    // Toutes les commandes (admin)
    public function orders()
    {
        $orders = Order::with(['user', 'items', 'address'])
            ->latest()
            ->paginate(15);

        return response()->json($orders);
    }

    // Mettre à jour le statut d'une commande
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        $order->statusHistory()->create([
            'old_status' => $order->getOriginal('status'),
            'new_status' => $request->status,
            'note' => 'Mis à jour par admin',
            'changed_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Statut mis à jour',
            'order' => $order->load('statusHistory'),
        ]);
    }
}
