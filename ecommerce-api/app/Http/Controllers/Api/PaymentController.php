<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PhoneRequest;
use App\Models\Payment;
use App\Models\Order;
use App\Services\PhoneValidationService;
use App\Services\CommissionService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentConfirmationMail;
use FedaPay\FedaPay;
use FedaPay\Transaction as FedaTransaction;

class PaymentController extends Controller
{
    use ApiResponse;

    /**
     * POST /api/orders/{orderId}/pay
     * - cash_on_delivery : confirmé immédiatement (pas de gateway)
     * - mobile_money / mtn_momo / moov_money : transaction FedaPay async
     */
    public function pay(PhoneRequest $request, $orderId, PhoneValidationService $phoneService)
    {
        $order = Order::with('payment')->findOrFail($orderId);

        if ($order->user_id !== auth()->id()) {
            return $this->error('Non autorisé', 403);
        }

        if ($order->payment && $order->payment->status === 'completed') {
            return $this->error('Cette commande est déjà payée', 400);
        }

        $method = $request->payment_method;

        // ── Cash on delivery : pas de gateway ──────────────────────────────
        if ($method === 'cash_on_delivery') {
            $payment = Payment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'user_id'        => auth()->id(),
                    'amount'         => $order->total,
                    'method'         => $method,
                    'status'         => 'completed',
                    'transaction_id' => 'COD-' . strtoupper(uniqid()),
                ]
            );

            $order->update([
                'status'         => 'processing',
                'payment_status' => 'paid',
                'transaction_id' => $payment->transaction_id,
            ]);

            $order->load('items.product');
            app(CommissionService::class)->recordForOrder($order);

            $payment->load(['user', 'order']);
            Mail::to(auth()->user())->send(new PaymentConfirmationMail($payment));

            return $this->success($payment, 'Commande confirmée (paiement à la livraison)', 201);
        }

        // ── Mobile money : FedaPay ──────────────────────────────────────────
        $normalizedPhone = null;
        if ($request->phone_number) {
            $normalizedPhone = $phoneService->normalize($request->phone_number);
        }

        $user = auth()->user();

        $this->initFedaPay();

        $nameParts = explode(' ', trim($user->name), 2);
        $firstname = $nameParts[0];
        $lastname  = $nameParts[1] ?? $nameParts[0];

        try {
            $transaction = FedaTransaction::create([
                'description'  => 'Commande #' . $order->order_number,
                'amount'       => (int) $order->total,
                'currency'     => ['iso' => 'XOF'],
                'callback_url' => config('services.fedapay.webhook_url'),
                'customer'     => [
                    'firstname'    => $firstname,
                    'lastname'     => $lastname,
                    'email'        => $user->email,
                    'phone_number' => [
                        'number'  => $normalizedPhone ?? '',
                        'country' => 'bj',
                    ],
                ],
            ]);

            $returnUrl = config('services.fedapay.return_url')
                . '?order_id=' . $order->id;

            $token = $transaction->generateToken([
                'return_url' => $returnUrl,
            ]);

            $payment = Payment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'user_id'        => auth()->id(),
                    'amount'         => $order->total,
                    'method'         => $method,
                    'status'         => 'pending',
                    'transaction_id' => (string) $transaction->id,
                    'phone_number'   => $normalizedPhone,
                ]
            );

            return $this->success([
                'payment'        => $payment,
                'redirect_url'   => $token->url,
                'transaction_id' => $transaction->id,
            ], 'Redirection vers le paiement FedaPay', 201);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la création du paiement : ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/payments — Mes paiements
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
     */
    public function index(Request $request)
    {
        $payments = Payment::with(['order', 'user'])
            ->latest()
            ->paginate($request->get('per_page', 15));

        return $this->paginated($payments, 'Liste des paiements');
    }

    /**
     * POST /api/admin/orders/{orderId}/refund — Rembourser (admin)
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

        $oldStatus = $order->status;

        $order->payment->update(['status' => 'refunded']);
        $order->update(['status' => 'refunded', 'payment_status' => 'refunded']);

        foreach ($order->items as $item) {
            \App\Models\Product::where('id', $item->product_id)->increment('stock', $item->quantity);
        }

        app(CommissionService::class)->reverseForOrder($order);

        $order->statusHistory()->create([
            'old_status' => $oldStatus,
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
     * GET /api/payments/{orderId}/status
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

    private function initFedaPay(): void
    {
        FedaPay::setApiKey(config('services.fedapay.secret_key'));
        FedaPay::setEnvironment(config('services.fedapay.env', 'sandbox'));
    }
}
