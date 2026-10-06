'use client';

import { useEffect, useRef, useState } from 'react';
import { conversationApi } from '@/lib/api';
import { formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Conversation, Message } from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import { MessageCircle, Send, ArrowLeft, Loader2 } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<(Conversation & { messages: Message[] }) | null>(null);
  const [loadingConv, setLoadingConv] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await conversationApi.getAll();
      setConversations(res.data);
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Mes messages</h1>
      </div>

      <div className="flex h-[calc(100vh-12rem)] bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {/* Conversation list */}
        <div className={`w-full sm:w-80 border-r border-slate-100 flex flex-col ${activeConv ? 'hidden sm:flex' : 'flex'}`}>
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {conversations.map((c) => {
              const otherName = c.buyer_id === user?.id ? c.seller?.name : c.buyer?.name;
              const isActive = activeConv?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={`w-full text-left px-4 py-3.5 transition ${
                    isActive ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-slate-50 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {(otherName || 'V').charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-sm text-slate-900 truncate">{otherName || 'Vendeur'}</p>
                    </div>
                    {(c.unread_count ?? 0) > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shrink-0">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                  {c.last_message && (
                    <p className="text-xs text-slate-400 truncate mt-1 ml-10.5">{c.last_message.content}</p>
                  )}
                  {c.product && (
                    <p className="text-xs text-blue-500 truncate mt-0.5 ml-10.5">Re: {c.product.name}</p>
                  )}
                </button>
              );
            })}
            {conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                <MessageCircle className="h-12 w-12 mb-3 text-slate-200" />
                <p className="text-sm font-medium">Aucune conversation</p>
                <p className="text-xs text-slate-300 mt-1">Contactez un vendeur pour démarrer</p>
              </div>
            )}
          </div>
        </div>

        {/* Active conversation */}
        <div className={`flex-1 flex flex-col min-w-0 ${activeConv ? 'flex' : 'hidden sm:flex'}`}>
          {activeConv ? (
            <>
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => setActiveConv(null)}
                  className="sm:hidden p-1.5 hover:bg-slate-100 rounded-xl transition"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500" />
                </button>
                <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {((activeConv.buyer_id === user?.id ? activeConv.seller?.name : activeConv.buyer?.name) || 'V').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">
                    {activeConv.buyer_id === user?.id ? activeConv.seller?.name : activeConv.buyer?.name}
                  </p>
                  {activeConv.product && (
                    <p className="text-xs text-slate-400">Re: {activeConv.product.name}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                {loadingConv ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <>
                    {activeConv.messages?.map((m) => {
                      const isMine = m.sender_id === user?.id;
                      return (
                        <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isMine
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white border border-slate-100 text-slate-900 rounded-bl-sm'
                          }`}>
                            <p className="text-sm leading-relaxed">{m.content}</p>
                            <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                              {formatDate(m.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Écrire un message..."
                  className="flex-1 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl disabled:opacity-50 transition"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-10 w-10 text-slate-200" />
              </div>
              <p className="font-medium text-slate-500">Sélectionnez une conversation</p>
              <p className="text-sm text-slate-300 mt-1">Choisissez à gauche pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
