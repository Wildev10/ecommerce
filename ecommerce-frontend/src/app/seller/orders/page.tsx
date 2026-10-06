'use client';

import { useState, useEffect } from 'react';
import { sellerApi } from '@/lib/api';
import { formatPrice, formatDate, orderStatusLabels, orderStatusColors, extractErrorMessage } from '@/lib/api-helpers';
import { Loader2, Package, MapPin, Phone, User, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Order, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
];

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed'],
  confirmed: ['processing'],
  processing: ['shipped'],
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await sellerApi.getOrders({ page, per_page: 20, status: statusFilter || undefined });
      setOrders(data.data);
      setMeta(data.meta);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      await sellerApi.updateOrderStatus(orderId, { status: newStatus });
      toast.success('Statut mis à jour');
      loadOrders();
      if (selectedOrder?.id === orderId) {
        const updated = await sellerApi.getOrder(orderId);
        setSelectedOrder(updated);
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const viewOrderDetail = async (orderId: number) => {
    try {
      const order = await sellerApi.getOrder(orderId);
      setSelectedOrder(order);
    } catch { toast.error('Erreur de chargement'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Commandes reçues</h1>
        {meta && <p className="text-sm text-slate-400 mt-0.5">{meta.total} commande{meta.total > 1 ? 's' : ''}</p>}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => { setStatusFilter(filter.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              statusFilter === filter.value
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Package className="h-14 w-14 text-slate-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Aucune commande</h2>
          <p className="text-slate-400 text-sm">Vous n&apos;avez pas encore reçu de commandes</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5">Commande</th>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 font-bold text-slate-900 text-sm">#{order.order_number}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{order.user?.name || 'Client'}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-900">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${orderStatusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                        {orderStatusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">{formatDate(order.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => viewOrderDetail(order.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                        >
                          Voir
                        </button>
                        {ALLOWED_TRANSITIONS[order.status]?.map((nextStatus) => (
                          <button
                            key={nextStatus}
                            onClick={() => handleStatusUpdate(order.id, nextStatus)}
                            disabled={updatingStatus === order.id}
                            className="px-3 py-1.5 text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 rounded-xl disabled:opacity-50 transition"
                          >
                            {updatingStatus === order.id ? '...' : orderStatusLabels[nextStatus]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-400">Page {meta.current_page} / {meta.last_page}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Commande #{selectedOrder.order_number}</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-1 inline-block ${orderStatusColors[selectedOrder.status] || 'bg-slate-100 text-slate-700'}`}>
                  {orderStatusLabels[selectedOrder.status] || selectedOrder.status}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Client */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" /> Client
                </h3>
                <p className="text-sm text-slate-700 font-medium">{selectedOrder.user?.name}</p>
                <p className="text-xs text-slate-500">{selectedOrder.user?.email}</p>
              </div>

              {/* Address */}
              {selectedOrder.address && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Adresse de livraison
                  </h3>
                  <p className="text-sm font-medium text-slate-700">{selectedOrder.address.full_name}</p>
                  <p className="text-sm text-slate-500">{selectedOrder.address.street_address}, {selectedOrder.address.quarter}, {selectedOrder.address.city}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" /> {selectedOrder.address.phone}
                  </p>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Articles</h3>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="py-2.5 flex justify-between text-sm">
                      <span className="text-slate-600">{item.product_name} × {item.quantity}</span>
                      <span className="font-semibold text-slate-800">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-3 mt-2 flex justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-orange-600 text-lg">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status update */}
              {ALLOWED_TRANSITIONS[selectedOrder.status] && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Avancer le statut :</p>
                  <div className="flex flex-wrap gap-2">
                    {ALLOWED_TRANSITIONS[selectedOrder.status].map((nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() => handleStatusUpdate(selectedOrder.id, nextStatus)}
                        className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition"
                      >
                        Passer à : {orderStatusLabels[nextStatus]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
