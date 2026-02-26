'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ordersApi, paymentApi } from '@/lib/api';
import { formatPrice } from '@/lib/api-helpers';
import { useAuthStore } from '@/stores/auth-store';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import MomoForm, { validateBeninPhone } from '@/components/payment/MomoForm';
import PaymentSuccess from '@/components/payment/PaymentSuccess';
import type { Order } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Payment success state
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadOrder();
  }, [id, isAuthenticated]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getById(Number(id));
      setOrder(data);

      // Redirect if already paid
      if (data.payment_status === 'paid' || data.payment_status === 'completed') {
        toast.success('Cette commande a déjà été payée');
        router.push(`/orders/${id}`);
      }
    } catch {
      toast.error('Commande introuvable');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedMethod || !order) return;

    // Validate phone
    if (selectedMethod === 'mtn_momo' || selectedMethod === 'moov_money') {
      const error = validateBeninPhone(phoneNumber, selectedMethod as 'mtn_momo' | 'moov_money');
      if (error) {
        setPhoneError(error);
        return;
      }
      setPhoneError(null);
    }

    setProcessing(true);

    try {
      const cleanedPhone = '229' + phoneNumber.replace(/[\s-]/g, '');

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const response = await paymentApi.pay(order.id, {
        payment_method: selectedMethod === 'mtn_momo' || selectedMethod === 'moov_money'
          ? 'mobile_money'
          : selectedMethod,
        phone_number: cleanedPhone,
        amount: order.total,
      });

      const payment = response.data;
      setTransactionId(payment?.transaction_id || `TXN-${Date.now()}`);
      setPaymentSuccess(true);
      toast.success('Paiement effectué avec succès !');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors du paiement';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) return null;

  if (paymentSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <PaymentSuccess
          transactionId={transactionId}
          orderId={order.id}
          amount={formatPrice(order.total)}
          method={selectedMethod || ''}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href={`/orders/${order.id}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à la commande
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
        {/* Title */}
        <div className="text-center mb-8">
          <ShieldCheck className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Payer ma commande</h1>
          <p className="text-gray-500 text-sm mt-1">
            Commande #{order.order_number}
          </p>
        </div>

        {/* Processing overlay */}
        {processing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Traitement en cours...</h3>
              <p className="text-sm text-gray-600">
                📱 Vous allez recevoir une demande de confirmation sur votre téléphone.
                Entrez votre code PIN pour valider.
              </p>
              <div className="flex items-center justify-center space-x-1.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Payment method selection */}
          <PaymentMethodSelector
            selected={selectedMethod}
            onSelect={setSelectedMethod}
          />

          {/* Phone form for mobile money */}
          {(selectedMethod === 'mtn_momo' || selectedMethod === 'moov_money') && (
            <MomoForm
              method={selectedMethod}
              phoneNumber={phoneNumber}
              onPhoneChange={(val) => {
                setPhoneNumber(val);
                setPhoneError(null);
              }}
              error={phoneError}
            />
          )}

          {/* Order summary */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Récapitulatif</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Réduction</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Livraison</span>
                <span>{order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : 'Gratuite'}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total à payer</span>
                <span className="text-blue-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmitPayment}
            disabled={!selectedMethod || processing || (selectedMethod !== 'cash_on_delivery' && !phoneNumber)}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {processing ? (
              <span className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Traitement en cours...</span>
              </span>
            ) : (
              `Confirmer le paiement de ${formatPrice(order.total)}`
            )}
          </button>

          {/* Security note */}
          <div className="text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Paiement sécurisé. Vos informations sont protégées.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
