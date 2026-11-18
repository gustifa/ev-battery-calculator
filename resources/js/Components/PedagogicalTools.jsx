import React, { useState } from 'react';
import Swal from 'sweetalert2';

// ============================================================================
// 1. DAFTAR MISI STUDI KASUS PRAKTIKUM (CHALLENGE MODE)
// ============================================================================
export const PRACTICE_MISSIONS = [
    {
        id: 'misi-1',
        level: 'Pemula (Level 1)',
        title: 'Konversi Motor Harian 110 cc (Komuter Kota)',
        brief: 'Pelanggan membawa Honda Beat 110 cc untuk dikonversi. Rancang baterai LFP bertegangan nominal ±48 V dengan energi minimal 1,1 kWh, serta pilih daya motor yang LULUS regulasi PM 39/2023 dan batas toleransi berat (±5%).',
        hints: 'Gunakan kimia LFP (3,2 V/sel → 15S = 48 V), atur kapasitas minimal 24 Ah, dan daya motor 1.000–2.000 W.',
        check: (state) => {
            const passChem = state.chemistry === 'LFP';
            const passVolt = state.actualNominalV >= 47 && state.actualNominalV <= 52;
            const passEnergy = state.totalEnergyKwh >= 1.1;
            const passReg = state.engineCc <= 110 && state.powerRulePass && state.isWeightPass;
            return {
                passed: passChem && passVolt && passEnergy && passReg,
                details: [
                    { label: 'Kimia Baterai LFP', ok: passChem },
                    { label: 'Tegangan Nominal ±48V', ok: passVolt },
                    { label: 'Energi Total ≥ 1,1 kWh', ok: passEnergy },
                    { label: 'Motor ≤110cc Lulus PM 39/2023 & Berat ±5%', ok: passReg },
                ],
            };
        },
    },
    {
        id: 'misi-2',
        level: 'Menengah (Level 2)',
        title: 'Motor Kurir Paket Perkotaan (125 cc)',
        brief: 'Sebuah usaha logistik ingin mengonversi motor 125 cc menggunakan baterai NMC 72 V minimal 1,4 kWh, torsi roda minimal 24 Nm agar kuat membawa beban, dan kecepatan puncak teoritis minimal 65 km/jam.',
        hints: 'Pilih NMC 20S (72 V) 20 Ah, motor 2.000 W (3.000 RPM) dengan rasio reduksi 1:4 atau lebih.',
        check: (state) => {
            const passChem = state.chemistry === 'NMC' && state.actualNominalV >= 70;
            const passEnergy = state.totalEnergyKwh >= 1.4;
            const passTorque = state.wheelTorqueNm >= 24;
            const passSpeed = state.topSpeedKmh >= 65;
            const passSafe = state.isBmsSafe && state.isVoltageSafe;
            return {
                passed: passChem && passEnergy && passTorque && passSpeed && passSafe,
                details: [
                    { label: 'Baterai NMC ≥ 70V', ok: passChem },
                    { label: 'Energi ≥ 1,4 kWh', ok: passEnergy },
                    { label: 'Torsi Roda ≥ 24 Nm', ok: passTorque },
                    { label: 'Top Speed Teoritis ≥ 65 km/jam', ok: passSpeed },
                    { label: 'Proteksi BMS & Tegangan Controller Aman', ok: passSafe },
                ],
            };
        },
    },
    {
        id: 'misi-3',
        level: 'Mahir (Level 3)',
        title: 'Motor Operasional Daerah Perbukitan (150 cc)',
        brief: 'Rancang konversi motor 150 cc untuk medan tanjakan berat: torsi roda minimal 35 Nm, grade magnet motor wajib tahan suhu puncak ≥ 135°C (minimal Grade SH), daya motor ≤ 3 kW (PM 39/2023), dan seluruh ceklis keselamatan lulus.',
        hints: 'Gunakan motor 3.000 W dengan rasio reduksi 1:4,2 ke atas, atur suhu puncak ≥ 135°C, dan pastikan semua ceklis Tab 4 tercentang.',
        check: (state) => {
            const passTorque = state.wheelTorqueNm >= 35;
            const passTemp = state.peakTempC >= 135;
            const passReg = state.engineCc <= 150 && state.isOverallReady;
            const passSafe = state.isBmsSafe && state.isVoltageSafe;
            return {
                passed: passTorque && passTemp && passReg && passSafe,
                details: [
                    { label: 'Torsi Roda ≥ 35 Nm', ok: passTorque },
                    { label: 'Suhu Puncak ≥ 135°C (Magnet Grade SH/UH)', ok: passTemp },
                    { label: 'Lulus Penuh Regulasi PM 39/2023 (≤150cc)', ok: passReg },
                    { label: 'Proteksi Controller & BMS Aman', ok: passSafe },
                ],
            };
        },
    },
];

