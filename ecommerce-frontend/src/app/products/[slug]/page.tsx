'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart, ArrowLeft, Minus, Plus, Star, Heart, Check,
  Truck, Shield, RefreshCw, Package, MessageSquare, ChevronRight,
} from 'lucide-react';
import { productsApi, reviewsApi, wishlistApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/api-helpers';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import Loading from '@/components/ui/loading';
import type { Product, Review } from '@/types';
import toast from 'react-hot-toast';

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} ${
            i <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-[var(--surface-2)] text-[var(--border)]'
          }`}
        />
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

  const discount =
    product.compare_price && product.compare_price > product.price
      ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
      : null;

  const avgRating = product.reviews_avg_rating ? Number(product.reviews_avg_rating) : 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-6 flex-wrap">
          <Link href="/" className="hover:text-[var(--foreground)] transition">Accueil</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/products" className="hover:text-[var(--foreground)] transition">Produits</Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <Link href={`/products?category=${product.category.id}`} className="hover:text-[var(--foreground)] transition">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-[var(--foreground-2)] font-medium line-clamp-1">{product.name}</span>
        </nav>

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] mb-8 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-12">

          {/* Image */}
          <div>
            <div className="aspect-square bg-white rounded-3xl border border-[var(--border)] overflow-hidden relative shadow-sm">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--surface-2)]">
                  <Package className="h-20 w-20 text-[var(--border-2)]" />
                </div>
              )}
              {discount && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-sm font-black px-3 py-1.5 rounded-full shadow-md">
                    -{discount}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">

            {/* Category + title */}
            <div>
              {product.category && (
                <Link
                  href={`/products?category=${product.category.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 uppercase tracking-wider transition mb-2"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--foreground)] leading-[1.15] tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-3">
                <StarRow rating={avgRating} size="md" />
                <span className="text-sm font-bold text-[var(--foreground)]">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-[var(--muted)]">({reviews.length} avis)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 py-4 border-y border-[var(--border)]">
              <span className="text-3xl font-black text-[var(--foreground)]">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-lg text-[var(--muted)] line-through pb-0.5">
                  {formatPrice(product.compare_price)}
                </span>
              )}
              {discount && (
                <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg pb-0.5">
                  Économie {formatPrice(product.compare_price! - product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-[var(--foreground-2)] leading-relaxed text-sm">
                {product.description}
              </p>
            )}

            {/* Stock */}
            <div>
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-700">
                    {product.stock <= 5
                      ? `Plus que ${product.stock} en stock !`
                      : 'En stock — livraison sous 24–48h'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-sm font-semibold text-red-600">Rupture de stock</span>
                </div>
              )}
            </div>

            {/* Qty + CTA */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center gap-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-30 transition text-[var(--foreground)]"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-black text-[var(--foreground)]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-30 transition text-[var(--foreground)]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={added}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition shadow-md ${
                    added
                      ? 'bg-emerald-500 shadow-emerald-200 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200 text-white'
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
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-[var(--border)] text-[var(--muted)] hover:border-red-200 hover:text-red-400 hover:bg-red-50'
                  }`}
                  title={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            )}

            {/* Trust mini-badges */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { icon: Truck,      label: 'Livraison',  sub: '24–48h au Bénin' },
                { icon: Shield,     label: 'Paiement',   sub: 'MTN & Moov' },
                { icon: RefreshCw,  label: 'Retour',     sub: 'Sous 7 jours' },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] text-center"
                >
                  <Icon className="h-4.5 w-4.5 h-[18px] w-[18px] text-orange-500" />
                  <p className="text-xs font-semibold text-[var(--foreground)]">{label}</p>
                  <p className="text-[10px] text-[var(--muted)]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm p-6 sm:p-8">
          <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-black text-[var(--foreground)] flex items-center gap-2.5 mb-1">
                <MessageSquare className="h-5 w-5 text-[var(--muted)]" />
                Avis clients
                <span className="text-sm font-semibold text-[var(--muted)]">({reviews.length})</span>
              </h2>
              {avgRating > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <StarRow rating={avgRating} size="sm" />
                  <span className="text-sm text-[var(--muted)]">{avgRating.toFixed(1)} / 5</span>
                </div>
              )}
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-sm font-bold text-[var(--foreground)] hover:text-orange-600 border-2 border-[var(--border)] hover:border-orange-300 px-4 py-2 rounded-xl transition"
              >
                {showReviewForm ? 'Annuler' : '+ Écrire un avis'}
              </button>
            )}
          </div>

          {/* Review form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="mb-8 p-5 bg-[var(--surface-2)] rounded-2xl border border-[var(--border)] space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2.5">
                  Votre note
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewRating(i)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star className={`h-7 w-7 ${i <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-[var(--border-2)] fill-[var(--border)]'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">
                  Votre commentaire
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  className="w-full border-2 border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-white transition resize-none"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-sm shadow-orange-200"
              >
                {submittingReview ? 'Publication…' : 'Publier mon avis'}
              </button>
            </form>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[var(--surface-2)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-[var(--border-2)]" />
              </div>
              <p className="text-[var(--foreground)] font-semibold mb-1">Aucun avis pour ce produit</p>
              <p className="text-[var(--muted)] text-sm">Soyez le premier à partager votre avis !</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {reviews.map((review) => (
                <div key={review.id} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-black shrink-0">
                        {review.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--foreground)] text-sm">
                          {review.user?.name}
                        </p>
                        <StarRow rating={review.rating} size="sm" />
                      </div>
                    </div>
                    <span className="text-xs text-[var(--muted)] shrink-0">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-[var(--foreground-2)] text-sm leading-relaxed ml-12">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
