'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import { sellerApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';

interface SellerDashboard {
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  top_products: Array<{
    product_id: number;
    product_name: string;
    total_sold: number;
    total_revenue: number;
  }>;
  monthly_sales: Array<{
    month: number;
    year: number;
    revenue: number;
  }>;
}

export default function SellerDashboardPage() {
  const [data, setData] = useState<SellerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await sellerApi.getDashboard();
      setData(res);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Chargement..." />;
  if (!data) return null;

  const currentMonthRevenue = data.monthly_sales?.[0]?.revenue || 0;

  const stats = [
    { label: 'Produits actifs', value: `${data.active_products}/${data.total_products}`, icon: Package, color: 'bg-green-500', link: '/seller/products' },
    { label: 'Commandes', value: data.total_orders, sub: `${data.pending_orders} en attente`, icon: ShoppingCart, color: 'bg-orange-500', link: '/seller/orders' },
    { label: 'Revenus totaux', value: formatPrice(data.total_revenue), icon: DollarSign, color: 'bg-purple-500', link: '#' },
    { label: 'Revenus du mois', value: formatPrice(currentMonthRevenue), icon: TrendingUp, color: 'bg-blue-500', link: '#' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.link} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg text-white ${stat.color}`}><Icon className="h-6 w-6" /></div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-500">{stat.label}</p>
              {stat.sub && <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>}
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Meilleurs produits</h3>
          <Link href="/seller/products" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
        </div>
        {data.top_products?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Produit</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-500">Vendus</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-500">Revenus</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.top_products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.product_name}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{p.total_sold}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">{formatPrice(p.total_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">Aucune vente pour le moment</p>
        )}
      </div>
    </div>
  );
}
