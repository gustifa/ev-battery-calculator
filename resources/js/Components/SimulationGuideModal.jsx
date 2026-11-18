import React from 'react';

export const SIMULATION_GUIDES = {
    battery: {
        badge: 'Bab 2 – Modul Battery Pack & Charger',
        title: 'Panduan Perancangan Battery Pack & Pengisian',
        objective: 'Menentukan konfigurasi susunan seri–paralel sel baterai lithium, tegangan charger yang sesuai, serta memenuhi standar keselamatan isolasi listrik.',
        formulas: [
            'Jumlah Seri (S) = Target Tegangan Sistem ÷ Tegangan Nominal per Sel (NMC = 3,6 V | LFP = 3,2 V | LTO = 2,4 V)',
            'Jumlah Paralel (P) = Target Kapasitas (Ah) ÷ Kapasitas per Sel (Ah)',
            'Tegangan Charger (Cut-Off Penuh) = Jumlah Seri (S) × Tegangan Penuh per Sel (NMC = 4,2 V | LFP = 3,65 V | LTO = 2,85 V)',
            'Tahanan Isolasi Minimal (UN R136 / ISO 6469-3) = Tegangan Nominal × 100 Ω/V',
        ],
        standards: [
            'Arus pengisian ideal berada pada rentang 0,2C – 0,5C dengan metode CC-CV (Constant Current – Constant Voltage) agar sel tidak cepat panas.',
            'Tegangan charger wajib cocok dengan tegangan penuh baterai (contoh: 20S NMC = 84 V). Menggunakan charger bertegangan lebih tinggi berisiko memicu thermal runaway.',
            'Sistem bertegangan > 60 V DC wajib menggunakan kabel dan pelindung berwarna ORANYE serta stiker peringatan bahaya listrik.',
            'Wajib memasang label spesifikasi kuning berukuran 50 × 60 mm pada kompartemen baterai.',
        ],
        steps: [
            'Pilih Preset Baterai Buku Ajar atau tentukan kimia sel (NMC/LFP/LTO) secara manual.',
            'Masukkan kapasitas per sel (Ah), target tegangan (V), dan target kapasitas (Ah).',
            'Sesuaikan arus charger (Ampere) hingga indikator C-rate berada di rentang aman (≤ 0,5C).',
        ],
    },
    motor: {
        badge: 'Bab 3 – Modul Motor Listrik & Sistem Transmisi',
        title: 'Panduan Perhitungan Torsi, Rasio Gear & Termal Magnet',
        objective: 'Menghitung torsi poros motor, torsi akhir di roda setelah reduksi gir/CVT, kecepatan puncak teoritis, serta memilih ketahanan suhu magnet permanen.',
        formulas: [
            'Torsi Poros Motor (Nm) = (9,55 × Daya Motor [Watt]) ÷ Putaran Motor [RPM]',
            'Torsi Roda (Nm) = Torsi Poros Motor × Rasio Reduksi (1 : X)',
            'Kecepatan Teoritis (km/jam) = (RPM Motor ÷ Rasio Reduksi) × (π × Diameter Ban [m]) × 0,06',
        ],
        standards: [
            'Motor In-Wheel Hub memiliki rasio reduksi 1 : 1 (langsung terpasang pada pelek roda belakang).',
            'Motor Mid-Drive menggunakan reduksi rantai/sabuk/girboks (umumnya rasio 1 : 3,5 hingga 1 : 4,5) untuk melipatgandakan torsi tanjakan.',
            'Magnet Neodymium (NdFeB) memiliki batas suhu kerja: Grade N (≤80°C), Grade H (≤120°C), Grade SH (≤150°C), dan Grade UH (≤180°C). Melebihi batas suhu menyebabkan demagnetisasi permanen.',
        ],
        steps: [
            'Pilih Preset Motor (misal Braja BR-N.2000 atau Honda EM1 e:) atau isi daya dan RPM motor.',
            'Atur rasio reduksi (isi 1 untuk Hub Motor) dan diameter luar ban dalam meter.',
            'Masukkan estimasi suhu kerja puncak motor untuk melihat rekomendasi Grade Magnet NdFeB.',
        ],
    },
    controller: {
        badge: 'Bab 2 & 4 – Modul Controller, MCB & Modulasi PWM',
        title: 'Panduan Proteksi Arus DC & Pencocokan BMS–Controller',
        objective: 'Menentukan kapasitas pengaman hubung singkat (MCB/Sekring DC), mencegah cut-off mendadak akibat ketidakcocokan BMS, dan memahami prinsip PWM.',
        formulas: [
            'Arus Pengenal + Rugi Daya = (Daya Motor [W] ÷ Tegangan Nominal [V]) × 1,15',
            'Rating MCB / Sekring DC = 120% s/d 140% dari Setting Arus Maksimal Controller',
            'Tegangan Rata-rata PWM (V) = Tegangan Baterai × Duty Cycle (%)',
        ],
        standards: [
            'Setting arus maksimal controller tidak boleh melebihi arus kontinu (Continuous Discharge Current) BMS agar BMS tidak memutus daya saat akselerasi.',
            'Batas toleransi tegangan maksimal controller (misal 90 V atau 100 V) harus lebih tinggi dari tegangan penuh baterai (contoh: 84 V pada 20S NMC).',
            'Controller mengatur kecepatan motor BLDC menggunakan sinyal Pulse Width Modulation (PWM) sesuai bukaan tuas gas (Hall Sensor 0,8 V – 4,2 V).',
        ],
        steps: [
            'Pastikan status BMS vs Controller berwarna hijau (AMAN).',
            'Catat rentang Ampere MCB DC yang direkomendasikan untuk dipasang pada jalur positif utama baterai.',
            'Geser slider Duty Cycle PWM (0–100%) untuk mengamati perubahan lebar pulsa pada osiloskop virtual.',
        ],
    },
    regulation: {
        badge: 'Bab 5 – Permenhub PM 39/2023 & PM 87/2020',
        title: 'Panduan Regulasi Konversi & Ceklis Pra-Uji Tipe (SUT/SRUT)',
        objective: 'Memastikan spesifikasi sepeda motor hasil konversi mematuhi batas daya motor, toleransi berat, intensitas lampu, dan fitur keselamatan wajib.',
        formulas: [
            'Selisih Berat (%) = ((Berat Konversi − Berat Awal) ÷ Berat Awal) × 100%',
            'Batas Toleransi Perubahan Berat Kosong: Maksimal ±5% dari berat kendaraan asal.',
            'Intensitas Daya Pancar Lampu Utama: Minimal ≥ 12.000 Candela (cd).',
        ],
        standards: [
            'Mesin ≤ 110 cc → Daya motor listrik wajib 1 kW – 2 kW.',
            'Mesin > 110 – 150 cc → Daya motor listrik paling tinggi 3 kW.',
            'Mesin > 150 – 200 cc → Daya motor listrik paling tinggi 4 kW.',
            'Mesin > 200 cc → Daya motor listrik paling rendah 4 kW.',
            'Wajib dilengkapi aktivasi 2 langkah (indikator READY), interlock saat pengisian daya (charger terpasang = motor lumpuh), serta proteksi gigi mundur.',
        ],
        steps: [
            'Masukkan kapasitas silinder (cc) mesin asal sesuai STNK/BPKB dan daya motor listrik (kW).',
            'Isi berat kendaraan sebelum dan sesudah konversi serta hasil ukur lampu utama (Candela).',
            'Periksa dan centang kelima syarat keselamatan fungsional untuk mendapatkan status SIAP DIAJUKAN UJI TIPE.',
        ],
    },
    gradeability: {
        badge: 'Simulasi Lapangan – Kemampuan Menanjak (Gradeability)',
        title: 'Panduan Uji Beban & Sudut Tanjakan',
        objective: 'Menguji apakah torsi roda dari rancangan Tab 2 sanggup menaklukkan kemiringan jalan tertentu dengan beban pengendara dan penumpang.',
        formulas: [
            'Torsi Tanjakan Dibutuhkan (Nm) = [m · g · sin(θ) + m · g · cos(θ) · Crr] × Jari-jari Roda (m)',
            'Syarat Lulus Tanjakan: Torsi Roda Tersedia ≥ Torsi Tanjakan Dibutuhkan',
        ],
        standards: [
            'Jika torsi roda lebih kecil dari kebutuhan tanjakan, motor akan tertahan (stall), menarik arus puncak ekstrem, dan berisiko merusak MOSFET controller.',
            'Solusi teknis jika gagal menanjak adalah memperbesar rasio reduksi gir belakang di Tab 2.',
        ],
        steps: [
            'Geser sudut kemiringan tanjakan (0° hingga 30°) dan isi total berat pengendara + barang.',
            'Amati apakah indikator menyatakan MAMPU MENANJAK dan perhatikan estimasi kecepatan saat menanjak.',
        ],
    },
    troubleshooting: {
        badge: 'Praktikum Bengkel – Diagnosis Gangguan Kelistrikan',
        title: 'Panduan Troubleshooting Wiring & Multimeter Virtual',
        objective: 'Melatih kemampuan analisis kerusakan jalur tegangan tinggi (72 V DC) maupun tegangan rendah (12 V DC & sinyal 5 V) menggunakan multimeter.',
        formulas: [
            'Jalur Utama (HV): Battery Pack → MCB DC → Kunci Kontak → Controller',
            'Jalur Aksesoris (LV): Kunci Kontak → DC-DC Converter → 12 V (Lampu, Sein, Klakson)',
            'Jalur Sinyal Kontrol: Throttle Hall Sensor (0,8–4,2 V) & Switch Rem (Brake Cut-Off)',
        ],
        standards: [
            'Selalu ukur tegangan secara berurutan dari sumber (Battery Pack) menuju beban.',
            'Jika motor menyala (READY) tetapi tidak bergerak saat gas ditarik, periksa sinyal Hall Sensor throttle dan switch rem (brake cut-off).',
            'Jika motor bisa jalan tetapi lampu/klakson mati total, periksa keluaran 12 V dari DC-DC Converter.',
        ],
        steps: [
            'Baca keluhan pengendara pada panel kiri.',
            'Klik setiap kotak komponen pada skema wiring untuk membaca tegangan pada layar Multimeter Digital.',
            'Setelah menemukan komponen yang tegangannya tidak normal, klik tombol Perbaiki / Ganti Komponen.',
        ],
    },
    testride: {
        badge: 'Simulasi Kokpit – Prosedur Operasi & Interlock',
        title: 'Panduan Test Ride Virtual & Uji Fitur Keselamatan',
        objective: 'Mensimulasikan urutan menyalakan motor listrik sesuai standar keselamatan serta memantau konsumsi daya (Watt) dan penurunan SOC baterai.',
        formulas: [
            'Energi Terpakai (kWh) = (Daya Motor [W] ÷ 1000) × Waktu Tempuh [Jam]',
            'Status READY = Kunci Kontak ON + Tombol Starter + Standar Samping Naik + Charger Terlepas',
        ],
        standards: [
            'Sesuai regulasi keselamatan, kendaraan tidak boleh langsung melaju hanya dengan memutar kunci kontak; wajib ada aktivasi 2 langkah (indikator READY).',
            'Ketika kabel charger terpasang atau tuas rem ditekan, controller wajib memutus tenaga motor seketika.',
        ],
        steps: [
            'Pastikan Kunci Kontak dan Tombol Aktivasi dalam posisi tercentang hingga lampu READY menyala hijau.',
            'Tarik slider Throttle (0–100%) dan amati kecepatan, daya listrik, serta penurunan persentase baterai (SOC).',
            'Uji coba centang Kabel Charger Terpasang atau Standar Samping untuk melihat sistem pengaman memutus laju motor.',
        ],
    },
    roi: {
        badge: 'Studi Kelayakan – Analisis Ekonomi & Lingkungan',
        title: 'Panduan Perhitungan Penghematan Biaya & Titik Impas (BEP)',
        objective: 'Membandingkan biaya operasional harian/bulanan antara motor bensin dan motor listrik konversi serta menghitung waktu balik modal.',
        formulas: [
            'Biaya BBM Harian = (Jarak Harian ÷ Konsumsi BBM [km/L]) × Harga BBM',
            'Biaya Listrik Harian = (Jarak Harian ÷ Efisiensi EV [km/kWh]) × Tarif PLN × 1,15 (rugi charger)',
            'Titik Impas / BEP (Bulan) = Total Biaya Konversi ÷ Penghematan per Bulan',
        ],
        standards: [
            'Rata-rata efisiensi motor listrik konversi kelas 2 kW adalah 30–35 km per 1 kWh listrik.',
            'Semakin tinggi jarak tempuh harian kendaraan, semakin cepat waktu balik modal (BEP) tercapai.',
        ],
        steps: [
            'Masukkan jarak tempuh rata-rata harian dan konsumsi BBM motor asal.',
            'Sesuaikan tarif listrik PLN dan total biaya paket konversi.',
            'Tinjau grafik perbandingan biaya bulanan, lama waktu balik modal (bulan), dan pengurangan emisi CO₂.',
        ],
    },
};

