<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    // ===== ADMIN : Lister tous les coupons =====
    public function index()
    {
        $coupons = Coupon::all();

        return response()->json($coupons);
    }

    // ===== ADMIN : Créer un coupon =====
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'discount' => 'required|numeric|min:0',
            'type' => 'required|in:fixed,percent',
            'min_amount' => 'nullable|numeric|min:0',
            'expires_at' => 'nullable|date|after:today',
            'is_active' => 'nullable|boolean',
        ]);

        $coupon = Coupon::create([
            'code' => strtoupper($request->code),
            'discount' => $request->discount,
            'type' => $request->type,
            'min_amount' => $request->min_amount ?? 0,
            'expires_at' => $request->expires_at,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'message' => 'Coupon créé avec succès.',
            'coupon' => $coupon,
        ], 201);
    }

    // ===== ADMIN : Voir un coupon =====
    public function show(Coupon $coupon)
    {
        return response()->json($coupon);
    }

    // ===== ADMIN : Modifier un coupon =====
    public function update(Request $request, Coupon $coupon)
    {
        $request->validate([
            'code' => 'sometimes|string|unique:coupons,code,' . $coupon->id,
            'discount' => 'sometimes|numeric|min:0',
            'type' => 'sometimes|in:fixed,percent',
            'min_amount' => 'nullable|numeric|min:0',
            'expires_at' => 'nullable|date|after:today',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->has('code')) {
            $coupon->code = strtoupper($request->code);
        }
        if ($request->has('discount')) {
            $coupon->discount = $request->discount;
        }
        if ($request->has('type')) {
            $coupon->type = $request->type;
        }
        if ($request->has('min_amount')) {
            $coupon->min_amount = $request->min_amount;
        }
        if ($request->has('expires_at')) {
            $coupon->expires_at = $request->expires_at;
        }
        if ($request->has('is_active')) {
            $coupon->is_active = $request->is_active;
        }

        $coupon->save();

        return response()->json([
            'message' => 'Coupon modifié avec succès.',
            'coupon' => $coupon,
        ]);
    }

    // ===== ADMIN : Supprimer un coupon =====
    public function destroy(Coupon $coupon)
    {
        $coupon->delete();

        return response()->json([
            'message' => 'Coupon supprimé avec succès.',
        ]);
    }

    // ===== CLIENT : Vérifier un code coupon =====
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))
                        ->where('is_active', true)
                        ->first();

        // Coupon introuvable
        if (!$coupon) {
            return response()->json([
                'message' => 'Code coupon invalide.',
            ], 404);
        }

        // Coupon expiré
        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return response()->json([
                'message' => 'Ce coupon a expiré.',
            ], 422);
        }

        // Montant minimum non atteint
        if ($request->amount < $coupon->min_amount) {
            return response()->json([
                'message' => "Montant minimum requis : {$coupon->min_amount} FCFA.",
            ], 422);
        }

        // Calculer la réduction
        if ($coupon->type === 'percent') {
            $discount = ($request->amount * $coupon->discount) / 100;
        } else {
            $discount = $coupon->discount;
        }

        $total_after_discount = max(0, $request->amount - $discount);

        return response()->json([
            'message' => 'Coupon valide !',
            'coupon' => $coupon,
            'original_amount' => $request->amount,
            'discount' => $discount,
            'total_after_discount' => $total_after_discount,
        ]);
    }
}
