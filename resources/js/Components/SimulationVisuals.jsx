import React from 'react';

export function BatteryPackDiagram({ series = 20, parallel = 4, chemistry = 'NMC', fullVoltage = 84, nominalVoltage = 72, isHighVoltage = true }) {
    // Batasi tampilan grid ekstrem (misal >30S atau >10P) agar SVG tidak meluber, namun untuk 20S 4P tampil 100% penuh (80 sel)
    const maxCols = 30;
    const maxRows = 10;
    const displayS = Math.min(Math.max(1, series), maxCols);
    const displayP = Math.min(Math.max(1, parallel), maxRows);
    const isTruncated = series > maxCols || parallel > maxRows;

    // Kalkulasi dimensi SVG dinamis agar muat rapi untuk semua jumlah S dan P
    const startX = 48;
    const startY = 76;
    const endX = 535;
    const endY = 235;
    const availW = endX - startX;
    const availH = endY - startY;

    const colStep = availW / displayS;
    const rowStep = availH / displayP;

    const cellW = Math.min(24, Math.max(10, colStep * 0.68));
    const cellH = Math.min(18, Math.max(8, rowStep * 0.56));
    const capW = Math.max(2, cellW * 0.14);
    const capH = cellH * 0.45;

    const topRowCenterY = startY + rowStep * 0.5;
    const bottomRowCenterY = startY + (displayP - 0.5) * rowStep;

    return (
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 text-white">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                <span className="text-xs font-bold tracking-wider text-sky-400 uppercase">
                    Skema Rakitan Battery Pack ({series}S {parallel}P – {chemistry})
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${isHighVoltage ? 'bg-orange-500 text-white' : 'bg-emerald-600 text-white'}`}>
                    {isHighVoltage ? 'HIGH VOLTAGE > 60V DC (KABEL ORANYE)' : 'SISTEM TEGANGAN RENDAH ≤ 60V DC'}
                </span>
            </div>

            <svg viewBox="0 0 820 285" className="w-full h-auto">
                {/* Wadah Utama Modul Baterai */}
                <rect x="12" y="18" width="548" height="252" rx="12" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <text x="26" y="40" fill="#e2e8f0" fontSize="11.5" fontWeight="bold">
                    MODUL SEL AKTUAL: {series} Seri × {parallel} Paralel = {series * parallel} Sel Fisik
                </text>

                {/* Legenda Rangkaian Seri & Paralel */}
                <g transform="translate(26, 48)">
                    <line x1="0" y1="6" x2="18" y2="6" stroke="#38bdf8" strokeWidth="2.5" />
                    <text x="23" y="10" fill="#94a3b8" fontSize="10">Busbar Paralel (+ ke + / - ke -)</text>

                    <line x1="185" y1="6" x2="205" y2="6" stroke="#f59e0b" strokeWidth="2.5" />
                    <text x="210" y="10" fill="#94a3b8" fontSize="10">Jalur Seri Antar-Grup (S1 → S{series})</text>
                </g>

                {/* Render Setiap Grup Seri (Kolom) dan Sel Paralel (Baris) */}
                {Array.from({ length: displayS }).map((_, sIdx) => {
                    const colCenterX = startX + (sIdx + 0.5) * colStep;
                    const cellLeftX = colCenterX - cellW / 2;
                    const cellRightX = colCenterX + cellW / 2 + capW;
                    const busLeftX = cellLeftX - 3;
                    const busRightX = cellRightX + 3;

                    const nextColCenterX = startX + (sIdx + 1.5) * colStep;
                    const nextBusLeftX = nextColCenterX - cellW / 2 - 3;

                    return (
                        <g key={`group-${sIdx}`}>
                            {/* Label Grup Seri (S1, S2, ... S20) */}
                            {(displayS <= 20 || sIdx % 2 === 0) && (
                                <text
                                    x={colCenterX}
                                    y={startY - 3}
                                    textAnchor="middle"
                                    fill="#64748b"
                                    fontSize="8"
                                    fontWeight="bold"
                                >
                                    S{sIdx + 1}
                                </text>
                            )}

                            {/* Garis Busbar Paralel Sisi Kiri (-) dan Sisi Kanan (+) jika P > 1 */}
                            {displayP > 1 && (
                                <>
                                    <line
                                        x1={busLeftX}
                                        y1={topRowCenterY}
                                        x2={busLeftX}
                                        y2={bottomRowCenterY}
                                        stroke="#38bdf8"
                                        strokeWidth="1.8"
                                    />
                                    <line
                                        x1={busRightX}
                                        y1={topRowCenterY}
                                        x2={busRightX}
                                        y2={bottomRowCenterY}
                                        stroke="#38bdf8"
                                        strokeWidth="1.8"
                                    />
                                </>
                            )}

                            {/* Garis Penghubung Seri dari Busbar (+) Grup Ini ke Busbar (-) Grup Berikutnya */}
                            {sIdx < displayS - 1 && (
                                <line
                                    x1={busRightX}
                                    y1={topRowCenterY}
                                    x2={nextBusLeftX}
                                    y2={topRowCenterY}
                                    stroke="#f59e0b"
                                    strokeWidth="2.2"
                                />
                            )}

                            {/* Render Sel-Sel Baterai dalam Kolom Ini */}
                            {Array.from({ length: displayP }).map((__, pIdx) => {
                                const rowCenterY = startY + (pIdx + 0.5) * rowStep;
                                const cellTopY = rowCenterY - cellH / 2;

                                return (
                                    <g key={`cell-${sIdx}-${pIdx}`}>
                                        {/* Kaki penghubung ke busbar paralel */}
                                        <line x1={busLeftX} y1={rowCenterY} x2={cellLeftX} y2={rowCenterY} stroke="#38bdf8" strokeWidth="1.2" />
                                        <line x1={cellRightX} y1={rowCenterY} x2={busRightX} y2={rowCenterY} stroke="#38bdf8" strokeWidth="1.2" />

                                        {/* Badan Sel Baterai */}
                                        <rect
                                            x={cellLeftX}
                                            y={cellTopY}
                                            width={cellW}
                                            height={cellH}
                                            rx="2"
                                            fill="#2563eb"
                                            stroke="#93c5fd"
                                            strokeWidth="0.9"
                                        />
                                        {/* Kutub Positif (+) di Kanan */}
                                        <rect
                                            x={cellLeftX + cellW}
                                            y={rowCenterY - capH / 2}
                                            width={capW}
                                            height={capH}
                                            rx="1"
                                            fill="#f8fafc"
                                        />
                                    </g>
                                );
                            })}
                        </g>
                    );
                })}

                {/* Terminal Utama B- (Grup S1 Kiri) dan B+ (Grup Terakhir Kanan) */}
                {(() => {
                    const firstBusLeftX = startX + 0.5 * colStep - cellW / 2 - 3;
                    const lastColCenterX = startX + (displayS - 0.5) * colStep;
                    const lastBusRightX = lastColCenterX + cellW / 2 + capW + 3;

                    return (
                        <g>
                            {/* Kabel Utama B- (Negatif) ke BMS */}
                            <polyline
                                points={`${firstBusLeftX},${bottomRowCenterY} 28,${bottomRowCenterY} 28,248 585,248 585,180 605,180`}
                                fill="none"
                                stroke="#38bdf8"
                                strokeWidth="3"
                            />
                            <circle cx={firstBusLeftX} cy={bottomRowCenterY} r="3.5" fill="#38bdf8" />
                            <text x="34" y="242" fill="#38bdf8" fontSize="10" fontWeight="bold">
                                Terminal B- (Negatif Total)
                            </text>

                            {/* Kabel Utama B+ (Positif) ke BMS */}
                            <polyline
                                points={`${lastBusRightX},${topRowCenterY} 572,${topRowCenterY} 572,115 605,115`}
                                fill="none"
                                stroke={isHighVoltage ? '#f97316' : '#ef4444'}
                                strokeWidth="3.5"
                            />
                            <circle cx={lastBusRightX} cy={topRowCenterY} r="3.5" fill="#ef4444" />
                            <text x="455" y="262" fill="#fb923c" fontSize="10" fontWeight="bold">
                                Terminal B+ ({nominalVoltage}V) →
                            </text>
                        </g>
                    );
                })()}

                {isTruncated && (
                    <text x="190" y="262" fill="#fbbf24" fontSize="9.5">
                        *Tampilan dipadatkan dari {series}S × {parallel}P ({series * parallel} sel)
                    </text>
                )}

                {/* Kotak BMS */}
                <rect x="605" y="82" width="88" height="122" rx="10" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
                <text x="649" y="128" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="bold">BMS</text>
                <text x="649" y="146" textAnchor="middle" fill="#cbd5e1" fontSize="10">{nominalVoltage} V</text>
                <text x="649" y="162" textAnchor="middle" fill="#64748b" fontSize="9">Balancing &</text>
                <text x="649" y="174" textAnchor="middle" fill="#64748b" fontSize="9">Cut-off</text>

                {/* Kabel BMS ke Charger */}
                <line x1="693" y1="115" x2="725" y2="115" stroke={isHighVoltage ? '#f97316' : '#ef4444'} strokeWidth="3.5" />
                <line x1="693" y1="180" x2="725" y2="180" stroke="#38bdf8" strokeWidth="3" />

                {/* Kotak Charger CC-CV */}
                <rect x="725" y="82" width="83" height="122" rx="10" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
                <text x="766" y="126" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">CHARGER</text>
                <text x="766" y="146" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">{fullVoltage} V</text>
                <text x="766" y="164" textAnchor="middle" fill="#94a3b8" fontSize="9">CC-CV Output</text>
            </svg>
        </div>
    );
}

export function MotorDrivetrainDiagram({ powerW, motorRpm, gearRatio, wheelRpm, topSpeedKmh, wheelTorqueNm }) {
    const isHubMotor = Number(gearRatio) === 1;
    const animDuration = wheelRpm > 0 ? Math.max(0.2, 60 / wheelRpm).toFixed(2) : 0;

    return (
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Simulasi Penggerak ({isHubMotor ? 'In-Wheel Hub Motor' : `Mid-Drive Rasio 1:${gearRatio}`})
                </span>
                <span className="text-xs font-bold text-emerald-400">
                    Kecepatan Roda: {topSpeedKmh} km/jam
                </span>
            </div>

            <svg viewBox="0 0 640 190" className="w-full h-auto">
                <style>{`
                    @keyframes spinWheel {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .wheel-spin {
                        transform-origin: 480px 95px;
                        animation: ${wheelRpm > 0 ? `spinWheel ${animDuration}s linear infinite` : 'none'};
                    }
                    .motor-spin {
                        transform-origin: 150px 95px;
                        animation: ${motorRpm > 0 ? `spinWheel ${Math.max(0.15, 60 / motorRpm).toFixed(2)}s linear infinite` : 'none'};
                    }
                `}</style>

                {/* Dinamo Motor */}
                <rect x="70" y="45" width="160" height="100" rx="14" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" />
                <circle cx="150" cy="95" r="32" fill="#0f172a" stroke="#60a5fa" strokeWidth="2" />
                <g className="motor-spin">
                    <line x1="150" y1="65" x2="150" y2="125" stroke="#60a5fa" strokeWidth="2" />
                    <line x1="120" y1="95" x2="180" y2="95" stroke="#60a5fa" strokeWidth="2" />
                </g>
                <text x="150" y="32" fill="#93c5fd" fontSize="11" fontWeight="bold" textAnchor="middle">
                    MOTOR BLDC ({powerW} W | {motorRpm} RPM)
                </text>

                {/* Rantai / Transmisi */}
                <line x1="230" y1="78" x2="415" y2="62" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" />
                <line x1="230" y1="112" x2="415" y2="128" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" />
                <rect x="275" y="82" width="95" height="26" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="322" y="99" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Rasio 1 : {gearRatio}
                </text>

                {/* Roda & Ban */}
                <circle cx="480" cy="95" r="68" fill="none" stroke="#334155" strokeWidth="14" />
                <circle cx="480" cy="95" r="54" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
                <g className="wheel-spin">
                    <line x1="480" y1="43" x2="480" y2="147" stroke="#10b981" strokeWidth="3" />
                    <line x1="428" y1="95" x2="532" y2="95" stroke="#10b981" strokeWidth="3" />
                    <line x1="443" y1="58" x2="517" y2="132" stroke="#10b981" strokeWidth="2" />
                    <line x1="517" y1="58" x2="443" y2="132" stroke="#10b981" strokeWidth="2" />
                </g>
                <text x="480" y="180" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle">
                    RODA ({wheelRpm} RPM | Torsi {wheelTorqueNm} Nm)
                </text>
            </svg>
        </div>
    );
}

export function PwmCircuitDiagram({ pwmDuty, nominalV, avgV, mcbMinA, mcbMaxA, isBmsSafe }) {
    // Hitung lebar pulsa kotak PWM untuk 4 siklus gelombang
    const cycleWidth = 70;
    const highWidth = (cycleWidth * pwmDuty) / 100;

    return (
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Osiloskop Sinyal PWM Controller & Alur Proteksi
                </span>
                <span className="text-xs font-bold text-amber-400">
                    Duty Cycle: {pwmDuty}% → V rata-rata: {avgV} V
                </span>
            </div>

            <svg viewBox="0 0 640 170" className="w-full h-auto">
                {/* Diagram Blok Kiri */}
                <rect x="20" y="30" width="80" height="45" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                <text x="60" y="56" fill="#93c5fd" fontSize="11" fontWeight="bold" textAnchor="middle">BATERAI</text>

                <line x1="100" y1="52" x2="130" y2="52" stroke="#ea580c" strokeWidth="3" />

                <rect x="130" y="30" width="80" height="45" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                <text x="170" y="50" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">MCB DC</text>
                <text x="170" y="64" fill="#ffffff" fontSize="10" textAnchor="middle">{mcbMinA}-{mcbMaxA}A</text>

                <line x1="210" y1="52" x2="240" y2="52" stroke="#ea580c" strokeWidth="3" />

                <rect x="240" y="30" width="90" height="45" rx="6" fill="#1e293b" stroke={isBmsSafe ? '#10b981' : '#ef4444'} strokeWidth="2" />
                <text x="285" y="56" fill={isBmsSafe ? '#6ee7b7' : '#fca5a5'} fontSize="10" fontWeight="bold" textAnchor="middle">
                    CONTROLLER
                </text>

                <text x="20" y="115" fill="#94a3b8" fontSize="10">
                    • Semakin besar bukaan throttle (%), semakin lebar sinyal ON (High).
                </text>
                <text x="20" y="133" fill="#94a3b8" fontSize="10">
                    • Tegangan Efektif = {nominalV}V × {pwmDuty}% = {avgV}V.
                </text>

                {/* Layar Osiloskop Kanan */}
                <rect x="350" y="20" width="275" height="130" rx="8" fill="#020617" stroke="#334155" strokeWidth="2" />
                <line x1="360" y1="125" x2="615" y2="125" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="360" y1="45" x2="615" y2="45" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                <text x="362" y="38" fill="#64748b" fontSize="9">{nominalV} V (ON)</text>
                <text x="362" y="138" fill="#64748b" fontSize="9">0 V (OFF)</text>

                {/* Gelombang Kotak PWM Dinamis */}
                {[0, 1, 2, 3].map((cycle) => {
                    const startX = 365 + cycle * 62;
                    const wHigh = (62 * pwmDuty) / 100;
                    const wLow = 62 - wHigh;
                    return (
                        <g key={cycle}>
                            {pwmDuty > 0 && (
                                <>
                                    <line x1={startX} y1="125" x2={startX} y2="45" stroke="#10b981" strokeWidth="2.5" />
                                    <line x1={startX} y1="45" x2={startX + wHigh} y2="45" stroke="#10b981" strokeWidth="2.5" />
                                    <line x1={startX + wHigh} y1="45" x2={startX + wHigh} y2="125" stroke="#10b981" strokeWidth="2.5" />
                                </>
                            )}
                            {wLow > 0 && (
                                <line x1={startX + wHigh} y1="125" x2={startX + 62} y2="125" stroke="#10b981" strokeWidth="2.5" />
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export function InspectionBlueprintDiagram({ powerPass, weightPass, headlightPass, checklist }) {
    const pointColor = (ok) => (ok ? '#10b981' : '#ef4444');

    return (
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Peta Titik Pemeriksaan Fisik & Keselamatan (PM 39/2023)
                </span>
                <span className="text-[11px] text-slate-400">Hijau = Lulus | Merah = Perlu Perbaikan</span>
            </div>

            <svg viewBox="0 0 640 185" className="w-full h-auto">
                {/* Siluet Rangka Sepeda Motor Konversi */}
                <circle cx="155" cy="135" r="34" fill="none" stroke="#64748b" strokeWidth="5" />
                <circle cx="465" cy="135" r="34" fill="none" stroke="#64748b" strokeWidth="5" />
                <path
                    d="M 155 135 L 200 55 L 255 55 L 290 120 L 405 120 L 465 135 M 290 120 L 345 75 L 435 75"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Titik 1: Lampu Utama */}
                <circle cx="185" cy="60" r="9" fill={pointColor(headlightPass)} />
                <text x="25" y="45" fill={pointColor(headlightPass)} fontSize="10" fontWeight="bold">
                    1. Lampu Utama (≥12.000 cd)
                </text>
                <line x1="145" y1="48" x2="177" y2="58" stroke={pointColor(headlightPass)} strokeWidth="1.5" />

                {/* Titik 2: Kompartemen Baterai & Kabel Oranye */}
                <rect x="275" y="78" width="55" height="36" rx="4" fill="#1e293b" stroke={pointColor(checklist.orangeHvCable && weightPass)} strokeWidth="2" />
                <text x="302" y="100" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">BATERAI</text>
                <text x="235" y="25" fill={pointColor(checklist.orangeHvCable && weightPass)} fontSize="10" fontWeight="bold">
                    2. Berat (±5%) & Kabel Oranye
                </text>
                <line x1="295" y1="30" x2="302" y2="76" stroke={pointColor(checklist.orangeHvCable && weightPass)} strokeWidth="1.5" />

                {/* Titik 3: Controller & Interlock */}
                <rect x="360" y="82" width="46" height="24" rx="4" fill="#1e293b" stroke={pointColor(checklist.chargerInterlock && checklist.controllerHeatsinkCover)} strokeWidth="2" />
                <text x="383" y="97" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">CTRL</text>
                <text x="435" y="38" fill={pointColor(checklist.chargerInterlock && checklist.controllerHeatsinkCover)} fontSize="10" fontWeight="bold">
                    3. Controller & Charger Interlock
                </text>
                <line x1="432" y1="42" x2="395" y2="80" stroke={pointColor(checklist.chargerInterlock && checklist.controllerHeatsinkCover)} strokeWidth="1.5" />

                {/* Titik 4: Motor Penggerak & Daya PM 39/2023 */}
                <circle cx="465" cy="135" r="14" fill={pointColor(powerPass)} />
                <text x="505" y="115" fill={pointColor(powerPass)} fontSize="10" fontWeight="bold">
                    4. Daya Motor (PM 39/2023)
                </text>
                <line x1="502" y1="118" x2="478" y2="130" stroke={pointColor(powerPass)} strokeWidth="1.5" />
            </svg>
        </div>
    );
}