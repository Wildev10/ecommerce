'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { disputeApi } from '@/lib/api';
import { formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Dispute, PaginationMeta } from '@/types';
import { AlertTriangle, Plus, X, Loader2, ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open:        { label: 'Ouvert',   color: 'bg-red-100 text-red-700' },
  in_progress: { label: 'En cours', color: 'bg-amber-100 text-amber-700' },
  resolved:    { label: 'Résolu',   color: 'bg-emerald-100 text-emerald-700' },
  closed:      { label: 'Fermé',    color: 'bg-slate-100 text-slate-500' },
};

const inputCls = 'w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition';

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes litiges</h1>
          <p className="text-sm text-slate-400 mt-0.5">Suivi de vos demandes de médiation</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition"
        >
          {showForm ? <><X className="h-4 w-4" /> Annuler</> : <><Plus className="h-4 w-4" /> Nouveau litige</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-5">Ouvrir un litige</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">N° commande *</label>
              <input
                type="number" required value={form.order_id}
                onChange={(e) => setForm({ ...form, order_id: e.target.value })}
                className={inputCls} placeholder="ID de la commande"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sujet *</label>
              <input
                type="text" required value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className={inputCls} placeholder="Ex: Produit endommagé, non reçu..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
              <textarea
                required value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4} className={`${inputCls} resize-none`}
                placeholder="Décrivez votre problème en détail..."
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit" disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Envoi...' : 'Envoyer le litige'}
              </button>
              <button
                type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {disputes.map((d) => {
          const st = STATUS_MAP[d.status] || STATUS_MAP.open;
          return (
            <Link
              key={d.id}
              href={`/disputes/${d.id}`}
              className="block bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm hover:border-slate-200 transition group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition">{d.subject}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Commande #{d.order?.order_number || d.order_id}</p>
                    <p className="text-xs text-slate-300 mt-0.5">{formatDate(d.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition" />
                </div>
              </div>
              {d.resolution && (
                <div className="mt-3 ml-12 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-sm text-emerald-700">{d.resolution}</p>
                </div>
              )}
            </Link>
          );
        })}

        {disputes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-slate-500 font-medium">Aucun litige ouvert</p>
            <p className="text-slate-400 text-sm mt-1">Tout va bien !</p>
          </div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Page {meta.current_page} / {meta.last_page}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}
              className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
