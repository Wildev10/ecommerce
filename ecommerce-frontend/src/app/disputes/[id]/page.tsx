'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { disputeApi } from '@/lib/api';
import { formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Dispute } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open:        { label: 'Ouvert',   color: 'bg-red-100 text-red-800' },
  in_progress: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
  resolved:    { label: 'Résolu',   color: 'bg-green-100 text-green-800' },
  closed:      { label: 'Fermé',    color: 'bg-gray-100 text-gray-800' },
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
  if (!dispute) return <p className="text-center py-12 text-gray-500">Litige introuvable</p>;

  const st = STATUS_MAP[dispute.status] || STATUS_MAP.open;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/disputes" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{dispute.subject}</h1>
            <p className="text-sm text-gray-500 mt-1">Commande #{dispute.order?.order_number || dispute.order_id} • {formatDate(dispute.created_at)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
        </div>
        <p className="text-gray-700">{dispute.description}</p>
        {dispute.resolution && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">Résolution :</p>
            <p className="text-sm text-green-700">{dispute.resolution}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Discussion</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
          {dispute.messages?.map((m) => (
            <div key={m.id} className={`p-3 rounded-lg ${m.user_id === user?.id ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-900">{m.user?.name || (m.is_admin ? 'Support' : 'Vous')}</span>
                {m.is_admin && <span className="text-xs bg-blue-200 text-blue-800 px-1.5 rounded">Support</span>}
                <span className="text-xs text-gray-400">{formatDate(m.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700">{m.message}</p>
            </div>
          ))}
          {(!dispute.messages || dispute.messages.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">Aucun message</p>
          )}
        </div>

        {dispute.status !== 'closed' && dispute.status !== 'resolved' && (
          <div className="flex gap-2">
            <input
              value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Ajouter un message..."
              className="flex-1 border rounded-lg px-4 py-2 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            <button onClick={handleSend} disabled={sending || !message.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
              {sending ? '...' : 'Envoyer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
