'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Truck, MapPin, Clock } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Order } from '@/types';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800' },
  delivering: { label: 'En livraison', color: 'bg-orange-100 text-orange-800' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
};

export default function DashboardDeliveriesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filter, setFilter] = useState('shipped');

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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Suivi des livraisons</h1>
        <div className="flex gap-2">
          {(['shipped', 'delivering', 'delivered'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === s ? STATUS_MAP[s].color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {STATUS_MAP[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Commande</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Adresse</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Montant</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Livreur</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center">
                  <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune livraison {STATUS_MAP[filter]?.label.toLowerCase()}</p>
                </td></tr>
              ) : (
                orders.map(order => {
                  const st = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/orders/${order.id}`} className="font-medium text-blue-600 hover:underline">
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{order.user?.name || '-'}</td>
                      <td className="px-6 py-4">
                        {order.address ? (
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600">{order.address.quarter}, {order.address.city}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 font-medium">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        {order.delivery_person ? (
                          <span className="text-sm">{order.delivery_person.name}</span>
                        ) : (
                          <span className="text-xs text-gray-400">Non assigné</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(order.created_at)}
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
