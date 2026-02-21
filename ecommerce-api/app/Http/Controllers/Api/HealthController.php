<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HealthController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/health — Statut global de l'API
     */
    public function index()
    {
        $dbOk = false;
        try {
            DB::connection()->getPdo();
            $dbOk = true;
        } catch (\Exception $e) {
            // DB down
        }

        $status = $dbOk ? 'healthy' : 'degraded';
        $code   = $dbOk ? 200 : 503;

        return $this->success([
            'status'    => $status,
            'timestamp' => now()->toISOString(),
            'version'   => config('app.version', '1.0.0'),
            'services'  => [
                'database' => $dbOk ? 'up' : 'down',
                'cache'    => $this->checkCache() ? 'up' : 'down',
                'storage'  => is_writable(storage_path()) ? 'up' : 'down',
            ],
        ], $status === 'healthy' ? 'API opérationnelle' : 'API en mode dégradé', $code);
    }

    /**
     * GET /api/health/db — Statut de la base de données
     */
    public function db()
    {
        try {
            $start = microtime(true);
            DB::connection()->getPdo();
            DB::select('SELECT 1');
            $latency = round((microtime(true) - $start) * 1000, 2);

            return $this->success([
                'status'     => 'connected',
                'driver'     => config('database.default'),
                'latency_ms' => $latency,
            ], 'Base de données connectée');
        } catch (\Exception $e) {
            return $this->error('Base de données indisponible : ' . $e->getMessage(), 503);
        }
    }

    /**
     * GET /api/metrics — Métriques de base
     */
    public function metrics()
    {
        return $this->success([
            'uptime'     => $this->getUptime(),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'memory'     => [
                'usage_mb'  => round(memory_get_usage(true) / 1024 / 1024, 2),
                'peak_mb'   => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
            ],
            'counts'     => [
                'users'      => \App\Models\User::count(),
                'products'   => \App\Models\Product::count(),
                'orders'     => \App\Models\Order::count(),
                'categories' => \App\Models\Category::count(),
            ],
        ], 'Métriques API');
    }

    /**
     * Vérifie que le cache fonctionne
     */
    private function checkCache(): bool
    {
        try {
            Cache::put('health_check', true, 5);
            return Cache::get('health_check') === true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Temps écoulé depuis le boot
     */
    private function getUptime(): string
    {
        if (defined('LARAVEL_START')) {
            $seconds = time() - (int) LARAVEL_START;
            return gmdate('H:i:s', $seconds);
        }
        return 'N/A';
    }
}
