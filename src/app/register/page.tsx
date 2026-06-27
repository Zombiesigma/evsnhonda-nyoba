"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login as registration is disabled via UI
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin h-8 w-8 text-zinc-200" />
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
        Redirecting to Security Portal...
      </p>
    </div>
  );
}