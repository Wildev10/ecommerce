'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart, ArrowLeft, Minus, Plus, Star, Heart, Check,
  Truck, Shield, RefreshCw, Package, MessageSquare,
} from 'lucide-react';
import { productsApi, reviewsApi, wishlistApi } from '@/lib/api';
import { formatPrice, formatDate, getProductImage } from '@/lib/api-helpers';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import Loading from '@/components/ui/loading';
import type { Product, Review } from '@/types';
import toast from 'react-hot-toast';

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${cls} ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
      ))}
    </div>
  );
}

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!product || !isAuthenticated) { router.push('/login'); return; }
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
    } catch { toast.error('Erreur'); }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !isAuthenticated) return;
    setSubmittingReview(true);
    try {
      await reviewsApi.create(product.id, { rating: reviewRating, comment: reviewComment });
      toast.success('Avis publié !');
      setShowReviewForm(false);
      setReviewComment('');
      const reviewsData = await reviewsApi.getByProduct(product.id);
      setReviews(reviewsData.data);
    } catch {
      toast.error("Erreur lors de l'ajout de l'avis");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loading text="Chargement..." />;
  if (!product) return null;

  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

  const avgRating = product.reviews_avg_rating ? Number(product.reviews_avg_rating) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-700 transition">Accueil</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-slate-700 transition">Produits</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/products?category=${product.category.id}`} className="hover:text-slate-700 transition">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

        {/* Image */}
        <div className="space-y-3">
          <div className="aspect-square bg-white rounded-2xl border border-slate-100 overflow-hidden relative shadow-sm">
            <img
              src={getProductImage(product.name, product.image_url) ?? ''}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount && (
              <div className="absolute top-4 left-4">
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">-{discount}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Category + title */}
          <div>
            {product.category && (
              <Link
                href={`/products?category=${product.category.id}`}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 transition"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          {avgRating > 0 && (
            <div className="flex items-center gap-3">
              <StarRow rating={avgRating} size="md" />
              <span className="text-sm font-semibold text-slate-700">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-slate-400">({reviews.length} avis)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-extrabold text-blue-700">{formatPrice(product.price)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-lg text-slate-400 line-through pb-0.5">{formatPrice(product.compare_price)}</span>
            )}
            {discount && (
              <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg pb-0.5">
                Économie {formatPrice(product.compare_price! - product.price)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-slate-600 leading-relaxed text-sm border-t border-slate-100 pt-4">
              {product.description}
            </p>
          )}

          {/* Stock */}
          <div>
            {product.stock > 0 ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-sm font-medium text-green-700">
                  {product.stock <= 5 ? `Plus que ${product.stock} en stock !` : 'En stock'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                <span className="text-sm font-medium text-red-600">Rupture de stock</span>
              </div>
            )}
          </div>

          {/* Qty + actions */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              {/* Qty */}
              <div className="flex items-center bg-slate-50 border-2 border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-40 transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-40 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {added ? (
                  <><Check className="h-4 w-4" /> Ajouté au panier !</>
                ) : (
                  <><ShoppingCart className="h-4 w-4" /> Ajouter au panier</>
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={handleToggleWishlist}
                className={`p-3 rounded-xl border-2 transition ${
                  inWishlist
                    ? 'border-red-300 bg-red-50 text-red-500'
                    : 'border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-400 hover:bg-red-50'
                }`}
                title={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            {[
              { icon: Truck, label: 'Livraison', sub: '24–48h au Bénin' },
              { icon: Shield, label: 'Paiement', sub: 'MTN & Moov' },
              { icon: RefreshCw, label: 'Retour', sub: 'Sous 7 jours' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="text-center p-3 bg-slate-50 rounded-xl">
                <Icon className="h-5 w-5 text-blue-700 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-800">{label}</p>
                <p className="text-[10px] text-slate-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-slate-400" />
              Avis clients
              <span className="text-sm font-normal text-slate-400 ml-1">({reviews.length})</span>
            </h2>
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <StarRow rating={avgRating} size="sm" />
                <span className="text-sm text-slate-500">{avgRating.toFixed(1)} / 5</span>
              </div>
            )}
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-sm font-medium text-blue-700 hover:text-blue-900 border-2 border-blue-200 hover:border-blue-400 px-4 py-2 rounded-xl transition"
            >
              {showReviewForm ? 'Annuler' : '+ Écrire un avis'}
            </button>
          )}
        </div>

        {/* Review form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Votre note</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i)}
                    className="transition hover:scale-110"
                  >
                    <Star className={`h-7 w-7 ${i <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 fill-slate-100'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Votre commentaire</label>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce produit..."
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 bg-white transition resize-none"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
            >
              {submittingReview ? 'Publication…' : 'Publier mon avis'}
            </button>
          </form>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="text-center py-10">
            <Star className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun avis pour ce produit.</p>
            <p className="text-slate-400 text-sm mt-1">Soyez le premier à partager votre avis !</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map(review => (
              <div key={review.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {review.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{review.user?.name}</p>
                      <StarRow rating={review.rating} size="sm" />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{formatDate(review.created_at)}</span>
                </div>
                {review.comment && (
                  <p className="text-slate-600 text-sm leading-relaxed ml-12">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
