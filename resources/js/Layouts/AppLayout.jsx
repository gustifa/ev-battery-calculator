import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AppLayout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { url } = usePage();

    const isActive = (path) => url === path;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 min-w-[320px]">
            {/* ========================================================= */}
            {/* STICKY RESPONSIVE HEADER                                  */}
            {/* ========================================================= */}
            <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Brand / Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs shrink-0">
                                EV
                            </div>
                            <div className="leading-tight">
                                <Link href="/simulator" className="text-sm sm:text-base font-bold text-gray-900 hover:text-blue-600 transition block">
                                    EV Conversion Lab
                                </Link>
                                <span className="text-[10px] sm:text-xs text-gray-500 block truncate max-w-[190px] sm:max-w-none">
                                    PPSDM KEBTKE – PT Braja Elektrik Motor
                                </span>
                            </div>
                        </div>

                        {/* Navigasi Desktop (md ke atas) */}
                        <nav className="hidden md:flex items-center gap-2">
                            <Link
                                href="/simulator"
                                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                                    isActive('/simulator')
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                Simulasi Teknis
                            </Link>
                            <Link
                                href="/"
                                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                                    isActive('/')
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                Kalkulator Jarak Tempuh
                            </Link>
                        </nav>

                        {/* Tombol Hamburger Mobile (< md) */}
                        <div className="md:hidden">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Buka Menu Navigasi"
                                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                {mobileMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dropdown Navigasi Mobile */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 px-4 pt-2 pb-4 space-y-1.5 shadow-md">
                        <Link
                            href="/simulator"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${
                                isActive('/simulator')
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Simulasi Teknis (8 Modul)
                        </Link>
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${
                                isActive('/')
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Kalkulator Jarak Tempuh
                        </Link>
                    </div>
                )}
            </header>

            {/* ========================================================= */}
            {/* KONTEN UTAMA (FLEX-1 AGAR FOOTER SELALU DI BAWAH)          */}
            {/* ========================================================= */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {children}
            </main>

            {/* ========================================================= */}
            {/* STICKY RESPONSIVE FOOTER                                  */}
            {/* ========================================================= */}
            <footer className="no-print bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-gray-600">
                        <div>
                            <p className="font-bold text-gray-900 text-sm mb-1">
                                Simulator Konversi Sepeda Motor Listrik
                            </p>
                            <p className="leading-relaxed text-gray-500">
                                Media pembelajaran dan perancangan teknis berbasis kurikulum konversi sepeda motor listrik serta regulasi uji tipe.
                            </p>
                        </div>

                        <div>
                            <p className="font-bold text-gray-900 text-sm mb-1">Acuan Regulasi & Standar</p>
                            <ul className="space-y-1 text-gray-500">
                                <li>• Permenhub PM 39 Tahun 2023 & PM 87 Tahun 2020</li>
                                <li>• Standar Keselamatan Baterai UN R136 & ISO 6469-3</li>
                            </ul>
                        </div>

                        <div className="sm:col-span-2 lg:col-span-1 lg:text-right flex flex-col justify-between">
                            <div>
                                <p className="font-bold text-gray-900 text-sm mb-1">Akses Cepat</p>
                                <div className="flex flex-wrap lg:justify-end gap-3 text-blue-600 font-medium">
                                    <Link href="/simulator" className="hover:underline">Simulasi Teknis</Link>
                                    <span>•</span>
                                    <Link href="/" className="hover:underline">Kalkulator Jarak</Link>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-3">
                                © {new Date().getFullYear()} EV Conversion Simulator. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}