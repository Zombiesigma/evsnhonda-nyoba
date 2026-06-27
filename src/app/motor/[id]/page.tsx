
"use client";

import { use, useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CreditCalculator } from '@/components/CreditCalculator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, Plus, ShieldCheck, Loader2, Orbit, Cpu, Target, Layers, FileText } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function MotorcycleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, language } = useLanguage();
  const db = useFirestore();
  const { id } = use(params);

  const docRef = useMemo(() => id ? doc(db, 'motorcycles', id) : null, [db, id]);
  const { data: bike, loading } = useDoc(docRef);

  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const finalGallery = useMemo(() => {
    if (!bike) return [];
    let images: string[] = [];
    if (bike.image?.startsWith('http')) images.push(bike.image);
    const galleryUrls = (bike.gallery || []).filter((url: string) => url?.startsWith('http'));
    images = [...images, ...galleryUrls];
    if (images.length === 0) {
      const placeholder = PlaceHolderImages.find(img => img.id === bike.image)?.imageUrl || PlaceHolderImages[0].imageUrl;
      images.push(placeholder);
    }
    return images;
  }, [bike]);

  const activeVariant = useMemo(() => {
    if (!bike) return { name: 'Standard', price: 0, color: 'Base' };
    
    const basePrice = Number(bike.startingPrice || 0);
    
    // Attempt to get from variants array if available
    if (bike.variants && bike.variants[activeVariantIndex]) {
      const variant = bike.variants[activeVariantIndex];
      return {
        ...variant,
        price: Number(variant.price || basePrice)
      };
    }
    
    return { name: 'Standard', price: basePrice, color: 'Base' };
  }, [bike, activeVariantIndex]);

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin h-8 w-8 text-zinc-200" />
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">Loading Node...</p>
    </div>
  );

  if (!bike) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4 px-6 text-center">
      <h2 className="text-2xl font-bold tracking-tight">Vehicle Not Found</h2>
      <Button asChild variant="outline" className="px-8 h-12 rounded-2xl font-bold border-zinc-200">
        <Link href="/motor">Back to Catalog</Link>
      </Button>
    </div>
  );

  const specLabels: Record<string, string> = {
    engineType: 'Mesin', maxPower: 'Tenaga', displacement: 'Kapasitas', fuelSystem: 'Bahan Bakar',
    transmissionType: 'Transmisi', ignitionSystem: 'Pengapian'
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="min-h-screen bg-white text-[#171717] pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Link href="/motor" className="inline-flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-black uppercase tracking-widest mb-8 transition-colors">
          <ChevronLeft className="h-3 w-3" /> Back to Lineup
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Visual Gallery */}
          <div className="space-y-6 animate-expo-entry lg:sticky lg:top-24">
            <div className="relative aspect-[16/11] bg-zinc-50 rounded-[32px] overflow-hidden border border-zinc-100 shadow-sm">
              <Image 
                src={finalGallery[activeImageIndex] || finalGallery[0]} 
                alt={bike.name} 
                fill 
                className="object-cover"
                priority
              />
              <div className="absolute top-6 left-6">
                 <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border border-white/50">
                   {bike.category} Node
                 </span>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {finalGallery.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all",
                    activeImageIndex === idx ? 'border-black scale-105 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
                  )}
                >
                  <Image src={img} alt={`Asset ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info, Price, and Credit Simulation */}
          <div className="space-y-10 animate-expo-entry" style={{ animationDelay: '100ms' }}>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-none">{bike.name}</h1>
              <p className="text-base md:text-lg text-zinc-500 leading-relaxed font-medium">
                {language === 'id' ? bike.description_id : bike.description_en}
              </p>
            </div>

            <div className="bg-black text-white rounded-[24px] p-6 md:p-8 flex items-center justify-between shadow-2xl shadow-black/20">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1 block">OTR Jakarta</span>
                <p className="text-3xl font-bold font-mono tracking-tight">{formatCurrency(activeVariant.price)}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1 block">Variant</span>
                <p className="text-sm font-bold uppercase tracking-widest">{activeVariant.name}</p>
              </div>
            </div>

            <div className="space-y-6">
              <CreditCalculator
                initialPrice={activeVariant.price}
                motorcycleName={bike.name}
                leasingTable={bike.leasingTable}
              />
            </div>

            <div className="pt-6">
               <Button className="w-full h-16 bg-black text-white rounded-2xl font-bold text-lg shadow-xl shadow-black/10 hover:scale-[1.02] transition-transform active:scale-95" asChild>
                 <Link href="/ajukan-kredit">Mulai Pengajuan Kredit</Link>
               </Button>
            </div>
          </div>
        </div>

        {/* Detailed Specs & Features */}
        <section className="mt-20 py-20 border-t border-zinc-100">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-12">
               <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-black" />
                    </div>
                    Core Features
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(language === 'id' ? (bike.features_id || []) : (bike.features_en || [])).map((f: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-white border border-zinc-100 rounded-2xl hover:shadow-sm transition-all">
                        <span className="font-bold text-sm">{f}</span>
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-300">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-black" />
                  </div>
                  Technical Matrix
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(specLabels).map(([key, label]) => {
                    const val = bike.specs?.[key];
                    if (!val) return null;
                    return (
                      <div key={key} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-xs font-bold text-black">{val}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
