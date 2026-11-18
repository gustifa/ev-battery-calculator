import React, { useState } from 'react';
import { useForm, router, Head, Link } from '@inertiajs/react';

export default function Index({ vehicles }) {
    const [editingVehicle, setEditingVehicle] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'car',
        battery_capacity_kwh: '',
        energy_consumption_per_km: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingVehicle) {
            put(`/vehicles/${editingVehicle.id}`, {
                onSuccess: () => cancelEdit(),
            });
        } else {
            post('/vehicles', {
                onSuccess: () => reset(),
            });
        }
    };

    const startEdit = (vehicle) => {
        clearErrors();
        setEditingVehicle(vehicle);
        setData({
            name: vehicle.name,
            type: vehicle.type,
            battery_capacity_kwh: vehicle.battery_capacity_kwh,
            energy_consumption_per_km: vehicle.energy_consumption_per_km,
        });
    };

    const cancelEdit = () => {
        setEditingVehicle(null);
        reset();
        clearErrors();
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus data kendaraan ini?')) {
            router.delete(`/vehicles/${id}`);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Head title="Manajemen Data Kendaraan EV" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Data Kendaraan EV</h1>
                <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
                    &larr; Kembali ke Kalkulator
                </Link>
            </div>

            {/* Form Tambah / Edit Kendaraan */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    {editingVehicle ? `Edit Kendaraan: ${editingVehicle.name}` : 'Tambah Kendaraan Baru'}
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kendaraan</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Hyundai Ioniq 5"
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kendaraan</label>
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                        >
                            <option value="car">Mobil (Car)</option>
                            <option value="motorcycle">Motor (Motorcycle)</option>
                        </select>
                        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Baterai (kWh)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.battery_capacity_kwh}
                            onChange={(e) => setData('battery_capacity_kwh', e.target.value)}
                            placeholder="Contoh: 72.6"
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                        />
                        {errors.battery_capacity_kwh && (
                            <p className="text-red-500 text-xs mt-1">{errors.battery_capacity_kwh}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Konsumsi Energi (kWh / km)
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            value={data.energy_consumption_per_km}
                            onChange={(e) => setData('energy_consumption_per_km', e.target.value)}
                            placeholder="Contoh: 0.165"
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                        />
                        {errors.energy_consumption_per_km && (
                            <p className="text-red-500 text-xs mt-1">{errors.energy_consumption_per_km}</p>
                        )}
                    </div>

                    <div className="md:col-span-2 flex gap-2 mt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {editingVehicle ? 'Simpan Perubahan' : 'Tambah Kendaraan'}
                        </button>

                        {editingVehicle && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                                Batal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Tabel Daftar Kendaraan */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                            <th className="p-3">Nama Kendaraan</th>
                            <th className="p-3">Tipe</th>
                            <th className="p-3">Kapasitas Baterai</th>
                            <th className="p-3">Konsumsi Energi</th>
                            <th className="p-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                        {vehicles.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-500">
                                    Belum ada data kendaraan.
                                </td>
                            </tr>
                        ) : (
                            vehicles.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-800">{vehicle.name}</td>
                                    <td className="p-3 capitalize">
                                        {vehicle.type === 'car' ? 'Mobil' : 'Motor'}
                                    </td>
                                    <td className="p-3">{vehicle.battery_capacity_kwh} kWh</td>
                                    <td className="p-3">{vehicle.energy_consumption_per_km} kWh/km</td>
                                    <td className="p-3 text-right space-x-3">
                                        <button
                                            onClick={() => startEdit(vehicle)}
                                            className="text-amber-600 hover:underline font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vehicle.id)}
                                            className="text-red-600 hover:underline font-medium"
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
    );
}