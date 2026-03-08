'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Dispute, PaginationMeta } from '@/types';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open:        { label: 'Ouvert',     color: 'bg-red-100 text-red-800' },
  in_progress: { label: 'En cours',   color: 'bg-yellow-100 text-yellow-800' },
  resolved:    { label: 'Résolu',     color: 'bg-green-100 text-green-800' },
  closed:      { label: 'Fermé',      color: 'bg-gray-100 text-gray-800' },
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDisputes({ page, status: filter || undefined });
      setDisputes(res.data);
      setMeta(res.meta);
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filter]);

  if (loading && disputes.length === 0) return <Loading text="Chargement..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Litiges</h1>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Tous les statuts</option>
          <option value="open">Ouverts</option>
          <option value="in_progress">En cours</option>
          <option value="resolved">Résolus</option>
          <option value="closed">Fermés</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Sujet</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Acheteur</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Commande</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {disputes.map((d) => {
                const st = STATUS_MAP[d.status] || STATUS_MAP.open;
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">#{d.id}</td>
                    <td className="px-6 py-4">{d.subject}</td>
                    <td className="px-6 py-4">{d.user?.name || `#${d.user_id}`}</td>
                    <td className="px-6 py-4">#{d.order?.order_number || d.order_id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(d.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/disputes/${d.id}`} className="text-blue-600 hover:underline text-xs font-medium">Voir</Link>
                    </td>
                  </tr>
                );
              })}
              {disputes.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Aucun litige</td></tr>
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
