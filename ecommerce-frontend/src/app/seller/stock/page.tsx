'use client';

import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import { formatPrice, extractErrorMessage } from '@/lib/api-helpers';
import { Loader2, AlertTriangle, Check, Package, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getMyProducts({ page, per_page: 50 });
      setProducts(data.data);
      setMeta(data.meta);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  const handleStockUpdate = async (productId: number) => {
    const newStock = parseInt(editStock);
    if (isNaN(newStock) || newStock < 0) { toast.error('Stock invalide'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('stock', String(newStock));
      await productsApi.update(productId, formData);
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)));
      setEditingId(null);
      toast.success('Stock mis à jour');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < 5);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Gestion du stock</h1>
        <p className="text-sm text-slate-400 mt-0.5">Cliquez sur un stock pour le modifier</p>
      </div>

      {/* Alerts */}
      {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStockProducts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-2">
                <AlertTriangle className="h-4 w-4" />
                Rupture de stock ({outOfStockProducts.length})
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {outOfStockProducts.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                    {p.name}
                  </li>
                ))}
                {outOfStockProducts.length > 5 && <li className="text-xs text-red-400">+ {outOfStockProducts.length - 5} autres</li>}
              </ul>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-2">
                <AlertTriangle className="h-4 w-4" />
                Stock bas ({lowStockProducts.length})
              </div>
              <ul className="text-sm text-amber-700 space-y-1">
                {lowStockProducts.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                    {p.name} — <span className="font-semibold">{p.stock} restant{p.stock > 1 ? 's' : ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Package className="h-14 w-14 text-slate-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Aucun produit</h2>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left">Produit</th>
                  <th className="px-5 py-3.5 text-left">Prix</th>
                  <th className="px-5 py-3.5 text-left">Stock</th>
                  <th className="px-5 py-3.5 text-left">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((product) => (
                  <tr key={product.id} className={`transition ${
                    product.stock === 0 ? 'bg-red-50/50' : product.stock < 5 ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'
                  }`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-100 rounded-xl shrink-0 overflow-hidden">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700">{formatPrice(product.price)}</td>
                    <td className="px-5 py-4">
                      {editingId === product.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number" min="0" value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-20 border-2 border-blue-400 rounded-xl px-2.5 py-1.5 text-sm focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleStockUpdate(product.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <button onClick={() => handleStockUpdate(product.id)} disabled={saving}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingId(product.id); setEditStock(String(product.stock)); }}
                          className={`inline-flex items-center gap-1.5 font-bold text-sm hover:underline cursor-pointer ${
                            product.stock === 0 ? 'text-red-600' : product.stock < 5 ? 'text-amber-600' : 'text-slate-800'
                          }`}
                        >
                          {product.stock < 5 && <AlertTriangle className="h-3.5 w-3.5" />}
                          {product.stock}
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {product.stock === 0 ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Rupture</span>
                      ) : product.stock < 5 ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Stock bas</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">En stock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-400">Page {meta.current_page} / {meta.last_page}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
