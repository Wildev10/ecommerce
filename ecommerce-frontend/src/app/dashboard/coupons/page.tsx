'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Coupon } from '@/types';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

const DEFAULT_FORM = {
  code: '',
  type: 'fixed' as 'fixed' | 'percent',
  discount: '',
  min_amount: '',
  max_uses: '',
  expires_at: '',
  is_active: true,
};

export default function DashboardCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadCoupons(); }, [page]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCoupons({ page, per_page: 15 });
      setCoupons(res.data);
      setLastPage(res.meta?.last_page || 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => { setForm(DEFAULT_FORM); setShowForm(false); setEditingId(null); };

  const handleEdit = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      type: coupon.type,
      discount: String(coupon.discount),
      min_amount: coupon.min_amount ? String(coupon.min_amount) : '',
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      is_active: coupon.is_active,
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        code: form.code,
        type: form.type,
        discount: Number(form.discount),
        is_active: form.is_active,
      };
      if (form.min_amount) payload.min_amount = Number(form.min_amount);
      if (form.max_uses) payload.max_uses = Number(form.max_uses);
      if (form.expires_at) payload.expires_at = form.expires_at;

      if (editingId) {
        await adminApi.updateCoupon(editingId, payload);
        toast.success('Coupon mis à jour');
      } else {
        await adminApi.createCoupon(payload);
        toast.success('Coupon créé');
      }
      resetForm();
      loadCoupons();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce coupon ?')) return;
    try {
      await adminApi.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success('Coupon supprimé');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des coupons</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> Nouveau coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-bold">{editingId ? 'Modifier le coupon' : 'Nouveau coupon'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="w-full border rounded-lg px-3 py-2" placeholder="PROMO2024" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'fixed' | 'percent'})} className="w-full border rounded-lg px-3 py-2">
                <option value="fixed">Montant fixe (FCFA)</option>
                <option value="percent">Pourcentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Réduction *</label>
              <input required type="number" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commande minimum</label>
              <input type="number" value={form.min_amount} onChange={e => setForm({...form, min_amount: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utilisations max</label>
              <input type="number" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;expiration</label>
              <input type="date" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
            <span className="text-sm">Actif</span>
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editingId ? 'Mettre à jour' : 'Créer'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"><X className="h-4 w-4 inline" /> Annuler</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Code</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Type</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Valeur</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Utilisations</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Expire le</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Actif</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" /></td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">Aucun coupon</td></tr>
              ) : (
                coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{coupon.code}</td>
                    <td className="px-6 py-4">{coupon.type === 'fixed' ? 'Fixe' : 'Pourcentage'}</td>
                    <td className="px-6 py-4 font-medium">{coupon.type === 'fixed' ? formatPrice(coupon.discount) : `${coupon.discount}%`}</td>
                    <td className="px-6 py-4">{coupon.used_count || 0}{coupon.max_uses ? `/${coupon.max_uses}` : ''}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{coupon.expires_at ? formatDate(coupon.expires_at) : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {coupon.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(coupon)} className="text-blue-600 hover:text-blue-800 p-1"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-4 w-4" /></button>
                      </div>
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
