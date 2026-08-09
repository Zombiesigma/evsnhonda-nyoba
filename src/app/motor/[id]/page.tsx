
"use client";

import { use, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CreditCalculator } from '@/components/CreditCalculator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ChevronLeft, Layers, FileText, CheckCircle2 } from 'lucide-react';
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
  const [dpPercentage, setDpPercentage] = useState(20);

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
    if (bike.variants && bike.variants[activeVariantIndex]) {
      const v = bike.variants[activeVariantIndex];
      return { ...v, price: Number(v.price || basePrice) };
    }
    return { name: 'Standard', price: basePrice, color: 'Base' };
  }, [bike, activeVariantIndex]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
    }).format(val);

  if (loading) return <DetailPageSkeleton />;

  if (!bike) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4 px-6 text-center">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight">{t('detail_not_found')}</h2>
      <Button asChild variant="outline" className="px-8 h-12 rounded-xl font-bold border-zinc-200">
        <Link href="/motor">{t('detail_back')}</Link>
      </Button>
    </div>
  );

  const specLabels: Record<string, string> = {
    engineType: language === 'id' ? 'Tipe Mesin' : 'Engine Type',
    displacement: language === 'id' ? 'Kapasitas' : 'Displacement',
    maxPower: language === 'id' ? 'Tenaga Maksimum' : 'Max Power',
    maxTorque: language === 'id' ? 'Torsi Maksimum' : 'Max Torque',
    fuelSystem: language === 'id' ? 'Sistem Bahan Bakar' : 'Fuel System',
    transmissionType: language === 'id' ? 'Tipe Transmisi' : 'Transmission',
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Link href="/motor" className="inline-flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-zinc-400 hover:text-black uppercase tracking-widest mb-6 md:mb-8 transition-colors">
          <ChevronLeft className="h-3 w-3" /> {t('detail_back')}
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
          {/* Visual Gallery */}
          <div className="space-y-4 md:space-y-6 lg:sticky lg:top-24">
            <div className="relative aspect-[16/11] bg-zinc-50 rounded-2xl md:rounded-[32px] overflow-hidden border border-zinc-100 shadow-sm group">
              <Image 
                src={finalGallery[activeImageIndex] || finalGallery[0]} 
                alt={bike.name} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute top-4 left-4 md:top-6 md:left-6">
                 <span className="px-3 py-1.5 md:px-4 md:py-2 bg-white/90 backdrop-blur-md rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest shadow-sm border border-white/50">
                   {bike.category} Unit
                 </span>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {finalGallery.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={cn(
                    "relative w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden border-2 shrink-0 transition-all",
                    activeImageIndex === idx ? 'border-black scale-105 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info & Simulation */}
          <div className="space-y-8 md:space-y-10">
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl md:text-6xl font-extrabold tracking-tighter leading-tight md:leading-none text-black">{bike.name}</h1>
              <p className="text-sm md:text-lg text-zinc-500 leading-relaxed font-medium">
                {language === 'id' ? bike.description_id : bike.description_en}
              </p>
            </div>

            {/* Price Card */}
            <div className="bg-black text-white rounded-2xl md:rounded-[24px] p-6 md:p-8 space-y-5 md:space-y-6 shadow-xl md:shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-0.5 md:mb-1 block">{t('detail_otr')}</span>
                  <p className="text-2xl md:text-3xl font-bold font-mono tracking-tight">{formatCurrency(activeVariant.price)}</p>
                </div>
                {bike.variants && bike.variants.length > 1 && (
                  <div className="text-right">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-0.5 md:mb-1 block">{t('detail_variant')}</span>
                    <p className="text-xs md:text-sm font-bold uppercase tracking-widest">{activeVariant.name}</p>
                  </div>
                )}
              </div>

              {/* Variant Selector */}
              {bike.variants && bike.variants.length > 1 && (
                <div className="flex flex-wrap gap-1.5 md:gap-2 pt-2 border-t border-white/10">
                  {bike.variants.map((v: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveVariantIndex(i)}
                      className={cn(
                        "px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all border",
                        activeVariantIndex === i 
                          ? "bg-white text-black border-white" 
                          : "bg-transparent text-white border-white/20 hover:border-white/50"
                      )}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Calculator Section */}
            <div className="space-y-4 md:space-y-6">
              <CreditCalculator
                initialPrice={activeVariant.price}
                motorcycleName={bike.name}
                leasingTable={bike.leasingTable}
                onDpChange={setDpPercentage}
              />
            </div>

            <div className="pt-2 md:pt-6">
               <Button className="w-full h-14 md:h-16 bg-black text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-xl shadow-black/10 hover:scale-[1.02] transition-all" asChild>
                 <Link href={`/ajukan-kredit?motorId=${bike.id}&variant=${activeVariantIndex}&dp=${dpPercentage}`}>
                   {t('detail_apply')}
                 </Link>
               </Button>
            </div>
          </div>
        </div>

        {/* Technical Data */}
        <section className="mt-12 md:mt-20 py-12 md:py-20 border-t border-zinc-100">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16">
            {/* Features */}
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-zinc-100 flex items-center justify-center">
                  <Layers className="w-4 h-4 md:w-5 md:h-5 text-black" />
                </div>
                {t('detail_features')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {(language === 'id' ? (bike.features_id || []) : (bike.features_en || [])).map((f: string, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 md:p-5 bg-white border border-zinc-100 rounded-xl md:rounded-2xl hover:border-black transition-all">
                    <span className="font-bold text-xs md:text-sm">{f}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Specs */}
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-zinc-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-black" />
                </div>
                {t('detail_technical')}
              </h2>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {Object.entries(specLabels).map(([key, label]) => {
                  const val = bike.specs?.[key];
                  if (!val) return null;
                  return (
                    <div key={key} className="bg-zinc-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-zinc-100">
                      <p className="text-[8px] md:text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-[10px] md:text-xs font-bold text-black">{val}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function DetailPageSkeleton() {
  return (
    <div className="min-h-screen pt-20 md:pt-28 px-4 md:px-8 space-y-8 md:space-y-12 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 md:gap-16">
        <Skeleton className="aspect-[16/11] rounded-2xl md:rounded-[32px]" />
        <div className="space-y-6 md:space-y-8">
          <Skeleton className="h-16 md:h-20 w-3/4 rounded-xl md:rounded-2xl" />
          <Skeleton className="h-24 md:h-32 rounded-2xl md:rounded-3xl" />
          <Skeleton className="h-48 md:h-64 rounded-2xl md:rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
