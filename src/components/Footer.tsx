
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-white py-16 px-8 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs">E</div>
            <span className="font-bold text-sm tracking-tight text-black uppercase">Evan<span className="text-zinc-400 font-medium">Honda</span></span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-medium uppercase tracking-wider">
            Platform Pengalaman Resmi Honda Selamat Motor.<br/>Presisi teknis untuk mobilitas harian Anda.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-[9px] uppercase tracking-[0.3em] mb-8 text-zinc-300">Akses Cepat</h4>
          <ul className="space-y-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <li><Link href="/motor" className="hover:text-black transition-colors">Katalog Unit</Link></li>
            <li><Link href="/simulasi-kredit" className="hover:text-black transition-colors">Simulasi Kredit</Link></li>
            <li><Link href="/ajukan-kredit" className="hover:text-black transition-colors">Pengajuan</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[9px] uppercase tracking-[0.3em] mb-8 text-zinc-300">Layanan</h4>
          <ul className="space-y-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <li><a href="#" className="hover:text-black transition-colors">Booking Service</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Suku Cadang</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Trade-In</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[9px] uppercase tracking-[0.3em] mb-8 text-zinc-300">Kontak Resmi</h4>
          <ul className="space-y-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <li>info@evanhonda.com</li>
            <li>1-500-989 (Hotline)</li>
            <li>+62 811 1234 5678 (WA)</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-50 text-center">
        <p className="text-[8px] text-zinc-300 uppercase tracking-[0.4em] font-bold">
          © {year || '2025'} EVAN HONDA SELAMAT MOTOR. SELURUH HAK CIPTA DILINDUNGI.
        </p>
      </div>
    </footer>
  );
}
