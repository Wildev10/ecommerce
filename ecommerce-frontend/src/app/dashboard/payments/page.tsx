'use client';

import { useEffect, useState } from 'react';
import { Loader2, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

interface PaymentRecord {
  id: number;
  order_id: number;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id?: string;
  created_at: string;
  order?: { order_number: string; user?: { name: string } };
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed:    'bg-red-100 text-red-700',
  refunded:  'bg-purple-100 text-purple-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', completed: 'Complété', failed: 'Échoué', refunded: 'Remboursé',
};

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'À la livraison',
  mobile_money: 'Mobile Money',
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  card: 'Carte',
  credit_card: 'Carte bancaire',
  paypal: 'PayPal',
};

export default function DashboardPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadPayments(); }, [page]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPayments({ page, per_page: 15 });
      setPayments(res.data);
      setLastPage(res.meta?.last_page || 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const filtered = statusFilter ? payments.filter(p => p.status === statusFilter) : payments;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestion des paiements</h1>
          <p className="text-sm text-slate-400 mt-0.5">Historique des transactions</p>
        </div>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-purple-400 transition"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="completed">Complété</option>
          <option value="failed">Échoué</option>
          <option value="refunded">Remboursé</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5">ID</th>
                <th className="text-left px-5 py-3.5">Commande</th>
                <th className="text-left px-5 py-3.5">Client</th>
                <th className="text-left px-5 py-3.5">Montant</th>
                <th className="text-left px-5 py-3.5">Méthode</th>
                <th className="text-left px-5 py-3.5">Statut</th>
                <th className="text-left px-5 py-3.5">Transaction</th>
                <th className="text-left px-5 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <CreditCard className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Aucun paiement</p>
                  </td>
                </tr>
              ) : (
                filtered.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 text-slate-400 text-xs">#{payment.id}</td>
                    <td className="px-5 py-4 font-semibold text-purple-600">
                      #{payment.order?.order_number || payment.order_id}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{payment.order?.user?.name || '—'}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{formatPrice(payment.amount)}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {PAYMENT_LABELS[payment.payment_method] || payment.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[payment.status] || 'bg-slate-100 text-slate-700'}`}>
                        {STATUS_LABELS[payment.status] || payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{payment.transaction_id || '—'}</td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{formatDate(payment.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {lastPage > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-400">Page {page} / {lastPage}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
