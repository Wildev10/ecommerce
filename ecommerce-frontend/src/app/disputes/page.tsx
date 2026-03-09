'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { disputeApi } from '@/lib/api';
import { formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Dispute, PaginationMeta } from '@/types';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open:        { label: 'Ouvert',   color: 'bg-red-100 text-red-800' },
  in_progress: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
  resolved:    { label: 'Résolu',   color: 'bg-green-100 text-green-800' },
  closed:      { label: 'Fermé',    color: 'bg-gray-100 text-gray-800' },
};

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ order_id: '', subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await disputeApi.getAll({ page });
      setDisputes(res.data);
      setMeta(res.meta);
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await disputeApi.create({
        order_id: parseInt(form.order_id),
        subject: form.subject,
        description: form.description,
      });
      toast.success('Litige créé');
      setShowForm(false);
      setForm({ order_id: '', subject: '', description: '' });
      load();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSubmitting(false); }
  };

  if (loading && disputes.length === 0) return <Loading text="Chargement..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mes litiges</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          {showForm ? 'Annuler' : 'Nouveau litige'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Ouvrir un litige</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">N° commande *</label>
            <input type="number" required value={form.order_id} onChange={(e) => setForm({ ...form, order_id: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 text-sm" placeholder="ID de la commande" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
            <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 text-sm" placeholder="Ex: Produit endommagé" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4} className="w-full border rounded-lg px-4 py-2 text-sm" placeholder="Décrivez votre problème..." />
          </div>
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {disputes.map((d) => {
          const st = STATUS_MAP[d.status] || STATUS_MAP.open;
          return (
            <Link key={d.id} href={`/disputes/${d.id}`} className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{d.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">Commande #{d.order?.order_number || d.order_id}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(d.created_at)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
              </div>
              {d.resolution && (
                <p className="text-sm text-green-700 bg-green-50 rounded-lg p-2 mt-3">{d.resolution}</p>
              )}
            </Link>
          );
        })}
        {disputes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">Aucun litige</p>
          </div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50">Précédent</button>
          <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50">Suivant</button>
        </div>
      )}
    </div>
  );
}
