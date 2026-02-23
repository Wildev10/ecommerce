'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Package, ShoppingCart, DollarSign, ArrowUpRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';

interface DashboardData {
  total_users: number;
  total_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  recent_orders: Array<{
    id: number;
    order_number: string;
    total: number;
    status: string; 
    created_at: string;
    user?: { name: string };
  }>;
  new_users_today: number;
  orders_today: number;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'En traitement', color: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await adminApi.getDashboard();
      setData(res);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Chargement du tableau de bord..." />;
  if (!data) return null;

  const stats = [
    { label: 'Utilisateurs', value: data.total_users, icon: Users, color: 'bg-blue-500', link: '/admin/users' },
    { label: 'Produits', value: data.total_products, icon: Package, color: 'bg-green-500', link: '/admin/products' },
    { label: 'Commandes', value: data.total_orders, sub: `${data.pending_orders} en attente`, icon: ShoppingCart, color: 'bg-orange-500', link: '/admin/orders' },
    { label: 'Revenus totaux', value: formatPrice(data.total_revenue), sub: `${data.orders_today} commandes aujourd'hui`, icon: DollarSign, color: 'bg-purple-500', link: '#' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.link} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg text-white ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-500">{stat.label}</p>
              {stat.sub && <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Commandes récentes</h3>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {data.recent_orders?.map((order) => {
              const st = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
              return (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div>
                    <span className="font-medium text-gray-900">#{order.order_number}</span>
                    <p className="text-xs text-gray-500">{order.user?.name} • {formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                    <span className={`block mt-1 text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                </Link>
              );
            })}
            {(!data.recent_orders || data.recent_orders.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-4">Aucune commande récente</p>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques du jour</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50">
              <div>
                <p className="text-sm text-gray-600">Nouveaux utilisateurs</p>
                <p className="text-2xl font-bold text-blue-600">{data.new_users_today}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50">
              <div>
                <p className="text-sm text-gray-600">Commandes du jour</p>
                <p className="text-2xl font-bold text-green-600">{data.orders_today}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{data.pending_orders}</p>
              </div>
              <Package className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
