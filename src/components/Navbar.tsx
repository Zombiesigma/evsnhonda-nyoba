
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { name: t('nav_catalog'), href: '/motor' },
    { name: t('nav_simulation'), href: '/simulasi-kredit' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  return (
    <nav className={cn(
      "fixed top-0 z-[100] w-full transition-all duration-500 h-14 md:h-16 flex items-center",
      scrolled 
        ? "bg-white/80 backdrop-blur-xl border-b border-zinc-100/50 shadow-[0_1px_10px_rgba(0,0,0,0.02)]" 
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto w-full px-6 md:px-10 flex items-center justify-between">
        
        <Link href="/" className="z-[110] flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
          <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-110">
            <Image 
              src="https://ik.imagekit.io/zlt25mb52fx/assets/images/logo/honda.svg" 
              alt="Honda Official Logo" 
              fill 
              className="object-contain"
            />
          </div>
          <span className="font-extrabold text-sm md:text-base tracking-[0.1em] text-black uppercase">
            Evan Honda
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[10px] font-bold transition-all uppercase tracking-[0.2em] relative py-1",
                  pathname === item.href 
                    ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-black" 
                    : "text-zinc-400 hover:text-black"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4 border-l border-zinc-100 pl-8">
            <button 
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 hover:text-black transition-colors h-7 px-2 border border-zinc-200 rounded-md uppercase"
            >
              <Globe className="h-2.5 w-2.5" />
              {language}
            </button>
            <Button className="bg-black text-white hover:bg-zinc-800 h-8 px-5 rounded-lg text-[9px] font-bold tracking-widest uppercase shadow-sm" asChild>
              <Link href="/ajukan-kredit">{t('nav_acquire')}</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-black z-[110] p-1.5 hover:bg-zinc-50 rounded-md transition-colors" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={cn(
        "fixed inset-0 bg-white z-[105] flex flex-col transition-all duration-700 ease-expo-out",
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      )}>
        <div className="flex-1 flex flex-col pt-24 px-8 pb-10">
          <div className="space-y-8">
            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em] mb-4">Navigasi Utama</p>
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between text-3xl font-bold tracking-tighter transition-all duration-500",
                  pathname === item.href ? "text-black" : "text-zinc-200 hover:text-zinc-400"
                )}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                {item.name}
                <ArrowRight className={cn("h-6 w-6", pathname === item.href ? "opacity-100" : "opacity-0")} />
              </Link>
            ))}
          </div>

          <div className="mt-auto space-y-6">
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest"
              >
                <Globe className="h-4 w-4" />
                Language: {language.toUpperCase()}
              </button>
            </div>
            <Button className="w-full h-14 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-black/10" asChild onClick={() => setIsOpen(false)}>
              <Link href="/ajukan-kredit">{t('nav_acquire')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
