'use client';

import { useEffect, useState } from 'react';
import { Package, Search, ToggleLeft, ToggleRight, Trash2, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Product } from '@/types';
import { formatPrice, formatDate } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  useEffect(() => { loadProducts(); }, [page]);

  const loadProducts = async () => {
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
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des produits</h1>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un produit..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Produit</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Prix</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Stock</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Actif</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Aucun produit</td></tr>
              ) : (
                filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={product.stock <= 5 ? 'text-red-600 font-medium' : 'text-gray-700'}>{product.stock}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(product.id)}
                        disabled={togglingIds.has(product.id)}
                        className="flex items-center"
                      >
                        {togglingIds.has(product.id) ? (
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        ) : product.is_active ? (
                          <ToggleRight className="h-6 w-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(product.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Précédent</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} / {lastPage}</span>
          <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Suivant</button>
        </div>
      )}
    </div>
  );
}
