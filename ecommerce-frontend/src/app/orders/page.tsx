'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';
import { formatPrice, formatDate, orderStatusLabels, orderStatusColors } from '@/lib/api-helpers';
import { useAuthStore } from '@/stores/auth-store';
import { Package, Loader2, Eye, CreditCard, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.error("Impossible d'annuler cette commande");
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes commandes</h1>
          {meta && <p className="text-sm text-slate-500 mt-0.5">{meta.total} commande{meta.total > 1 ? 's' : ''} au total</p>}
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Continuer mes achats</span>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Package className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Aucune commande</h2>
          <p className="text-slate-500 mb-6">Vous n&apos;avez pas encore passé de commande</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition"
          >
            <ShoppingBag className="h-4 w-4" />
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 p-5 sm:p-6 transition">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-bold text-slate-900 text-base">
                    Commande #{order.order_number}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${orderStatusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                    {orderStatusLabels[order.status] || order.status}
                  </span>
                  <span className="font-bold text-blue-700 text-base">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Items preview */}
              {order.items && order.items.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="inline-flex items-center bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs">
                      <span className="text-slate-700 font-medium">{item.product_name}</span>
                      <span className="text-slate-400 mx-1">×</span>
                      <span className="font-bold text-slate-600">{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs text-slate-400 self-center">
                      +{order.items.length - 3} article{order.items.length - 3 > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50">
                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Voir les détails
                </Link>

                {(order.payment_status === 'unpaid' || order.payment_status === 'pending') && order.status !== 'cancelled' && (
                  <Link
                    href={`/orders/${order.id}/pay`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Payer maintenant
                  </Link>
                )}

                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="inline-flex items-center px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 rounded-xl">
                {meta.current_page} / {meta.last_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
