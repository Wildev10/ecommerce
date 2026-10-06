'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Order } from '@/types';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: 'En attente',    color: 'bg-amber-100 text-amber-700' },
  confirmed:  { label: 'Confirmée',     color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'En traitement', color: 'bg-indigo-100 text-indigo-700' },
  shipped:    { label: 'Expédiée',      color: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Livrée',        color: 'bg-emerald-100 text-emerald-700' },
  cancelled:  { label: 'Annulée',       color: 'bg-red-100 text-red-700' },
};

const STATUS_OPTIONS = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({ page, per_page: 15 });
      setOrders(res.data);
      setLastPage(res.meta?.last_page || 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleStatusChange = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o));
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Gestion des commandes</h1>
        <p className="text-sm text-slate-400 mt-0.5">Toutes les commandes de la plateforme</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5">Commande</th>
                <th className="text-left px-5 py-3.5">Client</th>
                <th className="text-left px-5 py-3.5">Total</th>
                <th className="text-left px-5 py-3.5">Statut</th>
                <th className="text-left px-5 py-3.5">Date</th>
                <th className="text-left px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <ShoppingCart className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Aucune commande</p>
                  </td>
                </tr>
              ) : (
                orders.map(order => {
                  const st = STATUS_MAP[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-700' };
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4">
                        <Link href={`/dashboard/orders/${order.id}`} className="font-semibold text-purple-600 hover:text-purple-800">
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{order.user?.name || '—'}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{formatPrice(order.total)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{formatDate(order.created_at)}</td>
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id || order.status === 'cancelled' || order.status === 'delivered'}
                          className="text-xs border-2 border-slate-200 rounded-xl px-2.5 py-1.5 disabled:opacity-50 focus:outline-none focus:border-purple-400 transition"
                        >
                          <option value={order.status}>{st.label}</option>
                          {STATUS_OPTIONS.filter(s => s !== order.status).map(s => (
                            <option key={s} value={s}>{STATUS_MAP[s]?.label || s}</option>
                          ))}
                        </select>
                      </td>
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
