import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/app/context/LanguageContext';
import { FirebaseClientProvider } from '@/firebase';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Evan Honda Selamat Motor | Official Experience',
  description: 'Jelajahi koleksi motor Honda terbaru, simulasi kredit instan, dan layanan dealer resmi Honda Selamat Motor.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-white text-[#171717] min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster />
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
