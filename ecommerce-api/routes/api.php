<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Admin\AdminController;

// ╔═══════════════════════════════════════════════╗
// ║         SANTÉ & MONITORING                    ║
// ╚═══════════════════════════════════════════════╝
Route::get('/health', [HealthController::class, 'index']);
Route::get('/health/db', [HealthController::class, 'db']);
Route::get('/metrics', [HealthController::class, 'metrics']);

// ╔═══════════════════════════════════════════════╗
// ║         AUTH PUBLIQUES (rate limited)          ║
// ╚═══════════════════════════════════════════════╝
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
});

// ╔═══════════════════════════════════════════════╗
// ║         RESSOURCES PUBLIQUES                  ║
// ╚═══════════════════════════════════════════════╝
// Produits
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Catégories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Avis produits (lecture publique)
Route::get('/products/{product}/reviews', [ReviewController::class, 'index']);

// ╔═══════════════════════════════════════════════╗
// ║         ROUTES PROTÉGÉES (auth:sanctum)       ║
// ╚═══════════════════════════════════════════════╝
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ──
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/user', [AuthController::class, 'profile']);
    Route::put('/user/update', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'changePassword']);

    // ── Panier ──
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/{cartItem}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // ── Adresses ──
    Route::apiResource('addresses', AddressController::class);
    Route::patch('/addresses/{address}/default', [AddressController::class, 'setDefault']);

    // ── Coupons — vérification client ──
    Route::post('/coupons/verify', [CouponController::class, 'verify']);

    // ── Commandes ──
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/apply-coupon', [OrderController::class, 'applyCoupon']);

    // ── Paiement ──
    Route::post('/orders/{orderId}/pay', [PaymentController::class, 'pay']);
    Route::get('/payments', [PaymentController::class, 'myPayments']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);

    // ── Avis (écriture) ──
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

    // ── Gestion produits (vendeur/admin) ──
    Route::middleware('seller')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        Route::get('/seller/products', [ProductController::class, 'myProducts']);
    });

    // ╔═══════════════════════════════════════════════╗
    // ║         ADMIN                                 ║
    // ╚═══════════════════════════════════════════════╝
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [AdminController::class, 'dashboard']);

        // Utilisateurs
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{id}/role', [AdminController::class, 'updateRole']);
        Route::put('/users/{id}/toggle', [AdminController::class, 'toggleUser']);

        // Commandes
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::put('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);

        // Produits (admin)
        Route::get('/products', [AdminController::class, 'products']);
        Route::put('/products/{id}/toggle', [AdminController::class, 'toggleProduct']);

        // Catégories CRUD admin
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // Coupons CRUD admin
        Route::apiResource('coupons', CouponController::class);

        // Paiements (admin)
        Route::get('/payments', [PaymentController::class, 'index']);
    });
});
