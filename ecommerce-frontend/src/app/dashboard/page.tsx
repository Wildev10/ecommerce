'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Package, ShoppingCart, TrendingUp, ArrowUpRight, AlertCircle } from 'lucide-react';
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
  pending:    { label: 'En attente',    color: 'bg-amber-100 text-amber-700' },
  confirmed:  { label: 'Confirmée',     color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'En traitement', color: 'bg-indigo-100 text-indigo-700' },
  shipped:    { label: 'Expédiée',      color: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Livrée',        color: 'bg-emerald-100 text-emerald-700' },
  cancelled:  { label: 'Annulée',       color: 'bg-red-100 text-red-700' },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

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
  if (!data) return <p className="text-slate-500">Impossible de charger le tableau de bord.</p>;

  const stats = [
    {
      label: 'Clients',
      value: data.total_users,
      sub: `+${data.new_users_today} aujourd'hui`,
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      border: 'border-blue-100',
      link: '/dashboard/users',
    },
    {
      label: 'Produits',
      value: data.total_products,
      icon: Package,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      border: 'border-slate-100',
      link: '/dashboard/products',
    },
    {
      label: 'Commandes',
      value: data.total_orders,
      sub: `${data.pending_orders} en attente`,
      icon: ShoppingCart,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      border: 'border-slate-100',
      link: '/dashboard/orders',
    },
    {
      label: "Chiffre d'affaires",
      value: formatPrice(data.total_revenue),
      sub: `${data.orders_today} cmd aujourd'hui`,
      icon: TrendingUp,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      border: 'border-slate-100',
      link: '#',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-sm text-slate-400 mt-0.5">Vue d&apos;ensemble de la plateforme</p>
      </div>

      {data.pending_orders > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm font-semibold text-amber-800">
            {data.pending_orders} commande{data.pending_orders > 1 ? 's' : ''} en attente de traitement
          </p>
          <Link href="/dashboard/orders" className="ml-auto text-sm font-bold text-amber-700 hover:text-amber-900 whitespace-nowrap">
            Voir →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.link}
              className={`bg-white rounded-2xl border ${stat.border} p-5 hover:shadow-sm transition-shadow group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex p-2.5 rounded-xl ${stat.iconBg}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
              {stat.sub && <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>}
            </Link>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Commandes récentes</h3>
          <Link href="/dashboard/orders" className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition">
            Voir tout →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3.5 text-left">N° Commande</th>
                <th className="px-5 py-3.5 text-left">Client</th>
                <th className="px-5 py-3.5 text-left">Montant</th>
                <th className="px-5 py-3.5 text-left">Statut</th>
                <th className="px-5 py-3.5 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.recent_orders?.map((order) => {
                const status = STATUS_MAP[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-700' };
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 font-semibold text-slate-900">#{order.order_number}</td>
                    <td className="px-5 py-4 text-slate-600">{order.user?.name || '—'}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{formatDate(order.created_at)}</td>
                  </tr>
                );
              })}
              {(!data.recent_orders || data.recent_orders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-sm">
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
