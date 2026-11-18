import React from 'react';
import { useForm, router, Head, Link } from '@inertiajs/react';

export default function Calculator({ vehicles, calculations }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        vehicle_id: vehicles.length > 0 ? vehicles[0].id : '',
        distance_km: '',
        load_weight_kg: 0,
    });

    const selectedVehicle = vehicles.find((v) => v.id === data.vehicle_id);
    const latestCalculation = calculations.length > 0 ? calculations[0] : null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/calculations', {
            preserveScroll: true,
            onSuccess: () => reset('distance_km'),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Hapus riwayat perhitungan ini?')) {
            router.delete(`/calculations/${id}`, { preserveScroll: true });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <Head title="Kalkulator Baterai EV" />

                {/* Header */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Kalkulator Kebutuhan Baterai EV</h1>
                        <p className="text-sm text-gray-500">Hitung estimasi konsumsi daya & rekomendasi kapasitas baterai</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/simulator"
                            style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
                        >
                            Simulasi Teknis (Bab 2–5)
                        </Link>
                        <Link
                            href="/vehicles"
                            style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
                        >
                            Kelola Data Kendaraan &rarr;
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Form Kalkulator */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Parameter Perjalanan</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pilih Kendaraan Listrik
                                </label>
                                <select
                                    value={data.vehicle_id}
                                    onChange={(e) => setData('vehicle_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {vehicles.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.name} ({v.type === 'car' ? 'Mobil' : 'Motor'} - {v.battery_capacity_kwh} kWh)
                                        </option>
                                    ))}
                                </select>
                                {errors.vehicle_id && <p className="text-red-500 text-xs mt-1">{errors.vehicle_id}</p>}
                            </div>

                            {selectedVehicle && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 flex justify-between">
                                    <span>Kapasitas Bawaan: <strong>{selectedVehicle.battery_capacity_kwh} kWh</strong></span>
                                    <span>Konsumsi Rata-rata: <strong>{selectedVehicle.energy_consumption_per_km} kWh/km</strong></span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Jarak Tempuh (km)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={data.distance_km}
                                        onChange={(e) => setData('distance_km', e.target.value)}
                                        placeholder="Contoh: 120"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.distance_km && <p className="text-red-500 text-xs mt-1">{errors.distance_km}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Beban Tambahan (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={data.load_weight_kg}
                                        onChange={(e) => setData('load_weight_kg', e.target.value)}
                                        placeholder="Contoh: 75"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.load_weight_kg && <p className="text-red-500 text-xs mt-1">{errors.load_weight_kg}</p>}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing || vehicles.length === 0}
                                    style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                                    className="w-full py-2.5 px-5 rounded-lg text-sm font-medium hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                                >
                                    Hitung Kebutuhan Baterai
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Kartu Hasil Terakhir */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Hasil Perhitungan Terakhir</h2>
                            {latestCalculation ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Kendaraan</p>
                                        <p className="font-semibold text-gray-800">
                                            {latestCalculation.vehicle ? latestCalculation.vehicle.name : 'Kendaraan Dihapus'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500">Energi Dibutuhkan</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {latestCalculation.calculated_energy_needed_kwh} kWh
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Rekomendasi (+20%)</p>
                                            <p className="text-lg font-bold text-emerald-600">
                                                {latestCalculation.recommended_battery_kwh} kWh
                                            </p>
                                        </div>
                                    </div>
                                    {latestCalculation.vehicle && (
                                        <div className={`p-3 rounded-lg text-xs font-medium ${
                                            latestCalculation.vehicle.battery_capacity_kwh >= latestCalculation.recommended_battery_kwh
                                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                                        }`}>
                                            {latestCalculation.vehicle.battery_capacity_kwh >= latestCalculation.recommended_battery_kwh
                                                ? 'Kapasitas baterai kendaraan mencukupi untuk sekali pengisian penuh.'
                                                : 'Perlu pengisian ulang (charging) di tengah perjalanan.'}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Belum ada simulasi perhitungan dilakukan.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabel Riwayat Perhitungan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-base font-semibold text-gray-800">Riwayat Perhitungan Terbaru</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600">
                                    <th className="py-3 px-4 text-left">Kendaraan</th>
                                    <th className="py-3 px-4 text-left">Jarak</th>
                                    <th className="py-3 px-4 text-left">Beban</th>
                                    <th className="py-3 px-4 text-left">Energi Dibutuhkan</th>
                                    <th className="py-3 px-4 text-left">Rekomendasi Baterai</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {calculations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-6 text-center text-gray-500">
                                            Belum ada riwayat perhitungan.
                                        </td>
                                    </tr>
                                ) : (
                                    calculations.map((calc) => (
                                        <tr key={calc.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-800">
                                                {calc.vehicle ? calc.vehicle.name : <span className="italic text-gray-400">Dihapus</span>}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">{calc.distance_km} km</td>
                                            <td className="py-3 px-4 text-gray-700">{calc.load_weight_kg} kg</td>
                                            <td className="py-3 px-4 font-medium text-blue-600">
                                                {calc.calculated_energy_needed_kwh} kWh
                                            </td>
                                            <td className="py-3 px-4 font-medium text-emerald-600">
                                                {calc.recommended_battery_kwh} kWh
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(calc.id)}
                                                    className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}