<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsDelivery
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || !in_array(auth()->user()->role, ['delivery', 'admin'])) {
            return response()->json([
                'message' => 'Accès refusé. Réservé aux livreurs.'
            ], 403);
        }

        return $next($request);
    }
}
