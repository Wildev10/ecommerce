'use client';

import { useEffect, useState } from 'react';
import { conversationApi } from '@/lib/api';
import { formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Conversation, Message } from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';

export default function SellerMessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<(Conversation & { messages: Message[] }) | null>(null);
  const [loadingConv, setLoadingConv] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await conversationApi.getAll();
      setConversations(res.data);
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadConversations(); }, []);

  const openConversation = async (id: number) => {
    setLoadingConv(true);
    try {
      const res = await conversationApi.getById(id);
      setActiveConv(res);
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoadingConv(false); }
  };

  const handleSend = async () => {
    if (!message.trim() || !activeConv) return;
    setSending(true);
    try {
      await conversationApi.sendMessage(activeConv.id, message);
      setMessage('');
      openConversation(activeConv.id);
      loadConversations();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSending(false); }
  };

  if (loading) return <Loading text="Chargement..." />;

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Conversation list */}
      <div className={`w-full sm:w-80 border-r border-slate-100 flex flex-col ${activeConv ? 'hidden sm:flex' : 'flex'}`}>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Messages</h2>
          <p className="text-xs text-slate-400 mt-0.5">{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => {
            const otherName = c.buyer_id === user?.id ? c.seller?.name : c.buyer?.name;
            const isActive = activeConv?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => openConversation(c.id)}
                className={`w-full text-left px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50 transition ${isActive ? 'bg-orange-50 border-l-2 border-l-orange-400' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-slate-900 truncate">{otherName || 'Utilisateur'}</p>
                      {(c.unread_count ?? 0) > 0 && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 shrink-0 ml-1">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                    {c.product && (
                      <p className="text-xs text-blue-500 truncate mt-0.5">Re: {c.product.name}</p>
                    )}
                    {c.last_message && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{c.last_message.content}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 p-8">
              <MessageCircle className="h-12 w-12 mb-2" />
              <p className="text-sm">Aucune conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* Active conversation */}
      <div className={`flex-1 flex flex-col ${activeConv ? 'flex' : 'hidden sm:flex'}`}>
        {activeConv ? (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <button onClick={() => setActiveConv(null)} className="sm:hidden p-1.5 hover:bg-slate-100 rounded-xl">
                <ArrowLeft className="h-4 w-4 text-slate-500" />
              </button>
              <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                {(activeConv.buyer_id === user?.id ? activeConv.seller?.name : activeConv.buyer?.name)?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">
                  {activeConv.buyer_id === user?.id ? activeConv.seller?.name : activeConv.buyer?.name}
                </p>
                {activeConv.product && <p className="text-xs text-slate-400">Re: {activeConv.product.name}</p>}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
              {loadingConv ? (
                <div className="flex items-center justify-center h-full">
                  <Loading text="" />
                </div>
              ) : (
                activeConv.messages?.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      m.sender_id === user?.id
                        ? 'bg-orange-500 text-white rounded-br-sm'
                        : 'bg-white text-slate-900 border border-slate-100 rounded-bl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      <p className={`text-[10px] mt-1 ${m.sender_id === user?.id ? 'text-orange-200' : 'text-slate-400'}`}>
                        {formatDate(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Écrire un message..."
                className="flex-1 border-2 border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition"
              />
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full disabled:opacity-50 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <MessageCircle className="h-16 w-16 mb-3" />
            <p className="text-sm font-medium">Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