// ============================================================================
// 2. BANNER MISI PRAKTIKUM INTERAKTIF
// ============================================================================
export function MissionChallengePanel({ simState }) {
    const [selectedMissionId, setSelectedMissionId] = useState('misi-1');
    const [isOpen, setIsOpen] = useState(true);

    const mission = PRACTICE_MISSIONS.find((m) => m.id === selectedMissionId) || PRACTICE_MISSIONS[0];
    const evaluation = mission.check(simState);

    const handleVerifyMission = () => {
        const listHtml = evaluation.details
            .map(
                (d) =>
                    `<div style="text-align:left; margin: 6px 0; font-size: 13px;">
                        ${d.ok ? '✅' : '❌'} <strong>${d.label}</strong>
                    </div>`
            )
            .join('');

        if (evaluation.passed) {
            Swal.fire({
                icon: 'success',
                title: 'Misi Praktikum Berhasil!',
                html: `<p style="font-size:14px; margin-bottom:10px;">Selamat! Rancangan teknis Anda memenuhi seluruh kriteria <strong>${mission.title}</strong>.</p>${listHtml}`,
                confirmButtonText: 'Mantap, Lanjutkan!',
                confirmButtonColor: '#059669',
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Misi Belum Selesai',
                html: `<p style="font-size:13px; margin-bottom:10px;">Beberapa parameter belum memenuhi target studi kasus:</p>${listHtml}<p style="font-size:12px; color:#b45309; margin-top:10px; background:#fef3c7; padding:8px; border-radius:6px;"><strong>Petunjuk:</strong> ${mission.hints}</p>`,
                confirmButtonText: 'Perbaiki Rancangan',
                confirmButtonColor: '#d97706',
            });
        }
    };

    return (
        <div className="no-print bg-gradient-to-r from-indigo-50 via-blue-50 to-sky-50 border border-indigo-200 rounded-xl p-4 sm:p-5 mb-6 shadow-xs">
            <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-xs font-bold tracking-wide">
                        MISI PRAKTIKUM
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-indigo-950">
                        Studi Kasus Berbasis Masalah (Problem-Based Learning)
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-xs font-semibold text-indigo-700 hover:underline cursor-pointer"
                >
                    {isOpen ? 'Sembunyikan Misi ▲' : 'Tampilkan Misi ▼'}
                </button>
            </div>

            {isOpen && (
                <div className="mt-3 pt-3 border-t border-indigo-200/70 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                            <label className="block text-[11px] font-semibold text-indigo-800 uppercase mb-1">
                                Pilih Skenario Studi Kasus Siswa:
                            </label>
                            <select
                                value={selectedMissionId}
                                onChange={(e) => setSelectedMissionId(e.target.value)}
                                className="w-full sm:max-w-md border border-indigo-300 bg-white rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-gray-800"
                            >
                                {PRACTICE_MISSIONS.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        [{m.level}] {m.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() =>
                                    Swal.fire({
                                        icon: 'info',
                                        title: 'Petunjuk Pengerjaan',
                                        text: mission.hints,
                                        confirmButtonColor: '#2563eb',
                                    })
                                }
                                className="px-3 py-2 rounded-lg bg-white border border-indigo-300 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 cursor-pointer"
                            >
                                💡 Petunjuk
                            </button>
                            <button
                                type="button"
                                onClick={handleVerifyMission}
                                style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
                                className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:opacity-90 cursor-pointer shadow-xs"
                            >
                                ✔ Cek Kelulusan Misi
                            </button>
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 bg-white/80 p-3 rounded-lg border border-indigo-100 leading-relaxed">
                        <strong>Soal Kasus:</strong> {mission.brief}
                    </p>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// 3. PANEL BEDAH RUMUS REAL-TIME (SHOW YOUR WORK)
// ============================================================================
export function FormulaBreakdownPanel({ title, formulas = [] }) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-700">
            <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[11px] font-bold border border-sky-500/30">
                        BEDAH RUMUS
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white">{title}</h3>
                </div>
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-sky-300 hover:text-sky-200 cursor-pointer font-medium"
                >
                    {expanded ? 'Tutup Rumus' : 'Lihat Langkah Hitung'}
                </button>
            </div>

            {expanded && (
                <div className="mt-3 pt-3 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {formulas.map((item, idx) => (
                        <div key={idx} className="bg-slate-800/90 p-3 rounded-lg border border-slate-700 space-y-1">
                            <p className="text-sky-300 font-semibold">{item.name}</p>
                            <p className="font-mono text-[11px] text-slate-400">Rumus: {item.formula}</p>
                            <p className="font-mono text-xs text-emerald-300 font-semibold">
                                Hitung: {item.substitution}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// 4. SIMULATOR KESALAHAN INTERAKTIF ("APA YANG TERJADI JIKA...?")
// ============================================================================
export function WhatIfErrorSimulator({ onTriggerScenario }) {
    const scenarios = [
        {
            id: 'wrong-charger',
            label: '⚠️ Simulasi Salah Beli Charger (84V ke Pak 48V)',
            description: 'Memasang charger 84V pada pak baterai 48V menyebabkan overvoltage sel, BMS memutus paksa, dan risiko thermal runaway.',
        },
        {
            id: 'bms-under',
            label: '⚠️ Simulasi BMS Kekecilan (BMS 25A vs Ctrl 55A)',
            description: 'Saat gas ditarik penuh di tanjakan, arus controller melebihi batas BMS sehingga motor mendadak mati total (cut-off) di tengah jalan.',
        },
        {
            id: 'wrong-gear',
            label: '⚠️ Simulasi Rasio Hub Berat di Tanjakan (1:1)',
            description: 'Menggunakan rasio 1:1 pada motor putaran tinggi membuat torsi roda kecil dan suhu magnet melonjak hingga 165°C (risiko demagnetisasi).',
        },
    ];

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2">
                <span className="text-base">🧪</span>
                <h3 className="text-xs sm:text-sm font-bold text-amber-950">
                    Laboratorium Kesalahan ("Apa yang Terjadi Jika...?")
                </h3>
            </div>
            <p className="text-xs text-amber-800">
                Klik skenario di bawah untuk melihat dampak kesalahan perakitan secara langsung pada parameter simulasi:
            </p>
            <div className="flex flex-wrap gap-2">
                {scenarios.map((sc) => (
                    <button
                        key={sc.id}
                        type="button"
                        onClick={() => {
                            onTriggerScenario(sc.id);
                            Swal.fire({
                                icon: 'error',
                                title: 'Simulasi Kegagalan Sistem!',
                                text: sc.description,
                                confirmButtonText: 'Amati Dampak di Layar',
                                confirmButtonColor: '#dc2626',
                            });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-red-50 hover:border-red-300 text-xs font-semibold text-gray-800 transition cursor-pointer"
                    >
                        {sc.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// 5. PERBANDINGAN LANGSUNG: MOTOR BENSIN ASAL VS HASIL KONVERSI
// ============================================================================
export function BeforeAfterComparisonCard({
    engineCc,
    origWeightKg,
    convWeightKg,
    totalEnergyKwh,
    wheelTorqueNm,
}) {
    // Estimasi konsumsi BBM motor bensin: ±1 liter per 45 km (Pertalite Rp 10.000/L)
    const iceCostPer100Km = Math.round((100 / 45) * 10000);
    // Estimasi konsumsi EV: ±2,5 kWh per 100 km (Tarif listrik rumah Rp 1.445/kWh)
    const evCostPer100Km = Math.round(2.5 * 1445);
    const savingPer100Km = iceCostPer100Km - evCostPer100Km;
    // Emisi CO2 bensin ±2,31 kg/liter -> per 100 km = (100/45)*2.31 = 5.13 kg CO2
    const co2SavedPerYearKg = Math.round(((100 / 45) * 2.31) * 100); // asumsi 10.000 km/tahun

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-3">
                <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-800">
                        Ringkasan Komparasi: Motor Bensin Asal vs Hasil Konversi Listrik
                    </h3>
                    <p className="text-xs text-gray-500">
                        Membantu siswa mempresentasikan dampak teknis, biaya operasional, dan lingkungan
                    </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Hemat Biaya ±{Math.round((savingPer100Km / iceCostPer100Km) * 100)}% / 100 km
                </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 font-medium">Sumber Penggerak</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">Mesin {engineCc} cc (BBM)</p>
                    <p className="text-emerald-700 font-bold mt-0.5">→ Motor BLDC ({totalEnergyKwh} kWh)</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 font-medium">Bobot Kendaraan</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">Awal: {origWeightKg} kg</p>
                    <p className="text-blue-700 font-bold mt-0.5">→ Konversi: {convWeightKg} kg</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="text-emerald-700 font-medium">Biaya Energi per 100 km</p>
                    <p className="text-xs line-through text-gray-500 mt-1">Bensin: ±Rp {iceCostPer100Km.toLocaleString('id-ID')}</p>
                    <p className="text-base font-bold text-emerald-900">Listrik: ±Rp {evCostPer100Km.toLocaleString('id-ID')}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
                    <p className="text-sky-700 font-medium">Reduksi Emisi & Torsi</p>
                    <p className="text-sm font-bold text-sky-900 mt-1">-{co2SavedPerYearKg} kg CO₂ / tahun</p>
                    <p className="text-xs text-sky-700 mt-0.5">Torsi instan roda: {wheelTorqueNm} Nm</p>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// 6. FUNGSI KUIS REFLEKSI DINAMIS SEBELUM SIMPAN LAPORAN (SWEETALERT2)
// ============================================================================
export async function runDynamicComprehensionQuiz({
    fullVoltage,
    minInsulationKOhm,
    mcbMinA,
    mcbMaxA,
}) {
    const q1 = await Swal.fire({
        title: 'Kuis Pemahaman (1/3)',
        text: `Berdasarkan pak baterai yang baru Anda rancang, berapakah tegangan output charger wajib yang harus digunakan?`,
        input: 'radio',
        inputOptions: {
            wrong1: `${(fullVoltage - 12).toFixed(1)} Volt (Tegangan nominal bawah)`,
            correct: `${fullVoltage} Volt (Sesuai tegangan penuh seluruh sel seri)`,
            wrong2: `${(fullVoltage + 15).toFixed(1)} Volt (Tegangan lebih agar cepat penuh)`,
        },
        inputValidator: (value) => (!value ? 'Pilih salah satu jawaban terlebih dahulu!' : null),
        confirmButtonText: 'Lanjut Soal 2 →',
        confirmButtonColor: '#2563eb',
        showCancelButton: true,
        cancelButtonText: 'Batal',
    });

    if (!q1.isConfirmed) return null;

    const q2 = await Swal.fire({
        title: 'Kuis Pemahaman (2/3)',
        text: `Menurut standar UN R136 / ISO 6469-3 (minimal 100 Ω/Volt), berapa nilai tahanan isolasi minimal untuk sistem baterai Anda?`,
        input: 'radio',
        inputOptions: {
            wrong1: `Minimal ${(minInsulationKOhm / 10).toFixed(2)} kΩ`,
            correct: `Minimal ${minInsulationKOhm} kΩ`,
            wrong2: `Harus 0 Ω agar arus mengalir lancar`,
        },
        inputValidator: (value) => (!value ? 'Pilih salah satu jawaban!' : null),
        confirmButtonText: 'Lanjut Soal 3 →',
        confirmButtonColor: '#2563eb',
        showCancelButton: true,
        cancelButtonText: 'Batal',
    });

    if (!q2.isConfirmed) return null;

    const q3 = await Swal.fire({
        title: 'Kuis Pemahaman (3/3)',
        text: `Berapa ukuran rating MCB / Sekring DC yang direkomendasikan untuk mengamankan rangkaian baterai–controller Anda?`,
        input: 'radio',
        inputOptions: {
            correct: `${mcbMinA} – ${mcbMaxA} Ampere (20–40% di atas setting arus controller)`,
            wrong1: `5 Ampere agar cepat memutus saat motor digas`,
            wrong2: `250 Ampere agar tidak pernah trip selamanya`,
        },
        inputValidator: (value) => (!value ? 'Pilih salah satu jawaban!' : null),
        confirmButtonText: 'Selesai & Simpan Laporan ✔',
        confirmButtonColor: '#059669',
        showCancelButton: true,
        cancelButtonText: 'Batal',
    });

    if (!q3.isConfirmed) return null;

    let score = 0;
    if (q1.value === 'correct') score += 1;
    if (q2.value === 'correct') score += 1;
    if (q3.value === 'correct') score += 1;

    return Math.round((score / 3) * 100);
}