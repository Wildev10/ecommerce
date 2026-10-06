// src/components/providers/hydration-provider.tsx

'use client';

import { useSyncExternalStore, ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface HydrationProviderProps {
  children: ReactNode;
}

const emptySubscribe = () => () => {};

export default function HydrationProvider({ children }: HydrationProviderProps) {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#22c55e',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      {children}
    </>
  );
}
