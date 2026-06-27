"use client";

import { useEffect, useState } from 'react';

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-white py-12 px-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <h3 className="font-bold text-lg tracking-tight">EVAN HONDA</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Authorized Honda Experience Platform.<br/>Satu Hati untuk setiap perjalanan.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider mb-6 text-gray-400">Tautan Cepat</h4>
          <ul className="space-y-3 text-sm text-gray-600">
            <li><a href="/motor" className="hover:text-black transition-colors">Katalog</a></li>
            <li><a href="/simulasi-kredit" className="hover:text-black transition-colors">Simulasi Kredit</a></li>
            <li><a href="/dealer" className="hover:text-black transition-colors">Cari Dealer</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider mb-6 text-gray-400">Layanan</h4>
          <ul className="space-y-3 text-sm text-gray-600">
            <li><a href="#" className="hover:text-black transition-colors">Booking Service</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Suku Cadang</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Trade-In</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider mb-6 text-gray-400">Kontak</h4>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>Email: info@evanhonda.com</li>
            <li>Phone: 1-500-989</li>
            <li>WA: +62 811 1234 5678</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-50 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          © {year || '2025'} EVAN HONDA SELAMAT MOTOR. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
