'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';
import { formatPrice, formatDate, orderStatusLabels, orderStatusColors } from '@/lib/api-helpers';
import { useAuthStore } from '@/stores/auth-store';
import { Package, Loader2, Eye, CreditCard } from 'lucide-react';
import type { Order, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadOrders();
  }, [page, isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getAll({ page, per_page: 10 });
      setOrders(data.data);
      setMeta(data.meta);
    } catch {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    try {
      await ordersApi.cancel(orderId);
      toast.success('Commande annulée');
      loadOrders();
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes commandes</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune commande</h2>
          <p className="text-gray-500 mb-6">Vous n&apos;avez pas encore passé de commande</p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    Commande #{order.order_number}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${orderStatusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {orderStatusLabels[order.status] || order.status}
                  </span>
                  <span className="font-bold text-blue-600">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex flex-wrap gap-2 mb-4">
                {order.items?.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 text-sm">
                    <span className="text-gray-700">{item.product_name}</span>
                    <span className="text-gray-400 mx-1">×</span>
                    <span className="font-medium">{item.quantity}</span>
                  </div>
                ))}
                {order.items && order.items.length > 3 && (
                  <span className="text-sm text-gray-500 self-center">
                    +{order.items.length - 3} autres
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  Voir détails
                </Link>

                {(order.payment_status === 'unpaid' || order.payment_status === 'pending') && order.status !== 'cancelled' && (
                  <Link
                    href={`/orders/${order.id}/pay`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <CreditCard className="h-4 w-4 mr-1.5" />
                    Payer
                  </Link>
                )}

                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {meta.current_page} / {meta.last_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
