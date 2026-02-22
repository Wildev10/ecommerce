<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Payment;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderStatusChangedMail;

class AdminController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/admin/dashboard — Statistiques du dashboard
     * Accès : Admin
     */
    public function dashboard()
    {
        return $this->success([
            'total_users'    => User::count(),
            'total_products' => Product::count(),
            'total_orders'   => Order::count(),
            'total_revenue'  => Order::where('payment_status', 'paid')->sum('total'),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'recent_orders'  => Order::with('user')->latest()->take(5)->get(),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'orders_today'   => Order::whereDate('created_at', today())->count(),
        ], 'Dashboard administrateur');
    }

    /**
     * GET /api/admin/users — Liste des utilisateurs
     * Accès : Admin
     */
    public function users(Request $request)
    {
        $query = User::query();

        // Filtre par rôle
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate($request->get('per_page', 15));

        return $this->paginated($users, 'Liste des utilisateurs');
    }

    /**
     * PUT /api/admin/users/{id}/role — Changer le rôle d'un utilisateur
     * Accès : Admin
     */
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:buyer,seller,admin',
        ]);

        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return $this->error('Vous ne pouvez pas modifier votre propre rôle', 400);
        }

        $user->update(['role' => $request->role]);

        return $this->success($user, 'Rôle mis à jour');
    }

    /**
     * PUT /api/admin/users/{id}/toggle — Activer/Désactiver un utilisateur
     * Accès : Admin
     */
    public function toggleUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return $this->error('Vous ne pouvez pas vous désactiver vous-même', 400);
        }

        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'activé' : 'désactivé';

        return $this->success($user, "Utilisateur {$status}");
    }

    /**
     * GET /api/admin/orders — Toutes les commandes
     * Accès : Admin
     */
    public function orders(Request $request)
    {
        $query = Order::with(['user', 'items', 'address']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate($request->get('per_page', 15));

        return $this->paginated($orders, 'Liste des commandes');
    }

    /**
     * PUT /api/admin/orders/{id}/status — Mettre à jour le statut d'une commande
     * Accès : Admin
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $oldStatus = $order->status;

        // Si annulation, remettre le stock
        if ($request->status === 'cancelled' && $oldStatus !== 'cancelled') {
            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)->increment('stock', $item->quantity);
            }
        }

        $order->update(['status' => $request->status]);

        // Si livré + cash on delivery, marquer comme payé
        if ($request->status === 'delivered' && $order->payment_method === 'cash_on_delivery') {
            $order->update(['payment_status' => 'paid']);
        }

        $order->statusHistory()->create([
            'old_status' => $oldStatus,
            'new_status' => $request->status,
            'note'       => 'Mis à jour par admin',
            'changed_by' => $request->user()->id,
        ]);

        $order->load(['user', 'statusHistory']);
        Mail::to($order->user)->send(new OrderStatusChangedMail($order, $oldStatus, $request->status));

        return $this->success(
            $order,
            'Statut mis à jour'
        );
    }

    /**
     * GET /api/admin/products — Tous les produits (admin)
     * Accès : Admin
     */
    public function products(Request $request)
    {
        $query = Product::with(['category', 'seller']);

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $products = $query->latest()->paginate($request->get('per_page', 15));

        return $this->paginated($products, 'Liste des produits (admin)');
    }

    /**
     * PUT /api/admin/products/{id}/toggle — Activer/Désactiver un produit
     * Accès : Admin
     */
    public function toggleProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => !$product->is_active]);

        $status = $product->is_active ? 'activé' : 'désactivé';

        return $this->success($product, "Produit {$status}");
    }

    /**
     * GET /api/admin/users/{id} — Détail d'un utilisateur
     * Accès : Admin
     */
    public function userShow($id)
    {
        $user = User::with(['orders' => function ($q) {
            $q->latest()->take(10);
        }, 'addresses', 'reviews.product'])->findOrFail($id);

        return $this->success($user, 'Détail utilisateur');
    }

    /**
     * GET /api/admin/reviews — Liste de tous les avis (modération)
     * Accès : Admin
     */
    public function reviews(Request $request)
    {
        $query = Review::with(['user:id,name,email', 'product:id,name,slug']);

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('comment', 'like', "%{$search}%");
        }

        $reviews = $query->latest()->paginate($request->get('per_page', 15));

        return $this->paginated($reviews, 'Liste des avis (admin)');
    }

    /**
     * DELETE /api/admin/reviews/{id} — Supprimer un avis (modération)
     * Accès : Admin
     */
    public function deleteReview($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return $this->success(null, 'Avis supprimé par l\'admin');
    }

    /**
     * DELETE /api/admin/users/{id} — Supprimer un utilisateur
     * Accès : Admin
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return $this->error('Vous ne pouvez pas supprimer votre propre compte', 400);
        }

        if ($user->orders()->exists()) {
            return $this->error('Cet utilisateur a des commandes et ne peut pas être supprimé. Désactivez-le à la place.', 409);
        }

        $user->tokens()->delete();
        $user->delete();

        return $this->success(null, 'Utilisateur supprimé');
    }

    /**
     * DELETE /api/admin/products/{id} — Supprimer un produit (admin)
     * Accès : Admin
     */
    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);

        if ($product->orderItems()->exists()) {
            return $this->error(
                'Ce produit est lié à des commandes existantes. Désactivez-le à la place.',
                409
            );
        }

        if ($product->image && !str_starts_with($product->image, 'http')) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($product->image);
        }

        if ($product->gallery) {
            foreach ($product->gallery as $img) {
                if (!str_starts_with($img, 'http')) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($img);
                }
            }
        }

        $product->reviews()->delete();
        $product->delete();

        return $this->success(null, 'Produit supprimé par l\'admin');
    }
}
