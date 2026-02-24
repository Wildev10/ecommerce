'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Loader2 } from 'lucide-react';
import { sellerApi } from '@/lib/api';
import type { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
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

const STATUS_OPTIONS = ['confirmed', 'processing', 'shipped', 'delivered'];

export default function SellerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { loadOrder(); }, [params.id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await sellerApi.getOrder(Number(params.id));
      setOrder(data);
      setNewStatus(data.status);
    } catch (error) {
      toast.error(extractErrorMessage(error));
      router.push('/seller/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.status) return;
    setUpdating(true);
    try {
      await sellerApi.updateOrderStatus(order.id, { status: newStatus, comment: comment || undefined });
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

  const status = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="space-y-6">
      <Link href="/seller/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Commande #{order.order_number}</h1>
          <p className="text-gray-500">{formatDate(order.created_at)}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>{status.label}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Articles</h2>
            <div className="space-y-3">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  {item.product?.image_url && <img src={item.product.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.name || `Produit #${item.product_id}`}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.product_price)} × {item.quantity}</p>
                  </div>
                  <span className="font-bold">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Mettre à jour le statut</h2>
            <div className="space-y-3">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value={order.status}>{status.label} (actuel)</option>
                {STATUS_OPTIONS.filter(s => s !== order.status).map(s => <option key={s} value={s}>{STATUS_MAP[s]?.label || s}</option>)}
              </select>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Commentaire (optionnel)" className="w-full border rounded-lg px-3 py-2" rows={2} />
              <button onClick={handleUpdateStatus} disabled={updating || newStatus === order.status} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                {updating && <Loader2 className="h-4 w-4 animate-spin" />} Mettre à jour
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold mb-3">Résumé</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span>{order.shipping_fee === 0 ? 'Gratuite' : formatPrice(order.shipping_fee)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Réduction</span><span>-{formatPrice(order.discount)}</span></div>}
              <hr />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-blue-600">{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {order.address && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" /> Livraison</h3>
              <p className="text-sm">{order.address.full_name} - {order.address.phone}</p>
              <p className="text-xs text-gray-500">{order.address.street_address}, {order.address.quarter}, {order.address.city}</p>
            </div>
          )}

          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Historique</h3>
              <div className="space-y-2">
                {order.status_history.map((entry, idx) => {
                  const st = STATUS_MAP[entry.new_status] || { label: entry.new_status, color: 'bg-gray-100 text-gray-800' };
                  return (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                        <p className="text-xs text-gray-400">{formatDate(entry.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
