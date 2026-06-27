"use client";

import { useState, useMemo } from "react";
import { CreditCalculator } from "@/components/CreditCalculator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Loader2, Bike, Shield, Clock } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query } from "firebase/firestore";

export default function CreditSimulationPage() {
  const { t } = useLanguage();
  const db = useFirestore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const bikesQuery = useMemo(
    () => (db ? query(collection(db, "motorcycles")) : null),
    [db]
  );
  const { data: motorcycles, loading } = useCollection(bikesQuery);

  const selectedMotorcycle = useMemo(() => {
    if (!motorcycles || motorcycles.length === 0) return null;
    if (!selectedId) return motorcycles[0];
    return motorcycles.find((m) => m.id === selectedId) || motorcycles[0];
  }, [motorcycles, selectedId]);

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-300" />
      </div>
    );
  }

  // ---------- Empty state ----------
  if (!selectedMotorcycle) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-white px-6 text-center">
        <Bike className="w-8 h-8 text-neutral-200 mb-4" />
        <h1 className="text-xl font-semibold text-neutral-900">
          Belum ada unit tersedia
        </h1>
        <p className="text-sm text-neutral-500 mt-2 max-w-xs">
          Silakan tambahkan model motor melalui panel admin.
        </p>
      </div>
    );
  }

  const price = selectedMotorcycle.startingPrice;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header kecil – tenang & informatif */}
        <div className="flex items-center gap-2 mb-10">
          <Calculator className="w-4 h-4 text-neutral-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            {t("simulation_title")}
          </span>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-8">
          {/* Kolom kiri – Pemilih kendaraan & info ringkas */}
          <div className="space-y-5">
            {/* Kartu pemilih */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-5 md:p-6 shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.02)]">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-2 block">
                {t("apply_model_label")}
              </Label>
              <Select
                onValueChange={(id) => setSelectedId(id)}
                defaultValue={selectedMotorcycle.id}
              >
                <SelectTrigger className="h-12 rounded-xl text-sm font-medium border-neutral-200 bg-neutral-50/50 focus:ring-1 focus:ring-black/5 focus:border-black/20 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-neutral-100 shadow-lg">
                  {motorcycles?.map((m) => (
                    <SelectItem
                      key={m.id}
                      value={m.id}
                      className="text-sm font-medium py-2.5 focus:bg-neutral-50 cursor-pointer"
                    >
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dua badge kecil */}
            <div className="flex flex-wrap gap-2.5 text-[11px] font-semibold">
              <div className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200/80 px-3 py-2 rounded-lg text-neutral-700">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Approval 24 jam
              </div>
              <div className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200/80 px-3 py-2 rounded-lg text-neutral-700">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                Fixed 8,5% p.a
              </div>
            </div>

            {/* Harga & nama ditampilkan bersih */}
            <div className="border-t border-neutral-100 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Harga OTR
              </p>
              <p className="text-2xl font-semibold text-neutral-900 mt-1 leading-tight">
                Rp {price?.toLocaleString("id-ID")}
              </p>
              <p className="text-sm text-neutral-500 mt-0.5 font-medium">
                {selectedMotorcycle.name}
              </p>
            </div>
          </div>

          {/* Kolom kanan – Kalkulator kredit */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 md:p-6 shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.02)]">
            <CreditCalculator
              initialPrice={price}
              motorcycleName={selectedMotorcycle.name}
            />
          </div>
        </div>

        {/* Syarat – footer mini */}
        <div className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400 flex items-center gap-2">
          <Shield className="w-3 h-3" />
          Syarat: KTP, KK, Slip Gaji, Rekening Listrik
        </div>
      </div>
    </div>
  );
}