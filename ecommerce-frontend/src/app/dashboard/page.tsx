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

export default function DashboardPage() {
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
  if (!data) return <p className="text-gray-500">Impossible de charger le tableau de bord.</p>;

  const stats = [
    { label: 'Clients', value: data.total_users, icon: Users, color: 'bg-blue-500', link: '/dashboard/customers' },
    { label: 'Produits', value: data.total_products, icon: Package, color: 'bg-green-500', link: '/dashboard/products' },
    { label: 'Commandes', value: data.total_orders, sub: `${data.pending_orders} en attente`, icon: ShoppingCart, color: 'bg-orange-500', link: '/dashboard/orders' },
    { label: 'Chiffre d\'affaires', value: formatPrice(data.total_revenue), sub: `${data.orders_today} commandes aujourd'hui`, icon: DollarSign, color: 'bg-purple-500', link: '#' },
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques */}
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

      {/* Commandes récentes */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Commandes récentes</h3>
          <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:underline">
            Voir tout
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Commande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.recent_orders?.map((order) => {
                const status = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4 text-gray-600">{order.user?.name || '—'}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(order.created_at)}</td>
                  </tr>
                );
              })}
              {(!data.recent_orders || data.recent_orders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucune commande récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
