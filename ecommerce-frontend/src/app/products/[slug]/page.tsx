'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, Minus, Plus, Star, Heart, Check } from 'lucide-react';
import { productsApi, reviewsApi, wishlistApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/api-helpers';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import Loading from '@/components/ui/loading';
import type { Product, Review } from '@/types';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => { if (slug) loadProduct(); }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getById(slug);
      setProduct(data);
      const reviewsData = await reviewsApi.getByProduct(data.id);
      setReviews(reviewsData.data);
      if (isAuthenticated) {
        try {
          const inWish = await wishlistApi.check(data.id);
          setInWishlist(inWish);
        } catch { /* ignore */ }
      }
    } catch {
      toast.error('Produit non trouvé');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image_url || '', quantity, stock: product.stock });
    setAdded(true);
    toast.success(`${product.name} ajouté au panier`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = async () => {
    if (!product || !isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      if (inWishlist) {
        await wishlistApi.remove(product.id);
        setInWishlist(false);
        toast.success('Retiré des favoris');
      } else {
        await wishlistApi.add(product.id);
        setInWishlist(true);
        toast.success('Ajouté aux favoris');
      }
    } catch {
      toast.error('Erreur');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !isAuthenticated) return;
    setSubmittingReview(true);
    try {
      await reviewsApi.create(product.id, { rating: reviewRating, comment: reviewComment });
      toast.success('Avis ajouté avec succès');
      setShowReviewForm(false);
      setReviewComment('');
      const reviewsData = await reviewsApi.getByProduct(product.id);
      setReviews(reviewsData.data);
    } catch {
      toast.error('Erreur lors de l\'ajout de l\'avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loading text="Chargement..." />;
  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour aux produits
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ShoppingCart className="h-20 w-20 text-gray-300" /></div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <Link href={`/products?category=${product.category.id}`} className="text-sm text-blue-600 hover:underline">{product.category.name}</Link>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
          </div>

          {product.reviews_avg_rating !== undefined && product.reviews_avg_rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`h-5 w-5 ${i <= Math.round(product.reviews_avg_rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({reviews.length} avis)</span>
            </div>
          )}

          <p className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</p>

          {product.description && <p className="text-gray-600 leading-relaxed">{product.description}</p>}

          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{product.stock} en stock</span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Rupture de stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-gray-50"><Minus className="h-4 w-4" /></button>
                <span className="px-4 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-3 hover:bg-gray-50"><Plus className="h-4 w-4" /></button>
              </div>
              <button onClick={handleAddToCart} disabled={added} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-white ${added ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {added ? <><Check className="h-5 w-5" /> Ajouté !</> : <><ShoppingCart className="h-5 w-5" /> Ajouter au panier</>}
              </button>
              <button onClick={handleToggleWishlist} className={`p-3 border rounded-lg hover:bg-gray-50 ${inWishlist ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-500'}`}>
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Avis clients ({reviews.length})</h2>
          {isAuthenticated && (
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-sm text-blue-600 hover:underline">
              {showReviewForm ? 'Annuler' : 'Écrire un avis'}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Note</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} type="button" onClick={() => setReviewRating(i)}>
                    <Star className={`h-6 w-6 ${i <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Votre commentaire..." className="w-full border rounded-lg px-3 py-2" rows={3} />
            <button type="submit" disabled={submittingReview} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
              {submittingReview ? 'Envoi...' : 'Publier l\'avis'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun avis pour ce produit. Soyez le premier !</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                      {review.user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{review.user?.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                </div>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`h-4 w-4 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}