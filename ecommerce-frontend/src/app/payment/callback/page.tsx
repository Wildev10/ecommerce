'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { paymentApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { formatPrice } from '@/lib/api-helpers';
import Link from 'next/link';

type PaymentResult = {
  status: 'polling' | 'completed' | 'pending' | 'failed';
  orderNumber?: string;
  amount?: number;
  method?: string;
  transactionId?: string;
};

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const orderId = searchParams.get('order_id');

  const [result, setResult] = useState<PaymentResult>({ status: 'polling' });
  const [pollCount, setPollCount] = useState(0);

  const checkStatus = useCallback(async () => {
    if (!orderId) return;

    try {
      const data = await paymentApi.getStatus(Number(orderId));

      if (data.payment_status === 'paid' || data.payment?.status === 'completed') {
        setResult({
          status: 'completed',
          orderNumber: data.order_number,
          amount: data.payment?.amount,
          method: data.payment_method || data.payment?.method,
          transactionId: data.payment?.transaction_id,
        });
      } else if (data.payment?.status === 'failed') {
        setResult({
          status: 'failed',
          orderNumber: data.order_number,
          method: data.payment_method || data.payment?.method,
        });
      } else {
        setResult({
          status: 'pending',
          orderNumber: data.order_number,
          amount: data.payment?.amount,
          method: data.payment_method || data.payment?.method,
          transactionId: data.payment?.transaction_id,
        });
      }
    } catch {
      setResult({ status: 'failed' });
    }
  }, [orderId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!orderId) {
      router.push('/orders');
      return;
    }
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, isAuthenticated]);

  useEffect(() => {
    if (result.status !== 'pending' && result.status !== 'polling') return;
    if (pollCount >= 10) return;

    const timer = setTimeout(() => {
      setPollCount((c) => c + 1);
      checkStatus();
    }, 3000);
    return () => clearTimeout(timer);
  }, [result.status, pollCount, checkStatus]);

  if (result.status === 'polling') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  if (result.status === 'completed') {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paiement confirmé !</h1>
            <p className="text-gray-600 mt-2">Votre paiement a été traité avec succès.</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="space-y-3">
              {result.amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Montant payé</span>
                  <span className="font-bold text-gray-900">{formatPrice(result.amount)}</span>
                </div>
              )}
              {result.method && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Méthode</span>
                  <span className="font-medium text-gray-900">
                    {result.method === 'mtn_momo' ? 'MTN MoMo' :
                     result.method === 'moov_money' ? 'Moov Money' :
                     result.method === 'cash_on_delivery' ? 'Paiement à la livraison' :
                     result.method}
                  </span>
                </div>
              )}
              {result.transactionId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">N° Transaction</span>
                  <span className="font-mono text-sm font-medium text-gray-900">{result.transactionId}</span>
                </div>
              )}
            </div>
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
      </div>
    );
  }

  if (result.status === 'pending') {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100">
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paiement en attente</h1>
            <p className="text-gray-600 mt-2">
              Votre paiement est en cours de traitement. Vous recevrez une confirmation par email.
            </p>
          </div>

          {result.transactionId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                N° Transaction : <span className="font-mono font-medium">{result.transactionId}</span>
              </p>
            </div>
          )}

          {pollCount < 10 && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Vérification automatique en cours...</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/orders/${orderId}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Suivre ma commande
            </Link>
            <Link
              href="/orders"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Toutes mes commandes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiement échoué</h1>
          <p className="text-gray-600 mt-2">
            Le paiement n&apos;a pas pu être traité. Veuillez réessayer.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link
              href={`/orders/${orderId}/pay`}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Réessayer le paiement
            </Link>
          )}
          <Link
            href="/orders"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Mes commandes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
