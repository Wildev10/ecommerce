'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { User, Shop, PaginationMeta } from '@/types';

type SellerWithShop = User & { shop?: Shop; seller_status?: string };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:  { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approuvé',   color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeté',     color: 'bg-red-100 text-red-800' },
  banned:   { label: 'Banni',      color: 'bg-gray-100 text-gray-800' },
};

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<SellerWithShop[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSellers({ page, seller_status: filter || undefined });
      setSellers(res.data);
      setMeta(res.meta);
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filter]);

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'ban') => {
    try {
      if (action === 'approve') await adminApi.approveSeller(id);
      else if (action === 'reject') await adminApi.rejectSeller(id);
      else await adminApi.banSeller(id);
      toast.success('Action effectuée');
      load();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  if (loading && sellers.length === 0) return <Loading text="Chargement..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des vendeurs</h1>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvés</option>
          <option value="rejected">Rejetés</option>
          <option value="banned">Bannis</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Vendeur</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Boutique</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Inscrit le</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sellers.map((s) => {
                const st = STATUS_MAP[s.seller_status || 'pending'] || STATUS_MAP.pending;
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {s.shop?.name || <span className="text-gray-400 italic">Aucune</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(s.created_at)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {(s.seller_status === 'pending' || !s.seller_status) && (
                        <>
                          <button onClick={() => handleAction(s.id, 'approve')} className="text-green-600 hover:underline text-xs font-medium">Approuver</button>
                          <button onClick={() => handleAction(s.id, 'reject')} className="text-red-600 hover:underline text-xs font-medium">Rejeter</button>
                        </>
                      )}
                      {s.seller_status === 'approved' && (
                        <button onClick={() => handleAction(s.id, 'ban')} className="text-red-600 hover:underline text-xs font-medium">Bannir</button>
                      )}
                      {s.seller_status === 'rejected' && (
                        <button onClick={() => handleAction(s.id, 'approve')} className="text-green-600 hover:underline text-xs font-medium">Approuver</button>
                      )}
                      {s.seller_status === 'banned' && (
                        <button onClick={() => handleAction(s.id, 'approve')} className="text-green-600 hover:underline text-xs font-medium">Réactiver</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sellers.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucun vendeur trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">Page {meta.current_page} / {meta.last_page} ({meta.total} vendeurs)</p>
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
