"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MotorcycleCard } from "@/components/MotorcycleCard";
import { ArrowRight, Loader2, Target, Orbit, ChevronDown, Search, X } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlaceHolderImages } from "@/lib/placeholder-images";

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

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-honda')?.imageUrl || "https://ik.imagekit.io/zlt25mb52fx/assets/images/logo/ahm.svg";

  return (
    <div className="bg-white text-neutral-900">
      <main>
        {/* ========== HERO – Atmospheric Visual Background ========== */}
        <section className="relative min-h-[65vh] flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden">
          {/* Background Image with Layered Overlay */}
          <div className="absolute inset-0 z-0">
            <Image 
              src={heroImage}
              alt="Honda Experience"
              fill
              className="object-cover"
              priority
              data-ai-hint="honda motorcycle"
            />
            {/* Elegant Gradient Wash for readability */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/40 to-white" />
          </div>

          <div className="max-w-3xl w-full text-center space-y-10 relative z-10">
            {/* Elegant heading */}
            <div className="space-y-0.5">
              <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-none text-neutral-950 uppercase">
                Evan <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-600 via-neutral-500 to-neutral-700">Honda</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-500 mt-4 opacity-70">
                Official Honda Experience Center
              </p>
            </div>
          </div>

          {/* Elegant Search Selector */}
          <div className="max-w-md mx-auto w-full pt-4">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button className="w-full h-14 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl px-6 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:bg-white hover:border-black/10 transition-all shadow-2xl shadow-black/5 group">
                  <div className="flex items-center gap-4 truncate">
                    <Search className="h-4 w-4 shrink-0 text-neutral-300 group-hover:text-black transition-colors" />
                    <span>Search unit (PCX, Beat, CRF…)</span>
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-neutral-200" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[calc(100vw-48px)] md:w-[448px] p-0 rounded-2xl border-neutral-100 shadow-2xl overflow-hidden"
                align="center"
              >
                <div className="flex items-center border-b border-neutral-50 px-4 bg-neutral-50/30 h-12">
                  <Search className="mr-2 h-4 w-4 shrink-0 text-neutral-300" />
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
                      className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-neutral-300" />
                    </button>
                  )}
                </div>
                <ScrollArea className="h-[280px]">
                  <div className="p-2">
                    <button
                      onClick={() => handleSelectVehicle("all")}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors text-left uppercase tracking-widest"
                    >
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                        <Orbit className="h-4 w-4 text-neutral-400" />
                      </div>
                      Lihat Katalog Lengkap
                    </button>

                    {loading ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-neutral-200" />
                      </div>
                    ) : filteredMotorcycles.length === 0 ? (
                      <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                        Unit Tidak Ditemukan
                      </div>
                    ) : (
                      filteredMotorcycles.map((m: any) => (
                        <button
                          key={m.id}
                          onClick={() => handleSelectVehicle(m.id)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 rounded-xl transition-colors group text-left"
                        >
                          <div className="flex flex-col">
                            <span className="text-neutral-900 font-bold text-sm">{m.name}</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-300">
                              {m.category}
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-neutral-200 opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            {/* Minimalist Quick Pills */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {['Beat', 'Vario', 'PCX', 'CRF'].map((label) => (
                <button
                  key={label}
                  onClick={() => {
                    const found = motorcycles?.find((m: any) =>
                      m.name.toLowerCase().includes(label.toLowerCase())
                    );
                    if (found) handleSelectVehicle(found.id);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-white/40 backdrop-blur-md border border-neutral-200/50 text-[9px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black hover:bg-white hover:border-neutral-300 transition-all"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ========== LINEUP – High Performance Grid ========== */}
        <section className="px-6 py-10 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div className="space-y-1">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300 flex items-center gap-2">
                  <Orbit className="w-3 h-3" /> High Performance
                </h2>
                <p className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-950">Koleksi Terpilih</p>
              </div>
              <Link
                href="/motor"
                className="text-[10px] font-bold text-neutral-950 border-b border-neutral-950 inline-flex items-center gap-2 pb-1 uppercase tracking-widest hover:text-neutral-400 hover:border-neutral-200 transition-all"
              >
                Katalog <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-100" />
              </div>
            ) : featuredBikes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {featuredBikes.map((bike: any) => (
                  <MotorcycleCard key={bike.id} bike={bike} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border border-dashed border-neutral-100 rounded-[32px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-200">
                  Sinkronisasi Data…
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ========== CONTACT CTA – Focused & Clean ========== */}
        <section className="px-6 py-20 text-center border-t border-neutral-50 bg-neutral-50/30">
          <div className="max-w-md mx-auto space-y-8">
            <div className="w-16 h-16 bg-neutral-950 rounded-[24px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-black/10">
              <Target className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-950">
                Konsultasi Personal
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 max-w-[280px] mx-auto leading-relaxed">
                Terhubung langsung dengan Sales Advisor resmi Honda Selamat Motor.
              </p>
            </div>
            <div className="pt-4">
              <Button
                size="lg"
                className="bg-neutral-950 text-white h-14 px-12 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl shadow-black/10 hover:bg-neutral-800 transition-colors"
                asChild
              >
                <a href="https://wa.me/6282112121707">WhatsApp Support</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
