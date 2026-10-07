<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\CommissionService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentConfirmationMail;

class WebhookController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/webhooks/fedapay
     * FedaPay redirige le navigateur ici après paiement (declined/canceled/close).
     * On redirige vers le frontend avec l'order_id trouvé via transaction_id.
     */
    public function fedapayBrowserRedirect(Request $request)
    {
        $transactionId = $request->get('id');
        $status        = $request->get('status', 'unknown');
        $frontendBase  = env('FRONTEND_URL', 'http://localhost:3000');

        $orderId = null;
        if ($transactionId) {
            $payment = Payment::where('transaction_id', (string) $transactionId)->first();
            $orderId = $payment?->order_id;

            if ($payment && $payment->status === 'pending') {
                $payment->update(['status' => 'failed']);
            }
        }

        $redirectUrl = $frontendBase . '/payment/callback'
            . '?order_id=' . ($orderId ?? '')
            . '&status=' . $status;

        return redirect($redirectUrl);
    }

    /**
     * POST /api/webhooks/fedapay
     * Reçoit les événements de paiement FedaPay (pas d'auth Sanctum).
     */
    public function fedapay(Request $request)
    {
        $payload   = $request->all();
        $eventName = $payload['name'] ?? null;
        $entity    = $payload['entity'] ?? [];

        Log::channel('stack')->info('FedaPay webhook received', [
            'event'  => $eventName,
            'entity' => $entity,
        ]);

        // Vérifier la signature HMAC si une clé webhook est configurée
        $webhookSecret = config('services.fedapay.webhook_secret');
        if ($webhookSecret) {
            $signature = $request->header('X-FEDAPAY-SIGNATURE');
            $expected  = hash_hmac('sha256', $request->getContent(), $webhookSecret);
            if (!hash_equals($expected, (string) $signature)) {
                Log::warning('FedaPay webhook: signature invalide');
                return response()->json(['error' => 'Signature invalide'], 400);
            }
        }

        match ($eventName) {
            'transaction.approved' => $this->handleApproved($entity),
            'transaction.declined' => $this->handleDeclined($entity),
            'transaction.canceled' => $this->handleCanceled($entity),
            default                => null,
        };

        return response()->json(['received' => true]);
    }

    private function handleApproved(array $entity): void
    {
        $transactionId = (string) ($entity['id'] ?? '');
        if (!$transactionId) return;

        $payment = Payment::where('transaction_id', $transactionId)
            ->with(['order.items.product', 'user'])
            ->first();

        if (!$payment || $payment->status === 'completed') {
            return;
        }

        $payment->update(['status' => 'completed']);

        $order = $payment->order;
        $order->update([
            'status'         => 'processing',
            'payment_status' => 'paid',
        ]);

        $order->load('items.product');
        app(CommissionService::class)->recordForOrder($order);

        $order->statusHistory()->create([
            'old_status' => 'pending',
            'new_status' => 'processing',
            'note'       => 'Paiement FedaPay confirmé (transaction #' . $transactionId . ')',
            'changed_by' => $payment->user_id,
        ]);

        if ($payment->user) {
            Mail::to($payment->user)->send(new PaymentConfirmationMail($payment->fresh(['order'])));
        }
    }

    private function handleDeclined(array $entity): void
    {
        $transactionId = (string) ($entity['id'] ?? '');
        if (!$transactionId) return;

        $payment = Payment::where('transaction_id', $transactionId)->first();
        if ($payment && $payment->status === 'pending') {
            $payment->update(['status' => 'failed']);
            Log::info('FedaPay payment declined', ['transaction_id' => $transactionId]);
        }
    }

    private function handleCanceled(array $entity): void
    {
        $transactionId = (string) ($entity['id'] ?? '');
        if (!$transactionId) return;

        $payment = Payment::where('transaction_id', $transactionId)->first();
        if ($payment && $payment->status === 'pending') {
            $payment->update(['status' => 'failed']);
        }
    }
}
