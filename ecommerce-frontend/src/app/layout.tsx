import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import HydrationProvider from '@/components/providers/hydration-provider';
import ClientLayout from '@/components/layout/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-Shop Bénin - Votre boutique en ligne',
  description: 'Découvrez nos produits de qualité à prix compétitifs. Livraison au Bénin.',
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
          <ClientLayout>
            {children}
          </ClientLayout>
        </HydrationProvider>
      </body>
    </html>
  );
}
