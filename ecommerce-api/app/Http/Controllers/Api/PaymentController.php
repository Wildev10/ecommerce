<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PhoneRequest;
use App\Models\Payment;
use App\Models\Order;
use App\Services\PhoneValidationService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentConfirmationMail;

class PaymentController extends Controller
{
    use ApiResponse;

    /**
     * POST /api/orders/{orderId}/pay — Payer une commande
     * Accès : Authentifié (propriétaire de la commande)
     */
    public function pay(PhoneRequest $request, $orderId, PhoneValidationService $phoneService)
    {
        $order = Order::findOrFail($orderId);

        if ($order->user_id !== auth()->id()) {
            return $this->error('Non autorisé', 403);
        }

        if ($order->payment) {
            return $this->error('Cette commande est déjà payée', 400);
        }

        // Normaliser le numéro de téléphone en 8 chiffres
        $normalizedPhone = null;
        $operator = null;
        if ($request->phone_number && in_array($request->payment_method, ['mobile_money', 'mtn_momo', 'moov_money'])) {
            $normalizedPhone = $phoneService->normalize($request->phone_number);
            $detection = $phoneService->detectOperator($request->phone_number);
            $operator = $detection['operator'];
        }

        $payment = Payment::create([
            'order_id'       => $order->id,
            'user_id'        => auth()->id(),
            'amount'         => $order->total,
            'method'         => $request->payment_method,
            'status'         => 'completed',
            'transaction_id' => 'TXN-' . strtoupper(uniqid()),
            'phone_number'   => $normalizedPhone,
        ]);

        $order->update([
            'status'         => 'processing',
            'payment_status' => 'paid',
            'transaction_id' => $payment->transaction_id,
        ]);

        $payment->load(['user', 'order']);
        Mail::to(auth()->user())->send(new PaymentConfirmationMail($payment));

        return $this->success($payment, 'Paiement effectué avec succès', 201);
    }

    /**
     * GET /api/payments — Voir mes paiements
     * Accès : Authentifié
     */
    public function myPayments(Request $request)
    {
        $payments = Payment::where('user_id', auth()->id())
            ->with('order')
            ->latest()
            ->paginate($request->get('per_page', 15));

        return $this->paginated($payments, 'Mes paiements');
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
    public function index(Request $request)
    {
        $payments = Payment::with(['order', 'user'])
            ->latest()
            ->paginate($request->get('per_page', 15));

        return $this->paginated($payments, 'Liste des paiements');
    }

    /**
     * POST /api/admin/orders/{orderId}/refund — Rembourser une commande
     * Accès : Admin uniquement
     */
    public function refund(Request $request, $orderId)
    {
        $order = Order::with('payment')->findOrFail($orderId);

        if (!$order->payment) {
            return $this->error('Aucun paiement trouvé pour cette commande', 404);
        }

        if ($order->payment->status === 'refunded') {
            return $this->error('Cette commande a déjà été remboursée', 400);
        }

        if ($order->payment->status !== 'completed') {
            return $this->error('Seuls les paiements complétés peuvent être remboursés', 400);
        }

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $order->payment->update([
            'status' => 'refunded',
        ]);

        $order->update([
            'status'         => 'refunded',
            'payment_status' => 'refunded',
        ]);

        // Remettre le stock
        foreach ($order->items as $item) {
            \App\Models\Product::where('id', $item->product_id)->increment('stock', $item->quantity);
        }

        $order->statusHistory()->create([
            'old_status' => $order->getOriginal('status') ?? $order->status,
            'new_status' => 'refunded',
            'note'       => $request->reason ?? 'Remboursement effectué par admin',
            'changed_by' => auth()->id(),
        ]);

        return $this->success([
            'order'   => $order->fresh(['items', 'payment', 'statusHistory']),
            'payment' => $order->payment->fresh(),
        ], 'Remboursement effectué avec succès');
    }

    /**
     * GET /api/payments/{orderId}/status — Statut du paiement d'une commande
     * Accès : Authentifié
     */
    public function status($orderId)
    {
        $order = Order::with('payment')->findOrFail($orderId);

        if ($order->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return $this->error('Non autorisé', 403);
        }

        return $this->success([
            'order_id'       => $order->id,
            'order_number'   => $order->order_number,
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method,
            'payment'        => $order->payment,
        ], 'Statut du paiement');
    }
}
