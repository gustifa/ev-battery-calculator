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
        Schema::create('calculations', function (Blueprint $table) {
            $table->ulid('id')->primary(); // Menggunakan ULID sebagai Primary Key
        
            // Menggunakan foreignUlid agar tipe datanya cocok dengan tabel vehicles
            $table->foreignUlid('vehicle_id')->nullable()->constrained('vehicles')->onDelete('set null');
            
            $table->float('distance_km'); 
            $table->float('load_weight_kg')->default(0); 
            $table->float('calculated_energy_needed_kwh'); 
            $table->float('recommended_battery_kwh'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calculations');
    }
};
