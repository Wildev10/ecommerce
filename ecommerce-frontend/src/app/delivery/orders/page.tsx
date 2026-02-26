'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Loader2, Truck, CheckCircle, Package } from 'lucide-react';
import { deliveryApi } from '@/lib/api';
import type { Order } from '@/types';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; color: string; next?: string; nextLabel?: string }> = {
  shipped: { label: 'À récupérer', color: 'bg-purple-100 text-purple-800', next: 'delivering', nextLabel: 'Récupéré - En livraison' },
  delivering: { label: 'En livraison', color: 'bg-orange-100 text-orange-800', next: 'delivered', nextLabel: 'Marquer comme livré' },
  delivered: { label: 'Livré', color: 'bg-green-100 text-green-800' },
};

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filter, setFilter] = useState<string>('shipped');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => { loadOrders(); }, [page, filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await deliveryApi.getOrders({ page, status: filter });
      setOrders(res.data);
      setLastPage(res.meta?.last_page || 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    try {
      await deliveryApi.updateOrderStatus(orderId, { status });
      toast.success(status === 'delivered' ? 'Livraison confirmée !' : 'Statut mis à jour');
      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Mes livraisons</h1>
        <div className="flex gap-2">
          {['shipped', 'delivering'].map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === s
                  ? STATUS_MAP[s].color
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {STATUS_MAP[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune livraison</h2>
          <p className="text-gray-500">Pas de commandes {STATUS_MAP[filter]?.label.toLowerCase()} pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map(order => {
            const st = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold text-gray-900">#{order.order_number}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</span>
                  </div>

                  {/* Client */}
                  <div className="text-sm text-gray-600 mb-2">
                    <p className="font-medium">{order.user?.name || 'Client'}</p>
                  </div>

                  {/* Address */}
                  {order.address && (
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-600">
                        <p>{order.address.street_address}, {order.address.quarter}</p>
                        <p>{order.address.city}</p>
                      </div>
                    </div>
                  )}

                  {order.address?.phone && (
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${order.address.phone}`} className="text-sm text-blue-600 hover:underline">{order.address.phone}</a>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mb-3">{formatDate(order.created_at)}</div>

                  <div className="flex gap-2">
                    <button onClick={() => setSelectedOrder(order)} className="flex-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
                      Détails
                    </button>
                    {st.next && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, st.next!)}
                        disabled={updatingId === order.id}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 ${
                          st.next === 'delivered' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'
                        } disabled:opacity-50`}
                      >
                        {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : st.next === 'delivered' ? <CheckCircle className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                        {st.nextLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Précédent</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} / {lastPage}</span>
          <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Suivant</button>
        </div>
      )}

      {/* Detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Commande #{selectedOrder.order_number}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>

              <div className="space-y-4">
                {selectedOrder.user && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                    <p className="font-medium">{selectedOrder.user.name}</p>
                    {selectedOrder.user.email && <p className="text-sm text-gray-500">{selectedOrder.user.email}</p>}
                  </div>
                )}

                {selectedOrder.address && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Adresse de livraison</h3>
                    <p className="text-sm">{selectedOrder.address.full_name}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.address.street_address}, {selectedOrder.address.quarter}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.address.city}</p>
                    {selectedOrder.address.phone && (
                      <a href={`tel:${selectedOrder.address.phone}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1">
                        <Phone className="h-3.5 w-3.5" /> {selectedOrder.address.phone}
                      </a>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Articles</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                        <span>{item.product?.name || `#${item.product_id}`} × {item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.total)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold mt-3 pt-3 border-t">
                    <span>Total</span>
                    <span className="text-orange-600">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
