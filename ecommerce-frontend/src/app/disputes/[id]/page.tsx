'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { disputeApi } from '@/lib/api';
import { formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Dispute } from '@/types';
import { ArrowLeft, AlertTriangle, CheckCircle, Send, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open:        { label: 'Ouvert',   color: 'bg-red-100 text-red-700',       icon: AlertTriangle },
  in_progress: { label: 'En cours', color: 'bg-amber-100 text-amber-700',   icon: AlertTriangle },
  resolved:    { label: 'Résolu',   color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  closed:      { label: 'Fermé',    color: 'bg-slate-100 text-slate-500',   icon: CheckCircle },
};

export default function DisputeDetailPage() {
  const params = useParams();
  const { user } = useAuthStore();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      const res = await disputeApi.getById(Number(params.id));
      setDispute(res);
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [params.id]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await disputeApi.addMessage(dispute!.id, message);
      setMessage('');
      toast.success('Message envoyé');
      load();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSending(false); }
  };

  if (loading) return <Loading text="Chargement..." />;
  if (!dispute) return (
    <div className="text-center py-20 max-w-md mx-auto">
      <AlertTriangle className="h-12 w-12 text-slate-200 mx-auto mb-3" />
      <p className="text-slate-500">Litige introuvable</p>
    </div>
  );

  const st = STATUS_MAP[dispute.status] || STATUS_MAP.open;
  const StatusIcon = st.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      <Link href="/disputes" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition">
        <ArrowLeft className="h-4 w-4" /> Retour aux litiges
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{dispute.subject}</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Commande #{dispute.order?.order_number || dispute.order_id} • {formatDate(dispute.created_at)}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${st.color}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {st.label}
          </span>
        </div>
        <p className="text-slate-700 leading-relaxed">{dispute.description}</p>
        {dispute.resolution && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <p className="text-sm font-semibold text-emerald-800 mb-1 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" /> Résolution
            </p>
            <p className="text-sm text-emerald-700">{dispute.resolution}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Discussion</h2>
        </div>

        <div className="p-5 space-y-3 max-h-96 overflow-y-auto bg-slate-50/40">
          {dispute.messages?.map((m) => {
            const isMine = m.user_id === user?.id;
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3.5 ${
                  isMine
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : m.is_admin
                      ? 'bg-purple-50 border border-purple-100 text-slate-900 rounded-bl-sm'
                      : 'bg-white border border-slate-100 text-slate-900 rounded-bl-sm'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${isMine ? 'text-blue-200' : m.is_admin ? 'text-purple-700' : 'text-slate-600'}`}>
                      {m.user?.name || (m.is_admin ? 'Support' : 'Vous')}
                    </span>
                    {m.is_admin && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">Support</span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{m.message}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>{formatDate(m.created_at)}</p>
                </div>
              </div>
            );
          })}
          {(!dispute.messages || dispute.messages.length === 0) && (
            <p className="text-sm text-slate-400 text-center py-6">Aucun message pour l&apos;instant</p>
          )}
        </div>

        {dispute.status !== 'closed' && dispute.status !== 'resolved' && (
          <div className="px-5 py-4 border-t border-slate-100 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ajouter un message..."
              className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 transition"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
