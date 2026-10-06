'use client';

import { useEffect, useState } from 'react';
import { sellerApi } from '@/lib/api';
import { formatPrice, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { ShippingZone } from '@/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function SellerShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', price: '', estimated_days: '', is_active: true });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await sellerApi.getShippingZones();
      setZones(res);
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: '', price: '', estimated_days: '', is_active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (z: ShippingZone) => {
    setForm({ name: z.name, price: String(z.price), estimated_days: String(z.estimated_days), is_active: z.is_active });
    setEditingId(z.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: form.name,
        price: parseFloat(form.price),
        estimated_days: parseInt(form.estimated_days),
        is_active: form.is_active,
      };
      if (editingId) {
        await sellerApi.updateShippingZone(editingId, data);
        toast.success('Zone mise à jour');
      } else {
        await sellerApi.createShippingZone(data);
        toast.success('Zone créée');
      }
      resetForm();
      load();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette zone ?')) return;
    try {
      await sellerApi.deleteShippingZone(id);
      toast.success('Zone supprimée');
      load();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  if (loading) return <Loading text="Chargement..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Zones de livraison</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Modifier la zone' : 'Nouvelle zone'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Cotonou et environs" className="w-full border rounded-lg px-4 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) *</label>
              <input type="number" required min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jours estimés *</label>
              <input type="number" required min="1" value={form.estimated_days} onChange={(e) => setForm({ ...form, estimated_days: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Zone active
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg text-sm">Annuler</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Zone</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Prix</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Jours</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {zones.map((z) => (
                <tr key={z.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{z.name}</td>
                  <td className="px-6 py-4 text-right">{formatPrice(z.price)}</td>
                  <td className="px-6 py-4 text-right">{z.estimated_days} j</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${z.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {z.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(z)} className="text-blue-600 hover:text-blue-800"><Pencil className="h-4 w-4 inline" /></button>
                    <button onClick={() => handleDelete(z.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4 inline" /></button>
                  </td>
                </tr>
              ))}
              {zones.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucune zone de livraison</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
