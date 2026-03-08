'use client';

import { useEffect, useState } from 'react';
import { sellerApi } from '@/lib/api';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Wallet, Withdrawal, PaginationMeta } from '@/types';
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Validé',     color: 'bg-green-100 text-green-800' },
  rejected:  { label: 'Rejeté',     color: 'bg-red-100 text-red-800' },
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
      const [w, wds] = await Promise.all([
        sellerApi.getWallet(),
        sellerApi.getWithdrawals({ page }),
      ]);
      setWallet(w);
      setWithdrawals(wds.data);
      setMeta(wds.meta);
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

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

  if (loading && !wallet) return <Loading text="Chargement..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Portefeuille</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          Demander un retrait
        </button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <WalletIcon className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-gray-500">Solde disponible</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(wallet?.balance || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDownCircle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-gray-500">En attente</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{formatPrice(wallet?.pending_balance || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
            <p className="text-sm text-gray-500">Total gagné</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatPrice(wallet?.total_earned || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-2">Total retiré</p>
          <p className="text-2xl font-bold text-gray-600">{formatPrice(wallet?.total_withdrawn || 0)}</p>
        </div>
      </div>

      {/* Withdrawal form */}
      {showForm && (
        <form onSubmit={handleWithdraw} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Nouvelle demande de retrait</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
              <input
                type="number" required min="1000" step="1"
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Méthode *</label>
              <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="mtn_momo">MTN MoMo</option>
                <option value="moov_money">Moov Money</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° téléphone *</label>
              <input
                type="text" required
                value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="Ex: 97000000"
                className="w-full border rounded-lg px-4 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Envoi...' : 'Envoyer la demande'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Annuler</button>
          </div>
        </form>
      )}

      {/* Withdrawal history */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Historique des retraits</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Montant</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Méthode</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Téléphone</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {withdrawals.map((w) => {
                const st = STATUS_MAP[w.status] || STATUS_MAP.pending;
                return (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-right font-bold">{formatPrice(w.amount)}</td>
                    <td className="px-6 py-4">{w.method === 'mtn_momo' ? 'MTN MoMo' : 'Moov Money'}</td>
                    <td className="px-6 py-4 text-gray-500">{w.phone_number}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(w.created_at)}</td>
                  </tr>
                );
              })}
              {withdrawals.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucun retrait</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">Page {meta.current_page} / {meta.last_page}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Précédent</button>
              <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Suivant</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
