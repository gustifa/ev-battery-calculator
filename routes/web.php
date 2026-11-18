<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VehicleController;
use Inertia\Inertia;
use App\Http\Controllers\CalculationController;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/', [CalculationController::class, 'index'])->name('calculator.index');
    Route::post('/calculations', [CalculationController::class, 'store'])->name('calculations.store');
    Route::delete('/calculations/{calculation}', [CalculationController::class, 'destroy'])->name('calculations.destroy');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Halaman Simulasi Komprehensif (Bab 2 - Bab 5)
    Route::get('/simulator', [SimulatorController::class, 'index'])->name('simulator.index');
    Route::post('/simulator/reports', [SimulatorController::class, 'store'])->name('simulator.store');
    Route::delete('/simulator/reports/{report}', [SimulatorController::class, 'destroy'])->name('simulator.destroy');
    Route::resource('vehicles', VehicleController::class)->except(['create', 'show', 'edit']);

    // Halaman Simulasi Komprehensif (Bab 2 - Bab 5)
    Route::get('/simulator', function () {
        return Inertia::render('Simulator');
    })->name('simulator.index');
});

require __DIR__.'/auth.php';
