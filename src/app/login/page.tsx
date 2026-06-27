"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 md:p-6 relative overflow-hidden">
      {/* Background Decor (Desktop only) */}
      <div className="hidden md:block absolute top-0 left-0 w-full h-full sky-gradient-wash opacity-50 pointer-events-none"></div>

      <Card className="w-full max-w-md shadow-xl md:shadow-2xl border-none rounded-2xl md:rounded-3xl z-10 bg-white md:bg-white/80 md:backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center pb-6 pt-8 md:pt-12">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-black text-white rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg md:shadow-xl shadow-black/10">
            <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl md:text-4xl font-bold tracking-tight">Command Center</CardTitle>
            <CardDescription className="text-xs md:text-sm text-gray-400 font-medium">
              Authorized Personnel Only
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8 md:px-8 md:pb-12">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-300" />
                <Input
                  type="email"
                  placeholder="admin@evanhonda.com"
                  className="pl-10 md:pl-12 h-12 md:h-14 rounded-xl md:rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm md:text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-300" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 md:pl-12 h-12 md:h-14 rounded-xl md:rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm md:text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 md:h-14 bg-black text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-lg shadow-lg md:shadow-xl shadow-black/20 hover:scale-[1.02] transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign In to Portal"}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
              Contact root admin for new access
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="absolute bottom-6 text-center w-full text-[10px] text-gray-300 font-bold uppercase tracking-widest">
        © {new Date().getFullYear()} EVAN HONDA SELAMAT MOTOR
      </div>
    </div>
  );
}
