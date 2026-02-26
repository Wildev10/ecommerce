'use client';

import { useEffect, useState } from 'react';
import { Star, Trash2, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Review } from '@/types';
import { formatDate, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

export default function DashboardReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

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
        <Star key={i} className={`h-4 w-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestion des avis</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Utilisateur</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Produit</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Note</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Commentaire</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" /></td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Aucun avis</td></tr>
              ) : (
                reviews.map(review => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{review.user?.name || '-'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-[150px] truncate">{review.product?.name || `#${review.product_id}`}</td>
                    <td className="px-6 py-4">{renderStars(review.rating)}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-[250px] truncate">{review.comment || '-'}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{formatDate(review.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(review.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
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
