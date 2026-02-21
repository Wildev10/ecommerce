<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use ApiResponse;

    /**
     * POST /api/orders/{orderId}/pay — Payer une commande
     * Accès : Authentifié (propriétaire de la commande)
     */
    public function pay(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);

        if ($order->user_id !== auth()->id()) {
            return $this->error('Non autorisé', 403);
        }

        if ($order->payment) {
            return $this->error('Cette commande est déjà payée', 400);
        }

        $request->validate([
            'payment_method' => 'required|in:credit_card,paypal,bank_transfer,cash_on_delivery,mobile_money',
        ]);

        $payment = Payment::create([
            'order_id'       => $order->id,
            'user_id'        => auth()->id(),
            'amount'         => $order->total,
            'method'         => $request->payment_method,
            'status'         => 'completed',
            'transaction_id' => 'TXN-' . strtoupper(uniqid()),
        ]);

        $order->update([
            'status'         => 'processing',
            'payment_status' => 'paid',
            'transaction_id' => $payment->transaction_id,
        ]);

        return $this->success($payment, 'Paiement effectué avec succès', 201);
    }

    /**
     * GET /api/payments — Voir mes paiements
     * Accès : Authentifié
     */
    public function myPayments()
    {
        $payments = Payment::where('user_id', auth()->id())
            ->with('order')
            ->latest()
            ->get();

        return $this->success($payments, 'Mes paiements');
    }

    /**
     * GET /api/payments/{id} — Détail d'un paiement
     * Accès : Authentifié (propriétaire)
     */
    public function show($id)
    {
        $payment = Payment::with('order')->findOrFail($id);

        if ($payment->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return $this->error('Non autorisé', 403);
        }

        return $this->success($payment, 'Détail du paiement');
    }

    /**
     * GET /api/admin/payments — Tous les paiements (admin)
     * Accès : Admin uniquement
     */
    public function index()
    {
        $payments = Payment::with(['order', 'user'])->latest()->get();

        return $this->success($payments, 'Liste des paiements');
    }
}
