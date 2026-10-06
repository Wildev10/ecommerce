'use client';

import { useEffect, useState, useCallback } from 'react';
import { Package, Search, ToggleLeft, ToggleRight, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { adminApi } from '@/lib/api';
import type { Product } from '@/types';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({ page, per_page: 15 });
      setProducts(res.data);
      setLastPage(res.meta?.last_page || 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleToggle = async (id: number) => {
    setTogglingIds(prev => new Set(prev).add(id));
    try {
      await adminApi.toggleProduct(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));
      toast.success('Statut modifié');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setTogglingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Produit supprimé');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Gestion des produits</h1>
        <p className="text-sm text-slate-400 mt-0.5">Modérez et gérez les produits de la plateforme</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5">Produit</th>
                <th className="text-left px-5 py-3.5">Prix</th>
                <th className="text-left px-5 py-3.5">Stock</th>
                <th className="text-left px-5 py-3.5">Actif</th>
                <th className="text-left px-5 py-3.5">Date</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Package className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Aucun produit</p>
                  </td>
                </tr>
              ) : (
                filtered.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          {product.image_url ? (
                            <Image src={product.image_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-48">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{formatPrice(product.price)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${product.stock <= 5 ? 'text-red-600' : 'text-slate-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(product.id)} disabled={togglingIds.has(product.id)} className="flex items-center">
                        {togglingIds.has(product.id) ? (
                          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        ) : product.is_active ? (
                          <ToggleRight className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-slate-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{formatDate(product.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {lastPage > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-400">Page {page} / {lastPage}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
