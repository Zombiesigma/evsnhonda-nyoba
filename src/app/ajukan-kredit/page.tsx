
"use client";

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, User, Bike, Loader2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import { CreditCalculator } from '@/components/CreditCalculator';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Form Validation Schema
const applicationSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit").regex(/^[0-9]+$/, "Hanya angka saja"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal('')),
  city: z.string().min(2, "Domisili minimal 2 karakter"),
  motorcycleId: z.string().min(1, "Silakan pilih unit motor"),
  dp: z.string(),
  tenure: z.string(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function CreditApplicationPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const db = useFirestore();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const bikesQuery = useMemo(() => db ? query(collection(db, 'motorcycles'), orderBy('name', 'asc')) : null, [db]);
  const { data: motorcycles, loading: bikesLoading } = useCollection(bikesQuery);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      motorcycleId: searchParams.get('motorId') || '',
      dp: searchParams.get('dp') || '20',
      tenure: searchParams.get('tenure') || '35',
      name: '',
      phone: '',
      email: '',
      city: '',
    }
  });

  const selectedMotorId = watch('motorcycleId');
  const selectedDp = watch('dp');
  const selectedTenure = watch('tenure');

  const selectedMotorcycle = useMemo(() => 
    motorcycles?.find(m => m.id === selectedMotorId), 
  [motorcycles, selectedMotorId]);

  const handleDpChange = useCallback((dp: number) => {
    setValue('dp', dp.toString(), { shouldValidate: true });
  }, [setValue]);

  const handleNextStep = () => {
    if (!selectedMotorId) {
      toast({ variant: "destructive", title: t('apply_error_select_motor') });
      return;
    }
    setStep(2);
  };

  const onFinalSubmit = async (data: ApplicationFormData) => {
    if (!db) return;
    setLoading(true);

    const submissionData = {
      ...data,
      motorcycleName: selectedMotorcycle?.name || data.motorcycleId,
      dpPercentage: Number(data.dp),
      tenure: Number(data.tenure),
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'creditApplications'), submissionData);
      setLoading(false);
      setStep(3);
    } catch (error: any) {
      setLoading(false);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'creditApplications',
        operation: 'create',
        requestResourceData: submissionData,
      }));
      toast({ variant: "destructive", title: t('apply_error_generic') });
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-8 md:pb-12 px-4 bg-[#fafafa]">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Step Indicator - Tighter for Mobile */}
        <div className="flex items-center justify-between max-w-[280px] md:max-w-xs mx-auto mb-6 md:mb-8">
          {[
            { num: 1, label: t('apply_step_unit') },
            { num: 2, label: t('apply_step_personal') },
            { num: 3, label: t('apply_step_success') }
          ].map((item) => (
            <div key={item.num} className="flex flex-col items-center gap-1.5 md:gap-2 group">
              <div className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm font-bold transition-all border-2",
                step === item.num ? 'bg-black text-white border-black shadow-lg scale-110' : 
                step > item.num ? 'bg-green-500 text-white border-green-500' : 'bg-white border-zinc-100 text-zinc-200'
              )}>
                {step > item.num ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : item.num}
              </div>
              <span className={cn(
                "text-[8px] md:text-[10px] font-bold uppercase tracking-widest",
                step === item.num ? 'text-black' : 'text-zinc-300'
              )}>{item.label}</span>
            </div>
          ))}
        </div>

        <Card className="shadow-xl md:shadow-2xl border-none rounded-2xl md:rounded-[32px] overflow-hidden bg-white">
          <CardContent className="p-0">
            {step === 1 && (
              <div className="p-6 md:p-12 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-1.5 md:space-y-2">
                   <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-black">{t('apply_step_unit')}</h2>
                   <p className="text-xs md:text-sm text-zinc-500 font-medium">{t('apply_subtitle')}</p>
                </div>

                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 md:gap-8">
                  <div className="space-y-5 md:space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('apply_model_label')}</Label>
                      <Select
                        disabled={bikesLoading}
                        value={selectedMotorId}
                        onValueChange={(v) => setValue('motorcycleId', v)}
                      >
                        <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl border-zinc-100 font-bold bg-zinc-50/50 text-sm">
                          <SelectValue placeholder={bikesLoading ? 'Loading...' : t('apply_model_label')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {motorcycles?.map(m => (
                            <SelectItem key={m.id} value={m.id} className="font-bold py-2.5 md:py-3 text-sm">{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.motorcycleId && <p className="text-[10px] text-red-500">{errors.motorcycleId.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-2">
                        <Label className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('calc_dp')} (%)</Label>
                        <Input
                          type="number"
                          {...register('dp')}
                          className="h-12 md:h-14 rounded-xl md:rounded-2xl border-zinc-100 font-bold bg-zinc-50/50 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('calc_tenure')}</Label>
                        <Select
                          value={selectedTenure}
                          onValueChange={(v) => setValue('tenure', v)}
                        >
                          <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl border-zinc-100 font-bold bg-zinc-50/50 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {[11, 17, 23, 29, 35].map(m => (
                              <SelectItem key={m} value={m.toString()} className="font-bold py-2.5 md:py-3 text-sm">
                                {m} {language === 'id' ? 'Bulan' : 'Months'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-zinc-100">
                    {selectedMotorcycle ? (
                      <CreditCalculator 
                        initialPrice={selectedMotorcycle.startingPrice}
                        motorcycleName={selectedMotorcycle.name}
                        hideHeader
                        onDpChange={handleDpChange}
                      />
                    ) : (
                      <div className="h-40 md:h-full flex flex-col items-center justify-center text-center p-4 md:p-8 space-y-3 md:space-y-4 text-zinc-300">
                        <Bike className="w-8 h-8 md:w-12 md:h-12 opacity-20" />
                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{t('apply_error_select_motor')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleNextStep}
                  disabled={!selectedMotorId}
                  className="w-full h-12 md:h-16 text-sm md:text-lg font-bold bg-black text-white rounded-xl md:rounded-2xl shadow-xl hover:scale-[1.01] transition-all"
                >
                  {t('apply_next')} <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit(onFinalSubmit)} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 md:p-12 space-y-6 md:space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 border-b border-zinc-50 pb-6 md:pb-8">
                    <div className="space-y-1.5 md:space-y-2">
                       <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-black">{t('apply_step_personal')}</h2>
                       <p className="text-xs md:text-sm text-zinc-500 font-medium">{t('apply_subtitle')}</p>
                    </div>
                    {selectedMotorcycle && (
                      <div className="bg-black text-white px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-lg space-y-0.5 md:space-y-1">
                        <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">{t('apply_summary_title')}</p>
                        <p className="font-bold text-xs md:text-sm">{selectedMotorcycle.name}</p>
                        <p className="text-[8px] md:text-[10px] font-bold text-blue-400">DP {selectedDp}% • {selectedTenure}M</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1">
                      <Label className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase">{t('apply_name_label')}</Label>
                      <Input 
                        {...register('name')}
                        disabled={loading}
                        className={cn("h-12 md:h-14 rounded-xl md:rounded-2xl border-zinc-100 bg-zinc-50 text-sm", errors.name && "border-red-500")} 
                      />
                      {errors.name && <p className="text-[9px] md:text-[10px] font-bold text-red-500">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase">{t('apply_phone_label')}</Label>
                      <Input 
                        {...register('phone')}
                        disabled={loading}
                        placeholder="0812..."
                        className={cn("h-12 md:h-14 rounded-xl md:rounded-2xl border-zinc-100 bg-zinc-50 text-sm", errors.phone && "border-red-500")} 
                      />
                      {errors.phone && <p className="text-[9px] md:text-[10px] font-bold text-red-500">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase">Email</Label>
                      <Input 
                        type="email" 
                        {...register('email')}
                        disabled={loading}
                        className={cn("h-12 md:h-14 rounded-xl md:rounded-2xl border-zinc-100 bg-zinc-50 text-sm", errors.email && "border-red-500")} 
                      />
                      {errors.email && <p className="text-[9px] md:text-[10px] font-bold text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase">{t('apply_city_label')}</Label>
                      <Input 
                        {...register('city')}
                        disabled={loading}
                        className={cn("h-12 md:h-14 rounded-xl md:rounded-2xl border-zinc-100 bg-zinc-50 text-sm", errors.city && "border-red-500")} 
                      />
                      {errors.city && <p className="text-[9px] md:text-[10px] font-bold text-red-500">{errors.city.message}</p>}
                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 p-4 md:p-5 rounded-xl md:rounded-2xl flex items-start gap-3 md:gap-4">
                     <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-blue-500 shrink-0" />
                     <p className="text-[10px] md:text-[11px] font-medium text-blue-700 leading-relaxed">
                       {language === 'id' 
                         ? 'Data Anda akan dienkripsi dan hanya digunakan untuk proses verifikasi kredit oleh dealer resmi Honda Selamat Motor.' 
                         : 'Your data will be encrypted and only used for credit verification processes by the official Honda Selamat Motor dealer.'}
                     </p>
                  </div>

                  <div className="flex gap-3 md:gap-4 pt-2 md:pt-4">
                    <Button type="button" variant="outline" disabled={loading} onClick={() => setStep(1)} className="h-12 md:h-14 rounded-xl md:rounded-2xl flex-1 font-bold text-xs md:text-sm">
                      <ArrowLeft className="h-4 w-4 mr-2" /> {t('apply_back')}
                    </Button>
                    <Button type="submit" disabled={loading} className="h-12 md:h-14 text-sm md:text-lg font-bold bg-black text-white rounded-xl md:rounded-2xl flex-[2] shadow-xl hover:scale-[1.01] transition-all">
                      {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4 md:h-5 md:w-5" /> : t('apply_submit')}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="text-center py-12 md:py-20 px-6 md:px-8 space-y-8 md:space-y-10 animate-in zoom-in duration-500">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-green-50 text-green-500 rounded-[30px] md:rounded-[40px] flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10 md:w-14 md:h-14" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <h2 className="text-2xl md:text-4xl font-extrabold text-black">{t('apply_success_title')}</h2>
                  <p className="text-xs md:text-sm text-zinc-500 font-medium max-w-xs md:max-w-sm mx-auto">
                    {t('apply_success_msg')} {t('apply_success_next_steps')}
                  </p>
                </div>
                <Button asChild variant="outline" className="rounded-xl md:rounded-2xl px-12 md:px-16 h-12 md:h-14 font-bold border-zinc-200 hover:bg-black hover:text-white transition-all text-sm">
                  <Link href="/">OK</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
