"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MotorcycleCard } from "@/components/MotorcycleCard";
import { Phone, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";

export default function Home() {
  const { t } = useLanguage();
  const db = useFirestore();

  const lineupQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'motorcycles'), limit(3));
  }, [db]);

  const { data: motorcycles, loading } = useCollection(lineupQuery);

  const featuredBikes = useMemo(() => {
    if (!motorcycles) return [];
    return motorcycles;
  }, [motorcycles]);

  return (
    <div className="bg-white text-[#171717] selection:bg-black selection:text-white">
      <main>
        {/* ========== HERO – Ultra Compact for Mobile ========== */}
        <section className="pt-20 md:pt-24 pb-4 md:pb-10 px-4 flex flex-col items-center justify-center">
          <div className="max-w-4xl mx-auto text-center space-y-3">
            <h1 className="text-2xl md:text-6xl font-bold tracking-tight leading-tight">
              {t('hero_title')}
            </h1>
            <p className="text-[11px] md:text-lg text-gray-500 max-w-xs md:max-w-md mx-auto leading-relaxed">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-row gap-2 justify-center pt-1">
              <Button size="sm" className="bg-black text-white hover:bg-zinc-800 h-9 px-4 rounded-lg text-[10px] font-bold" asChild>
                <Link href="/motor">{t('hero_explore')}</Link>
              </Button>
              <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg bg-white border-gray-100 text-[10px] font-bold hover:bg-gray-50" asChild>
                <Link href="/ajukan-kredit">{t('hero_start')}</Link>
              </Button>
            </div>
          </div>

          <div className="mt-4 md:mt-8 w-full max-w-4xl">
            <div className="relative aspect-[21/9] md:aspect-[16/9] w-full bg-gray-50 rounded-xl overflow-hidden border shadow-sm">
              <Image
                src="https://picsum.photos/seed/honda-studio-mockup/1400/600"
                alt="Honda Experience"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* ========== LINEUP – High Density Grid ========== */}
        <section className="px-4 py-4 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">{t('lineup_title')}</h2>
              <Link href="/motor" className="text-[10px] font-bold text-[#0d74ce] inline-flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-wider">
                {t('lineup_view_all')} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-200" />
              </div>
            ) : featuredBikes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                {featuredBikes.map((bike: any) => (
                  <MotorcycleCard key={bike.id} bike={bike} />
                ))}
              </div>
            ) : (
              <p className="text-center text-[9px] text-gray-300 font-bold uppercase tracking-widest py-8 border-2 border-dashed rounded-xl">
                {t('lineup_empty') || 'Inventory Synchronizing...'}
              </p>
            )}
          </div>
        </section>

        {/* ========== CONTACT CTA – Direct and Clean ========== */}
        <section className="px-4 pb-12 md:pb-20 text-center border-t border-gray-50 pt-8">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg md:text-4xl font-bold tracking-tight">
                {t('contact_cta_title')}
              </h2>
              <p className="text-[10px] md:text-base text-gray-400">
                {t('contact_cta_subtitle')}
              </p>
            </div>
            <Button size="lg" className="bg-black text-white hover:bg-zinc-800 h-12 px-10 rounded-xl text-xs font-bold w-full max-w-[240px] shadow-lg shadow-black/10" asChild>
              <a href="https://wa.me/6281112345678">{t('contact_cta_button')}</a>
            </Button>
            <div className="pt-2">
              <Link href="/dealer" className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-black inline-flex items-center gap-1">
                {t('contact_cta_locate')} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp - Reduced scale for mobile accessibility */}
      <a
        href="https://wa.me/6281112345678"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-[120] w-10 h-10 md:w-12 md:h-12 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all active:scale-95 border border-white/10"
      >
        <Phone className="w-4 h-4 md:w-5 md:h-5 fill-current" />
      </a>
    </div>
  );
}
