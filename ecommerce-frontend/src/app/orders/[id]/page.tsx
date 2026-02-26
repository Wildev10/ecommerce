'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';
import { formatPrice, formatDate, orderStatusLabels, orderStatusColors, paymentStatusColors } from '@/lib/api-helpers';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2, ArrowLeft, CreditCard, MapPin, Clock, Package } from 'lucide-react';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

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
      toast.error('Impossible d\'annuler cette commande');
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

  const paymentStatusLabel: Record<string, string> = {
    unpaid: 'Non payé',
    pending: 'En attente',
    paid: 'Payé',
    completed: 'Payé',
    failed: 'Échoué',
    refunded: 'Remboursé',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/orders"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux commandes
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Commande #{order.order_number}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${orderStatusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
              {orderStatusLabels[order.status] || order.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusColors[order.payment_status] || 'bg-gray-100 text-gray-800'}`}>
              {paymentStatusLabel[order.payment_status] || order.payment_status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-4">
          {(order.payment_status === 'unpaid' || order.payment_status === 'pending') && order.status !== 'cancelled' && (
            <Link
              href={`/orders/${order.id}/pay`}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Payer maintenant
            </Link>
          )}
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              Annuler la commande
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Articles ({order.items?.length || 0})
            </h2>
            <div className="divide-y">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.product?.image_url ? (
                      <img src={item.product.image_url} alt={item.product_name} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <Package className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.product_price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">{formatPrice(item.total)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status History */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Historique
              </h2>
              <div className="space-y-4">
                {order.status_history.map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-gray-900">
                        {orderStatusLabels[entry.old_status] || entry.old_status} → {orderStatusLabels[entry.new_status] || entry.new_status}
                      </p>
                      {entry.note && <p className="text-xs text-gray-500">{entry.note}</p>}
                      <p className="text-xs text-gray-400">{formatDate(entry.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Réduction</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Livraison</span>
                <span>{order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : 'Gratuite'}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Adresse de livraison
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.address.full_name}</p>
                <p>{order.address.street_address}</p>
                <p>{order.address.quarter}, {order.address.city}</p>
                {order.address.landmark && <p className="text-gray-500">Repère : {order.address.landmark}</p>}
                <p>{order.address.phone}</p>
              </div>
            </div>
          )}

          {/* Payment info */}
          {order.payment && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Paiement
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Méthode : {order.payment_method === 'mobile_money' ? 'Mobile Money' : order.payment_method}</p>
                {order.payment.transaction_id && (
                  <p className="font-mono text-xs">Transaction : {order.payment.transaction_id}</p>
                )}
                <p>Statut : {paymentStatusLabel[order.payment.status] || order.payment.status}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
