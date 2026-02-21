<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/admin/coupons — Lister tous les coupons
     * Accès : Admin
     */
    public function index()
    {
        $coupons = Coupon::latest()->get();

        return $this->success($coupons, 'Liste des coupons');
    }

    /**
     * POST /api/admin/coupons — Créer un coupon
     * Accès : Admin
     */
    public function store(Request $request)
    {
        $request->validate([
            'code'       => 'required|string|unique:coupons,code',
            'discount'   => 'required|numeric|min:0',
            'type'       => 'required|in:fixed,percent',
            'min_amount' => 'nullable|numeric|min:0',
            'max_uses'   => 'nullable|integer|min:1',
            'starts_at'  => 'nullable|date',
            'expires_at' => 'nullable|date|after:today',
            'is_active'  => 'nullable|boolean',
        ]);

        $coupon = Coupon::create([
            'code'       => strtoupper($request->code),
            'discount'   => $request->discount,
            'type'       => $request->type,
            'min_amount' => $request->min_amount ?? 0,
            'max_uses'   => $request->max_uses,
            'starts_at'  => $request->starts_at,
            'expires_at' => $request->expires_at,
            'is_active'  => $request->is_active ?? true,
        ]);

        return $this->success($coupon, 'Coupon créé avec succès.', 201);
    }

    /**
     * GET /api/admin/coupons/{coupon} — Détail d'un coupon
     * Accès : Admin
     */
    public function show(Coupon $coupon)
    {
        return $this->success($coupon, 'Détail du coupon');
    }

    /**
     * PUT /api/admin/coupons/{coupon} — Modifier un coupon
     * Accès : Admin
     */
    public function update(Request $request, Coupon $coupon)
    {
        $request->validate([
            'code'       => 'sometimes|string|unique:coupons,code,' . $coupon->id,
            'discount'   => 'sometimes|numeric|min:0',
            'type'       => 'sometimes|in:fixed,percent',
            'min_amount' => 'nullable|numeric|min:0',
            'max_uses'   => 'nullable|integer|min:1',
            'starts_at'  => 'nullable|date',
            'expires_at' => 'nullable|date|after:today',
            'is_active'  => 'nullable|boolean',
        ]);

        $data = $request->only(['code', 'discount', 'type', 'min_amount', 'max_uses', 'starts_at', 'expires_at', 'is_active']);

        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $coupon->update($data);

        return $this->success($coupon, 'Coupon modifié avec succès.');
    }

    /**
     * DELETE /api/admin/coupons/{coupon} — Supprimer un coupon
     * Accès : Admin
     */
    public function destroy(Coupon $coupon)
    {
        $coupon->delete();

        return $this->success(null, 'Coupon supprimé avec succès.');
    }

    /**
     * POST /api/coupons/verify — Vérifier un code coupon
     * Accès : Authentifié
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code'   => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))
                        ->where('is_active', true)
                        ->first();

        if (!$coupon) {
            return $this->error('Code coupon invalide.', 404);
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return $this->error('Ce coupon a expiré.', 422);
        }

        if ($coupon->max_uses && $coupon->used_count >= $coupon->max_uses) {
            return $this->error('Ce coupon a atteint son nombre maximum d\'utilisations.', 422);
        }

        if ($request->amount < $coupon->min_amount) {
            return $this->error("Montant minimum requis : {$coupon->min_amount} FCFA.", 422);
        }

        $discount = $coupon->calculateDiscount($request->amount);

        return $this->success([
            'coupon'               => $coupon,
            'original_amount'      => $request->amount,
            'discount'             => $discount,
            'total_after_discount' => max(0, $request->amount - $discount),
        ], 'Coupon valide !');
    }
}

