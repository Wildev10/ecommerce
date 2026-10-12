import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import HydrationProvider from '@/components/providers/hydration-provider';
import ClientLayout from '@/components/layout/ClientLayout';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'E-Shop Bénin — Votre marketplace de confiance',
  description: 'Des milliers de produits authentiques livrés partout au Bénin. Paiement sécurisé MTN MoMo & Moov Money.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={font.variable}>
      <body className="bg-[var(--background)] min-h-screen flex flex-col">
        <HydrationProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </HydrationProvider>
      </body>
    </html>
  );
}
