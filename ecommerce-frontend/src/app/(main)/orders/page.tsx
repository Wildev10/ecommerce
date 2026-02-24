'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
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

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }
    loadOrders();
  }, [isAuthenticated, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getAll({ page });
      setOrders(res.data);
      setLastPage(res.meta.last_page);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading && orders.length === 0) return <Loading fullPage text="Chargement des commandes..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Package className="h-8 w-8 text-blue-600" />
        Mes commandes
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune commande</h2>
          <p className="text-gray-500 mb-6">Vous n&apos;avez pas encore passé de commande.</p>
          <Link href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">#{order.order_number}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.created_at)} • {order.items?.length || 0} article(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-blue-600">{formatPrice(order.total)}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page} / {lastPage}</span>
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
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
