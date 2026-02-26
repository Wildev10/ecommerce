'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface PaymentSuccessProps {
  transactionId: string;
  orderId: number;
  amount: string;
  method: string;
}

export default function PaymentSuccess({ transactionId, orderId, amount, method }: PaymentSuccessProps) {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCheck(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center space-y-6 py-8">
      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 transition-all duration-700 ${showCheck ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Paiement réussi !</h2>
        <p className="text-gray-600 mt-2">Votre paiement a été traité avec succès</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-sm mx-auto">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Montant payé</span>
            <span className="font-bold text-gray-900">{amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Méthode</span>
            <span className="font-medium text-gray-900">
              {method === 'mtn_momo' ? 'MTN MoMo' : 'Moov Money'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">N° Transaction</span>
            <span className="font-mono text-sm font-medium text-gray-900">{transactionId}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm mx-auto">
        <p className="text-sm text-blue-800">
          📱 Un SMS de confirmation vous sera envoyé sur votre numéro de téléphone.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/orders/${orderId}`}
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Voir ma commande
        </Link>
        <Link
          href="/orders"
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Toutes mes commandes
        </Link>
      </div>
    </div>
  );
}
