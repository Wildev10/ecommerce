import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import HydrationProvider from '@/components/providers/hydration-provider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-Shop - Votre boutique en ligne',
  description: 'Découvrez nos produits de qualité à prix compétitifs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        <HydrationProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </HydrationProvider>
      </body>
    </html>
  );
}
