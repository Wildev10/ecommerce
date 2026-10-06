'use client';

import { useEffect, useState } from 'react';
import { Tag, Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react';
import Image from 'next/image';
import { adminApi } from '@/lib/api';
import type { Category } from '@/types';
import { extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

const inputCls = 'w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition';

export default function DashboardCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, description: cat.description || '' });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Le nom est requis'); return; }
    setSubmitting(true);
    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, form);
        toast.success('Catégorie mise à jour');
      } else {
        await adminApi.createCategory(form);
        toast.success('Catégorie créée');
      }
      resetForm();
      loadCategories();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await adminApi.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Catégorie supprimée');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestion des catégories</h1>
          <p className="text-sm text-slate-400 mt-0.5">{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition"
        >
          <Plus className="h-4 w-4" /> Nouvelle catégorie
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900">{editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
            <button onClick={resetForm} className="p-1.5 hover:bg-slate-100 rounded-xl transition">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className={inputCls} placeholder="Ex: Électronique" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className={inputCls} placeholder="Description optionnelle" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editingId ? 'Mettre à jour' : 'Créer'}
              </button>
              <button type="button" onClick={resetForm}
                className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5">Catégorie</th>
                <th className="text-left px-5 py-3.5">Description</th>
                <th className="text-left px-5 py-3.5">Produits</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" /></td></tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <Tag className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Aucune catégorie</p>
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          {cat.image ? (
                            <Image src={cat.image} alt="" width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <Tag className="h-5 w-5 text-purple-400" />
                          )}
                        </div>
                        <span className="font-semibold text-slate-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 max-w-[200px] truncate">{cat.description || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-slate-700">{cat.products_count ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
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
      </div>
    </div>
  );
}
