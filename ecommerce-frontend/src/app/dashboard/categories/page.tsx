'use client';

import { useEffect, useState } from 'react';
import { Tag, Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Category } from '@/types';
import { extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des catégories</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" /> Nouvelle catégorie
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-900">{editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editingId ? 'Mettre à jour' : 'Créer'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
              <X className="h-4 w-4" /> Annuler
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Catégorie</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Description</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Produits</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" /></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">Aucune catégorie</td></tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img src={cat.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Tag className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{cat.description || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{cat.products_count ?? '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800 p-1">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 p-1">
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
