'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Package, Search, ToggleLeft, ToggleRight, Trash2, Loader2,
  ChevronLeft, ChevronRight, Edit, X, ImagePlus, Star,
} from 'lucide-react';
import { adminApi, productsApi, categoriesApi } from '@/lib/api';
import type { Product, Category } from '@/types';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

type EditForm = {
  name: string;
  description: string;
  price: string;
  compare_price: string;
  stock: string;
  category_id: string;
  is_active: boolean;
};

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<EditForm>({ name: '', description: '', price: '', compare_price: '', stock: '', category_id: '', is_active: true });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  useEffect(() => { categoriesApi.getAll().then(setCategories).catch(() => {}); }, []);

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

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      compare_price: product.compare_price ? String(product.compare_price) : '',
      stock: String(product.stock),
      category_id: String(product.category_id),
      is_active: product.is_active,
    });
    setNewImages([]);
  };

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files).filter(f => f.type.startsWith('image/'));
    setNewImages(prev => {
      const combined = [...prev, ...incoming].slice(0, 5);
      if (prev.length + incoming.length > 5) toast.error('Maximum 5 images');
      return combined;
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      if (form.compare_price) fd.append('compare_price', form.compare_price);
      fd.append('stock', form.stock);
      fd.append('category_id', form.category_id);
      fd.append('is_active', form.is_active ? '1' : '0');
      newImages.forEach((file, i) => {
        if (i === 0) fd.append('image', file);
        else fd.append(`gallery[${i - 1}]`, file);
      });
      const updated = await productsApi.update(editingProduct.id, fd);
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p));
      setEditingProduct(null);
      toast.success('Produit mis à jour');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const existingImageUrl = editingProduct?.image_url ?? null;
  const existingGallery = editingProduct?.gallery_urls ?? [];
  const slotsLeft = 5 - newImages.length;
  const inputCls = 'w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition';

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
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
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
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(product)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Modifier le produit</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Photos */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Photos du produit
                  <span className="ml-1.5 text-slate-400 font-normal">(la 1ère = photo principale)</span>
                </label>

                {existingImageUrl && newImages.length === 0 && (
                  <>
                    <div className="mb-3 p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-700 flex items-start gap-2">
                      <Star className="h-3.5 w-3.5 mt-0.5 shrink-0 text-purple-400" />
                      <span>Photos actuelles. Ajoutez de nouvelles photos pour les remplacer.</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="relative w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border-2 border-purple-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={existingImageUrl} alt="Actuelle" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 left-0 right-0 bg-purple-600 text-white text-[9px] font-bold text-center py-0.5">Actuelle</span>
                      </div>
                      {existingGallery.slice(0, 3).map((url, i) => (
                        <div key={i} className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {newImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newImages.map((file, i) => (
                      <div key={i} className="relative w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border-2 border-purple-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-purple-600 text-white text-[9px] font-bold text-center py-0.5">Principale</span>
                        )}
                        <button type="button" onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {slotsLeft > 0 && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition ${
                      dragOver ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50/50'
                    }`}
                  >
                    <ImagePlus className={`h-8 w-8 ${dragOver ? 'text-purple-500' : 'text-slate-300'}`} />
                    <p className="text-sm font-medium text-slate-600">Cliquez ou glissez-déposez vos photos</p>
                    <p className="text-xs text-slate-400">JPG, PNG, WEBP — {slotsLeft} emplacement{slotsLeft > 1 ? 's' : ''} restant{slotsLeft > 1 ? 's' : ''}</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => addFiles(e.target.files)} className="hidden" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
                <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none`} rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prix (FCFA) *</label>
                  <input required type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ancien prix</label>
                  <input type="number" min="0" value={form.compare_price} onChange={e => setForm({ ...form, compare_price: e.target.value })} className={inputCls} placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock *</label>
                  <input required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Catégorie *</label>
                  <select required value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className={inputCls}>
                    <option value="">Sélectionner</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded accent-purple-600 w-4 h-4" />
                <span className="text-sm text-slate-700 font-medium">Produit actif</span>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
