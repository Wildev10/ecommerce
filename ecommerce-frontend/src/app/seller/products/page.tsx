'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { productsApi, categoriesApi } from '@/lib/api';
import { formatPrice, extractErrorMessage } from '@/lib/api-helpers';
import {
  Loader2, Plus, Edit, Trash2, AlertTriangle, X, Package,
  ChevronLeft, ChevronRight, ImagePlus, Star,
} from 'lucide-react';
import type { Product, Category, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', price: '', compare_price: '', stock: '', category_id: '', is_active: true,
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
    categoriesApi.getAll().then(setCategories).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getMyProducts({ page, per_page: 20 });
      setProducts(data.data);
      setMeta(data.meta);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', price: '', compare_price: '', stock: '', category_id: '', is_active: true });
    setNewImages([]);
    setShowModal(true);
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
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (editingProduct) {
        await productsApi.update(editingProduct.id, fd);
        toast.success('Produit mis à jour');
      } else {
        await productsApi.create(fd);
        toast.success('Produit créé');
      }
      setShowModal(false);
      loadProducts();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await productsApi.delete(id);
      toast.success('Produit supprimé');
      loadProducts();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setNewImages((prev) => {
      const combined = [...prev, ...incoming].slice(0, 5);
      if (prev.length + incoming.length > 5) toast.error('Maximum 5 images');
      return combined;
    });
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const inputCls = 'w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition';

  // Images to show when editing: existing ones from the product
  const existingImageUrl = editingProduct?.image_url ?? null;
  const existingGallery = editingProduct?.gallery_urls ?? [];
  const totalExisting = existingImageUrl ? 1 + existingGallery.length : 0;
  const slotsLeft = 5 - newImages.length;

  if (loading && products.length === 0) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mes produits</h1>
          {meta && <p className="text-sm text-slate-400 mt-0.5">{meta.total} produit{meta.total > 1 ? 's' : ''}</p>}
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition"
        >
          <Plus className="h-4 w-4" /> Ajouter un produit
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Package className="h-14 w-14 text-slate-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Aucun produit</h2>
          <p className="text-slate-400 text-sm mb-5">Commencez par ajouter votre premier produit</p>
          <button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition">
            Ajouter un produit
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5">Produit</th>
                  <th className="px-5 py-3.5">Prix</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-slate-100 rounded-xl shrink-0 overflow-hidden">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 text-sm">{formatPrice(product.price)}</p>
                      {product.compare_price && product.compare_price > product.price && (
                        <p className="text-xs text-slate-400 line-through">{formatPrice(product.compare_price)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                        product.stock === 0 ? 'text-red-600' : product.stock < 5 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {product.stock < 5 && <AlertTriangle className="h-3.5 w-3.5" />}
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {product.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Photos */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Photos du produit
                  <span className="ml-1.5 text-slate-400 font-normal">(max 5 — la 1ère sera la photo principale)</span>
                </label>

                {/* Existing images info when editing */}
                {editingProduct && totalExisting > 0 && newImages.length === 0 && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                    <Star className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
                    <span>
                      Ce produit a déjà {totalExisting} photo{totalExisting > 1 ? 's' : ''}.
                      Ajoutez de nouvelles photos ci-dessous pour les remplacer, ou laissez vide pour garder les photos actuelles.
                    </span>
                  </div>
                )}

                {/* Preview of existing main image when editing */}
                {editingProduct && existingImageUrl && newImages.length === 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="relative w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border-2 border-orange-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={existingImageUrl} alt="Photo actuelle" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-[9px] font-bold text-center py-0.5">
                        Actuelle
                      </span>
                    </div>
                    {existingGallery.slice(0, 3).map((url, i) => (
                      <div key={i} className="relative w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* New image previews */}
                {newImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newImages.map((file, i) => (
                      <div key={i} className="relative w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border-2 border-orange-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-[9px] font-bold text-center py-0.5">
                            Principale
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop zone */}
                {slotsLeft > 0 && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition ${
                      dragOver
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-slate-200 hover:border-orange-400 hover:bg-orange-50/50'
                    }`}
                  >
                    <ImagePlus className={`h-8 w-8 ${dragOver ? 'text-orange-500' : 'text-slate-300'}`} />
                    <p className="text-sm font-medium text-slate-600">
                      Cliquez ou glissez-déposez vos photos ici
                    </p>
                    <p className="text-xs text-slate-400">
                      JPG, PNG, WEBP — {slotsLeft} emplacement{slotsLeft > 1 ? 's' : ''} restant{slotsLeft > 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => addFiles(e.target.files)}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls} placeholder="Nom du produit" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none`} rows={4} placeholder="Description détaillée du produit" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prix (FCFA) *</label>
                  <input required type="number" min="0" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ancien prix (FCFA)</label>
                  <input type="number" min="0" value={form.compare_price}
                    onChange={(e) => setForm({ ...form, compare_price: e.target.value })} className={inputCls} placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock *</label>
                  <input required type="number" min="0" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Catégorie *</label>
                  <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className={inputCls}>
                    <option value="">Sélectionner</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded accent-orange-500 w-4 h-4" />
                <span className="text-sm text-slate-700 font-medium">Produit actif (visible pour les clients)</span>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingProduct ? 'Enregistrer' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
