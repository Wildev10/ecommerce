'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ordersApi } from '@/lib/api';
import { formatPrice, formatDate, orderStatusLabels, orderStatusColors, paymentStatusColors } from '@/lib/api-helpers';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2, ArrowLeft, CreditCard, MapPin, Clock, Package, CheckCircle2 } from 'lucide-react';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

const paymentStatusLabel: Record<string, string> = {
  unpaid: 'Non payé',
  pending: 'En attente',
  paid: 'Payé',
  completed: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getById(Number(id));
      setOrder(data);
    } catch {
      toast.error('Commande introuvable');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    try {
      await ordersApi.cancel(order.id);
      toast.success('Commande annulée');
      loadOrder();
    } catch {
      toast.error("Impossible d'annuler cette commande");
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium mb-6 transition">
        <ArrowLeft className="h-4 w-4" /> Retour aux commandes
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Commande</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">#{order.order_number}</h1>
            <p className="text-sm text-slate-500 mt-1">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${orderStatusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
              {orderStatusLabels[order.status] || order.status}
            </span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${paymentStatusColors[order.payment_status] || 'bg-slate-100 text-slate-700'}`}>
              {paymentStatusLabel[order.payment_status] || order.payment_status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-slate-100">
          {(order.payment_status === 'unpaid' || order.payment_status === 'pending') && order.status !== 'cancelled' && (
            <Link
              href={`/orders/${order.id}/pay`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition"
            >
              <CreditCard className="h-4 w-4" />
              Payer maintenant
            </Link>
          )}
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-red-600 border-2 border-red-200 hover:bg-red-50 rounded-xl transition"
            >
              Annuler la commande
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Items + History */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Articles ({order.items?.length || 0})
            </h2>
            <div className="divide-y divide-slate-50">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="h-16 w-16 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product?.image_url ? (
                      <Image src={item.product.image_url} alt={item.product_name} width={64} height={64} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{item.product_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatPrice(item.product_price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-slate-800 shrink-0">{formatPrice(item.total)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status timeline */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Historique de la commande
              </h2>
              <div className="space-y-0">
                {order.status_history.map((entry, idx) => (
                  <div key={entry.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      </div>
                      {idx < order.status_history.length - 1 && (
                        <div className="w-0.5 h-8 bg-slate-100 my-1" />
                      )}
                    </div>
                    <div className="pb-4 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {orderStatusLabels[entry.old_status] || entry.old_status} → {orderStatusLabels[entry.new_status] || entry.new_status}
                      </p>
                      {entry.note && <p className="text-xs text-slate-500 mt-0.5">{entry.note}</p>}
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(entry.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary + Address + Payment */}
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-base font-bold text-slate-900 mb-4">Résumé</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total</span>
                <span className="font-medium text-slate-800">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span className="font-semibold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Livraison</span>
                <span className={order.shipping_fee === 0 ? 'text-green-600 font-semibold' : 'font-medium text-slate-800'}>
                  {order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : 'Gratuite'}
                </span>
              </div>
            </div>
            <div className="border-t border-slate-100 mt-3 pt-3 flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-blue-700 text-lg">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Delivery address */}
          {order.address && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Adresse de livraison
              </h2>
              <div className="text-sm text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900">{order.address.full_name}</p>
                <p>{order.address.street_address}</p>
                <p>{order.address.quarter}, {order.address.city}</p>
                {order.address.landmark && <p className="text-slate-400">Repère : {order.address.landmark}</p>}
                <p className="font-medium text-slate-700 mt-1">{order.address.phone}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          {order.payment && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Paiement
              </h2>
              <div className="text-sm text-slate-600 space-y-1.5">
                <p>Méthode : <span className="font-medium text-slate-800">{order.payment_method === 'mobile_money' ? 'Mobile Money' : order.payment_method === 'cash_on_delivery' ? 'À la livraison' : order.payment_method}</span></p>
                {order.payment.transaction_id && (
                  <p className="font-mono text-xs bg-slate-50 px-2 py-1 rounded">#{order.payment.transaction_id}</p>
                )}
                <p>Statut : <span className="font-medium text-slate-800">{paymentStatusLabel[order.payment.status] || order.payment.status}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
