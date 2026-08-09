
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'react-scroll'; // Note: Usually Link from next/link is used for navigation, but for simplicity we use plain Link or next/link
import NextLink from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { DEALERS } from '@/app/lib/dealers';

export function Footer() {
  const { t } = useLanguage();
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const dealer = DEALERS[0]; // Primary dealer info

  return (
    <footer className="bg-white py-16 px-8 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <img 
                src="https://ik.imagekit.io/zlt25mb52fx/assets/images/logo/honda.svg" 
                alt="Honda Official Logo" 
                className="object-contain w-full h-full"
              />
            </div>
            <span className="font-extrabold text-base tracking-[0.1em] text-black uppercase">Evan Honda</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-medium uppercase tracking-wider">
            {t('footer_tagline')}
          </p>
          <div className="pt-2">
            <p className="text-[10px] font-bold text-black uppercase tracking-widest">{dealer.name}</p>
            <p className="text-[9px] text-zinc-400 mt-1">{dealer.address}</p>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-[9px] uppercase tracking-[0.3em] mb-8 text-zinc-300">{t('footer_quick_access')}</h4>
          <ul className="space-y-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <li><NextLink href="/motor" className="hover:text-black transition-colors">{t('nav_catalog')}</NextLink></li>
            <li><NextLink href="/simulasi-kredit" className="hover:text-black transition-colors">{t('nav_simulation')}</NextLink></li>
            <li><NextLink href="/ajukan-kredit" className="hover:text-black transition-colors">{t('nav_acquire')}</NextLink></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[9px] uppercase tracking-[0.3em] mb-8 text-zinc-300">{t('footer_services')}</h4>
          <ul className="space-y-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <li><a href="#" className="hover:text-black transition-colors">Booking Service</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Suku Cadang</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Trade-In</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[9px] uppercase tracking-[0.3em] mb-8 text-zinc-300">{t('footer_contact')}</h4>
          <ul className="space-y-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <li>{t('home_contact_hours')}</li>
            <li>{t('home_contact_phone')}</li>
            <li>+62 {dealer.whatsapp} (WA)</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-50 text-center">
        <p className="text-[8px] text-zinc-300 uppercase tracking-[0.4em] font-bold">
          © {year || '2025'} EVAN HONDA SELAMAT MOTOR. {t('footer_rights')}
        </p>
      </div>
    </footer>
  );
}
