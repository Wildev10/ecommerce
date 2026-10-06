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
    Schema::create('addresses', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('label')->default('Maison'); // Maison, Bureau, etc.
        $table->string('full_name');
        $table->string('phone');
        $table->string('city');
        $table->string('quarter'); // Quartier
        $table->text('street_address'); // Adresse détaillée
        $table->text('landmark')->nullable(); // Point de repère
        $table->boolean('is_default')->default(false);
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
