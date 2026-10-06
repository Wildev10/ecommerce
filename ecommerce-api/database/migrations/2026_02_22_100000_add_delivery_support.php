<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('delivery_person_id')->nullable()->after('coupon_id')->constrained('users')->onDelete('set null');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->string('phone_number')->nullable()->after('transaction_id');
        });

        // Add 'delivering' status to orders enum (MySQL only)
        if (\Illuminate\Support\Facades\DB::getDriverName() === 'mysql') {
            \Illuminate\Support\Facades\DB::statement(
                "ALTER TABLE orders MODIFY COLUMN status ENUM('pending','confirmed','processing','shipped','delivering','delivered','cancelled','refunded') DEFAULT 'pending'"
            );
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['delivery_person_id']);
            $table->dropColumn('delivery_person_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('phone_number');
        });
    }
};
