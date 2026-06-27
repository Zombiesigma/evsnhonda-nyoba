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
    <div className="bg-white text-neutral-900">
      <main>
        {/* ========== HERO – Minimalist Atmospheric Wash ========== */}
        <section
          className="relative min-h-[55vh] flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 50% -20%, #e8f3ff 0%, rgba(255,255,255,0) 60%), #ffffff",
          }}
        >
          <div className="max-w-2xl w-full text-center space-y-10 relative z-10">
            {/* Elegant simplified heading */}
            <div className="space-y-0.5">
              <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-none text-neutral-950 uppercase">
                Evan <span className="text-neutral-200">Honda</span>
              </h1>
            </div>

            {/* Elegant Search Selector */}
            <div className="max-w-md mx-auto w-full pt-4">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button className="w-full h-12 flex items-center justify-between rounded-xl border border-neutral-100 bg-white/40 backdrop-blur-md px-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:bg-white hover:border-neutral-200 transition-all shadow-sm group">
                    <div className="flex items-center gap-4 truncate">
                      <Search className="h-3.5 w-3.5 shrink-0 text-neutral-300 group-hover:text-black transition-colors" />
                      <span>Search unit (PCX, Beat, CRF…)</span>
                    </div>
                    <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 text-neutral-200" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[calc(100vw-48px)] md:w-[448px] p-0 rounded-xl border-neutral-100 shadow-2xl overflow-hidden"
                  align="center"
                >
                  <div className="flex items-center border-b border-neutral-50 px-4 bg-neutral-50/30 h-11">
                    <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-neutral-300" />
                    <Input
                      placeholder="Ketik nama unit..."
                      className="h-full w-full border-none bg-transparent focus-visible:ring-0 text-xs font-bold placeholder:text-neutral-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
                      >
                        <X className="h-3 w-3 text-neutral-300" />
                      </button>
                    )}
                  </div>
                  <ScrollArea className="h-[240px]">
                    <div className="p-1">
                      <button
                        onClick={() => handleSelectVehicle("all")}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors text-left uppercase tracking-widest"
                      >
                        <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center">
                          <Orbit className="h-3.5 w-3.5 text-neutral-400" />
                        </div>
                        Lihat Katalog Lengkap
                      </button>

                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-4 w-4 animate-spin text-neutral-200" />
                        </div>
                      ) : filteredMotorcycles.length === 0 ? (
                        <div className="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                          Unit Tidak Ditemukan
                        </div>
                      ) : (
                        filteredMotorcycles.map((m: any) => (
                          <button
                            key={m.id}
                            onClick={() => handleSelectVehicle(m.id)}
                            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 rounded-lg transition-colors group text-left"
                          >
                            <div className="flex flex-col">
                              <span className="text-neutral-900 font-bold text-xs">{m.name}</span>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-300">
                                {m.category}
                              </span>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-neutral-200 opacity-0 group-hover:opacity-100 transition-all" />
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {/* Minimalist Quick Pills */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['Beat', 'Vario', 'PCX', 'CRF'].map((label) => (
                  <button
                    key={label}
                    onClick={() => {
                      const found = motorcycles?.find((m: any) =>
                        m.name.toLowerCase().includes(label.toLowerCase())
                      );
                      if (found) handleSelectVehicle(found.id);
                    }}
                    className="px-3 py-1 rounded-md bg-white border border-neutral-100 text-[9px] font-bold uppercase tracking-widest text-neutral-400 hover:text-blue-600 hover:border-blue-100 transition-all"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== LINEUP – High Performance Grid ========== */}
        <section className="px-6 py-10 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-6">
              <div className="space-y-1">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300 flex items-center gap-2">
                  <Orbit className="w-2.5 h-2.5" /> High Performance
                </h2>
                <p className="text-xl font-bold tracking-tight text-neutral-950">Koleksi Terpilih</p>
              </div>
              <Link
                href="/motor"
                className="text-[10px] font-bold text-neutral-950 border-b border-neutral-950 inline-flex items-center gap-1.5 pb-0.5 uppercase tracking-widest hover:text-neutral-400 hover:border-neutral-200 transition-all"
              >
                Katalog <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-100" />
              </div>
            ) : featuredBikes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {featuredBikes.map((bike: any) => (
                  <MotorcycleCard key={bike.id} bike={bike} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-neutral-100 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-200">
                  Sinkronisasi Data…
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ========== CONTACT CTA – Focused & Clean ========== */}
        <section className="px-6 py-16 text-center border-t border-neutral-50 bg-neutral-50/30">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-12 h-12 bg-neutral-950 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-black/5">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-950">
                Konsultasi Personal
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                Terhubung langsung dengan Sales Advisor kami.
              </p>
            </div>
            <div className="pt-2">
              <Button
                size="lg"
                className="bg-neutral-950 text-white h-12 px-10 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-neutral-800 transition-colors"
                asChild
              >
                <a href="https://wa.me/6281112345678">WhatsApp Support</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
