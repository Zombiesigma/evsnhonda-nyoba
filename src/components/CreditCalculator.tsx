
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calculator, Wallet, Calendar } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { LeasingRow } from '@/app/lib/motorcycles';
import { cn } from '@/lib/utils';

interface CreditCalculatorProps {
  initialPrice?: number;
  motorcycleName?: string;
  hideHeader?: boolean;
  leasingTable?: LeasingRow[];
  onDpChange?: (dp: number) => void;
}

export function CreditCalculator({ 
  initialPrice = 0, 
  motorcycleName, 
  hideHeader, 
  leasingTable,
  onDpChange 
}: CreditCalculatorProps) {
  const { t, language } = useLanguage();
  const [price, setPrice] = useState(initialPrice);
  const [dpAmountInput, setDpAmountInput] = useState(0);
  const [tenure, setTenure] = useState(35);
  
  const lastEmittedDp = useRef<number | null>(null);

  useEffect(() => {
    if (initialPrice > 0) {
      setPrice(initialPrice);
      const defaultDp = Math.round(initialPrice * 0.20);
      setDpAmountInput(defaultDp);
    }
  }, [initialPrice]);

  const dpPercentage = useMemo(() => {
    if (price <= 0) return 20;
    return Math.round((dpAmountInput / price) * 100);
  }, [dpAmountInput, price]);

  useEffect(() => {
    if (onDpChange && dpPercentage !== lastEmittedDp.current) {
      lastEmittedDp.current = dpPercentage;
      onDpChange(dpPercentage);
    }
  }, [dpPercentage, onDpChange]);

  const finalInstallment = useMemo(() => {
    if (price <= 0) return 0;
    
    if (leasingTable && leasingTable.length > 0) {
      const sortedTable = [...leasingTable].sort((a, b) => Math.abs(a.dp - dpAmountInput) - Math.abs(b.dp - dpAmountInput));
      const closestRow = sortedTable[0];
      const val = closestRow.installments[tenure.toString()];
      if (val) return val;
    }

    const principal = price - dpAmountInput;
    const annualRate = tenure <= 12 ? 0.085 : tenure <= 24 ? 0.095 : 0.105;
    const totalInterest = principal * annualRate * (tenure / 12);
    return Math.round((principal + totalInterest) / tenure);
  }, [price, dpAmountInput, tenure, leasingTable]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', { 
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0 
    }).format(val);

  if (price <= 0) return null;

  return (
    <Card className="border-zinc-100 bg-white shadow-sm rounded-2xl md:rounded-3xl overflow-hidden border">
      {!hideHeader && (
        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6 md:py-6 md:px-8">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5 md:space-y-1">
              <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <Calculator className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                {t('calc_title')}
              </CardTitle>
              <CardDescription className="text-[10px] md:text-xs text-zinc-400 font-medium tracking-tight">
                {t('calc_subtitle')} <span className="text-black font-bold">{motorcycleName}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-6 md:space-y-8 p-6 md:p-8">
        <div className="space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <Label className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Wallet className="w-3 h-3 md:w-3.5 md:h-3.5" /> {t('calc_dp')} ({dpPercentage}%)
            </Label>
            <span className="font-mono font-bold text-sm md:text-base">{formatCurrency(dpAmountInput)}</span>
          </div>
          <Slider 
            value={[dpAmountInput]} 
            onValueChange={(v) => setDpAmountInput(v[0])} 
            min={Math.round(price * 0.15)} 
            max={Math.round(price * 0.6)} 
            step={100000}
            className="py-1 md:py-2"
          />
        </div>

        <div className="space-y-3 md:space-y-4">
          <Label className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" /> {t('calc_tenure')}
          </Label>
          <div className="grid grid-cols-5 gap-1.5 md:gap-2">
            {[11, 17, 23, 29, 35].map((tVal) => (
              <button 
                key={tVal}
                aria-label={`Select tenure ${tVal} months`}
                className={cn(
                  "h-9 md:h-11 rounded-lg md:rounded-xl border text-[10px] md:text-xs font-bold transition-all",
                  tenure === tVal ? 'border-black bg-black text-white shadow-lg' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'
                )}
                onClick={() => setTenure(tVal)}
              >
                {tVal}x
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 md:pt-8 border-t border-zinc-100 bg-zinc-50 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 text-center">
            <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 md:mb-2">{t('calc_installment')}</p>
            <h3 className="text-2xl md:text-5xl font-bold text-black font-mono tracking-tighter leading-none">
              {formatCurrency(finalInstallment)}
            </h3>
        </div>
      </CardContent>
    </Card>
  );
}
