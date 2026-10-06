'use client';

import { useEffect, useState } from 'react';
import { sellerApi } from '@/lib/api';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Wallet, Withdrawal, PaginationMeta } from '@/types';
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, TrendingUp, Plus, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Validé',     color: 'bg-emerald-100 text-emerald-700' },
  rejected:  { label: 'Rejeté',     color: 'bg-red-100 text-red-700' },
};

export default function SellerWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', method: 'mtn_momo', phone_number: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [w, wds] = await Promise.all([sellerApi.getWallet(), sellerApi.getWithdrawals({ page })]);
      setWallet(w);
      setWithdrawals(wds.data);
      setMeta(wds.meta);
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sellerApi.requestWithdrawal({
        amount: parseFloat(form.amount),
        method: form.method,
        phone_number: form.phone_number,
      });
      toast.success('Demande de retrait envoyée');
      setShowForm(false);
      setForm({ amount: '', method: 'mtn_momo', phone_number: '' });
      load();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSubmitting(false); }
  };

  const inputCls = 'w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 transition';

  if (loading && !wallet) return <Loading text="Chargement..." />;

  const balanceCards = [
    { label: 'Solde disponible', value: wallet?.balance || 0, icon: WalletIcon, color: 'text-blue-600', bg: 'bg-blue-50', highlight: true },
    { label: 'En attente', value: wallet?.pending_balance || 0, icon: ArrowDownCircle, color: 'text-amber-600', bg: 'bg-amber-50', highlight: false },
    { label: 'Total gagné', value: wallet?.total_earned || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', highlight: false },
    { label: 'Total retiré', value: wallet?.total_withdrawn || 0, icon: ArrowUpCircle, color: 'text-slate-500', bg: 'bg-slate-100', highlight: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Portefeuille</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gérez vos revenus et demandes de retrait</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition"
        >
          {showForm ? <><X className="h-4 w-4" /> Annuler</> : <><Plus className="h-4 w-4" /> Demander un retrait</>}
        </button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balanceCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`bg-white rounded-2xl border p-5 ${card.highlight ? 'border-blue-200' : 'border-slate-100'}`}>
              <div className={`inline-flex p-2.5 rounded-xl ${card.bg} mb-3`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className={`text-2xl font-bold ${card.highlight ? 'text-blue-700' : 'text-slate-900'}`}>
                {formatPrice(card.value)}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Withdrawal form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-5">Nouvelle demande de retrait</h2>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Montant (FCFA) *</label>
                <input
                  type="number" required min="1000" step="1"
                  value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={inputCls} placeholder="Min. 1 000 FCFA"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Méthode *</label>
                <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className={inputCls}>
                  <option value="mtn_momo">MTN MoMo</option>
                  <option value="moov_money">Moov Money</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">N° téléphone *</label>
                <input
                  type="text" required value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  placeholder="Ex: 97000000" className={inputCls}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Envoi...' : 'Envoyer la demande'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Withdrawal history */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Historique des retraits</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <th className="text-right px-5 py-3.5">Montant</th>
                <th className="text-left px-5 py-3.5">Méthode</th>
                <th className="text-left px-5 py-3.5">Téléphone</th>
                <th className="text-left px-5 py-3.5">Statut</th>
                <th className="text-left px-5 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {withdrawals.map((w) => {
                const st = STATUS_MAP[w.status] || STATUS_MAP.pending;
                return (
                  <tr key={w.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 text-right font-bold text-slate-900">{formatPrice(w.amount)}</td>
                    <td className="px-5 py-4 text-slate-600">{w.method === 'mtn_momo' ? 'MTN MoMo' : 'Moov Money'}</td>
                    <td className="px-5 py-4 text-slate-500">{w.phone_number}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{formatDate(w.created_at)}</td>
                  </tr>
                );
              })}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-sm">
                    Aucun retrait effectué
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-400">Page {meta.current_page} / {meta.last_page}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)} className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
