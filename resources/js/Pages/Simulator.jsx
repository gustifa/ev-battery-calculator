import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AppLayout from '@/Layouts/AppLayout';
import {
    BatteryPackDiagram,
    MotorDrivetrainDiagram,
    PwmCircuitDiagram,
    InspectionBlueprintDiagram,
} from '@/Components/SimulationVisuals';
import {
    GradeabilityTab,
    TroubleshootingTab,
    TestRideTab,
    RoiAnalysisTab,
} from '@/Components/AdvancedSimulations';
import SimulationGuideModal from '@/Components/SimulationGuideModal';
import {
    MissionChallengePanel,
    FormulaBreakdownPanel,
    WhatIfErrorSimulator,
    BeforeAfterComparisonCard,
    runDynamicComprehensionQuiz,
} from '@/Components/PedagogicalTools';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    },
});

export default function Simulator({ reports = [] }) {
    const [activeTab, setActiveTab] = useState('battery');
    const [autoSync, setAutoSync] = useState(true);
    const [guideModalOpen, setGuideModalOpen] = useState(false);
    const [projectorMode, setProjectorMode] = useState(false);

    // ==========================================
    // DATA PRESET KOMPONEN BUKU AJAR
    // ==========================================
    const batteryPresets = [
        { label: '-- Pilih Preset Baterai Buku Ajar (Opsional) --', chem: 'NMC', cellAh: 5, v: 72, ah: 20, chargerA: 5 },
        { label: 'Paket Konversi Braja 72V 20Ah (NMC 20S 4P)', chem: 'NMC', cellAh: 5, v: 72, ah: 20, chargerA: 5 },
        { label: 'Honda EM1 e: (Honda Mobile Power Pack 50,4V 29,4Ah)', chem: 'NMC', cellAh: 4.9, v: 50.4, ah: 29.4, chargerA: 5 },
        { label: 'Gesits G1 (NMC 72V 20Ah / 1,44 kWh)', chem: 'NMC', cellAh: 5, v: 72, ah: 20, chargerA: 5 },
        { label: 'Alva One (Li-ion 60V 45Ah / 2,7 kWh)', chem: 'NMC', cellAh: 5, v: 60, ah: 45, chargerA: 10 },
        { label: 'Alva Cervo (Li-ion 73,8V 24Ah / 1,77 kWh)', chem: 'NMC', cellAh: 4.8, v: 73.8, ah: 24, chargerA: 8 },
        { label: 'Paket LFP Awet Siklus (72V 24Ah - 24S)', chem: 'LFP', cellAh: 6, v: 72, ah: 24, chargerA: 6 },
    ];

    const motorPresets = [
        { label: '-- Pilih Preset Motor Buku Ajar (Opsional) --', power: 2000, v: 72, rpm: 3000, ratio: 4, dia: 0.55, temp: 114 },
        { label: 'Braja BR-N.1000 (1.000 W | ≤110 cc)', power: 1000, v: 48, rpm: 2800, ratio: 1, dia: 0.52, temp: 95 },
        { label: 'Braja BR-N.1500 (1.500 W | ≤110 cc)', power: 1500, v: 60, rpm: 3000, ratio: 1, dia: 0.52, temp: 105 },
        { label: 'Braja BR-N.2000 (2.000 W | 110–150 cc)', power: 2000, v: 72, rpm: 3000, ratio: 4, dia: 0.55, temp: 114 },
        { label: 'Braja BR-N.3000 (3.000 W | 150–200 cc)', power: 3000, v: 72, rpm: 3500, ratio: 4.2, dia: 0.56, temp: 125 },
        { label: 'Honda EM1 e: (In-Wheel Hub 1.700 W)', power: 1700, v: 50.4, rpm: 650, ratio: 1, dia: 0.48, temp: 90 },
        { label: 'Gesits G1 (Mid-Drive 5.000 W Peak / 2.000 W Rated)', power: 2000, v: 72, rpm: 3200, ratio: 3.8, dia: 0.55, temp: 110 },
        { label: 'Alva Cervo (Mid-Drive 9.800 W Peak / 3.000 W Rated)', power: 3000, v: 73.8, rpm: 3600, ratio: 4.1, dia: 0.56, temp: 120 },
    ];

    // ==========================================
    // STATE TAB 1: BATERAI & CHARGER (BAB 2)
    // ==========================================
    const [chemistry, setChemistry] = useState('NMC');
    const [cellAh, setCellAh] = useState(5);
    const [targetVoltage, setTargetVoltage] = useState(72);
    const [targetAh, setTargetAh] = useState(20);
    const [chargerAmpere, setChargerAmpere] = useState(5);

    const chemSpecs = {
        NMC: { name: 'NMC (Li-ion)', nominal: 3.6, full: 4.2, empty: 2.5, kgPerKwh: 4.0, literPerKwh: 2.2 },
        LFP: { name: 'LFP (LiFePO4)', nominal: 3.2, full: 3.65, empty: 2.5, kgPerKwh: 8.4, literPerKwh: 4.4 },
        LTO: { name: 'LTO (Lithium Titanate)', nominal: 2.4, full: 2.85, empty: 1.8, kgPerKwh: 12.0, literPerKwh: 12.0 },
    };

    const currentChem = chemSpecs[chemistry];
    const seriesCount = Math.max(1, Math.round(targetVoltage / currentChem.nominal));
    const parallelCount = Math.max(1, Math.round(targetAh / (cellAh || 1)));
    const totalCells = seriesCount * parallelCount;
    const actualNominalV = +(seriesCount * currentChem.nominal).toFixed(1);
    const actualAh = +(parallelCount * (cellAh || 0)).toFixed(1);
    const totalEnergyKwh = +((actualNominalV * actualAh) / 1000).toFixed(2);
    const fullVoltage = +(seriesCount * currentChem.full).toFixed(1);
    const emptyVoltage = +(seriesCount * currentChem.empty).toFixed(1);
    const estWeightKg = +(totalEnergyKwh * currentChem.kgPerKwh).toFixed(1);
    const estVolumeL = +(totalEnergyKwh * currentChem.literPerKwh).toFixed(1);
    const minInsulationKOhm = +((actualNominalV * 100) / 1000).toFixed(1);
    const cRateCharge = actualAh > 0 ? +(chargerAmpere / actualAh).toFixed(2) : 0;
    const estChargeHours = chargerAmpere > 0 ? +((actualAh / chargerAmpere) * 1.15).toFixed(1) : 0;

    // ==========================================
    // STATE TAB 2: MOTOR & TRANSMISI (BAB 3)
    // ==========================================
    const [motorPowerW, setMotorPowerW] = useState(2000);
    const [motorVoltageV, setMotorVoltageV] = useState(72);
    const [motorRpm, setMotorRpm] = useState(3000);
    const [gearRatio, setGearRatio] = useState(4);
    const [wheelDiameterM, setWheelDiameterM] = useState(0.55);
    const [peakTempC, setPeakTempC] = useState(114);

    // ==========================================
    // STATE TAB 3: CONTROLLER, MCB & PWM (BAB 2 & 4)
    // ==========================================
    const [sysPowerW, setSysPowerW] = useState(2000);
    const [sysNominalV, setSysNominalV] = useState(72);
    const [sysPeakV, setSysPeakV] = useState(84);
    const [bmsMaxA, setBmsMaxA] = useState(50);
    const [ctrlMaxBatteryA, setCtrlMaxBatteryA] = useState(45);
    const [ctrlMaxToleranceV, setCtrlMaxToleranceV] = useState(90);
    const [pwmDuty, setPwmDuty] = useState(50);

    // ==========================================
    // STATE TAB 4: REGULASI PM 39/2023 & PRA-UJI (BAB 5)
    // ==========================================
    const [engineCc, setEngineCc] = useState(125);
    const [selectedMotorKw, setSelectedMotorKw] = useState(2);
    const [origWeightKg, setOrigWeightKg] = useState(105);
    const [convWeightKg, setConvWeightKg] = useState(108);
    const [headlightCd, setHeadlightCd] = useState(14000);
    const [checklist, setChecklist] = useState({
        twoStepReady: true,
        chargerInterlock: true,
        reverseDisabledForward: true,
        orangeHvCable: true,
        controllerHeatsinkCover: true,
    });

    // ==========================================
    // SINKRONISASI & SKENARIO ERROR
    // ==========================================
    const syncBatteryToOthers = (newChem, newTargetV) => {
        if (!autoSync) return;
        const spec = chemSpecs[newChem];
        const sCount = Math.max(1, Math.round(newTargetV / spec.nominal));
        const nomV = +(sCount * spec.nominal).toFixed(1);
        const peakV = +(sCount * spec.full).toFixed(1);

        setMotorVoltageV(nomV);
        setSysNominalV(nomV);
        setSysPeakV(peakV);
        setCtrlMaxToleranceV(Math.ceil(peakV + 6));
    };

    const syncMotorPowerToOthers = (newPowerW) => {
        if (!autoSync) return;
        setSysPowerW(newPowerW);
        setSelectedMotorKw(+(newPowerW / 1000).toFixed(2));
    };

    const handleTriggerErrorScenario = (scenarioId) => {
        if (scenarioId === 'wrong-charger') {
            setChemistry('LFP');
            setTargetVoltage(48);
            setSysNominalV(48);
            setSysPeakV(84); // Charger 84V dipaksa masuk
            setCtrlMaxToleranceV(60);
            setActiveTab('controller');
        } else if (scenarioId === 'bms-under') {
            setBmsMaxA(25);
            setCtrlMaxBatteryA(55);
            setActiveTab('controller');
        } else if (scenarioId === 'wrong-gear') {
            setGearRatio(1);
            setPeakTempC(165);
            setActiveTab('motor');
        }
    };

    const handleBatteryPreset = (idx) => {
        const p = batteryPresets[idx];
        if (!p) return;
        setChemistry(p.chem);
        setCellAh(p.cellAh);
        setTargetVoltage(p.v);
        setTargetAh(p.ah);
        setChargerAmpere(p.chargerA);
        syncBatteryToOthers(p.chem, p.v);

        if (idx > 0) {
            Toast.fire({ icon: 'info', title: 'Preset Baterai diterapkan & disinkronkan!' });
        }
    };

    const handleMotorPreset = (idx) => {
        const p = motorPresets[idx];
        if (!p) return;
        setMotorPowerW(p.power);
        setMotorVoltageV(p.v);
        setMotorRpm(p.rpm);
        setGearRatio(p.ratio);
        setWheelDiameterM(p.dia);
        setPeakTempC(p.temp);
        syncMotorPowerToOthers(p.power);

        if (idx > 0) {
            Toast.fire({ icon: 'info', title: 'Preset Motor diterapkan & disinkronkan!' });
        }
    };

    // ==========================================
    // PERHITUNGAN TAB 2, 3, & 4
    // ==========================================
    const nominalCurrentA = motorVoltageV > 0 ? +(motorPowerW / motorVoltageV).toFixed(1) : 0;
    const motorTorqueNm = motorRpm > 0 ? +((9.55 * motorPowerW) / motorRpm).toFixed(2) : 0;
    const wheelTorqueNm = +(motorTorqueNm * gearRatio).toFixed(1);
    const wheelRpm = gearRatio > 0 ? +(motorRpm / gearRatio).toFixed(0) : 0;
    const wheelCircumferenceM = +(Math.PI * wheelDiameterM).toFixed(2);
    const topSpeedKmh = +(wheelRpm * wheelCircumferenceM * 0.06).toFixed(1);

    const getMagnetRecommendation = (temp) => {
        if (temp <= 80) return { grade: 'Grade N (Maks. ±80°C)', status: 'Aman untuk beban ringan' };
        if (temp <= 120) return { grade: 'Grade H (Maks. ±120°C)', status: 'Direkomendasikan untuk motor konversi harian' };
        if (temp <= 150) return { grade: 'Grade SH (Maks. ±150°C)', status: 'Direkomendasikan untuk beban tanjakan / berat' };
        return { grade: 'Grade UH (Maks. ±180°C)', status: 'Wajib untuk beban ekstrem / balap' };
    };
    const magnetRec = getMagnetRecommendation(peakTempC);

    const baseCurrentA = sysNominalV > 0 ? sysPowerW / sysNominalV : 0;
    const currentWithLossA = +(baseCurrentA * 1.15).toFixed(1);
    const mcbMinA = Math.ceil(ctrlMaxBatteryA * 1.2);
    const mcbMaxA = Math.ceil(ctrlMaxBatteryA * 1.4);
    const pwmAvgVoltage = +((sysNominalV * pwmDuty) / 100).toFixed(1);
    const isBmsSafe = ctrlMaxBatteryA <= bmsMaxA;
    const isVoltageSafe = ctrlMaxToleranceV >= sysPeakV;

    const checkPowerCompliance = (cc, kw) => {
        if (cc <= 110) return { rule: '≤ 110 cc → Daya motor wajib 1 – 2 kW', pass: kw >= 1 && kw <= 2 };
        if (cc <= 150) return { rule: '> 110 – 150 cc → Daya motor paling tinggi 3 kW', pass: kw > 0 && kw <= 3 };
        if (cc <= 200) return { rule: '> 150 – 200 cc → Daya motor paling tinggi 4 kW', pass: kw > 0 && kw <= 4 };
        return { rule: '> 200 cc → Daya motor paling rendah 4 kW', pass: kw >= 4 };
    };

    const powerRuleResult = checkPowerCompliance(engineCc, selectedMotorKw);
    const weightDiffPercent = origWeightKg > 0 ? +(((convWeightKg - origWeightKg) / origWeightKg) * 100).toFixed(2) : 0;
    const isWeightPass = Math.abs(weightDiffPercent) <= 5;
    const isHeadlightPass = headlightCd >= 12000;
    const allChecklistPass = Object.values(checklist).every(Boolean);
    const isOverallReady = powerRuleResult.pass && isWeightPass && isHeadlightPass && allChecklistPass;

    // ==========================================
    // FORM SIMPAN LAPORAN + KUIS PEMAHAMAN SISWA
    // ==========================================
    const { data, setData, processing, reset } = useForm({
        student_or_workshop_name: '',
        motorcycle_model: '',
        simulation_data: {},
        is_regulation_compliant: false,
    });

    const handleSaveReport = async (e) => {
        e.preventDefault();

        if (!data.student_or_workshop_name.trim() || !data.motorcycle_model.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Harap isi Nama Siswa / Bengkel dan Model Motor Konversi sebelum menyimpan laporan.',
                confirmButtonColor: '#2563eb',
            });
            return;
        }

        // Jalankan Kuis Pemahaman Dinamis 3 Soal sebelum menyimpan
        const quizScore = await runDynamicComprehensionQuiz({
            fullVoltage,
            minInsulationKOhm,
            mcbMinA,
            mcbMaxA,
        });

        if (quizScore === null) return; // User menekan Batal

        const payload = {
            student_or_workshop_name: `${data.student_or_workshop_name} [Nilai Kuis: ${quizScore}/100]`,
            motorcycle_model: data.motorcycle_model,
            is_regulation_compliant: isOverallReady,
            simulation_data: {
                battery: `${seriesCount}S ${parallelCount}P ${chemistry} (${actualNominalV}V ${actualAh}Ah / ${totalEnergyKwh}kWh | Charger ${fullVoltage}V)`,
                motor: `${motorPowerW}W @ ${motorRpm}rpm | Rasio 1:${gearRatio} | Torsi Roda ${wheelTorqueNm}Nm | Top Speed ${topSpeedKmh}km/j`,
                protection: `MCB DC ${mcbMinA}-${mcbMaxA}A | BMS ${bmsMaxA}A vs Ctrl ${ctrlMaxBatteryA}A (${isBmsSafe ? 'Aman' : 'Overcurrent'})`,
                regulation: `Mesin ${engineCc}cc → ${selectedMotorKw}kW (${powerRuleResult.pass ? 'Lulus' : 'Gagal'}) | Selisih Berat ${weightDiffPercent}%`,
            },
        };

        router.post('/simulator/reports', payload, {
            preserveScroll: true,
            onSuccess: () => {
                reset('student_or_workshop_name', 'motorcycle_model');
                Swal.fire({
                    icon: 'success',
                    title: `Laporan Tersimpan! (Skor Kuis: ${quizScore}/100)`,
                    text: `Hasil rancangan ${payload.motorcycle_model} telah masuk ke arsip penilaian praktikum.`,
                    confirmButtonColor: '#2563eb',
                });
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Menyimpan',
                    text: 'Terjadi kesalahan saat menyimpan data laporan ke server.',
                    confirmButtonColor: '#dc2626',
                });
            },
        });
    };

    const handleDeleteReport = (id, modelName) => {
        Swal.fire({
            title: 'Hapus Laporan Praktikum?',
            text: `Data rancangan "${modelName}" akan dihapus permanen dari database.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/simulator/reports/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Toast.fire({ icon: 'success', title: 'Laporan berhasil dihapus.' });
                    },
                });
            }
        });
    };

    const tabs = [
        { id: 'battery', label: '1. Baterai & Charger (Bab 2)' },
        { id: 'motor', label: '2. Motor & Rasio Gear (Bab 3)' },
        { id: 'controller', label: '3. Controller, MCB & PWM (Bab 4)' },
        { id: 'regulation', label: '4. Uji Regulasi & Pra-Uji (Bab 5)' },
        { id: 'gradeability', label: '5. Uji Tanjakan & Beban' },
        { id: 'troubleshooting', label: '6. Troubleshooting Wiring' },
        { id: 'testride', label: '7. Test Ride Virtual' },
        { id: 'roi', label: '8. Analisis Biaya & ROI' },
    ];

    const GuideHelpButton = () => (
        <button
            type="button"
            onClick={() => setGuideModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs font-semibold cursor-pointer transition shrink-0"
        >
            <span>?</span> Panduan Materi
        </button>
    );

    return (
        <AppLayout>
            <Head title="Simulasi Teknis Sepeda Motor Listrik" />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: #ffffff !important; }
                }
            `}</style>

            {/* ========================================================= */}
            {/* LEMBAR CETAK PRAKTIKUM (HANYA MUNCUL SAAT PRINT / PDF)    */}
            {/* ========================================================= */}
            <div className="hidden print-only border-2 border-gray-800 p-6 mb-6 text-black">
                <div className="border-b-2 border-gray-800 pb-3 mb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold uppercase">Lembar Kerja Praktikum Konversi Motor Listrik</h1>
                        <p className="text-xs">Berdasarkan Kurikulum PPSDM KEBTKE – PT Braja Elektrik Motor & Permenhub PM 39/2023</p>
                    </div>
                    <div className="text-right text-xs">
                        <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
                        <p className="font-bold">Status Uji: {isOverallReady ? 'LULUS / SIAP UJI TIPE' : 'BELUM MEMENUHI SYARAT'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                    <p><strong>Nama Peserta / Bengkel:</strong> {data.student_or_workshop_name || '........................................'}</p>
                    <p><strong>Unit Motor Konversi:</strong> {data.motorcycle_model || '........................................'}</p>
                </div>

                <table className="w-full border-collapse border border-gray-800 text-xs mb-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-800 p-2 text-left">Modul Teknis</th>
                            <th className="border border-gray-800 p-2 text-left">Spesifikasi & Hasil Perhitungan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-gray-800 p-2 font-bold">1. Battery Pack & Charger</td>
                            <td className="border border-gray-800 p-2">
                                Kimia {chemistry} | Konfigurasi {seriesCount}S {parallelCount}P ({totalCells} sel) | {actualNominalV} V {actualAh} Ah ({totalEnergyKwh} kWh) |
                                Tegangan Charger Wajib: <strong>{fullVoltage} V</strong> | Isolasi Min: ≥ {minInsulationKOhm} kΩ | Estimasi Berat: ±{estWeightKg} kg
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-800 p-2 font-bold">2. Motor Listrik & Transmisi</td>
                            <td className="border border-gray-800 p-2">
                                Daya {motorPowerW} W @ {motorVoltageV} V ({motorRpm} rpm) | Rasio 1:{gearRatio} | Torsi Motor: {motorTorqueNm} Nm |
                                Torsi Roda: {wheelTorqueNm} Nm | Kecepatan Puncak Teoritis: {topSpeedKmh} km/jam | Magnet: {magnetRec.grade}
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-800 p-2 font-bold">3. Controller & Proteksi DC</td>
                            <td className="border border-gray-800 p-2">
                                MCB / Sekring DC: <strong>{mcbMinA}–{mcbMaxA} A</strong> | Arus BMS: {bmsMaxA} A vs Controller: {ctrlMaxBatteryA} A ({isBmsSafe ? 'Aman' : 'Tidak Cocok'}) |
                                Toleransi Tegangan Controller: {ctrlMaxToleranceV} V vs Puncak Baterai {sysPeakV} V ({isVoltageSafe ? 'Aman' : 'Risiko Overvoltage'})
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-800 p-2 font-bold">4. Validasi PM 39/2023</td>
                            <td className="border border-gray-800 p-2">
                                Mesin Asal: {engineCc} cc → Motor {selectedMotorKw} kW ({powerRuleResult.pass ? 'LULUS' : 'TIDAK LULUS'}) |
                                Berat: {origWeightKg} kg → {convWeightKg} kg ({weightDiffPercent}%, {isWeightPass ? 'LULUS' : 'GAGAL'}) |
                                Lampu Utama: {headlightCd.toLocaleString()} cd ({isHeadlightPass ? 'LULUS' : 'GAGAL'})
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p className="text-xs italic">* Dokumen ini dicetak otomatis dari Aplikasi Simulasi Teknis Sepeda Motor Listrik.</p>
            </div>

            {/* ========================================================= */}
            {/* HEADER HALAMAN & KONTROL UTAMA                            */}
            {/* ========================================================= */}
            <div className="no-print flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-5">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                        Simulasi Teknis Sepeda Motor Listrik
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Perancangan Baterai, Motor, Controller, Uji Lapangan, dan Validasi Regulasi Konversi (PM 39/2023)
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoSync}
                            onChange={(e) => {
                                setAutoSync(e.target.checked);
                                Toast.fire({
                                    icon: e.target.checked ? 'success' : 'info',
                                    title: e.target.checked
                                        ? 'Sinkronisasi otomatis diaktifkan'
                                        : 'Sinkronisasi otomatis dimatikan',
                                });
                            }}
                            className="rounded text-blue-600"
                        />
                        Sinkronisasi Antar-Tab
                    </label>

                    <button
                        type="button"
                        onClick={() => {
                            setProjectorMode(!projectorMode);
                            Toast.fire({
                                icon: 'info',
                                title: !projectorMode
                                    ? 'Mode Presentasi Guru (Fokus Visual) aktif'
                                    : 'Mode Standar Praktikum aktif',
                            });
                        }}
                        className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                            projectorMode
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'
                        }`}
                    >
                        📽️ {projectorMode ? 'Keluar Mode Proyektor' : 'Mode Presentasi Guru'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setGuideModalOpen(true)}
                        style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
                        className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:opacity-90 cursor-pointer"
                    >
                        ? Petunjuk & Materi Bab
                    </button>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        style={{ backgroundColor: '#059669', color: '#ffffff' }}
                        className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 cursor-pointer"
                    >
                        Cetak / Simpan PDF
                    </button>
                </div>
            </div>

            {/* ========================================================= */}
            {/* PANEL MISI STUDI KASUS PRAKTIKUM (PROBLEM-BASED LEARNING) */}
            {/* ========================================================= */}
            {!projectorMode && (
                <MissionChallengePanel
                    simState={{
                        chemistry,
                        actualNominalV,
                        totalEnergyKwh,
                        engineCc,
                        powerRulePass: powerRuleResult.pass,
                        isWeightPass,
                        wheelTorqueNm,
                        topSpeedKmh,
                        peakTempC,
                        isBmsSafe,
                        isVoltageSafe,
                        isOverallReady,
                    }}
                />
            )}

            {/* Navigasi 8 Tab Sejajar */}
            <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-6">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            style={
                                isActive
                                    ? { backgroundColor: '#2563eb', color: '#ffffff' }
                                    : { backgroundColor: '#ffffff', color: '#374151' }
                            }
                            className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer text-left sm:text-center ${
                                isActive ? 'border-blue-600 shadow-xs' : 'border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ========================================================= */}
            {/* TAB 1: BATERAI & CHARGER (BAB 2)                          */}
            {/* ========================================================= */}
            {activeTab === 'battery' && (
                <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {!projectorMode && (
                        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2 gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-gray-800">Parameter Battery Pack</h2>
                                <GuideHelpButton />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-blue-700 mb-1">
                                    Preset Baterai Buku Ajar
                                </label>
                                <select
                                    onChange={(e) => handleBatteryPreset(Number(e.target.value))}
                                    className="w-full border border-blue-200 bg-blue-50 rounded-lg px-3 py-2 text-xs font-medium text-blue-900"
                                >
                                    {batteryPresets.map((p, idx) => (
                                        <option key={idx} value={idx}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kimia Sel Lithium</label>
                                <select
                                    value={chemistry}
                                    onChange={(e) => {
                                        setChemistry(e.target.value);
                                        syncBatteryToOthers(e.target.value, targetVoltage);
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                                >
                                    <option value="NMC">NMC (Nominal 3,6 V | Penuh 4,2 V)</option>
                                    <option value="LFP">LFP / LiFePO4 (Nominal 3,2 V | Penuh 3,65 V)</option>
                                    <option value="LTO">LTO (Nominal 2,4 V | Penuh 2,85 V)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Per Sel (Ah)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.5"
                                    value={cellAh}
                                    onChange={(e) => setCellAh(parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Tegangan (V)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={targetVoltage}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            setTargetVoltage(val);
                                            syncBatteryToOthers(chemistry, val);
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Kapasitas (Ah)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={targetAh}
                                        onChange={(e) => setTargetAh(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Arus Charger (Ampere)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="1"
                                    value={chargerAmpere}
                                    onChange={(e) => setChargerAmpere(parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <div className={`${projectorMode ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 space-y-5`}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-base sm:text-lg font-bold text-gray-800">Hasil Rancangan Susunan Seri – Paralel</h2>
                            {projectorMode && <GuideHelpButton />}
                        </div>

                        <BatteryPackDiagram
                            series={seriesCount}
                            parallel={parallelCount}
                            chemistry={chemistry}
                            fullVoltage={fullVoltage}
                            nominalVoltage={actualNominalV}
                            isHighVoltage={actualNominalV > 60}
                        />

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-blue-50 p-3.5 sm:p-4 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-700 font-medium">Konfigurasi Pak</p>
                                <p className="text-xl sm:text-2xl font-bold text-blue-900">
                                    {seriesCount}S {parallelCount}P
                                </p>
                                <p className="text-xs text-blue-600 mt-1">Total: {totalCells} sel</p>
                            </div>

                            <div className="bg-emerald-50 p-3.5 sm:p-4 rounded-xl border border-emerald-100">
                                <p className="text-xs text-emerald-700 font-medium">Energi Total</p>
                                <p className="text-xl sm:text-2xl font-bold text-emerald-900">{totalEnergyKwh} kWh</p>
                                <p className="text-xs text-emerald-600 mt-1">
                                    {actualNominalV} V × {actualAh} Ah
                                </p>
                            </div>

                            <div className="bg-amber-50 p-3.5 sm:p-4 rounded-xl border border-amber-100">
                                <p className="text-xs text-amber-700 font-medium">Tegangan Charger</p>
                                <p className="text-xl sm:text-2xl font-bold text-amber-900">{fullVoltage} V</p>
                                <p className="text-xs text-amber-600 mt-1">Cut-off habis: {emptyVoltage} V</p>
                            </div>

                            <div className="bg-purple-50 p-3.5 sm:p-4 rounded-xl border border-purple-100">
                                <p className="text-xs text-purple-700 font-medium">Estimasi Berat & Ruang</p>
                                <p className="text-xl sm:text-2xl font-bold text-purple-900">±{estWeightKg} kg</p>
                                <p className="text-xs text-purple-600 mt-1">Volume: ±{estVolumeL} liter</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                <p className="font-semibold text-gray-800 text-sm mb-1">Analisis Pengisian (CC-CV)</p>
                                <ul className="space-y-1 text-gray-600 text-xs">
                                    <li>
                                        • C-rate pengisian: <strong>{cRateCharge}C</strong>{' '}
                                        {cRateCharge > 0.5 ? '(Terlalu cepat, idealnya 0,2–0,5C)' : '(Aman sesuai standar 0,2–0,5C)'}
                                    </li>
                                    <li>• Estimasi lama pengisian (0–100%): <strong>±{estChargeHours} jam</strong></li>
                                    <li>
                                        • Wajib label kuning 50×60 mm: <strong>{fullVoltage} Volt / {actualAh} Ah</strong>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                <p className="font-semibold text-red-800 text-sm mb-1">Standar Keselamatan UN R136 / ISO 6469-3</p>
                                <ul className="space-y-1 text-red-700 text-xs">
                                    <li>• Tahanan isolasi minimal (100 Ω/V): <strong>≥ {minInsulationKOhm} kΩ</strong></li>
                                    <li>• Pak {chemistry} {seriesCount}S wajib memakai charger <strong>{fullVoltage} V</strong>.</li>
                                    <li>
                                        • {actualNominalV > 60 ? 'Tegangan > 60 V DC: Wajib kabel & saluran warna ORANYE.' : 'Sistem tegangan ≤ 60 V DC.'}
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bedah Rumus Real-Time Bab 2 */}
                        <FormulaBreakdownPanel
                            title="Langkah Perhitungan Baterai & Charger (Bab 2)"
                            formulas={[
                                {
                                    name: 'Jumlah Sel Seri (S)',
                                    formula: 'Target Tegangan ÷ Tegangan Nominal Sel',
                                    substitution: `${targetVoltage} V ÷ ${currentChem.nominal} V = ${seriesCount} sel seri`,
                                },
                                {
                                    name: 'Tegangan Charger Wajib (V_full)',
                                    formula: 'Jumlah Sel Seri × Tegangan Penuh Sel',
                                    substitution: `${seriesCount} × ${currentChem.full} V = ${fullVoltage} V`,
                                },
                                {
                                    name: 'Kapasitas Energi (kWh)',
                                    formula: '(Tegangan Nominal × Kapasitas Ah) ÷ 1.000',
                                    substitution: `(${actualNominalV} V × ${actualAh} Ah) ÷ 1.000 = ${totalEnergyKwh} kWh`,
                                },
                                {
                                    name: 'Tahanan Isolasi Minimal (UN R136)',
                                    formula: '(Tegangan Nominal × 100 Ω/V) ÷ 1.000',
                                    substitution: `(${actualNominalV} × 100) ÷ 1.000 = ${minInsulationKOhm} kΩ`,
                                },
                            ]}
                        />
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: MOTOR & TRANSMISI (BAB 3)                          */}
            {/* ========================================================= */}
            {activeTab === 'motor' && (
                <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {!projectorMode && (
                        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2 gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-gray-800">Spesifikasi Motor & Roda</h2>
                                <GuideHelpButton />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-blue-700 mb-1">
                                    Preset Motor Buku Ajar
                                </label>
                                <select
                                    onChange={(e) => handleMotorPreset(Number(e.target.value))}
                                    className="w-full border border-blue-200 bg-blue-50 rounded-lg px-3 py-2 text-xs font-medium text-blue-900"
                                >
                                    {motorPresets.map((p, idx) => (
                                        <option key={idx} value={idx}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Daya Motor (W)</label>
                                    <input
                                        type="number"
                                        step="100"
                                        value={motorPowerW}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            setMotorPowerW(val);
                                            syncMotorPowerToOthers(val);
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tegangan (V)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={motorVoltageV}
                                        onChange={(e) => setMotorVoltageV(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Putaran Motor Nominal (RPM)</label>
                                <input
                                    type="number"
                                    step="100"
                                    value={motorRpm}
                                    onChange={(e) => setMotorRpm(parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rasio Reduksi (1 : X)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        value={gearRatio}
                                        onChange={(e) => setGearRatio(parseFloat(e.target.value) || 1)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">Isi 1 jika Hub Motor</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Diameter Ban (m)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={wheelDiameterM}
                                        onChange={(e) => setWheelDiameterM(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Suhu Beban Puncak (°C)</label>
                                <input
                                    type="number"
                                    value={peakTempC}
                                    onChange={(e) => setPeakTempC(parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <div className={`${projectorMode ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 space-y-5`}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-base sm:text-lg font-bold text-gray-800">Hasil Simulasi Mekanik & Termal Motor</h2>
                            {projectorMode && <GuideHelpButton />}
                        </div>

                        <MotorDrivetrainDiagram
                            powerW={motorPowerW}
                            motorRpm={motorRpm}
                            gearRatio={gearRatio}
                            wheelRpm={wheelRpm}
                            topSpeedKmh={topSpeedKmh}
                            wheelTorqueNm={wheelTorqueNm}
                        />

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-blue-50 p-3.5 sm:p-4 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-700 font-medium">Torsi Poros Motor</p>
                                <p className="text-xl sm:text-2xl font-bold text-blue-900">{motorTorqueNm} Nm</p>
                                <p className="text-xs text-blue-600 mt-1">Arus: ±{nominalCurrentA} A</p>
                            </div>

                            <div className="bg-emerald-50 p-3.5 sm:p-4 rounded-xl border border-emerald-100">
                                <p className="text-xs text-emerald-700 font-medium">Torsi di Roda</p>
                                <p className="text-xl sm:text-2xl font-bold text-emerald-900">{wheelTorqueNm} Nm</p>
                                <p className="text-xs text-emerald-600 mt-1">Rasio 1 : {gearRatio}</p>
                            </div>

                            <div className="bg-amber-50 p-3.5 sm:p-4 rounded-xl border border-amber-100">
                                <p className="text-xs text-amber-700 font-medium">Kecepatan Teoritis</p>
                                <p className="text-xl sm:text-2xl font-bold text-amber-900">{topSpeedKmh} km/j</p>
                                <p className="text-xs text-amber-600 mt-1">Putaran roda: {wheelRpm} rpm</p>
                            </div>

                            <div className="bg-gray-100 p-3.5 sm:p-4 rounded-xl border border-gray-200">
                                <p className="text-xs text-gray-600 font-medium">Keliling Ban</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-800">{wheelCircumferenceM} m</p>
                                <p className="text-xs text-gray-500 mt-1">π × {wheelDiameterM} m</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                            <p className="text-sm font-bold text-orange-900 mb-1">
                                Rekomendasi Grade Magnet NdFeB (Suhu Puncak {peakTempC}°C):
                            </p>
                            <p className="text-base font-semibold text-orange-700">{magnetRec.grade}</p>
                            <p className="text-xs text-orange-800 mt-1">
                                {magnetRec.status}. Jika suhu magnet melampaui batas grade-nya, kekuatan magnet akan turun permanen (demagnetisasi).
                            </p>
                        </div>

                        {/* Bedah Rumus Real-Time Bab 3 */}
                        <FormulaBreakdownPanel
                            title="Langkah Perhitungan Torsi & Kecepatan Motor (Bab 3)"
                            formulas={[
                                {
                                    name: 'Torsi Poros Motor (τ_motor)',
                                    formula: '(9,55 × Daya Watt) ÷ Putaran RPM',
                                    substitution: `(9,55 × ${motorPowerW} W) ÷ ${motorRpm} RPM = ${motorTorqueNm} Nm`,
                                },
                                {
                                    name: 'Torsi Akhir di Roda (τ_roda)',
                                    formula: 'Torsi Motor × Rasio Reduksi Gear',
                                    substitution: `${motorTorqueNm} Nm × ${gearRatio} = ${wheelTorqueNm} Nm`,
                                },
                                {
                                    name: 'Putaran Roda (RPM_roda)',
                                    formula: 'Putaran Motor ÷ Rasio Reduksi',
                                    substitution: `${motorRpm} RPM ÷ ${gearRatio} = ${wheelRpm} RPM`,
                                },
                                {
                                    name: 'Kecepatan Maksimum Teoritis (v)',
                                    formula: 'RPM_roda × (π × Diameter Ban) × 0,06',
                                    substitution: `${wheelRpm} × ${wheelCircumferenceM} m × 0,06 = ${topSpeedKmh} km/jam`,
                                },
                            ]}
                        />
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: CONTROLLER, MCB & PWM (BAB 2 & 4)                  */}
            {/* ========================================================= */}
            {activeTab === 'controller' && (
                <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {!projectorMode && (
                        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2 gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-gray-800">Parameter Sistem & Proteksi</h2>
                                <GuideHelpButton />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Daya Motor (W)</label>
                                    <input
                                        type="number"
                                        value={sysPowerW}
                                        onChange={(e) => setSysPowerW(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tegangan Nominal (V)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={sysNominalV}
                                        onChange={(e) => setSysNominalV(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tegangan Penuh Pak (V)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={sysPeakV}
                                        onChange={(e) => setSysPeakV(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Batas Maks. Controller (V)</label>
                                    <input
                                        type="number"
                                        value={ctrlMaxToleranceV}
                                        onChange={(e) => setCtrlMaxToleranceV(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Arus Kontinu BMS (A)</label>
                                    <input
                                        type="number"
                                        value={bmsMaxA}
                                        onChange={(e) => setBmsMaxA(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Setting Arus Controller (A)</label>
                                    <input
                                        type="number"
                                        value={ctrlMaxBatteryA}
                                        onChange={(e) => setCtrlMaxBatteryA(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Simulasi Bukaan Gas / Duty Cycle PWM: <strong>{pwmDuty}%</strong>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={pwmDuty}
                                    onChange={(e) => setPwmDuty(Number(e.target.value))}
                                    className="w-full cursor-pointer"
                                />
                            </div>
                        </div>
                    )}

                    <div className={`${projectorMode ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 space-y-5`}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-base sm:text-lg font-bold text-gray-800">Hasil Pencocokan Controller & Proteksi</h2>
                            {projectorMode && <GuideHelpButton />}
                        </div>

                        <PwmCircuitDiagram
                            pwmDuty={pwmDuty}
                            nominalV={sysNominalV}
                            avgV={pwmAvgVoltage}
                            mcbMinA={mcbMinA}
                            mcbMaxA={mcbMaxA}
                            isBmsSafe={isBmsSafe}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-700 font-medium">Rekomendasi MCB / Sekring DC</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {mcbMinA} – {mcbMaxA} A
                                </p>
                                <p className="text-xs text-blue-600 mt-1">20–40% di atas batas arus ({ctrlMaxBatteryA} A)</p>
                            </div>

                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <p className="text-xs text-emerald-700 font-medium">Tegangan Rata-rata PWM</p>
                                <p className="text-2xl font-bold text-emerald-900">{pwmAvgVoltage} V</p>
                                <p className="text-xs text-emerald-600 mt-1">
                                    {sysNominalV} V × {pwmDuty}% duty cycle
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <p className="text-xs text-gray-600 font-medium">Arus Pengenal (+15% Rugi)</p>
                                <p className="text-2xl font-bold text-gray-800">±{currentWithLossA} A</p>
                                <p className="text-xs text-gray-500 mt-1">Arus murni: {baseCurrentA.toFixed(1)} A</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div
                                className={`p-4 rounded-lg border text-sm ${
                                    isBmsSafe
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                        : 'bg-red-50 border-red-200 text-red-900'
                                }`}
                            >
                                <strong>Status Kecocokan Arus BMS vs Controller: </strong>
                                {isBmsSafe
                                    ? `AMAN. Setting arus controller (${ctrlMaxBatteryA} A) tidak melebihi arus kontinu BMS (${bmsMaxA} A).`
                                    : `BAHAYA / CUT-OFF! Setting arus controller (${ctrlMaxBatteryA} A) melebihi kemampuan BMS (${bmsMaxA} A). BMS akan memutus arus saat beban puncak.`}
                            </div>

                            <div
                                className={`p-4 rounded-lg border text-sm ${
                                    isVoltageSafe
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                        : 'bg-red-50 border-red-200 text-red-900'
                                }`}
                            >
                                <strong>Status Toleransi Tegangan Penuh: </strong>
                                {isVoltageSafe
                                    ? `AMAN. Controller (maks. ${ctrlMaxToleranceV} V) sanggup menahan tegangan penuh baterai (${sysPeakV} V).`
                                    : `RISIKO OVERVOLTAGE! Tegangan penuh baterai (${sysPeakV} V) melampaui batas maksimal controller (${ctrlMaxToleranceV} V).`}
                            </div>
                        </div>

                        {/* Bedah Rumus Real-Time Bab 4 */}
                        <FormulaBreakdownPanel
                            title="Langkah Perhitungan Proteksi MCB & PWM (Bab 4)"
                            formulas={[
                                {
                                    name: 'Rating MCB / Sekring DC (120%–140%)',
                                    formula: 'Arus Maks. Controller × (1,2 s/d 1,4)',
                                    substitution: `${ctrlMaxBatteryA} A × 1,2..1,4 = ${mcbMinA} – ${mcbMaxA} A`,
                                },
                                {
                                    name: 'Tegangan Rata-rata PWM ke Motor',
                                    formula: 'Tegangan Nominal × Duty Cycle (%)',
                                    substitution: `${sysNominalV} V × ${pwmDuty}% = ${pwmAvgVoltage} V`,
                                },
                            ]}
                        />
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: REGULASI PM 39/2023 & CEKLIS PRA-UJI (BAB 5)       */}
            {/* ========================================================= */}
            {activeTab === 'regulation' && (
                <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {!projectorMode && (
                        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2 gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-gray-800">Data Kendaraan Konversi</h2>
                                <GuideHelpButton />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Isi Silinder Mesin Asal (cc)</label>
                                <input
                                    type="number"
                                    value={engineCc}
                                    onChange={(e) => setEngineCc(parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Daya Motor Listrik Dipilih (kW)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={selectedMotorKw}
                                    onChange={(e) => setSelectedMotorKw(parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Berat Awal (kg)</label>
                                    <input
                                        type="number"
                                        value={origWeightKg}
                                        onChange={(e) => setOrigWeightKg(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Berat Konversi (kg)</label>
                                    <input
                                        type="number"
                                        value={convWeightKg}
                                        onChange={(e) => setConvWeightKg(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Daya Pancar Lampu Utama (Candela)</label>
                                <input
                                    type="number"
                                    step="500"
                                    value={headlightCd}
                                    onChange={(e) => setHeadlightCd(parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <div className={`${projectorMode ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 space-y-5`}>
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-gray-800">Evaluasi Kelaikan PM 39/2023 & PM 87/2020</h2>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    isOverallReady ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {isOverallReady ? 'SIAP DIAJUKAN UJI TIPE' : 'BELUM MEMENUHI SYARAT UJI'}
                            </span>
                        </div>

                        <InspectionBlueprintDiagram
                            powerPass={powerRuleResult.pass}
                            weightPass={isWeightPass}
                            headlightPass={isHeadlightPass}
                            checklist={checklist}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-xl border ${powerRuleResult.pass ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                <p className="text-xs font-semibold text-gray-600">1. Batas Daya Motor</p>
                                <p className="text-base font-bold mt-1">
                                    {powerRuleResult.pass ? 'LULUS' : 'TIDAK LULUS'} ({selectedMotorKw} kW)
                                </p>
                                <p className="text-xs mt-1 text-gray-700">{powerRuleResult.rule}</p>
                            </div>

                            <div className={`p-4 rounded-xl border ${isWeightPass ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                <p className="text-xs font-semibold text-gray-600">2. Toleransi Berat (±5%)</p>
                                <p className="text-base font-bold mt-1">
                                    {isWeightPass ? 'LULUS' : 'GAGAL'} ({weightDiffPercent > 0 ? `+${weightDiffPercent}` : weightDiffPercent}%)
                                </p>
                                <p className="text-xs mt-1 text-gray-700">
                                    {origWeightKg} kg → {convWeightKg} kg
                                </p>
                            </div>

                            <div className={`p-4 rounded-xl border ${isHeadlightPass ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                <p className="text-xs font-semibold text-gray-600">3. Lampu Utama (≥12.000 cd)</p>
                                <p className="text-base font-bold mt-1">
                                    {isHeadlightPass ? 'LULUS' : 'GAGAL'} ({headlightCd.toLocaleString()} cd)
                                </p>
                                <p className="text-xs mt-1 text-gray-700">
                                    {isHeadlightPass ? 'Sesuai standar uji fisik' : 'Periksa jalur 12 V / ganti bohlam'}
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">
                                Ceklis Keselamatan Fungsional & Konstruksi (Wajib Centang Semua)
                            </h3>
                            <div className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                                <label className="flex items-start sm:items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={checklist.twoStepReady}
                                        onChange={(e) => setChecklist({ ...checklist, twoStepReady: e.target.checked })}
                                        className="rounded text-blue-600 mt-0.5 sm:mt-0"
                                    />
                                    <span>Aktivasi 2 langkah (Kunci Kontak ON + Tombol Starter) & Indikator READY menyala</span>
                                </label>
                                <label className="flex items-start sm:items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={checklist.chargerInterlock}
                                        onChange={(e) => setChecklist({ ...checklist, chargerInterlock: e.target.checked })}
                                        className="rounded text-blue-600 mt-0.5 sm:mt-0"
                                    />
                                    <span>Port charger dilengkapi interlock (motor lumpuh saat kabel charger terpasang)</span>
                                </label>
                                <label className="flex items-start sm:items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={checklist.reverseDisabledForward}
                                        onChange={(e) => setChecklist({ ...checklist, reverseDisabledForward: e.target.checked })}
                                        className="rounded text-blue-600 mt-0.5 sm:mt-0"
                                    />
                                    <span>Fungsi mundur (reverse) otomatis nonaktif saat kendaraan bergerak maju</span>
                                </label>
                                <label className="flex items-start sm:items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={checklist.orangeHvCable}
                                        onChange={(e) => setChecklist({ ...checklist, orangeHvCable: e.target.checked })}
                                        className="rounded text-blue-600 mt-0.5 sm:mt-0"
                                    />
                                    <span>Kabel & saluran tegangan tinggi (&gt; 60 V DC) berwarna oranye & bertanda bahaya listrik</span>
                                </label>
                                <label className="flex items-start sm:items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={checklist.controllerHeatsinkCover}
                                        onChange={(e) => setChecklist({ ...checklist, controllerHeatsinkCover: e.target.checked })}
                                        className="rounded text-blue-600 mt-0.5 sm:mt-0"
                                    />
                                    <span>Controller terpasang dengan heatsink, dibaut kuat, dan terminal tertutup rapat</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* TAB 5 - 8 (MODUL LANJUTAN)                                */}
            {/* ========================================================= */}
            {activeTab === 'gradeability' && (
                <div className="no-print space-y-3 mb-8">
                    <div className="flex justify-between items-center bg-white px-4 sm:px-5 py-3 rounded-xl border border-gray-200 gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-800">Modul 5: Simulasi Uji Tanjakan & Beban</span>
                        <GuideHelpButton />
                    </div>
                    <GradeabilityTab
                        wheelTorqueNm={wheelTorqueNm}
                        wheelDiameterM={wheelDiameterM}
                        convWeightKg={convWeightKg}
                        topSpeedKmh={topSpeedKmh}
                    />
                </div>
            )}

            {activeTab === 'troubleshooting' && (
                <div className="no-print space-y-3 mb-8">
                    <div className="flex justify-between items-center bg-white px-4 sm:px-5 py-3 rounded-xl border border-gray-200 gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-800">Modul 6: Simulator Wiring & Troubleshooting Kelistrikan</span>
                        <GuideHelpButton />
                    </div>
                    <TroubleshootingTab nominalV={actualNominalV} />
                </div>
            )}

            {activeTab === 'testride' && (
                <div className="no-print space-y-3 mb-8">
                    <div className="flex justify-between items-center bg-white px-4 sm:px-5 py-3 rounded-xl border border-gray-200 gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-800">Modul 7: Test Ride Virtual & Live Dashboard</span>
                        <GuideHelpButton />
                    </div>
                    <TestRideTab
                        totalEnergyKwh={totalEnergyKwh}
                        topSpeedKmh={topSpeedKmh}
                        motorPowerW={motorPowerW}
                        nominalV={actualNominalV}
                    />
                </div>
            )}

            {activeTab === 'roi' && (
                <div className="no-print space-y-3 mb-8">
                    <div className="flex justify-between items-center bg-white px-4 sm:px-5 py-3 rounded-xl border border-gray-200 gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-800">Modul 8: Analisis Ekonomi, ROI & Penghematan</span>
                        <GuideHelpButton />
                    </div>
                    <RoiAnalysisTab totalEnergyKwh={totalEnergyKwh} />
                </div>
            )}

            {/* ========================================================= */}
            {/* LABORATORIUM KESALAHAN & KOMPARASI BEFORE-AFTER           */}
            {/* ========================================================= */}
            <div className="no-print space-y-6 mb-8">
                <WhatIfErrorSimulator onTriggerScenario={handleTriggerErrorScenario} />

                <BeforeAfterComparisonCard
                    engineCc={engineCc}
                    origWeightKg={origWeightKg}
                    convWeightKg={convWeightKg}
                    totalEnergyKwh={totalEnergyKwh}
                    wheelTorqueNm={wheelTorqueNm}
                />
            </div>

            {/* ========================================================= */}
            {/* PANEL SIMPAN LAPORAN KE DATABASE & RIWAYAT                */}
            {/* ========================================================= */}
            <div className="no-print bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200 mb-6">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                    <h2 className="text-base font-bold text-gray-800">
                        Simpan Hasil Rancangan ke Database Praktikum
                    </h2>
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                        Dilengkapi Kuis Refleksi 3 Soal Otomatis
                    </span>
                </div>
                <form onSubmit={handleSaveReport} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                    <div className="lg:col-span-5">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nama Siswa / Bengkel</label>
                        <input
                            type="text"
                            value={data.student_or_workshop_name}
                            onChange={(e) => setData('student_or_workshop_name', e.target.value)}
                            placeholder="Contoh: Budi Santoso / Bengkel SMK 1"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="lg:col-span-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Motor Asal / Proyek Konversi</label>
                        <input
                            type="text"
                            value={data.motorcycle_model}
                            onChange={(e) => setData('motorcycle_model', e.target.value)}
                            placeholder="Contoh: Honda Vario 125 Konversi"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                        <button
                            type="submit"
                            disabled={processing}
                            style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold hover:opacity-90 transition cursor-pointer"
                        >
                            Kuis & Simpan Laporan
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabel Riwayat Laporan Praktikum */}
            {reports.length > 0 && (
                <div className="no-print bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
                    <div className="px-5 sm:px-6 py-4 border-b border-gray-200">
                        <h2 className="text-base font-bold text-gray-800">Arsip Laporan Simulasi Tersimpan</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm min-w-[640px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600">
                                    <th className="py-3 px-4 text-left">Siswa / Bengkel & Nilai</th>
                                    <th className="py-3 px-4 text-left">Unit Proyek</th>
                                    <th className="py-3 px-4 text-left">Ringkasan Baterai & Motor</th>
                                    <th className="py-3 px-4 text-left">Status PM 39/2023</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reports.map((rep) => (
                                    <tr key={rep.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-semibold text-gray-800">{rep.student_or_workshop_name}</td>
                                        <td className="py-3 px-4 text-gray-700">{rep.motorcycle_model}</td>
                                        <td className="py-3 px-4 text-xs text-gray-600">
                                            <div>{rep.simulation_data?.battery}</div>
                                            <div className="text-gray-500 mt-0.5">{rep.simulation_data?.motor}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    rep.is_regulation_compliant
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {rep.is_regulation_compliant ? 'LULUS' : 'BELUM LULUS'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteReport(rep.id, rep.motorcycle_model)}
                                                className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Petunjuk Materi Per Bagian */}
            <SimulationGuideModal
                isOpen={guideModalOpen}
                onClose={() => setGuideModalOpen(false)}
                guideKey={activeTab}
            />
        </AppLayout>
    );
}