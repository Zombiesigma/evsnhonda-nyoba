"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MotorcycleCard } from "@/components/MotorcycleCard";
import { ArrowRight, Loader2, Target, Orbit, ChevronDown } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const { t } = useLanguage();
  const db = useFirestore();
  const router = useRouter();

  const lineupQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'motorcycles'));
  }, [db]);

  const { data: motorcycles, loading } = useCollection(lineupQuery);

  const featuredBikes = useMemo(() => {
    if (!motorcycles) return [];
    return motorcycles.slice(0, 4);
  }, [motorcycles]);

  const handleSelectVehicle = (id: string) => {
    if (id === "all") {
      router.push('/motor');
    } else {
      router.push(`/motor/${id}`);
    }
  };

  return (
    <div className="bg-white text-[#171717] selection:bg-black selection:text-white">
      <main>
        {/* ========== HERO – Evan Honda Interface ========== */}
        <section className="min-h-[70vh] sky-gradient-wash flex flex-col items-center justify-center px-4 pt-20 pb-8">
          <div className="max-w-3xl w-full text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/50 shadow-sm animate-expo-entry">
              <div className="pulse-dot" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                PROMO SPESIAL • BUNGA MULAI 2.99%
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-bold tracking-tight leading-[1.1] animate-expo-entry" style={{ animationDelay: '100ms' }}>
              Temukan <br />
              <span className="text-zinc-400 font-medium italic">Honda Impian</span> Anda
            </h1>
            
            <p className="text-sm md:text-lg text-zinc-500 max-w-md mx-auto leading-relaxed animate-expo-entry" style={{ animationDelay: '200ms' }}>
              Pilih kendaraan Honda terbaik di Evan Honda. Simulasi kredit instan dan penawaran eksklusif menanti Anda.
            </p>

            {/* Selector Card */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-5 md:p-8 shadow-selector animate-expo-entry text-left w-full mt-6" style={{ animationDelay: '300ms' }}>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2.5 block">
                Pilih Kendaraan Anda
              </label>
              
              <Select onValueChange={handleSelectVehicle}>
                <SelectTrigger className="h-12 rounded-xl border-zinc-200 bg-white text-sm font-semibold focus:ring-black">
                  <SelectValue placeholder="-- Pilih Model Honda --" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="font-bold text-blue-600">Semua Model</SelectItem>
                  {motorcycles?.map(m => (
                    <SelectItem key={m.id} value={m.id} className="font-medium">{(m as any).name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="mt-4 flex flex-wrap gap-2 justify-start">
                {['Beat', 'Vario', 'PCX', 'CRF'].map((label) => (
                  <button
                    key={label}
                    onClick={() => {
                      const found = motorcycles?.find(m => (m as any).name.toLowerCase().includes(label.toLowerCase()));
                      if (found) handleSelectVehicle(found.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-[11px] font-bold hover:bg-zinc-100 transition-all active:scale-95"
                  >
                    {label}
                  </button>
                ))}
                <button 
                  onClick={() => router.push('/motor')}
                  className="px-3 py-1.5 rounded-lg bg-black text-white text-[11px] font-bold hover:bg-zinc-800 transition-all"
                >
                  Lihat Semua
                </button>
              </div>

              <p className="text-[10px] text-zinc-400 mt-3.5 flex items-center gap-2">
                <Target className="w-3 h-3 text-blue-500" />
                Pilih model untuk detail lengkap & simulasi kredit instan.
              </p>
            </div>
          </div>
          
          <div className="mt-8 animate-bounce">
            <ChevronDown className="text-zinc-300 w-5 h-5" />
          </div>
        </section>

        {/* ========== LINEUP – Compact Grid ========== */}
        <section className="px-4 py-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-6">
              <div className="space-y-0.5">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                  <Orbit className="w-3 h-3" /> {t('lineup_title')}
                </h2>
                <p className="text-xl font-bold tracking-tight">Koleksi Performa</p>
              </div>
              <Link href="/motor" className="text-[10px] font-bold text-blue-600 inline-flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest">
                {t('lineup_view_all')} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-200" />
              </div>
            ) : featuredBikes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {featuredBikes.map((bike: any) => (
                  <MotorcycleCard key={bike.id} bike={bike} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-zinc-50 border-zinc-100">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                  {t('lineup_empty') || 'Syncing Lineup...'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ========== CONTACT CTA – Conversion ========== */}
        <section className="px-4 py-12 text-center bg-zinc-50">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
              Siap miliki motor impian?
            </h2>
            <p className="text-xs md:text-base text-zinc-500 leading-relaxed">
              Hubungi advisor sales Evan Honda sekarang untuk penawaran terbaik.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Button size="lg" className="bg-black text-white h-12 px-8 rounded-xl text-xs font-bold shadow-lg shadow-black/5" asChild>
                <a href="https://wa.me/6281112345678">WhatsApp Kami</a>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 rounded-xl text-xs font-bold bg-white border-zinc-200" asChild>
                <Link href="/dealer">Cari Dealer</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <div className="h-8 md:hidden" />
    </div>
  );
}