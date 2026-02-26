'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { deliveryApi } from '@/lib/api';
import { formatPrice, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

interface DeliveryDashboard {
  pending_deliveries: number;
  active_deliveries: number;
  completed_today: number;
  total_completed: number;
  earnings_today: number;
  current_orders: Array<{
    id: number;
    order_number: string;
    total: number;
    status: string;
    address?: { quarter: string; city: string; phone: string };
    user?: { name: string };
  }>;
}

export default function DeliveryDashboardPage() {
  const [data, setData] = useState<DeliveryDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const res = await deliveryApi.getDashboard();
      setData(res as unknown as DeliveryDashboard);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const stats = [
    { label: 'En attente', value: data?.pending_deliveries || 0, icon: Clock, color: 'bg-yellow-500' },
    { label: 'En cours', value: data?.active_deliveries || 0, icon: Truck, color: 'bg-orange-500' },
    { label: 'Livrées aujourd\'hui', value: data?.completed_today || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Total livrées', value: data?.total_completed || 0, icon: Package, color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg text-white ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current deliveries */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Livraisons en cours</h3>
          <Link href="/delivery/orders" className="text-sm text-orange-600 hover:underline">Voir toutes</Link>
        </div>
        <div className="divide-y">
          {data?.current_orders?.length ? (
            data.current_orders.map(order => (
              <Link key={order.id} href="/delivery/orders" className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">#{order.order_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'delivering' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status === 'shipped' ? 'À récupérer' : order.status === 'delivering' ? 'En livraison' : order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.user?.name} • {order.address?.quarter}, {order.address?.city}
                  </p>
                </div>
                <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune livraison en cours</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
