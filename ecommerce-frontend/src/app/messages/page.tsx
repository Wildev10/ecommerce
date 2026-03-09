'use client';

import { useEffect, useState } from 'react';
import { conversationApi } from '@/lib/api';
import { formatDate, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Conversation, Message } from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';

export default function MessagesPage() {
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes messages</h1>
      <div className="flex h-[calc(100vh-14rem)] bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Conversation list */}
        <div className={`w-full sm:w-80 border-r flex flex-col ${activeConv ? 'hidden sm:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => {
              const otherName = c.buyer_id === user?.id ? c.seller?.name : c.buyer?.name;
              return (
                <button
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${activeConv?.id === c.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-gray-900 truncate">{otherName || 'Vendeur'}</p>
                    {(c.unread_count ?? 0) > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">{c.unread_count}</span>
                    )}
                  </div>
                  {c.last_message && <p className="text-xs text-gray-500 truncate mt-1">{c.last_message.content}</p>}
                  {c.product && <p className="text-xs text-blue-500 truncate mt-0.5">Re: {c.product.name}</p>}
                </button>
              );
            })}
            {conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
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
              <div className="px-4 py-3 border-b flex items-center gap-3">
                <button onClick={() => setActiveConv(null)} className="sm:hidden">
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {activeConv.buyer_id === user?.id ? activeConv.seller?.name : activeConv.buyer?.name}
                  </p>
                  {activeConv.product && <p className="text-xs text-gray-500">Re: {activeConv.product.name}</p>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingConv ? (
                  <Loading text="" />
                ) : (
                  activeConv.messages?.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-2 ${m.sender_id === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        <p className="text-sm">{m.content}</p>
                        <p className={`text-[10px] mt-1 ${m.sender_id === user?.id ? 'text-blue-200' : 'text-gray-400'}`}>{formatDate(m.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-3 border-t flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Écrire un message..."
                  className="flex-1 border rounded-full px-4 py-2 text-sm"
                />
                <button onClick={handleSend} disabled={sending || !message.trim()} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageCircle className="h-16 w-16 mb-3" />
              <p className="text-sm">Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
