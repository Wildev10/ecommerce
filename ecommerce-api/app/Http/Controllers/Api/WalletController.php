<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Models\User;
use App\Services\PhoneValidationService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/seller/wallet — Mon portefeuille
     */
    public function show(Request $request)
    {
        $wallet = $request->user()->getOrCreateWallet();

        return $this->success($wallet, 'Mon portefeuille');
    }

    /**
     * GET /api/seller/withdrawals — Historique de mes retraits
     */
    public function withdrawals(Request $request)
    {
        $withdrawals = Withdrawal::where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->get('per_page', 15));

        return $this->paginated($withdrawals, 'Mes retraits');
    }

    /**
     * POST /api/seller/withdrawals — Demander un retrait
     */
    public function requestWithdrawal(Request $request, PhoneValidationService $phoneService)
    {
        $request->validate([
            'amount'       => 'required|numeric|min:1000',
            'method'       => 'required|in:mtn_momo,moov_money',
            'phone_number' => 'required|string|max:20',
        ]);

        // Validate phone
        $result = $phoneService->validateForPayment($request->phone_number, $request->method);
        if (!$result['valid']) {
            return $this->error($result['message'], 422);
        }

        $wallet = $request->user()->getOrCreateWallet();

        if ($wallet->balance < $request->amount) {
            return $this->error('Solde insuffisant. Disponible : ' . number_format($wallet->balance, 0, ',', ' ') . ' FCFA', 400);
        }

        // Prevent duplicate pending withdrawals
        $pending = Withdrawal::where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            return $this->error('Vous avez déjà une demande de retrait en cours.', 409);
        }

        $normalizedPhone = $phoneService->normalize($request->phone_number);

        $withdrawal = Withdrawal::create([
            'user_id'      => $request->user()->id,
            'amount'       => $request->amount,
            'method'       => $request->method,
            'phone_number' => $normalizedPhone,
            'status'       => 'pending',
        ]);

        // Reserve funds
        $wallet->decrement('balance', $request->amount);

        return $this->success($withdrawal, 'Demande de retrait soumise', 201);
    }

    // ── Admin endpoints ──

    /**
     * GET /api/admin/withdrawals — Toutes les demandes de retrait
     */
    public function adminIndex(Request $request)
    {
        $query = Withdrawal::with('user:id,name,email');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $withdrawals = $query->latest()->paginate($request->get('per_page', 15));

        return $this->paginated($withdrawals, 'Demandes de retrait');
    }

    /**
     * PUT /api/admin/withdrawals/{id} — Traiter un retrait (admin)
     */
    public function process(Request $request, $id)
    {
        $request->validate([
            'status'         => 'required|in:completed,rejected',
            'transaction_id' => 'required_if:status,completed|nullable|string',
            'note'           => 'nullable|string|max:500',
        ]);

        $withdrawal = Withdrawal::findOrFail($id);

        if ($withdrawal->status !== 'pending') {
            return $this->error('Ce retrait a déjà été traité.', 400);
        }

        $withdrawal->update([
            'status'         => $request->status,
            'transaction_id' => $request->transaction_id,
            'note'           => $request->note,
            'processed_by'   => $request->user()->id,
            'processed_at'   => now(),
        ]);

        // If rejected, refund the wallet
        if ($request->status === 'rejected') {
            $wallet = $withdrawal->user->getOrCreateWallet();
            $wallet->increment('balance', $withdrawal->amount);
        }

        $withdrawal->load('user:id,name,email');

        return $this->success($withdrawal, 'Retrait traité');
    }
}
