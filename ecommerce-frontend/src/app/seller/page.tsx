'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sellerApi } from '@/lib/api';
import { formatPrice } from '@/lib/api-helpers';
import { Loader2, Package, ShoppingCart, TrendingUp, ArrowUpRight, AlertCircle, BarChart3 } from 'lucide-react';
import type { SellerDashboard } from '@/types';
import toast from 'react-hot-toast';

export default function SellerDashboardPage() {
  const [dashboard, setDashboard] = useState<SellerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const data = await sellerApi.getDashboard();
      setDashboard(data);
    } catch {
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!dashboard) return null;

  const currentMonthRevenue = dashboard.monthly_sales?.[0]?.revenue || 0;
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  const stats = [
    {
      label: 'Produits actifs',
      value: `${dashboard.active_products}`,
      sub: `sur ${dashboard.total_products} total`,
      icon: Package,
      color: 'bg-blue-500',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      link: '/seller/products',
    },
    {
      label: 'Commandes',
      value: `${dashboard.total_orders}`,
      sub: `${dashboard.pending_orders} en attente`,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      light: 'bg-orange-50',
      text: 'text-orange-600',
      link: '/seller/orders',
    },
    {
      label: 'Revenus totaux',
      value: formatPrice(dashboard.total_revenue),
      sub: 'depuis le début',
      icon: TrendingUp,
      color: 'bg-emerald-500',
      light: 'bg-emerald-50',
      text: 'text-emerald-600',
      link: '/seller/wallet',
    },
    {
      label: 'Ce mois',
      value: formatPrice(currentMonthRevenue),
      sub: 'revenus du mois',
      icon: BarChart3,
      color: 'bg-purple-500',
      light: 'bg-purple-50',
      text: 'text-purple-600',
      link: '/seller/wallet',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Pending orders alert */}
      {dashboard.pending_orders > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-800 font-medium">
            Vous avez <strong>{dashboard.pending_orders}</strong> commande{dashboard.pending_orders > 1 ? 's' : ''} en attente de traitement.
          </p>
          <Link href="/seller/orders" className="ml-auto text-sm font-semibold text-orange-700 hover:text-orange-900 whitespace-nowrap">
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
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200 hover:shadow-sm transition group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.light}`}>
                  <Icon className={`h-5 w-5 ${stat.text}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm font-medium text-slate-600 mt-0.5">{stat.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top products */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900">Meilleurs produits</h3>
            <Link href="/seller/products" className="text-xs font-semibold text-orange-500 hover:text-orange-700 transition">
              Voir tout →
            </Link>
          </div>
          {dashboard.top_products?.length > 0 ? (
            <div className="space-y-0 divide-y divide-slate-50">
              {dashboard.top_products.map((product, i) => (
                <div key={product.product_id} className="flex items-center gap-3 py-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                    {i + 1}
                  </div>
                  <p className="flex-1 text-sm font-medium text-slate-800 truncate">{product.product_name}</p>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{formatPrice(product.total_revenue)}</p>
                    <p className="text-xs text-slate-400">{product.total_sold} vendus</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune vente pour le moment</p>
            </div>
          )}
        </div>

        {/* Monthly sales */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="text-base font-bold text-slate-900 mb-5">Ventes mensuelles</h3>
          {dashboard.monthly_sales?.length > 0 ? (
            <div className="space-y-3">
              {dashboard.monthly_sales.map((month, i) => {
                const maxRevenue = Math.max(...dashboard.monthly_sales.map((m) => m.revenue));
                const pct = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-16 shrink-0">
                      {monthNames[(month.month - 1) % 12]} {month.year}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-linear-to-r from-orange-400 to-orange-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-24 text-right shrink-0">
                      {formatPrice(month.revenue)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
