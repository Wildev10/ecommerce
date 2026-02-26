'use client';

import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import { formatPrice, extractErrorMessage } from '@/lib/api-helpers';
import { Loader2, AlertTriangle, Check, Package } from 'lucide-react';
import type { Product, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

export default function SellerStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getMyProducts({ page, per_page: 50 });
      setProducts(data.data);
      setMeta(data.meta);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId: number) => {
    const newStock = parseInt(editStock);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Stock invalide');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('stock', String(newStock));
      await productsApi.update(productId, formData);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
      setEditingId(null);
      toast.success('Stock mis à jour');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const lowStockProducts = products.filter((p) => p.stock < 5);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestion du stock</h1>

      {/* Alerts */}
      {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStockProducts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                <AlertTriangle className="h-5 w-5" />
                Rupture de stock ({outOfStockProducts.length})
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {outOfStockProducts.slice(0, 5).map((p) => (
                  <li key={p.id}>• {p.name}</li>
                ))}
              </ul>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-700 font-medium mb-1">
                <AlertTriangle className="h-5 w-5" />
                Stock bas ({lowStockProducts.length})
              </div>
              <ul className="text-sm text-yellow-600 space-y-1">
                {lowStockProducts.filter(p => p.stock > 0).slice(0, 5).map((p) => (
                  <li key={p.id}>• {p.name} ({p.stock} restants)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit</h2>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-6 py-3 font-medium">Produit</th>
                  <th className="px-6 py-3 font-medium">Prix</th>
                  <th className="px-6 py-3 font-medium">Stock actuel</th>
                  <th className="px-6 py-3 font-medium">Statut</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 ${product.stock === 0 ? 'bg-red-50' : product.stock < 5 ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center"><Package className="h-5 w-5 text-gray-400" /></div>
                          )}
                        </div>
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">
                      {editingId === product.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-20 border border-blue-300 rounded px-2 py-1 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleStockUpdate(product.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <button
                            onClick={() => handleStockUpdate(product.id)}
                            disabled={saving}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded text-sm">×</button>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 font-medium text-sm cursor-pointer hover:underline ${
                            product.stock === 0 ? 'text-red-600' : product.stock < 5 ? 'text-yellow-600' : 'text-gray-900'
                          }`}
                          onClick={() => { setEditingId(product.id); setEditStock(String(product.stock)); }}
                        >
                          {product.stock === 0 && <AlertTriangle className="h-3.5 w-3.5" />}
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.stock === 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Rupture</span>
                      ) : product.stock < 5 ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Stock bas</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">En stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setEditingId(product.id); setEditStock(String(product.stock)); }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex justify-center space-x-2 p-4 border-t">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Précédent</button>
              <span className="px-3 py-1 text-sm text-gray-600">Page {meta.current_page} / {meta.last_page}</span>
              <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Suivant</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
