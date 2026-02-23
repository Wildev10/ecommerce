'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'En traitement', color: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

const STATUS_OPTIONS = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => { loadOrders(); }, [page]);

  const loadOrders = async () => {
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
  };

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestion des commandes</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Commande</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Total</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Aucune commande</td></tr>
              ) : (
                orders.map(order => {
                  const st = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-blue-600 hover:underline">
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{order.user?.name || '-'}</td>
                      <td className="px-6 py-4 font-medium">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id || order.status === 'cancelled' || order.status === 'delivered'}
                          className="text-sm border rounded-lg px-2 py-1 disabled:opacity-50"
                        >
                          <option value={order.status}>{st.label}</option>
                          {STATUS_OPTIONS
                            .filter(s => s !== order.status)
                            .map(s => (
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
      </div>

      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Précédent</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} / {lastPage}</span>
          <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Suivant</button>
        </div>
      )}
    </div>
  );
}
