"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calculator, Wallet, Calendar } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { LeasingRow } from '@/app/lib/motorcycles';

interface CreditCalculatorProps {
  initialPrice?: number;
  motorcycleName?: string;
  hideHeader?: boolean;
  leasingTable?: LeasingRow[];
}

export function CreditCalculator({ initialPrice = 19425000, motorcycleName, hideHeader, leasingTable }: CreditCalculatorProps) {
  const { t, language } = useLanguage();
  const [price, setPrice] = useState(initialPrice);
  const [dpAmountInput, setDpAmountInput] = useState(0);
  const [tenure, setTenure] = useState(35);
  
  useEffect(() => {
    setPrice(initialPrice);
    if (leasingTable && leasingTable.length > 0) {
      setDpAmountInput(leasingTable[0].dp);
    } else {
      setDpAmountInput(Math.round(initialPrice * 0.25));
    }
  }, [initialPrice, leasingTable]);

  const dpPercentage = Math.round((dpAmountInput / price) * 100);

  const officialInstallment = useMemo(() => {
    if (!leasingTable || leasingTable.length === 0) return null;
    const sortedTable = [...leasingTable].sort((a, b) => Math.abs(a.dp - dpAmountInput) - Math.abs(b.dp - dpAmountInput));
    const closestRow = sortedTable[0];
    return closestRow.installments[tenure.toString()] || null;
  }, [leasingTable, dpAmountInput, tenure]);

  const estimatedInstallment = useMemo(() => {
    const principal = price - dpAmountInput;
    const annualRate = tenure <= 12 ? 0.035 : tenure <= 24 ? 0.045 : 0.055;
    const totalInterest = principal * annualRate * (tenure / 12);
    return Math.round((principal + totalInterest) / tenure);
  }, [price, dpAmountInput, tenure]);

  const finalInstallment = officialInstallment || estimatedInstallment;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', { 
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0 
    }).format(val);

  return (
    <Card className="border-zinc-100 bg-white shadow-selector rounded-3xl overflow-hidden">
      {!hideHeader && (
        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6 px-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <Calculator className="w-4 h-4" />
                </div>
                {t('calc_title')}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 font-medium tracking-tight">
                Estimasi pembayaran untuk <span className="text-black font-bold">{motorcycleName}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-8 p-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5" /> {t('calc_dp')} ({dpPercentage}%)
            </Label>
            <span className="font-mono font-bold text-base">{formatCurrency(dpAmountInput)}</span>
          </div>
          <Slider 
            value={[dpAmountInput]} 
            onValueChange={(v) => setDpAmountInput(v[0])} 
            min={Math.round(price * 0.15)} 
            max={Math.round(price * 0.6)} 
            step={500000}
            className="py-2"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> {t('calc_tenure')}
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {[11, 17, 23, 29, 35].map((tVal) => (
              <button 
                key={tVal}
                className={`h-11 rounded-xl border text-xs font-bold transition-all ${tenure === tVal ? 'border-black bg-black text-white shadow-lg' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'}`}
                onClick={() => setTenure(tVal)}
              >
                {tVal}x
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-100 bg-zinc-50 -mx-8 -mb-8 p-8 text-center">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t('calc_installment')}</p>
            <h3 className="text-4xl md:text-5xl font-bold text-black font-mono tracking-tighter leading-none">
              {formatCurrency(finalInstallment)}
            </h3>
        </div>
      </CardContent>
    </Card>
  );
}
