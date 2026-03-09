'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Commission, PaginationMeta } from '@/types';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:  { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  paid:     { label: 'Payée',      color: 'bg-green-100 text-green-800' },
  refunded: { label: 'Remboursée', color: 'bg-red-100 text-red-800' },
};

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<{ total: number; pending: number; paid: number; rate: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [newRate, setNewRate] = useState('');
  const [savingRate, setSavingRate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [commRes, statsRes] = await Promise.all([
        adminApi.getCommissions({ page, status: filter || undefined }),
        adminApi.getCommissionStats(),
      ]);
      setCommissions(commRes.data);
      setMeta(commRes.meta);
      setStats(statsRes);
      if (!newRate) setNewRate(String(statsRes.rate));
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filter]);

  const handleUpdateRate = async () => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate < 0 || rate > 100) { toast.error('Taux invalide (0-100)'); return; }
    setSavingRate(true);
    try {
      await adminApi.updateCommissionRate(rate);
      toast.success('Taux mis à jour');
      load();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSavingRate(false); }
  };

  if (loading && commissions.length === 0) return <Loading text="Chargement..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>

      {/* Stats + Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Total commissions</p>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.total || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">{formatPrice(stats?.pending || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Payées</p>
          <p className="text-2xl font-bold text-green-600">{formatPrice(stats?.paid || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-2">Taux de commission</p>
          <div className="flex gap-2">
            <input
              type="number" min="0" max="100" step="0.5"
              value={newRate} onChange={(e) => setNewRate(e.target.value)}
              className="border rounded px-2 py-1 w-20 text-sm"
            />
            <span className="text-gray-500 self-center">%</span>
            <button onClick={handleUpdateRate} disabled={savingRate} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
              {savingRate ? '...' : 'Sauver'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="paid">Payées</option>
          <option value="refunded">Remboursées</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Commande</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Vendeur</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Montant</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Taux</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Commission</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Part vendeur</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {commissions.map((c) => {
                const st = STATUS_MAP[c.status] || STATUS_MAP.pending;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">#{c.order?.order_number || c.order_id}</td>
                    <td className="px-6 py-4">{c.seller?.name || `#${c.seller_id}`}</td>
                    <td className="px-6 py-4 text-right">{formatPrice(c.order_amount)}</td>
                    <td className="px-6 py-4 text-right">{c.commission_rate}%</td>
                    <td className="px-6 py-4 text-right font-medium text-blue-600">{formatPrice(c.commission_amount)}</td>
                    <td className="px-6 py-4 text-right">{formatPrice(c.seller_amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(c.created_at)}</td>
                  </tr>
                );
              })}
              {commissions.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Aucune commission</td></tr>
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
