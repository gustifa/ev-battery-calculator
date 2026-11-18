<?php

namespace App\Http\Controllers;

use App\Models\Calculation;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalculationController extends Controller
{
    public function index()
    {
        return Inertia::render('Calculator', [
            'vehicles' => Vehicle::orderBy('name')->get(),
            'calculations' => Calculation::with('vehicle')->latest()->take(10)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'distance_km' => 'required|numeric|min:0.1',
            'load_weight_kg' => 'nullable|numeric|min:0',
        ]);

        $vehicle = Vehicle::findOrFail($validated['vehicle_id']);
        $loadWeight = $validated['load_weight_kg'] ?? 0;

        // Penambahan konsumsi 5% untuk setiap 100 kg beban tambahan
        $loadFactor = 1 + (($loadWeight / 100) * 0.05);
        $energyNeeded = $validated['distance_km'] * $vehicle->energy_consumption_per_km * $loadFactor;

        // Rekomendasi kapasitas baterai dengan margin keamanan 20%
        $recommendedBattery = $energyNeeded * 1.2;

        Calculation::create([
            'vehicle_id' => $vehicle->id,
            'distance_km' => $validated['distance_km'],
            'load_weight_kg' => $loadWeight,
            'calculated_energy_needed_kwh' => round($energyNeeded, 2),
            'recommended_battery_kwh' => round($recommendedBattery, 2),
        ]);

        return redirect()->back();
    }

    public function destroy(Calculation $calculation)
    {
        $calculation->delete();

        return redirect()->back();
    }
}