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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->ulid('id')->primary(); // Menggunakan ULID sebagai Primary Key
            $table->string('name'); 
            $table->enum('type', ['car', 'motorcycle']); 
            $table->float('battery_capacity_kwh'); 
            $table->float('energy_consumption_per_km'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
