<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\Order;
use App\Models\Setting;
use App\Models\User;

class CommissionService
{
    /**
     * Returns the global commission rate (%).
     */
    public function getRate(): float
    {
        return (float) Setting::get('commission_rate', 10);
    }

    /**
     * Calculate and record commissions for each seller in an order.
     * Called when an order is paid.
     */
    public function recordForOrder(Order $order): void
    {
        $rate = $this->getRate();

        // Group order items by seller
        $sellerTotals = [];
        foreach ($order->items as $item) {
            $sellerId = $item->product?->seller_id;
            if (!$sellerId) continue;
            $sellerTotals[$sellerId] = ($sellerTotals[$sellerId] ?? 0) + $item->total;
        }

        foreach ($sellerTotals as $sellerId => $amount) {
            $commissionAmount = round($amount * $rate / 100, 2);
            $sellerAmount     = round($amount - $commissionAmount, 2);

            Commission::create([
                'order_id'          => $order->id,
                'seller_id'         => $sellerId,
                'order_amount'      => $amount,
                'commission_rate'   => $rate,
                'commission_amount' => $commissionAmount,
                'seller_amount'     => $sellerAmount,
                'status'            => 'pending',
            ]);

            // Credit seller wallet
            $seller = User::find($sellerId);
            if ($seller) {
                $wallet = $seller->getOrCreateWallet();
                $wallet->increment('pending_balance', $sellerAmount);
                $wallet->increment('total_earned', $sellerAmount);
            }
        }
    }

    /**
     * Mark commissions as paid and move from pending to available balance.
     */
    public function settleForOrder(Order $order): void
    {
        $commissions = Commission::where('order_id', $order->id)->where('status', 'pending')->get();

        foreach ($commissions as $commission) {
            $commission->update(['status' => 'paid']);
            $seller = User::find($commission->seller_id);
            if ($seller) {
                $wallet = $seller->getOrCreateWallet();
                $wallet->decrement('pending_balance', $commission->seller_amount);
                $wallet->increment('balance', $commission->seller_amount);
            }
        }
    }
}
