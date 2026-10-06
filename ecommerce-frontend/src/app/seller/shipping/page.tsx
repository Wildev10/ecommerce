'use client';

import { useEffect, useState } from 'react';
import { sellerApi } from '@/lib/api';
import { formatPrice, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { ShippingZone } from '@/types';
import { Plus, Pencil, Trash2, Truck, X, Loader2, Save } from 'lucide-react';

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

  const inputCls = 'w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 transition';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Zones de livraison</h1>
          <p className="text-sm text-slate-400 mt-0.5">Définissez vos zones et tarifs de livraison</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition"
        >
          <Plus className="h-4 w-4" /> Ajouter une zone
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">{editingId ? 'Modifier la zone' : 'Nouvelle zone'}</h2>
            <button onClick={resetForm} className="p-1.5 hover:bg-slate-100 rounded-xl transition">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom de la zone *</label>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Cotonou et environs" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prix (FCFA) *</label>
                <input type="number" required min="0" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Délai (jours) *</label>
                <input type="number" required min="1" value={form.estimated_days}
                  onChange={(e) => setForm({ ...form, estimated_days: e.target.value })}
                  placeholder="1" className={inputCls} />
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-sm font-medium text-slate-700">Zone active</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer'}
              </button>
              <button type="button" onClick={resetForm}
                className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Zones table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5">Zone</th>
                <th className="text-right px-5 py-3.5">Prix</th>
                <th className="text-right px-5 py-3.5">Délai</th>
                <th className="text-left px-5 py-3.5">Statut</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {zones.map((z) => (
                <tr key={z.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-slate-400" /> {z.name}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-800">{formatPrice(z.price)}</td>
                  <td className="px-5 py-4 text-right text-slate-600">{z.estimated_days} j</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${z.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {z.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(z)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(z.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {zones.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Truck className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Aucune zone de livraison configurée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
