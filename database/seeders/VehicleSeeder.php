<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = [
            [
                'name' => 'Hyundai Ioniq 5 Long Range',
                'type' => 'car',
                'battery_capacity_kwh' => 72.6,
                'energy_consumption_per_km' => 0.165,
            ],
            [
                'name' => 'Wuling Air EV Long Range',
                'type' => 'car',
                'battery_capacity_kwh' => 26.7,
                'energy_consumption_per_km' => 0.089,
            ],
            [
                'name' => 'BYD Atto 3 Extended Range',
                'type' => 'car',
                'battery_capacity_kwh' => 60.48,
                'energy_consumption_per_km' => 0.149,
            ],
            [
                'name' => 'Alva Cervo',
                'type' => 'motorcycle',
                'battery_capacity_kwh' => 3.8,
                'energy_consumption_per_km' => 0.030,
            ],
            [
                'name' => 'Polytron Fox-R',
                'type' => 'motorcycle',
                'battery_capacity_kwh' => 3.74,
                'energy_consumption_per_km' => 0.028,
            ],
        ];

        foreach ($vehicles as $vehicle) {
            Vehicle::create($vehicle);
        }
    }
}