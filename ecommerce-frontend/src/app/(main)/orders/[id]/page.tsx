'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, XCircle, Loader2 } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
import { useAuthStore } from '@/stores/auth-store';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'En traitement', color: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'Paiement à la livraison',
  mobile_money: 'Mobile Money',
  card: 'Carte bancaire',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadOrder();
  }, [isAuthenticated, params.id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getById(Number(params.id));
      setOrder(data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(order.id);
      toast.success('Commande annulée');
      loadOrder();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loading fullPage text="Chargement de la commande..." />;
  if (!order) return null;

  const status = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour aux commandes
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commande #{order.order_number}</h1>
          <p className="text-gray-500">{formatDate(order.created_at)}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-blue-600" />
              Articles ({order.items?.length || 0})
            </h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  {item.product?.image_url && (
                    <img
                      src={item.product.image_url}
                      alt={item.product?.name || ''}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.product?.name || `Produit #${item.product_id}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.product_price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status history */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-blue-600" />
                Historique
              </h2>
              <div className="space-y-4">
                {order.status_history.map((entry, idx) => {
                  const st = STATUS_MAP[entry.new_status] || { label: entry.new_status, color: 'bg-gray-100 text-gray-800' };
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-3 h-3 mt-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                        {entry.note && <p className="text-sm text-gray-600 mt-1">{entry.note}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-3">Résumé</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span>{order.shipping_fee === 0 ? 'Gratuite' : formatPrice(order.shipping_fee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          {order.address && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-blue-600" />
                Adresse de livraison
              </h3>
              <p className="text-sm text-gray-700">{order.address.full_name}</p>
              <p className="text-sm text-gray-500">{order.address.phone}</p>
              <p className="text-sm text-gray-500">{order.address.street_address}, {order.address.quarter}</p>
              <p className="text-sm text-gray-500">{order.address.city}</p>
            </div>
          )}

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Paiement
            </h3>
            <p className="text-sm text-gray-700">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
          </div>

          {/* Cancel button */}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full flex items-center justify-center gap-2 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Annuler la commande
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
