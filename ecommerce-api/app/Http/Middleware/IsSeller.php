<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsSeller
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || !in_array(auth()->user()->role, ['seller', 'admin'])) {
            return response()->json([
                'message' => 'Accès refusé. Réservé aux vendeurs.'
            ], 403);
        }

        return $next($request);
    }
}
