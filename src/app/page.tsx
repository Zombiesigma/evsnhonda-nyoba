
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MotorcycleCard } from "@/components/MotorcycleCard";
import { ArrowRight, Loader2, Target, Orbit, ChevronDown, Search, X } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    <div className="bg-white text-[#171717]">
      <main>
        {/* ========== HERO ========== */}
        <section className="min-h-[70vh] md:min-h-[60vh] sky-gradient-wash flex flex-col items-center justify-center px-6 pt-20 pb-10 relative overflow-hidden">
          <div className="max-w-3xl w-full text-center space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-sm animate-expo-entry">
              <div className="pulse-dot" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                PROMO EKSKLUSIF • BUNGA MULAI 2.99%
              </span>
            </div>

            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-[0.95] animate-expo-entry" style={{ animationDelay: '100ms' }}>
              Temukan Honda <br />
              <span className="text-zinc-300 font-medium italic">Impian Anda</span>
            </h1>
            
            <p className="text-[12px] md:text-base text-zinc-500 max-w-sm md:max-w-md mx-auto leading-relaxed animate-expo-entry" style={{ animationDelay: '200ms' }}>
              Personalisasi pengalaman berkendara Anda dengan simulasi kredit instan dan katalog unit terlengkap di Evan Honda.
            </p>

            {/* Compact Searchable Selector */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-zinc-100/50 p-4 md:p-6 shadow-selector animate-expo-entry text-left w-full mt-6" style={{ animationDelay: '250ms' }}>
              <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2.5 block px-1">
                Pilih Model Kendaraan
              </label>
              
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-between rounded-xl border-zinc-200 bg-white text-sm font-bold hover:bg-zinc-50 px-4 transition-all"
                  >
                    <div className="flex items-center gap-2 truncate text-zinc-600">
                      <Search className="h-4 w-4 shrink-0 opacity-40" />
                      <span>Cari motor (PCX, Beat, CRF...)</span>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-48px)] md:w-[600px] p-0 rounded-2xl border-zinc-100 shadow-2xl overflow-hidden" align="start">
                  <div className="flex items-center border-b px-4 bg-zinc-50/50 h-12">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-30" />
                    <Input
                      placeholder="Ketik nama unit..."
                      className="h-full w-full border-none bg-transparent focus-visible:ring-0 text-sm font-bold"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="p-1.5 hover:bg-zinc-200 rounded-full transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <ScrollArea className="h-[280px]">
                    <div className="p-1">
                      <button
                        onClick={() => handleSelectVehicle("all")}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-zinc-900 hover:bg-zinc-50 rounded-xl transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                          <Orbit className="h-4 w-4" />
                        </div>
                        Lihat Katalog Lengkap
                      </button>
                      
                      {loading ? (
                        <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-zinc-200" /></div>
                      ) : filteredMotorcycles.length === 0 ? (
                        <div className="py-10 text-center text-xs text-zinc-400 font-bold uppercase tracking-widest">Model Tidak Ditemukan</div>
                      ) : (
                        filteredMotorcycles.map((m: any) => (
                          <button
                            key={m.id}
                            onClick={() => handleSelectVehicle(m.id)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 rounded-xl transition-colors group text-left"
                          >
                            <div className="flex flex-col">
                              <span className="text-zinc-900 font-bold text-sm">{m.name}</span>
                              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{m.category} Node</span>
                            </div>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all text-zinc-400" />
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              <div className="mt-3.5 flex flex-wrap gap-2">
                {['Beat', 'Vario', 'PCX', 'CRF'].map((label) => (
                  <button
                    key={label}
                    onClick={() => {
                      const found = motorcycles?.find(m => (m as any).name.toLowerCase().includes(label.toLowerCase()));
                      if (found) handleSelectVehicle(found.id);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-zinc-50 border border-zinc-100 text-[10px] font-bold hover:bg-zinc-100 transition-all uppercase tracking-widest text-zinc-500"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== LINEUP ========== */}
        <section className="px-6 py-12 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div className="space-y-1">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-300 flex items-center gap-2">
                  <Orbit className="w-3 h-3" /> LATEST LINEUP
                </h2>
                <p className="text-2xl font-bold tracking-tight">Koleksi Terpilih</p>
              </div>
              <Link href="/motor" className="text-[10px] font-bold text-black border-b border-black inline-flex items-center gap-1.5 pb-0.5 uppercase tracking-widest hover:text-zinc-400 hover:border-zinc-200 transition-all">
                {t('lineup_view_all')} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-zinc-100" /></div>
            ) : featuredBikes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {featuredBikes.map((bike: any) => (
                  <MotorcycleCard key={bike.id} bike={bike} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border rounded-2xl bg-zinc-50/50 border-dashed">
                <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-[0.2em]">Menunggu Sinkronisasi Data...</p>
              </div>
            )}
          </div>
        </section>

        {/* ========== CONTACT CTA ========== */}
        <section className="px-6 py-16 text-center border-t border-zinc-50 bg-zinc-50/30">
          <div className="max-w-xl mx-auto space-y-6">
             <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-black/10">
               <Target className="w-6 h-6" />
             </div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
              Mulai Perjalanan Anda
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto font-medium">
              Dapatkan konsultasi personal dengan sales advisor kami untuk penawaran terbaik hari ini.
            </p>
            <div className="pt-2">
              <Button size="lg" className="bg-black text-white h-12 md:h-14 px-10 rounded-xl text-xs font-bold shadow-2xl shadow-black/10 hover:scale-105 transition-transform" asChild>
                <a href="https://wa.me/6281112345678">WhatsApp Support</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
