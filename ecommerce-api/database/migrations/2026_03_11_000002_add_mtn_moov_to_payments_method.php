<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE payments MODIFY COLUMN method ENUM('credit_card','paypal','bank_transfer','cash_on_delivery','mobile_money','mtn_momo','moov_money') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE payments MODIFY COLUMN method ENUM('credit_card','paypal','bank_transfer','cash_on_delivery','mobile_money') NOT NULL");
    }
};
