'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
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
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'Livraison',
  mobile_money: 'Mobile Money',
  card: 'Carte',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestion des paiements</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Commande</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Montant</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Méthode</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" /></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">Aucun paiement</td></tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">#{payment.id}</td>
                    <td className="px-6 py-4 font-medium text-blue-600">#{payment.order?.order_number || payment.order_id}</td>
                    <td className="px-6 py-4 text-gray-700">{payment.order?.user?.name || '-'}</td>
                    <td className="px-6 py-4 font-bold">{formatPrice(payment.amount)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{PAYMENT_LABELS[payment.payment_method] || payment.payment_method}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-800'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{formatDate(payment.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Précédent</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} / {lastPage}</span>
          <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Suivant</button>
        </div>
      )}
    </div>
  );
}
