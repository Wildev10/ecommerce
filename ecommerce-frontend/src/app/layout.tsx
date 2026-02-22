import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import HydrationProvider from '@/components/providers/hydration-provider';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-Commerce | Boutique en ligne',
  description: 'Votre boutique en ligne de confiance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        <HydrationProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </HydrationProvider>
      </body>
    </html>
  );
}
