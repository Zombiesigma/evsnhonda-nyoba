
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MotorcycleCard } from "@/components/MotorcycleCard";
import { ArrowRight, Loader2, Target, Orbit, ChevronDown, Search, Check, X } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const { t } = useLanguage();
  const db = useFirestore();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const lineupQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'motorcycles'));
  }, [db]);

  const { data: motorcycles, loading } = useCollection(lineupQuery);

  const featuredBikes = useMemo(() => {
    if (!motorcycles) return [];
    return motorcycles.slice(0, 4);
  }, [motorcycles]);

  const filteredMotorcycles = useMemo(() => {
    if (!motorcycles) return [];
    if (!searchQuery) return motorcycles;
    return motorcycles.filter((m: any) => 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [motorcycles, searchQuery]);

  const handleSelectVehicle = (id: string) => {
    if (!id) return;
    setOpen(false);
    if (id === "all") {
      router.push('/motor');
    } else {
      router.push(`/motor/${id}`);
    }
  };

  return (
    <div className="bg-white text-[#171717] selection:bg-black selection:text-white">
      <main>
        {/* ========== HERO – Evan Honda Infrastructure ========== */}
        <section className="min-h-[80vh] md:min-h-[70vh] sky-gradient-wash flex flex-col items-center justify-center px-4 pt-16 pb-6 relative overflow-hidden">
          <div className="max-w-3xl w-full text-center space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/50 shadow-sm animate-expo-entry">
              <div className="pulse-dot" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                PROMO SPESIAL • BUNGA MULAI 2.99%
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-bold tracking-tight leading-[1] animate-expo-entry" style={{ animationDelay: '100ms' }}>
              Temukan <br />
              <span className="text-zinc-400 font-medium italic">Honda Impian</span> Anda
            </h1>
            
            <p className="text-[11px] md:text-base text-zinc-500 max-w-sm md:max-w-md mx-auto leading-relaxed animate-expo-entry" style={{ animationDelay: '200ms' }}>
              Pilih kendaraan Honda terbaik di Evan Honda. Simulasi kredit instan dan penawaran eksklusif menanti Anda.
            </p>

            {/* Searchable Selector Card */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-4 md:p-8 shadow-selector animate-expo-entry text-left w-full mt-4 md:mt-6" style={{ animationDelay: '250ms' }}>
              <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
                Cari & Pilih Kendaraan
              </label>
              
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-11 md:h-12 justify-between rounded-xl border-zinc-200 bg-white text-sm font-semibold hover:bg-zinc-50 px-4"
                  >
                    <div className="flex items-center gap-2 truncate text-zinc-600">
                      <Search className="h-4 w-4 shrink-0 opacity-50" />
                      <span>Cari model motor...</span>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-32px)] md:w-[600px] p-0 rounded-2xl border-zinc-100 shadow-2xl overflow-hidden" align="start">
                  <div className="flex items-center border-b px-3 bg-zinc-50/50">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      placeholder="Ketik nama motor (contoh: PCX, Beat)..."
                      className="h-12 w-full border-none bg-transparent focus-visible:ring-0 text-sm font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-zinc-200 rounded-full transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="p-1">
                      <button
                        onClick={() => handleSelectVehicle("all")}
                        className="w-full flex items-center gap-2 px-3 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center">
                          <Orbit className="h-4 w-4" />
                        </div>
                        Lihat Semua Model
                      </button>
                      
                      {loading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-5 w-5 animate-spin text-zinc-300" />
                        </div>
                      ) : filteredMotorcycles.length === 0 ? (
                        <div className="py-10 text-center text-sm text-zinc-400 font-medium">
                          Model tidak ditemukan.
                        </div>
                      ) : (
                        filteredMotorcycles.map((m: any) => (
                          <button
                            key={m.id}
                            onClick={() => handleSelectVehicle(m.id)}
                            className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium hover:bg-zinc-50 rounded-lg transition-colors group text-left border-b border-zinc-50 last:border-0"
                          >
                            <div className="flex flex-col">
                              <span className="text-zinc-900 font-bold">{m.name}</span>
                              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{m.category}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-500" />
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              <div className="mt-3 flex flex-wrap gap-1.5 md:gap-2 justify-start">
                {['Beat', 'Vario', 'PCX', 'CRF'].map((label) => (
                  <button
                    key={label}
                    onClick={() => {
                      const found = motorcycles?.find(m => (m as any).name.toLowerCase().includes(label.toLowerCase()));
                      if (found) handleSelectVehicle(found.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-[10px] md:text-[11px] font-bold hover:bg-zinc-100 transition-all active:scale-95"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <p className="text-[9px] md:text-[10px] text-zinc-400 mt-3 flex items-center gap-1.5">
                <Target className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-500" />
                Ketik nama unit untuk pencarian spesifik & simulasi kredit.
              </p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-8 animate-bounce opacity-20">
            <ChevronDown className="text-zinc-900 w-5 h-5" />
          </div>
        </section>

        {/* ========== LINEUP – Compact Grid ========== */}
        <section className="px-4 py-6 md:py-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-4 md:mb-6">
              <div className="space-y-0.5">
                <h2 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                  <Orbit className="w-3 h-3" /> KOLEKSI TERBARU
                </h2>
                <p className="text-lg md:text-xl font-bold tracking-tight">Performa Infrastruktur</p>
              </div>
              <Link href="/motor" className="text-[9px] md:text-[10px] font-bold text-blue-600 inline-flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest">
                {t('lineup_view_all')} <ArrowRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12 md:py-16">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-200" />
              </div>
            ) : featuredBikes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {featuredBikes.map((bike: any) => (
                  <MotorcycleCard key={bike.id} bike={bike} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-zinc-50 border-zinc-100">
                <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                  {t('lineup_empty') || 'Syncing Lineup...'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ========== CONTACT CTA – Conversion ========== */}
        <section className="px-4 py-8 md:py-12 text-center bg-zinc-50">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-lg md:text-3xl font-bold tracking-tight">
              Mulai Perjalanan Anda
            </h2>
            <p className="text-[10px] md:text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">
              Hubungi advisor sales Evan Honda sekarang untuk penawaran terbaik dan ketersediaan unit.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Button size="lg" className="bg-black text-white h-11 md:h-12 px-6 md:px-8 rounded-xl text-[10px] md:text-xs font-bold shadow-lg shadow-black/5" asChild>
                <a href="https://wa.me/6281112345678">WhatsApp Kami</a>
              </Button>
              <Button variant="outline" size="lg" className="h-11 md:h-12 px-6 md:px-8 rounded-xl text-[10px] md:text-xs font-bold bg-white border-zinc-200" asChild>
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
