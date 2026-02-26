'use client';

import { useState, useEffect } from 'react';
import { sellerApi, productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/api-helpers';
import { Loader2, Package, ShoppingCart, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import type { SellerDashboard } from '@/types';
import toast from 'react-hot-toast';

export default function SellerDashboardPage() {
  const [dashboard, setDashboard] = useState<SellerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!dashboard) return null;

  const stats = [
    { label: 'Total produits', value: dashboard.total_products, icon: Package, color: 'blue' },
    { label: 'Produits actifs', value: dashboard.active_products, icon: Package, color: 'green' },
    { label: 'Total commandes', value: dashboard.total_orders, icon: ShoppingCart, color: 'purple' },
    { label: 'En attente', value: dashboard.pending_orders, icon: AlertTriangle, color: 'yellow' },
    { label: 'Chiffre d\'affaires', value: formatPrice(dashboard.total_revenue), icon: DollarSign, color: 'emerald' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord vendeur</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${colorMap[stat.color]} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Top products */}
      {dashboard.top_products && dashboard.top_products.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Produits les plus vendus
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Produit</th>
                  <th className="pb-3 font-medium text-right">Vendus</th>
                  <th className="pb-3 font-medium text-right">Revenus</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashboard.top_products.map((product, i) => (
                  <tr key={i} className="text-sm">
                    <td className="py-3 text-gray-900 font-medium">{product.product_name}</td>
                    <td className="py-3 text-gray-600 text-right">{product.total_sold}</td>
                    <td className="py-3 text-gray-900 font-medium text-right">{formatPrice(product.total_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly sales */}
      {dashboard.monthly_sales && dashboard.monthly_sales.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ventes mensuelles</h2>
          <div className="space-y-3">
            {dashboard.monthly_sales.map((month, i) => {
              const maxRevenue = Math.max(...dashboard.monthly_sales.map(m => m.revenue));
              const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
              const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-20">{monthNames[month.month - 1]} {month.year}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-32 text-right">{formatPrice(month.revenue)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
