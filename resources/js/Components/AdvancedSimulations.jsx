import React, { useState, useEffect } from 'react';

// =====================================================================
// TAB 5: SIMULASI UJI TANJAKAN & BEBAN (GRADEABILITY SIMULATOR)
// =====================================================================
export function GradeabilityTab({ wheelTorqueNm, wheelDiameterM, convWeightKg, topSpeedKmh }) {
    const [slopeDeg, setSlopeDeg] = useState(12);
    const [riderWeightKg, setRiderWeightKg] = useState(120); // Pengendara + penumpang

    const totalMassKg = (convWeightKg || 108) + (riderWeightKg || 0);
    const gravity = 9.81;
    const wheelRadiusM = (wheelDiameterM || 0.55) / 2;
    const slopeRad = (slopeDeg * Math.PI) / 180;
    const slopePercent = +(Math.tan(slopeRad) * 100).toFixed(1);

    // Gaya gravitasi tanjakan + tahanan gelinding ban (Crr ~ 0.015)
    const climbForceN = totalMassKg * gravity * Math.sin(slopeRad);
    const rollingForceN = totalMassKg * gravity * Math.cos(slopeRad) * 0.015;
    const requiredForceN = climbForceN + rollingForceN;
    const requiredTorqueNm = +(requiredForceN * wheelRadiusM).toFixed(1);

    const torqueMarginNm = +(wheelTorqueNm - requiredTorqueNm).toFixed(1);
    const canClimb = wheelTorqueNm >= requiredTorqueNm;
    const climbSpeedEstKmh = canClimb
        ? +Math.max(8, topSpeedKmh * Math.max(0.25, 1 - slopeDeg / 35)).toFixed(1)
        : 0;

    return (
        <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}
            className="no-print mb-8"
        >
            {/* Input Tanjakan */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Parameter Medan & Beban</h2>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sudut Kemiringan Tanjakan: <strong>{slopeDeg}° ({slopePercent}%)</strong>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="30"
                        value={slopeDeg}
                        onChange={(e) => setSlopeDeg(Number(e.target.value))}
                        className="w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-gray-400">
                        <span>0° (Datar)</span>
                        <span>15° (Curam)</span>
                        <span>30° (Ekstrem)</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Berat Pengendara + Penumpang / Barang (kg)
                    </label>
                    <input
                        type="number"
                        min="40"
                        max="250"
                        value={riderWeightKg}
                        onChange={(e) => setRiderWeightKg(parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 space-y-1">
                    <p>• Berat kosong motor (Tab 4): <strong>{convWeightKg} kg</strong></p>
                    <p>• Total massa kendaraan + beban: <strong>{totalMassKg} kg</strong></p>
                    <p>• Torsi roda tersedia (Tab 2): <strong>{wheelTorqueNm} Nm</strong></p>
                </div>
            </div>

            {/* Hasil & Visualisasi Bidang Miring */}
            <div style={{ gridColumn: 'span 2 / span 2' }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-800">Simulasi Kemampuan Menanjak (Gradeability)</h2>
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                            canClimb ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {canClimb ? 'MAMPU MENANJAK' : 'GAGAL MENANJAK (TORSI KURANG)'}
                    </span>
                </div>

                {/* Diagram Bidang Miring SVG */}
                <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700">
                    <svg viewBox="0 0 640 190" className="w-full h-auto">
                        {/* Garis Horizontal Dasar */}
                        <line x1="40" y1="165" x2="600" y2="165" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />

                        {/* Grup Bidang Miring & Motor yang Berotasi Sesuai Sudut */}
                        <g transform={`translate(100, 165) rotate(${-slopeDeg})`}>
                            {/* Jalan Tanjakan */}
                            <line x1="0" y1="0" x2="480" y2="0" stroke="#94a3b8" strokeWidth="6" />
                            {/* Ikon Motor di Atas Tanjakan */}
                            <g transform="translate(210, -45)">
                                <circle cx="20" cy="33" r="12" fill="#0f172a" stroke="#10b981" strokeWidth="3" />
                                <circle cx="85" cy="33" r="12" fill="#0f172a" stroke="#10b981" strokeWidth="3" />
                                <path d="M 20 33 L 40 10 L 70 10 L 85 33 Z" fill="#3b82f6" />
                                <circle cx="52" cy="0" r="7" fill="#fbbf24" />
                                {/* Panah Dorong / Mundur */}
                                {canClimb ? (
                                    <text x="105" y="22" fill="#34d399" fontSize="12" fontWeight="bold">
                                        ▲ Nanjak ±{climbSpeedEstKmh} km/j
                                    </text>
                                ) : (
                                    <text x="-95" y="22" fill="#f87171" fontSize="12" fontWeight="bold">
                                        ▼ Torsi Kurang!
                                    </text>
                                )}
                            </g>
                        </g>

                        <text x="45" y="30" fill="#cbd5e1" fontSize="12" fontWeight="bold">
                            Kemiringan: {slopeDeg}° ({slopePercent}%) | Beban Total: {totalMassKg} kg
                        </text>
                    </svg>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-700 font-medium">Torsi Roda Tersedia</p>
                        <p className="text-2xl font-bold text-blue-900">{wheelTorqueNm} Nm</p>
                        <p className="text-xs text-blue-600 mt-1">Dari motor + rasio gear</p>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <p className="text-xs text-amber-700 font-medium">Torsi Tanjakan Dibutuhkan</p>
                        <p className="text-2xl font-bold text-amber-900">{requiredTorqueNm} Nm</p>
                        <p className="text-xs text-amber-600 mt-1">Pada sudut {slopeDeg}°</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${canClimb ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <p className="text-xs font-medium text-gray-700">Selisih / Cadangan Torsi</p>
                        <p className={`text-2xl font-bold ${canClimb ? 'text-emerald-900' : 'text-red-900'}`}>
                            {torqueMarginNm > 0 ? `+${torqueMarginNm}` : torqueMarginNm} Nm
                        </p>
                        <p className="text-xs mt-1 text-gray-600">
                            {canClimb ? `Estimasi laju: ±${climbSpeedEstKmh} km/j` : 'Perbesar rasio gear di Tab 2'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =====================================================================
// TAB 6: SIMULATOR WIRING & TROUBLESHOOTING KELISTRIKAN
// =====================================================================
export function TroubleshootingTab({ nominalV }) {
    const faults = [
        {
            id: 'normal',
            title: 'Sistem Normal (Tidak Ada Gangguan)',
            symptom: 'Motor berputar normal, lampu dan klakson menyala terang.',
            suspect: 'normal',
            hint: 'Semua tegangan terbaca normal sesuai standar.',
            readings: {
                battery: `${nominalV} V DC`,
                mcb: `${nominalV} V DC`,
                keyswitch: `${nominalV} V DC`,
                dcdc: '12.4 V DC (Normal)',
                brake: '0 V (Tuas rem bebas)',
                throttle: '0.8 V – 4.2 V (Normal)',
                controller: `${nominalV} V DC (Ready)`,
            },
        },
        {
            id: 'throttle_wire',
            title: 'Gangguan #1: Kabel Sinyal Hall Sensor Throttle Putus',
            symptom: 'Kunci kontak ON, lampu & klakson hidup, indikator READY menyala, tetapi motor TIDAK mau jalan saat gas diputar.',
            suspect: 'throttle',
            hint: 'Periksa tegangan sinyal (kabel hijau/biru) pada grip gas/throttle menggunakan multimeter.',
            readings: {
                battery: `${nominalV} V DC`,
                mcb: `${nominalV} V DC`,
                keyswitch: `${nominalV} V DC`,
                dcdc: '12.4 V DC',
                brake: '0 V (Normal)',
                throttle: '0.00 V (PUTUS! Seharusnya 0.8–4.2V)',
                controller: `${nominalV} V DC`,
            },
        },
        {
            id: 'brake_switch',
            title: 'Gangguan #2: Switch Rem (Brake Cut-Off) Macet / Korslet',
            symptom: 'Motor tiba-tiba mati tenaga di tengah jalan meski baterai penuh dan gas diputar.',
            suspect: 'brake',
            hint: 'Controller memutus arus karena menerima sinyal pengereman terus-menerus.',
            readings: {
                battery: `${nominalV} V DC`,
                mcb: `${nominalV} V DC`,
                keyswitch: `${nominalV} V DC`,
                dcdc: '12.4 V DC',
                brake: '12.0 V AKTIF TERUS (Switch rem macet!)',
                throttle: '2.5 V (Normal)',
                controller: 'LOCKED (Brake Cut-Off Aktif)',
            },
        },
        {
            id: 'dcdc_dead',
            title: 'Gangguan #3: DC-DC Converter 12V Rusak / Sekring 12V Putus',
            symptom: 'Motor listrik bisa melaju normal, tetapi lampu utama, lampu sein, dan klakson mati total.',
            suspect: 'dcdc',
            hint: 'Periksa keluaran step-down converter dari tegangan tinggi baterai ke sistem aksesoris 12 V.',
            readings: {
                battery: `${nominalV} V DC`,
                mcb: `${nominalV} V DC`,
                keyswitch: `${nominalV} V DC`,
                dcdc: '0.00 V DC (RUSAK! Seharusnya 12V)',
                brake: '0 V',
                throttle: '1.2 V',
                controller: `${nominalV} V DC`,
            },
        },
        {
            id: 'mcb_trip',
            title: 'Gangguan #4: MCB Utama Trip / Terminal Baterai Kendor',
            symptom: 'Semua indikator mati total saat kunci kontak diputar ke posisi ON.',
            suspect: 'mcb',
            hint: 'Ukur tegangan keluar dari MCB DC sebelum menuju kunci kontak dan controller.',
            readings: {
                battery: `${nominalV} V DC`,
                mcb: '0.00 V DC (MCB TRIP / OFF!)',
                keyswitch: '0.00 V DC',
                dcdc: '0.00 V DC',
                brake: '0 V',
                throttle: '0 V',
                controller: '0.00 V DC',
            },
        },
    ];

    const [currentFaultIdx, setCurrentFaultIdx] = useState(1);
    const [selectedNode, setSelectedNode] = useState('battery');
    const [solved, setSolved] = useState(false);

    const activeFault = faults[currentFaultIdx];

    const triggerRandomFault = () => {
        const randomIdx = Math.floor(Math.random() * (faults.length - 1)) + 1;
        setCurrentFaultIdx(randomIdx);
        setSelectedNode('battery');
        setSolved(false);
    };

    const handleRepair = (nodeKey) => {
        if (activeFault.suspect === 'normal') return;
        if (nodeKey === activeFault.suspect) {
            setSolved(true);
            setCurrentFaultIdx(0);
        } else {
            alert('Komponen ini dalam kondisi normal! Coba ukur titik komponen lain dengan multimeter.');
        }
    };

    const nodes = [
        { key: 'battery', label: '1. Battery Pack', x: 30, y: 35, w: 95, h: 45 },
        { key: 'mcb', label: '2. MCB DC', x: 155, y: 35, w: 85, h: 45 },
        { key: 'keyswitch', label: '3. Kunci Kontak', x: 270, y: 35, w: 105, h: 45 },
        { key: 'dcdc', label: '4. DC-DC 12V', x: 270, y: 120, w: 105, h: 45 },
        { key: 'brake', label: '5. Switch Rem', x: 410, y: 120, w: 95, h: 45 },
        { key: 'throttle', label: '6. Throttle Gas', x: 530, y: 120, w: 95, h: 45 },
        { key: 'controller', label: '7. Controller', x: 440, y: 35, w: 145, h: 45 },
    ];

    return (
        <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}
            className="no-print mb-8"
        >
            {/* Panel Kasus & Multimeter Virtual */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-lg font-bold text-gray-800">Praktikum Troubleshooting</h2>
                    <button
                        type="button"
                        onClick={triggerRandomFault}
                        style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer"
                    >
                        Acak Kerusakan Baru
                    </button>
                </div>

                <div className={`p-4 rounded-xl border ${solved ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-xs font-bold uppercase text-gray-600">Laporan Keluhan Pengendara:</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{activeFault.title}</p>
                    <p className="text-xs text-gray-700 mt-1">{activeFault.symptom}</p>
                    {solved && (
                        <p className="text-xs font-bold text-emerald-700 mt-2">
                            ✓ BERHASIL DIPERBAIKI! Sistem kelistrikan kembali normal.
                        </p>
                    )}
                </div>

                {/* Layar Multimeter Digital */}
                <div className="bg-slate-900 text-white p-4 rounded-xl border-2 border-slate-700">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">Multimeter Digital Virtual</p>
                    <p className="text-xs text-blue-300 mt-1">
                        Titik Ukur: <strong>{nodes.find((n) => n.key === selectedNode)?.label}</strong>
                    </p>
                    <div className="mt-2 bg-emerald-950 border border-emerald-700 rounded-lg p-3 font-mono text-lg font-bold text-emerald-400">
                        {activeFault.readings[selectedNode]}
                    </div>
                </div>

                {activeFault.suspect !== 'normal' && (
                    <button
                        type="button"
                        onClick={() => handleRepair(selectedNode)}
                        style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                        className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold hover:opacity-90 cursor-pointer"
                    >
                        Perbaiki / Ganti Komponen Terpilih ({nodes.find((n) => n.key === selectedNode)?.label})
                    </button>
                )}
            </div>

            {/* Skema Wiring Interaktif */}
            <div style={{ gridColumn: 'span 2 / span 2' }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Klik Komponen pada Diagram untuk Mengukur Tegangan</h2>
                    <span className="text-xs text-gray-500">Petunjuk: {activeFault.hint}</span>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <svg viewBox="0 0 650 190" className="w-full h-auto">
                        {/* Garis Koneksi Wiring */}
                        <line x1="125" y1="57" x2="155" y2="57" stroke="#ea580c" strokeWidth="3" />
                        <line x1="240" y1="57" x2="270" y2="57" stroke="#ea580c" strokeWidth="3" />
                        <line x1="375" y1="57" x2="440" y2="57" stroke="#ea580c" strokeWidth="3" />
                        <line x1="322" y1="80" x2="322" y2="120" stroke="#f59e0b" strokeWidth="2.5" />
                        <line x1="457" y1="80" x2="457" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" />
                        <line x1="575" y1="80" x2="575" y2="120" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" />

                        {/* Kotak Komponen Interaktif */}
                        {nodes.map((node) => {
                            const isSelected = selectedNode === node.key;
                            return (
                                <g
                                    key={node.key}
                                    onClick={() => setSelectedNode(node.key)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <rect
                                        x={node.x}
                                        y={node.y}
                                        width={node.w}
                                        height={node.h}
                                        rx="8"
                                        fill={isSelected ? '#1d4ed8' : '#1e293b'}
                                        stroke={isSelected ? '#93c5fd' : '#64748b'}
                                        strokeWidth={isSelected ? '3' : '1.5'}
                                    />
                                    <text
                                        x={node.x + node.w / 2}
                                        y={node.y + 26}
                                        fill="#ffffff"
                                        fontSize="10"
                                        fontWeight="bold"
                                        textAnchor="middle"
                                    >
                                        {node.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
        </div>
    );
}

// =====================================================================
// TAB 7: TEST RIDE VIRTUAL & LIVE DASHBOARD (KOKPIT INTERAKTIF)
// =====================================================================
export function TestRideTab({ totalEnergyKwh, topSpeedKmh, motorPowerW, nominalV }) {
    const [keyOn, setKeyOn] = useState(true);
    const [starterPressed, setStarterPressed] = useState(true);
    const [sideStandDown, setSideStandDown] = useState(false);
    const [chargerPlugged, setChargerPlugged] = useState(false);
    const [brakePressed, setBrakePressed] = useState(false);
    const [throttle, setThrottle] = useState(0);
    const [socPercent, setSocPercent] = useState(100);
    const [tripKm, setTripKm] = useState(0);

    // Logika Keamanan PM 39/2023:
    // Motor READY hanya jika: Kunci ON + Tombol Starter ditekan + Standar samping naik + Charger dicabut + Baterai > 0%
    const isReady = keyOn && starterPressed && !sideStandDown && !chargerPlugged && socPercent > 0;
    const effectiveThrottle = isReady && !brakePressed ? throttle : 0;
    const currentSpeed = +((topSpeedKmh * effectiveThrottle) / 100).toFixed(1);
    const currentPowerW = Math.round((motorPowerW * Math.pow(effectiveThrottle / 100, 1.3)));
    const currentAmpere = nominalV > 0 ? +(currentPowerW / nominalV).toFixed(1) : 0;

    // Simulasi berkurangnya SOC baterai & bertambahnya jarak tempuh secara real-time saat gas ditarik
    useEffect(() => {
        if (effectiveThrottle <= 0 || socPercent <= 0) return;

        const timer = setInterval(() => {
            setTripKm((prev) => +(prev + currentSpeed / 360).toFixed(2)); // Percepatan waktu 10x untuk simulasi
            const kwhUsed = (currentPowerW / 1000) / 360;
            const socDrop = totalEnergyKwh > 0 ? (kwhUsed / totalEnergyKwh) * 100 : 0.2;
            setSocPercent((prev) => Math.max(0, +(prev - socDrop).toFixed(2)));
        }, 1000);

        return () => clearInterval(timer);
    }, [effectiveThrottle, currentSpeed, currentPowerW, totalEnergyKwh, socPercent]);

    return (
        <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}
            className="no-print mb-8"
        >
            {/* Panel Saklar & Pengendali Kokpit */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-lg font-bold text-gray-800">Kontrol Kokpit & Interlock</h2>
                    <button
                        type="button"
                        onClick={() => {
                            setSocPercent(100);
                            setTripKm(0);
                            setThrottle(0);
                        }}
                        className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                    >
                        Isi Penuh & Reset Trip
                    </button>
                </div>

                <div className="space-y-2.5 text-sm">
                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border cursor-pointer">
                        <span>1. Kunci Kontak Utama (Ignition)</span>
                        <input
                            type="checkbox"
                            checked={keyOn}
                            onChange={(e) => {
                                setKeyOn(e.target.checked);
                                if (!e.target.checked) setStarterPressed(false);
                            }}
                        />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border cursor-pointer">
                        <span>2. Tombol Aktivasi (2-Step Ready)</span>
                        <input
                            type="checkbox"
                            disabled={!keyOn}
                            checked={starterPressed}
                            onChange={(e) => setStarterPressed(e.target.checked)}
                        />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer">
                        <span>Standar Samping Turun (Side-Stand)</span>
                        <input
                            type="checkbox"
                            checked={sideStandDown}
                            onChange={(e) => setSideStandDown(e.target.checked)}
                        />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 border border-red-200 cursor-pointer">
                        <span>Kabel Charger Terpasang (Interlock)</span>
                        <input
                            type="checkbox"
                            checked={chargerPlugged}
                            onChange={(e) => setChargerPlugged(e.target.checked)}
                        />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border cursor-pointer">
                        <span>Tuas Rem Ditekan (Brake Cut-Off)</span>
                        <input
                            type="checkbox"
                            checked={brakePressed}
                            onChange={(e) => setBrakePressed(e.target.checked)}
                        />
                    </label>
                </div>

                <div className="pt-2">
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                        Putaran Gas / Throttle: <span className="text-blue-600">{throttle}%</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={throttle}
                        onChange={(e) => setThrottle(Number(e.target.value))}
                        className="w-full cursor-pointer"
                    />
                </div>
            </div>

            {/* Layar Speedometer Digital */}
            <div style={{ gridColumn: 'span 2 / span 2' }} className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col justify-between">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-4">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-slate-400">Digital Instrument Cluster</p>
                        <p className="text-xs text-slate-400">
                            Kapasitas Pak: {totalEnergyKwh} kWh | Max Speed: {topSpeedKmh} km/j
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {chargerPlugged && (
                            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold animate-pulse">
                                CHARGING INTERLOCK
                            </span>
                        )}
                        {sideStandDown && (
                            <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-bold">
                                SIDE STAND
                            </span>
                        )}
                        {brakePressed && (
                            <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-bold">
                                BRAKE CUT-OFF
                            </span>
                        )}
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isReady ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                            }`}
                        >
                            {isReady ? '● READY' : 'STANDBY / OFF'}
                        </span>
                    </div>
                </div>

                {/* Angka Utama Speedometer */}
                <div className="my-6 text-center">
                    <div className="text-7xl font-black tracking-tight text-emerald-400 font-mono">
                        {keyOn ? currentSpeed : '--'}
                    </div>
                    <div className="text-sm font-semibold tracking-widest text-slate-400 mt-1">KM / JAM</div>
                </div>

                {/* Indikator Bawah: Baterai SOC, Wattmeter, Trip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-xs text-slate-400">Sisa Baterai (SOC)</p>
                        <p className={`text-2xl font-bold mt-1 ${socPercent < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {keyOn ? `${socPercent.toFixed(1)}%` : '--'}
                        </p>
                        <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                            <div
                                style={{ width: `${keyOn ? socPercent : 0}%` }}
                                className={`h-full ${socPercent < 20 ? 'bg-red-500' : 'bg-emerald-500'}`}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-xs text-slate-400">Daya & Arus Real-Time</p>
                        <p className="text-2xl font-bold text-amber-400 mt-1">
                            {keyOn ? `${currentPowerW} W` : '--'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Arus tarik: {keyOn ? `${currentAmpere} A` : '0 A'}</p>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-xs text-slate-400">Jarak Tempuh (Trip)</p>
                        <p className="text-2xl font-bold text-blue-400 mt-1">
                            {keyOn ? `${tripKm.toFixed(2)} km` : '--'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Simulasi berjalan saat gas ditarik</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =====================================================================
// TAB 8: ANALISIS EKONOMI, ROI & PENGHEMATAN BBM VS LISTRIK
// =====================================================================
export function RoiAnalysisTab({ totalEnergyKwh }) {
    const [dailyKm, setDailyKm] = useState(40);
    const [fuelKmPerLiter, setFuelKmPerLiter] = useState(45);
    const [fuelPricePerLiter, setFuelPricePerLiter] = useState(10000); // Pertalite Rp 10.000
    const [electricityTariff, setElectricityTariff] = useState(1445); // PLN R1 Rp 1.445/kWh
    const [conversionCostRp, setConversionCostRp] = useState(15000000); // Biaya paket konversi
    const [evKmPerKwh, setEvKmPerKwh] = useState(32); // Efisiensi rata-rata motor konversi 2 kW

    const dailyFuelCost = fuelKmPerLiter > 0 ? (dailyKm / fuelKmPerLiter) * fuelPricePerLiter : 0;
    const dailyEvCost = evKmPerKwh > 0 ? (dailyKm / evKmPerKwh) * electricityTariff * 1.15 : 0; // +15% efisiensi charger
    const dailySavings = Math.max(0, dailyFuelCost - dailyEvCost);
    const monthlySavings = dailySavings * 30;
    const yearlySavings = dailySavings * 365;
    const breakEvenMonths = monthlySavings > 0 ? +(conversionCostRp / monthlySavings).toFixed(1) : 0;

    // Emisi CO2: 1 liter bensin ~ 2.31 kg CO2, 1 kWh listrik ~ 0.85 kg CO2
    const yearlyCo2SavedKg = Math.round(
        ((dailyKm / (fuelKmPerLiter || 1)) * 2.31 - (dailyKm / (evKmPerKwh || 1)) * 0.85) * 365
    );

    const formatRp = (num) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    return (
        <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}
            className="no-print mb-8"
        >
            {/* Input Parameter Ekonomi */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Parameter Biaya Operasional</h2>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jarak Tempuh Harian (km/hari)</label>
                    <input
                        type="number"
                        value={dailyKm}
                        onChange={(e) => setDailyKm(parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Konsumsi BBM (km/L)</label>
                        <input
                            type="number"
                            value={fuelKmPerLiter}
                            onChange={(e) => setFuelKmPerLiter(parseFloat(e.target.value) || 0)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Harga BBM (Rp/L)</label>
                        <input
                            type="number"
                            step="500"
                            value={fuelPricePerLiter}
                            onChange={(e) => setFuelPricePerLiter(parseFloat(e.target.value) || 0)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Efisiensi EV (km/kWh)</label>
                        <input
                            type="number"
                            value={evKmPerKwh}
                            onChange={(e) => setEvKmPerKwh(parseFloat(e.target.value) || 0)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tarif PLN (Rp/kWh)</label>
                        <input
                            type="number"
                            value={electricityTariff}
                            onChange={(e) => setElectricityTariff(parseFloat(e.target.value) || 0)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Biaya Konversi (Rp)</label>
                    <input
                        type="number"
                        step="500000"
                        value={conversionCostRp}
                        onChange={(e) => setConversionCostRp(parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>
            </div>

            {/* Hasil Analisis ROI & Penghematan */}
            <div style={{ gridColumn: 'span 2 / span 2' }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
                <h2 className="text-lg font-bold text-gray-800">Hasil Analisis Penghematan & Titik Impas (ROI)</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <p className="text-xs text-red-700 font-medium">Biaya BBM / Bulan</p>
                        <p className="text-xl font-bold text-red-900">{formatRp(dailyFuelCost * 30)}</p>
                        <p className="text-xs text-red-600 mt-1">{formatRp(dailyFuelCost)} / hari</p>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <p className="text-xs text-emerald-700 font-medium">Biaya Listrik / Bulan</p>
                        <p className="text-xl font-bold text-emerald-900">{formatRp(dailyEvCost * 30)}</p>
                        <p className="text-xs text-emerald-600 mt-1">
                            1x cas penuh ({totalEnergyKwh} kWh): {formatRp(totalEnergyKwh * electricityTariff)}
                        </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-700 font-medium">Penghematan / Tahun</p>
                        <p className="text-xl font-bold text-blue-900">{formatRp(yearlySavings)}</p>
                        <p className="text-xs text-blue-600 mt-1">Hemat {formatRp(monthlySavings)} / bulan</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <p className="text-xs text-purple-700 font-medium">Balik Modal (BEP)</p>
                        <p className="text-2xl font-bold text-purple-900">{breakEvenMonths} Bulan</p>
                        <p className="text-xs text-purple-600 mt-1">±{(breakEvenMonths / 12).toFixed(1)} tahun pemakaian</p>
                    </div>
                </div>

                {/* Grafik Batang Perbandingan Biaya Bulanan */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                    <p className="text-sm font-bold text-gray-800">Perbandingan Pengeluaran Energi Bulanan</p>
                    <div>
                        <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                            <span>Motor Bensin (BBM)</span>
                            <span>{formatRp(dailyFuelCost * 30)}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                            <div style={{ width: '100%' }} className="bg-red-500 h-full" />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                            <span>Motor Listrik Konversi (PLN)</span>
                            <span>{formatRp(dailyEvCost * 30)}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                            <div
                                style={{
                                    width: `${dailyFuelCost > 0 ? Math.min(100, (dailyEvCost / dailyFuelCost) * 100) : 10}%`,
                                }}
                                className="bg-emerald-500 h-full"
                            />
                        </div>
                    </div>

                    <p className="text-xs text-emerald-700 font-medium pt-1">
                        Dampak Lingkungan: Mengurangi emisi karbon hingga <strong>±{yearlyCo2SavedKg} kg CO₂/tahun</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
}