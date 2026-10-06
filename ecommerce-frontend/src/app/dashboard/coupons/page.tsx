'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, Ticket, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Coupon } from '@/types';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

const inputCls = 'w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition';

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestion des coupons</h1>
          <p className="text-sm text-slate-400 mt-0.5">Créez et gérez les codes de réduction</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition"
        >
          <Plus className="h-4 w-4" /> Nouveau coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900">{editingId ? 'Modifier le coupon' : 'Nouveau coupon'}</h3>
            <button onClick={resetForm} className="p-1.5 hover:bg-slate-100 rounded-xl transition">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Code *</label>
                <input required value={form.code}
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  className={inputCls} placeholder="PROMO2024" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type *</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'fixed' | 'percent'})} className={inputCls}>
                  <option value="fixed">Montant fixe (FCFA)</option>
                  <option value="percent">Pourcentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Réduction *</label>
                <input required type="number" value={form.discount}
                  onChange={e => setForm({...form, discount: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Commande minimum</label>
                <input type="number" value={form.min_amount}
                  onChange={e => setForm({...form, min_amount: e.target.value})} className={inputCls} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Utilisations max</label>
                <input type="number" value={form.max_uses}
                  onChange={e => setForm({...form, max_uses: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expiration</label>
                <input type="date" value={form.expires_at}
                  onChange={e => setForm({...form, expires_at: e.target.value})} className={inputCls} />
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.is_active}
                onChange={e => setForm({...form, is_active: e.target.checked})}
                className="w-4 h-4 rounded accent-purple-600" />
              <span className="text-sm font-medium text-slate-700">Coupon actif</span>
            </label>
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
                <th className="text-left px-5 py-3.5">Code</th>
                <th className="text-left px-5 py-3.5">Type</th>
                <th className="text-left px-5 py-3.5">Valeur</th>
                <th className="text-left px-5 py-3.5">Utilisations</th>
                <th className="text-left px-5 py-3.5">Expire le</th>
                <th className="text-left px-5 py-3.5">Statut</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" /></td></tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Ticket className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Aucun coupon</p>
                  </td>
                </tr>
              ) : (
                coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 font-mono font-bold text-purple-600">{coupon.code}</td>
                    <td className="px-5 py-4 text-slate-600">{coupon.type === 'fixed' ? 'Fixe' : 'Pourcentage'}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {coupon.type === 'fixed' ? formatPrice(coupon.discount) : `${coupon.discount}%`}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {coupon.used_count || 0}{coupon.max_uses ? `/${coupon.max_uses}` : ''}
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">
                      {coupon.expires_at ? formatDate(coupon.expires_at) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        coupon.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {coupon.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(coupon)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
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
    </div>
  );
}
