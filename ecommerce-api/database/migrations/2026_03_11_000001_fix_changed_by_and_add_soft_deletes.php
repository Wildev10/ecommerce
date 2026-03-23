<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Fix changed_by column: string → unsignedBigInteger (FK)
        Schema::table('order_status_histories', function (Blueprint $table) {
            // Drop old string column and recreate as proper FK
            $table->dropColumn('changed_by');
        });

        Schema::table('order_status_histories', function (Blueprint $table) {
            $table->foreignId('changed_by')->nullable()->after('new_status')->constrained('users')->onDelete('set null');
        });

        // Add soft deletes to key models for audit trail
        Schema::table('products', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('order_status_histories', function (Blueprint $table) {
            $table->dropForeign(['changed_by']);
            $table->dropColumn('changed_by');
        });

        Schema::table('order_status_histories', function (Blueprint $table) {
            $table->string('changed_by')->nullable();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
