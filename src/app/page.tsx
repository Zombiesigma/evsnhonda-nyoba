
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MotorcycleCard } from "@/components/MotorcycleCard";
import { ArrowRight, Loader2, Target, Orbit, ChevronDown, Search, X, Clock, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { DEALERS } from "@/app/lib/dealers";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { t } = useLanguage();
  const db = useFirestore();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const lineupQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'motorcycles'), orderBy('name', 'asc'));
  }, [db]);

  const { data: motorcycles, loading } = useCollection(lineupQuery);

  const featuredBikes = useMemo(() => {
    if (!motorcycles) return [];
    // Prefer featured ones if the flag exists, otherwise take first 4
    const featured = motorcycles.filter((m: any) => m.featured === true);
    return featured.length > 0 ? featured.slice(0, 4) : motorcycles.slice(0, 4);
  }, [motorcycles]);

  const filteredMotorcycles = useMemo(() => {
    if (!motorcycles) return [];
    if (!searchQuery) return motorcycles.slice(0, 10);
    return motorcycles.filter((m: any) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);
  }, [motorcycles, searchQuery]);

  const availablePills = useMemo(() => {
    if (!motorcycles) return [];
    const popular = ['Beat', 'Vario', 'PCX', 'CRF'];
    return popular.filter(label => 
      motorcycles.some((m: any) => m.name?.toLowerCase().includes(label.toLowerCase()))
    );
  }, [motorcycles]);

  const handleSelectVehicle = (id: string) => {
    if (!id) return;
    setOpen(false);
    if (id === "all") {
      router.push('/motor');
    } else {
      router.push(`/motor/${id}`);
    }
  };

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-honda')?.imageUrl || "https://picsum.photos/seed/honda1/1200/600";
  const mainDealer = DEALERS[0];

  return (
    <div className="bg-white text-neutral-900">
      <main>
        {/* ========== HERO – Reduced Height & Optimized Visuals ========== */}
        <section className="relative min-h-[50vh] md:min-h-[60vh] flex flex-col items-center justify-center px-6 pt-20 pb-12 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src={heroImage}
              alt="Honda Experience"
              fill
              className="object-cover"
              priority
              data-ai-hint="honda motorcycle"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/30 to-white" />
          </div>

          <div className="max-w-4xl w-full text-center space-y-8 relative z-10">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-none text-neutral-950 uppercase animate-in fade-in slide-in-from-bottom-4 duration-700">
                Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-500 to-neutral-300">Your Node</span>
              </h1>
              <p className="text-[10px] md:text-[12px] font-bold uppercase tracking-[0.4em] text-neutral-600 mt-2 opacity-80">
                Official Honda Experience Center
              </p>
            </div>

            <div className="max-w-md mx-auto w-full pt-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button className="w-full h-12 md:h-14 flex items-center justify-between rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-xl px-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:bg-white hover:border-black/20 transition-all shadow-xl shadow-black/5 group">
                    <div className="flex items-center gap-3 truncate">
                      <Search className="h-4 w-4 shrink-0 text-neutral-300 group-hover:text-black transition-colors" />
                      <span>{t('home_hero_search_hint')}</span>
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
                      placeholder="Ketik unit..."
                      className="h-full w-full border-none bg-transparent focus-visible:ring-0 text-xs font-bold placeholder:text-neutral-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="p-2 hover:bg-neutral-100 rounded-full">
                        <X className="h-4 w-4 text-neutral-300" />
                      </button>
                    )}
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => handleSelectVehicle("all")}
                        className="w-full flex items-center gap-3 px-3 py-3 text-[9px] font-bold text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors text-left uppercase tracking-widest"
                      >
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Orbit className="h-4 w-4 text-neutral-400" />
                        </div>
                        {t('home_hero_search_all')}
                      </button>

                      {loading ? (
                        <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-neutral-100" /></div>
                      ) : filteredMotorcycles.length === 0 ? (
                        <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-300">{t('home_hero_search_not_found')}</div>
                      ) : (
                        filteredMotorcycles.map((m: any) => (
                          <button
                            key={m.id}
                            onClick={() => handleSelectVehicle(m.id)}
                            className="w-full flex items-center gap-4 px-3 py-2.5 hover:bg-neutral-50 rounded-xl transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden relative shrink-0 border border-neutral-50">
                              <Image src={m.image?.startsWith('http') ? m.image : PlaceHolderImages[0].imageUrl} alt="" fill className="object-cover" sizes="40px" />
                            </div>
                            <div className="flex-1 flex flex-col text-left">
                              <span className="text-neutral-900 font-bold text-sm tracking-tight">{m.name}</span>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-300">{m.category}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-neutral-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              <div className="mt-5 flex flex-wrap gap-2 justify-center">
                {availablePills.map((label) => (
                  <button
                    key={label}
                    onClick={() => {
                      const found = motorcycles?.find((m: any) => m.name.toLowerCase().includes(label.toLowerCase()));
                      if (found) handleSelectVehicle(found.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-md border border-neutral-200/50 text-[9px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black hover:bg-white transition-all"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== FEATURED LINEUP – Grid Performance ========== */}
        <section className="px-6 py-12 md:py-20 bg-white border-b border-neutral-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div className="space-y-1">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300 flex items-center gap-2">
                  <Orbit className="w-3 h-3" /> {t('home_featured_badge')}
                </h2>
                <p className="text-2xl md:text-4xl font-bold tracking-tight text-neutral-950">{t('home_featured_title')}</p>
              </div>
              <Link
                href="/motor"
                className="text-[10px] font-bold text-neutral-950 border-b border-neutral-950 inline-flex items-center gap-2 pb-1 uppercase tracking-widest hover:text-neutral-400 hover:border-neutral-200 transition-all"
              >
                {t('home_featured_view_all')} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-[16/11] rounded-[24px]" />)}
              </div>
            ) : featuredBikes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {featuredBikes.map((bike: any) => (
                  <MotorcycleCard key={bike.id} bike={bike} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-neutral-100 rounded-[32px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-200">Data Pending...</p>
              </div>
            )}
          </div>
        </section>

        {/* ========== LOCATION – Maps & Physical Trust ========== */}
        <section className="px-6 py-16 md:py-24 bg-neutral-50/30">
          <div className="max-w-7xl mx-auto">
             <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 md:gap-20 items-center">
                <div className="space-y-8">
                   <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300">{t('home_location_title')}</h2>
                      <p className="text-3xl font-bold text-black tracking-tight">{mainDealer.name}</p>
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-start gap-4">
                         <MapPin className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                         <p className="text-sm font-medium text-neutral-500 leading-relaxed">{mainDealer.address}</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <Clock className="w-5 h-5 text-neutral-400 shrink-0" />
                         <p className="text-xs font-bold uppercase tracking-widest text-neutral-800">{t('home_contact_hours')}</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <Phone className="w-5 h-5 text-neutral-400 shrink-0" />
                         <p className="text-xs font-bold uppercase tracking-widest text-neutral-800">{t('home_contact_phone')}</p>
                      </div>
                   </div>
                   <Button asChild className="h-14 px-10 rounded-2xl bg-black text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-black/10">
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mainDealer.address)}`} target="_blank">Dapatkan Arah</a>
                   </Button>
                </div>
                <div className="aspect-video w-full rounded-[32px] overflow-hidden shadow-2xl shadow-black/5 border border-neutral-100 bg-white relative">
                   <iframe 
                      src={mainDealer.mapUrl}
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      title="Dealer Location"
                   />
                </div>
             </div>
          </div>
        </section>

        {/* ========== CONTACT CTA – Direct Link ========== */}
        <section className="px-6 py-20 text-center bg-white">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="w-16 h-16 bg-neutral-950 rounded-[24px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-black/10">
              <Target className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-950">{t('home_contact_title')}</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 max-w-[320px] mx-auto leading-relaxed">
                {t('home_contact_subtitle')}
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-neutral-950 text-white h-14 px-12 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl shadow-black/10 hover:bg-neutral-800 transition-colors"
                asChild
              >
                <a href={`https://wa.me/${mainDealer.whatsapp}`}>{t('home_contact_wa')}</a>
              </Button>
              <Button variant="outline" className="h-14 px-10 rounded-2xl border-neutral-200 text-[10px] font-bold uppercase tracking-widest">
                 {t('home_contact_phone')}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
