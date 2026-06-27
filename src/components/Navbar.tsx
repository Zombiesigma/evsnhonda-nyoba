"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight, Phone, MessageSquare, Globe } from 'lucide-react';
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
    { name: t('nav_dealer'), href: '/dealer' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  return (
    <nav className={cn(
      "fixed top-0 z-[100] w-full px-6 transition-all duration-300 h-16 flex items-center",
      scrolled ? "bg-white/90 backdrop-blur-xl border-b border-zinc-100 shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        
        <Link href="/" className="z-[110] flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-base tracking-tight">E</div>
          <span className="font-bold text-base tracking-tight text-black flex items-baseline">
            Evan<span className="text-zinc-400 font-normal ml-0.5">Honda</span>
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
                  "text-[13px] font-semibold transition-colors uppercase tracking-widest",
                  pathname === item.href ? "text-black" : "text-zinc-400 hover:text-black"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4 border-l border-zinc-100 pl-8">
            <button 
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="flex items-center gap-2 text-[11px] font-bold hover:text-black transition-colors h-9 px-3 border border-zinc-200 rounded-lg uppercase"
            >
              <Globe className="h-3.5 w-3.5" />
              {language}
            </button>
            <Button className="bg-black text-white hover:bg-zinc-800 h-9 px-6 rounded-xl text-[11px] font-bold tracking-widest uppercase shadow-lg shadow-black/5" asChild>
              <Link href="/ajukan-kredit">{t('nav_acquire')}</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-black z-[110] p-2" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={cn(
        "fixed inset-0 bg-white z-[105] flex flex-col transition-all duration-500 ease-in-out",
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      )}>
        <div className="flex-1 flex flex-col pt-32 px-10 pb-10">
          <div className="space-y-8">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Core Navigation</p>
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between text-3xl font-bold tracking-tight group transition-all duration-300",
                  "animate-in fade-in slide-in-from-top-6",
                  pathname === item.href ? "text-black" : "text-zinc-300 hover:text-black"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {item.name}
                <ArrowRight className={cn("h-6 w-6 transition-transform", pathname === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-2")} />
              </Link>
            ))}
          </div>

          <div className="mt-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-2 gap-4">
              <a href="tel:1500989" className="flex flex-col gap-2 p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                <Phone className="h-5 w-5 text-zinc-400" />
                <span className="text-xs font-bold">Help Desk</span>
                <span className="text-[10px] text-zinc-400">1-500-989</span>
              </a>
              <a href="https://wa.me/6281112345678" className="flex flex-col gap-2 p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                <MessageSquare className="h-5 w-5 text-zinc-400" />
                <span className="text-xs font-bold">WhatsApp</span>
                <span className="text-[10px] text-zinc-400">Live Support</span>
              </a>
            </div>

            <Button className="w-full h-16 bg-black text-white rounded-2xl text-sm font-bold shadow-2xl shadow-black/10" asChild onClick={() => setIsOpen(false)}>
              <Link href="/ajukan-kredit">{t('nav_acquire')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}