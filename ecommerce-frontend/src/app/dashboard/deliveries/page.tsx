'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Truck, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Order } from '@/types';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; activeCls: string; inactiveCls: string }> = {
  shipped:    { label: 'Expédiée',     activeCls: 'bg-purple-600 text-white', inactiveCls: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' },
  delivering: { label: 'En livraison', activeCls: 'bg-orange-500 text-white',  inactiveCls: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' },
  delivered:  { label: 'Livrée',       activeCls: 'bg-emerald-600 text-white', inactiveCls: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' },
};

const STATUS_BADGE: Record<string, string> = {
  shipped:    'bg-purple-100 text-purple-700',
  delivering: 'bg-orange-100 text-orange-700',
  delivered:  'bg-emerald-100 text-emerald-700',
};

export default function DashboardDeliveriesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filter, setFilter] = useState('shipped');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadOrders(); }, [page, filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({ page, per_page: 15, status: filter });
      setOrders(res.data);
      setLastPage(res.meta?.last_page || 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Suivi des livraisons</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gérez et suivez toutes les livraisons</p>
        </div>
        <div className="flex gap-2">
          {(['shipped', 'delivering', 'delivered'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                filter === s ? STATUS_MAP[s].activeCls : STATUS_MAP[s].inactiveCls
              }`}
            >
              {STATUS_MAP[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5">Commande</th>
                <th className="text-left px-5 py-3.5">Client</th>
                <th className="text-left px-5 py-3.5">Adresse</th>
                <th className="text-left px-5 py-3.5">Montant</th>
                <th className="text-left px-5 py-3.5">Livreur</th>
                <th className="text-left px-5 py-3.5">Statut</th>
                <th className="text-left px-5 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" /></td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Truck className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Aucune livraison {STATUS_MAP[filter]?.label.toLowerCase()}</p>
                  </td>
                </tr>
              ) : (
                orders.map(order => {
                  const badge = STATUS_BADGE[order.status] || 'bg-slate-100 text-slate-700';
                  const label = STATUS_MAP[order.status]?.label || order.status;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4">
                        <Link href={`/dashboard/orders/${order.id}`} className="font-semibold text-purple-600 hover:text-purple-800">
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{order.user?.name || '—'}</td>
                      <td className="px-5 py-4">
                        {order.address ? (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <span className="text-xs text-slate-600">{order.address.quarter}, {order.address.city}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{formatPrice(order.total)}</td>
                      <td className="px-5 py-4">
                        {order.delivery_person ? (
                          <span className="text-sm text-slate-700 font-medium">{order.delivery_person.name}</span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Non assigné</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}>{label}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{formatDate(order.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {lastPage > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-400">Page {page} / {lastPage}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
