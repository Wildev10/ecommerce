<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    // Payer une commande
    public function pay(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);

        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($order->payment) {
            return response()->json(['message' => 'Cette commande est déjà payée'], 400);
        }

        $request->validate([
            'method' => 'required|in:credit_card,paypal,bank_transfer,cash_on_delivery',
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'amount' => $order->total,
            'method' => $request->method,
            'status' => 'completed',
            'transaction_id' => 'TXN-' . strtoupper(uniqid()),
        ]);

        $order->update(['status' => 'processing']);

        return response()->json([
            'message' => 'Paiement effectué avec succès',
            'payment' => $payment,
        ], 201);
    }

    // Voir mes paiements
    public function myPayments()
    {
        $payments = Payment::where('user_id', auth()->id())
            ->with('order')
            ->get();

        return response()->json($payments);
    }

    // Détail d'un paiement
    public function show($id)
    {
        $payment = Payment::with('order')->findOrFail($id);

        if ($payment->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($payment);
    }

    // Admin : tous les paiements
    public function index()
    {
        $payments = Payment::with(['order', 'user'])->get();
        return response()->json($payments);
    }
}
