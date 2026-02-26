'use client';

import { useState, useEffect } from 'react';
import { sellerApi } from '@/lib/api';
import { formatPrice, formatDate, orderStatusLabels, orderStatusColors, extractErrorMessage } from '@/lib/api-helpers';
import { Loader2, Eye, Package, MapPin, Phone, User } from 'lucide-react';
import type { Order, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  { value: '', label: 'Tous' },
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
  }, [page, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await sellerApi.getOrders({ page, per_page: 20, status: statusFilter || undefined });
      setOrders(data.data);
      setMeta(data.meta);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
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
    } catch {
      toast.error('Erreur de chargement');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Commandes reçues</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => { setStatusFilter(filter.value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === filter.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune commande</h2>
          <p className="text-gray-500">Vous n&apos;avez pas encore reçu de commandes</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-6 py-3 font-medium">Commande</th>
                  <th className="px-6 py-3 font-medium">Client</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Statut</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 text-sm">#{order.order_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.user?.name || 'Client'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderStatusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {orderStatusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => viewOrderDetail(order.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="h-4 w-4" />
                        </button>
                        {ALLOWED_TRANSITIONS[order.status]?.map((nextStatus) => (
                          <button
                            key={nextStatus}
                            onClick={() => handleStatusUpdate(order.id, nextStatus)}
                            disabled={updatingStatus === order.id}
                            className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
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
            <div className="flex justify-center space-x-2 p-4 border-t">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Précédent</button>
              <span className="px-3 py-1 text-sm text-gray-600">Page {meta.current_page} / {meta.last_page}</span>
              <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Suivant</button>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">Commande #{selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">×</button>
            </div>
            <div className="p-6 space-y-6">
              {/* Client info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><User className="h-4 w-4" /> Client</h3>
                <p className="text-sm text-gray-600">{selectedOrder.user?.name} — {selectedOrder.user?.email}</p>
              </div>

              {/* Address */}
              {selectedOrder.address && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><MapPin className="h-4 w-4" /> Adresse de livraison</h3>
                  <div className="text-sm text-gray-600">
                    <p>{selectedOrder.address.full_name}</p>
                    <p>{selectedOrder.address.street_address}, {selectedOrder.address.quarter}, {selectedOrder.address.city}</p>
                    <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedOrder.address.phone}</p>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Articles</h3>
                <div className="divide-y">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between text-sm">
                      <span className="text-gray-600">{item.product_name} × {item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status update */}
              {ALLOWED_TRANSITIONS[selectedOrder.status] && (
                <div className="flex gap-2">
                  {ALLOWED_TRANSITIONS[selectedOrder.status].map((nextStatus) => (
                    <button
                      key={nextStatus}
                      onClick={() => handleStatusUpdate(selectedOrder.id, nextStatus)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      Passer à : {orderStatusLabels[nextStatus]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}