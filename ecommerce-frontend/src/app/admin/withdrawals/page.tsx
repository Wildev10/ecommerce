'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Withdrawal, PaginationMeta } from '@/types';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Validé',     color: 'bg-green-100 text-green-800' },
  rejected:  { label: 'Rejeté',     color: 'bg-red-100 text-red-800' },
};

const METHOD_LABELS: Record<string, string> = {
  mtn_momo:    'MTN MoMo',
  moov_money:  'Moov Money',
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [processing, setProcessing] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getWithdrawals({ page, status: filter || undefined });
      setWithdrawals(res.data);
      setMeta(res.meta);
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filter]);

  const handleProcess = async (id: number, action: 'complete' | 'reject') => {
    setProcessing(id);
    try {
      const data: { action: 'complete' | 'reject'; transaction_id?: string } = { action };
      if (action === 'complete') {
        const txId = prompt('ID de transaction (optionnel) :');
        if (txId) data.transaction_id = txId;
      }
      await adminApi.processWithdrawal(id, data);
      toast.success(action === 'complete' ? 'Retrait validé' : 'Retrait rejeté');
      load();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setProcessing(null); }
  };

  if (loading && withdrawals.length === 0) return <Loading text="Chargement..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Demandes de retrait</h1>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="completed">Validés</option>
          <option value="rejected">Rejetés</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Vendeur</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Montant</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Méthode</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Téléphone</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {withdrawals.map((w) => {
                const st = STATUS_MAP[w.status] || STATUS_MAP.pending;
                return (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{w.user?.name || `#${w.user_id}`}</td>
                    <td className="px-6 py-4 text-right font-bold">{formatPrice(w.amount)}</td>
                    <td className="px-6 py-4">{METHOD_LABELS[w.method] || w.method}</td>
                    <td className="px-6 py-4 text-gray-500">{w.phone_number}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(w.created_at)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {w.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleProcess(w.id, 'complete')}
                            disabled={processing === w.id}
                            className="text-green-600 hover:underline text-xs font-medium"
                          >Valider</button>
                          <button
                            onClick={() => handleProcess(w.id, 'reject')}
                            disabled={processing === w.id}
                            className="text-red-600 hover:underline text-xs font-medium"
                          >Rejeter</button>
                        </>
                      )}
                      {w.transaction_id && (
                        <span className="text-xs text-gray-400">TX: {w.transaction_id}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {withdrawals.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Aucune demande de retrait</td></tr>
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
