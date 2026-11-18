<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids; // Ubah menjadi HasUlids
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory, HasUlids; // Gunakan trait HasUlids

    protected $fillable = [
        'name', 
        'type', 
        'battery_capacity_kwh', 
        'energy_consumption_per_km'
    ];
}

