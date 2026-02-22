<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // mobile_money is now included in the original create_payments_table migration.
        // This migration is kept for backwards compatibility with existing databases.
        if (\Illuminate\Support\Facades\DB::getDriverName() === 'mysql') {
            \Illuminate\Support\Facades\DB::statement(
                "ALTER TABLE payments MODIFY COLUMN method ENUM('credit_card','paypal','bank_transfer','cash_on_delivery','mobile_money') NOT NULL"
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (\Illuminate\Support\Facades\DB::getDriverName() === 'mysql') {
            \Illuminate\Support\Facades\DB::statement(
                "ALTER TABLE payments MODIFY COLUMN method ENUM('credit_card','paypal','bank_transfer','cash_on_delivery') NOT NULL"
            );
        }
    }
};
