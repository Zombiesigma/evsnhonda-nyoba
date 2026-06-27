"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Motorcycle } from '@/app/lib/motorcycles';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/app/context/LanguageContext';
import { ArrowRight, Orbit, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MotorcycleCardProps {
  bike: Motorcycle;
}

export function MotorcycleCard({ bike }: MotorcycleCardProps) {
  const { language, t } = useLanguage();
  
  const getImageUrl = () => {
    if (bike.image?.startsWith('http')) return bike.image;
    const galleryUrl = (bike.gallery || []).find(url => url.startsWith('http'));
    if (galleryUrl) return galleryUrl;
    return PlaceHolderImages.find(img => img.id === bike.image)?.imageUrl || PlaceHolderImages[0].imageUrl;
  };

  const imageUrl = getImageUrl();
  
  const formattedPrice = new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(bike.startingPrice || 0);

  const description = language === 'id' ? bike.description_id : bike.description_en;

  return (
    <div className="group bg-white rounded-[24px] border border-zinc-100 overflow-hidden hover:shadow-selector transition-all duration-500 animate-expo-entry hover:-translate-y-1">
      <Link href={`/motor/${bike.id}`} className="block relative aspect-[16/11] overflow-hidden bg-zinc-50">
        <Image 
          src={imageUrl} 
          alt={bike.name} 
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
           <span className="text-[8px] font-bold tracking-[0.2em] text-black bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full uppercase shadow-sm flex items-center gap-1.5">
             <Cpu className="w-2.5 h-2.5 text-blue-600" />
             {bike.category}
           </span>
        </div>
      </Link>
      
      <div className="p-5 space-y-4">
        <div className="space-y-1">
           <div className="flex justify-between items-baseline gap-2">
              <h3 className="font-bold text-lg text-black tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                {bike.name}
              </h3>
           </div>
           <p className="font-mono text-[14px] font-bold text-zinc-900 tracking-tight">{formattedPrice}</p>
        </div>
        
        <p className="text-zinc-500 leading-snug line-clamp-2 text-xs font-medium">
          {description || "Precision engineered infrastructure for your daily mobility."}
        </p>

        <div className="pt-4 border-t border-zinc-50 flex items-center justify-between">
           <Link href={`/motor/${bike.id}`} className="text-[10px] font-bold text-black hover:text-blue-600 transition-all uppercase tracking-widest flex items-center gap-1.5">
             Details <ArrowRight className="h-3 w-3" />
           </Link>
           <Button variant="ghost" className="h-8 px-4 rounded-lg border border-zinc-100 text-[10px] font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest" asChild>
             <Link href="/ajukan-kredit">Acquire</Link>
           </Button>
        </div>
      </div>
    </div>
  );
}