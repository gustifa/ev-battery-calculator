<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids; // Ubah menjadi HasUlids
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Calculation extends Model
{
    use HasFactory, HasUlids; // Gunakan trait HasUlids

    protected $fillable = [
        'vehicle_id', 
        'distance_km', 
        'load_weight_kg', 
        'calculated_energy_needed_kwh', 
        'recommended_battery_kwh'
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
