<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index()
    {
        return Inertia::render('Vehicles/Index', [
            'vehicles' => Vehicle::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:car,motorcycle',
            'battery_capacity_kwh' => 'required|numeric|min:0.1',
            'energy_consumption_per_km' => 'required|numeric|min:0.001',
        ]);

        Vehicle::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:car,motorcycle',
            'battery_capacity_kwh' => 'required|numeric|min:0.1',
            'energy_consumption_per_km' => 'required|numeric|min:0.001',
        ]);

        $vehicle->update($validated);

        return redirect()->back();
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();

        return redirect()->back();
    }
}