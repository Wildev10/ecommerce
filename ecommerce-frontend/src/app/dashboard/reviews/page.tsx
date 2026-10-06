'use client';

import { useEffect, useState } from 'react';
import { Star, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Review } from '@/types';
import { formatDate, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

export default function DashboardReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadReviews(); }, [page]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReviews({ page, per_page: 15 });
      setReviews(res.data);
      setLastPage(res.meta?.last_page || 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet avis ?')) return;
    try {
      await adminApi.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Avis supprimé');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Gestion des avis</h1>
        <p className="text-sm text-slate-400 mt-0.5">Modérez les avis clients</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5">Utilisateur</th>
                <th className="text-left px-5 py-3.5">Produit</th>
                <th className="text-left px-5 py-3.5">Note</th>
                <th className="text-left px-5 py-3.5">Commentaire</th>
                <th className="text-left px-5 py-3.5">Date</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" /></td></tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Star className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Aucun avis</p>
                  </td>
                </tr>
              ) : (
                reviews.map(review => (
                  <tr key={review.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 font-semibold text-slate-900">{review.user?.name || '—'}</td>
                    <td className="px-5 py-4 text-slate-600 max-w-36 truncate">
                      {review.product?.name || `#${review.product_id}`}
                    </td>
                    <td className="px-5 py-4">{renderStars(review.rating)}</td>
                    <td className="px-5 py-4 text-slate-500 max-w-60 truncate">{review.comment || '—'}</td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{formatDate(review.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleDelete(review.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
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
