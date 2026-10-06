'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifiedContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  if (status === 'success') {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email vérifié !</h1>
          <p className="text-gray-600 mt-2">
            Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Mon profil
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Accueil
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100">
          <AlertCircle className="h-12 w-12 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Déjà vérifié</h1>
          <p className="text-gray-600 mt-2">
            Votre adresse email est déjà vérifiée. Aucune action nécessaire.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100">
        <XCircle className="h-12 w-12 text-red-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lien invalide</h1>
        <p className="text-gray-600 mt-2">
          Ce lien de vérification est invalide ou a expiré. Connectez-vous pour en recevoir un nouveau.
        </p>
      </div>
      <Link
        href="/login"
        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Se connecter
      </Link>
    </div>
  );
}

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Suspense fallback={
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        }>
          <VerifiedContent />
        </Suspense>
      </div>
    </div>
  );
}
