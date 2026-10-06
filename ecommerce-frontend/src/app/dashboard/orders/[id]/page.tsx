'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, CreditCard, Clock, Loader2, Truck, User } from 'lucide-react';
import { ordersApi, adminApi } from '@/lib/api';
import type { Order } from '@/types';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: 'En attente',    color: 'bg-amber-100 text-amber-700' },
  confirmed:  { label: 'Confirmée',     color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'En traitement', color: 'bg-indigo-100 text-indigo-700' },
  shipped:    { label: 'Expédiée',      color: 'bg-purple-100 text-purple-700' },
  delivering: { label: 'En livraison',  color: 'bg-orange-100 text-orange-700' },
  delivered:  { label: 'Livrée',        color: 'bg-emerald-100 text-emerald-700' },
  cancelled:  { label: 'Annulée',       color: 'bg-red-100 text-red-700' },
};

const STATUS_OPTIONS = ['confirmed', 'processing', 'shipped', 'delivering', 'delivered', 'cancelled'];

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'Paiement à la livraison',
  mobile_money: 'Mobile Money',
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  card: 'Carte bancaire',
  credit_card: 'Carte bancaire',
};

export default function DashboardOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadOrder(); }, [params.id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getById(Number(params.id));
      setOrder(data);
      setNewStatus(data.status);
    } catch (error) {
      toast.error(extractErrorMessage(error));
      router.push('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.status) return;
    setUpdating(true);
    try {
      await adminApi.updateOrderStatus(order.id, { status: newStatus, comment: comment || undefined });
      toast.success('Statut mis à jour');
      setComment('');
      loadOrder();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading text="Chargement..." />;
  if (!order) return null;

  const status = STATUS_MAP[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-700' };
  const inputCls = 'w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition';

  return (
    <div className="space-y-5">
      <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition">
        <ArrowLeft className="h-4 w-4" /> Retour aux commandes
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Commande #{order.order_number}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{formatDate(order.created_at)}</p>
        </div>
        <span className={`px-3.5 py-1.5 rounded-full text-sm font-semibold ${status.color}`}>{status.label}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Articles ({order.items?.length || 0})
            </h2>
            <div className="space-y-2.5">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    {item.product?.image_url ? (
                      <Image src={item.product.image_url} alt="" width={48} height={48} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {item.product?.name || `Produit #${item.product_id}`}
                    </p>
                    <p className="text-xs text-slate-400">{formatPrice(item.product_price)} × {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status update */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-base font-bold text-slate-900 mb-4">Mettre à jour le statut</h2>
            <div className="space-y-3">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className={inputCls}>
                <option value={order.status}>{status.label} (actuel)</option>
                {STATUS_OPTIONS.filter(s => s !== order.status).map(s => (
                  <option key={s} value={s}>{STATUS_MAP[s]?.label || s}</option>
                ))}
              </select>
              <textarea
                value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Commentaire (optionnel)"
                className={`${inputCls} resize-none`} rows={2}
              />
              <button
                onClick={handleUpdateStatus}
                disabled={updating || newStatus === order.status}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition"
              >
                {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                Mettre à jour
              </button>
            </div>
          </div>

          {/* History */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-400" /> Historique
              </h2>
              <div className="space-y-3">
                {order.status_history.map((entry, idx) => {
                  const st = STATUS_MAP[entry.new_status] || { label: entry.new_status, color: 'bg-slate-100 text-slate-700' };
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-purple-500 shrink-0" />
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                        {entry.note && <p className="text-sm text-slate-600 mt-1">{entry.note}</p>}
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(entry.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-bold text-slate-900 mb-3">Résumé</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Sous-total</span>
                <span className="font-medium text-slate-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Livraison</span>
                <span className="font-medium text-slate-900">{order.shipping_fee === 0 ? 'Gratuite' : formatPrice(order.shipping_fee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Réduction</span>
                  <span className="font-medium">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-purple-600 text-base">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          {order.user && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" /> Client
              </h3>
              <p className="text-sm font-semibold text-slate-900">{order.user.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{order.user.email}</p>
            </div>
          )}

          {/* Delivery person */}
          {order.delivery_person && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4 text-slate-400" /> Livreur
              </h3>
              <p className="text-sm font-semibold text-slate-900">{order.delivery_person.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{order.delivery_person.email}</p>
            </div>
          )}

          {/* Address */}
          {order.address && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" /> Adresse
              </h3>
              <p className="text-sm font-semibold text-slate-900">{order.address.full_name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{order.address.phone}</p>
              <p className="text-xs text-slate-500">{order.address.street_address}, {order.address.quarter}</p>
              <p className="text-xs text-slate-500">{order.address.city}</p>
            </div>
          )}

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-400" /> Paiement
            </h3>
            <p className="text-sm text-slate-700">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
            {order.payment_status && (
              <span className={`mt-2 inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                (order.payment_status === 'paid' || order.payment_status === 'completed')
                  ? 'bg-emerald-100 text-emerald-700'
                  : (order.payment_status === 'unpaid' || order.payment_status === 'pending')
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
              }`}>
                {(order.payment_status === 'paid' || order.payment_status === 'completed')
                  ? 'Payé'
                  : (order.payment_status === 'unpaid' || order.payment_status === 'pending')
                    ? 'En attente'
                    : order.payment_status}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