export default function SimulationGuideModal({ isOpen, onClose, guideKey }) {
    if (!isOpen) return null;

    const guide = SIMULATION_GUIDES[guideKey] || SIMULATION_GUIDES.battery;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
            className="no-print"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: '90vh' }}
                className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full overflow-y-auto p-6 space-y-5"
            >
                {/* Header Modal */}
                <div className="flex justify-between items-start gap-4 border-b border-gray-200 pb-4">
                    <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-1">
                            {guide.badge}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">{guide.title}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold cursor-pointer"
                    >
                        ✕ Tutup
                    </button>
                </div>

                {/* Tujuan Praktikum */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-bold uppercase text-blue-800 mb-1">Tujuan Simulasi</p>
                    <p className="text-sm text-blue-950">{guide.objective}</p>
                </div>

                {/* Rumus & Persamaan Teknis */}
                <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Rumus & Persamaan Dasar</h4>
                    <div className="bg-slate-900 text-emerald-300 rounded-xl p-4 space-y-1.5 font-mono text-xs">
                        {guide.formulas.map((f, i) => (
                            <p key={i}>• {f}</p>
                        ))}
                    </div>
                </div>

                {/* Standar Regulasi & Keselamatan */}
                <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Ketentuan Teknis & Standar Keselamatan</h4>
                    <ul className="space-y-1.5 text-xs text-gray-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
                        {guide.standards.map((s, i) => (
                            <li key={i}>• {s}</li>
                        ))}
                    </ul>
                </div>

                {/* Langkah Penggunaan */}
                <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Langkah Simulasi</h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-4">
                        {guide.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ol>
                </div>

                {/* Footer Modal */}
                <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                        className="px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 cursor-pointer"
                    >
                        Mengerti & Lanjutkan Simulasi
                    </button>
                </div>
            </div>
        </div>
    );
}