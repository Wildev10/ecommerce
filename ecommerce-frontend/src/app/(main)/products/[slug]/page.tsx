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
  const [selectedImage, setSelectedImage] = useState(0);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getById(slug);
      setProduct(data);

      // Load reviews
      const reviewsData = await reviewsApi.getByProduct(data.id);
      setReviews(reviewsData.data);

      // Check wishlist
      if (isAuthenticated) {
        try {
          const isInWishlist = await wishlistApi.check(data.id);
          setInWishlist(isInWishlist);
        } catch { /* non-critical */ }
      }
    } catch {
      toast.error('Produit introuvable');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      quantity,
      stock: product.stock,
    });
    setAdded(true);
    toast.success('Ajouté au panier !');
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = async () => {
    if (!product || !isAuthenticated) {
      toast.error('Connectez-vous pour ajouter aux favoris');
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
    if (!product) return;
    setSubmittingReview(true);
    try {
      await reviewsApi.create(product.id, { rating: reviewRating, comment: reviewComment || undefined });
      toast.success('Avis publié !');
      setShowReviewForm(false);
      setReviewComment('');
      // Reload reviews
      const reviewsData = await reviewsApi.getByProduct(product.id);
      setReviews(reviewsData.data);
    } catch {
      toast.error('Erreur lors de la publication');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loading fullPage text="Chargement du produit..." />;
  if (!product) return null;

  const allImages = [
    product.image_url,
    ...(product.gallery_urls || []),
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5" />
        <span>Retour</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100">
              {allImages.length > 0 ? (
                <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ShoppingCart className="h-24 w-24" />
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${idx === selectedImage ? 'border-blue-600' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              {product.category && (
                <Link href={`/products?category=${product.category.slug}`} className="text-sm text-blue-600 hover:underline">
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">{product.name}</h1>

              {product.reviews_avg_rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-5 w-5 ${s <= Math.round(Number(product.reviews_avg_rating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {Number(product.reviews_avg_rating).toFixed(1)} ({product.reviews_count} avis)
                  </span>
                </div>
              )}

              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${product.stock > 5 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
              </span>

              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                {product.compare_price && product.compare_price > product.price && (
                  <span className="text-xl text-gray-400 line-through ml-3">{formatPrice(product.compare_price)}</span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-gray-600 font-medium">Quantité :</span>
                <div className="flex items-center border rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 hover:bg-gray-100">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-lg transition-colors ${added ? 'bg-green-600 text-white' : product.stock <= 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {added ? <><Check className="h-6 w-6" /> Ajouté !</> : <><ShoppingCart className="h-6 w-6" /> Ajouter au panier</>}
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-lg border ${inWishlist ? 'bg-red-50 border-red-200 text-red-600' : 'hover:bg-gray-50 text-gray-400'}`}
                >
                  <Heart className={`h-6 w-6 ${inWishlist ? 'fill-red-500' : ''}`} />
                </button>
              </div>

              {added && (
                <Link href="/cart" className="block text-center mt-3 text-blue-600 hover:underline">
                  Voir le panier →
                </Link>
              )}

              {product.seller && (
                <p className="text-sm text-gray-500 mt-4">
                  Vendu par <span className="font-medium text-gray-700">{product.seller.name}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Avis clients ({reviews.length})</h2>
          {isAuthenticated && (
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-blue-600 hover:underline font-medium">
              {showReviewForm ? 'Annuler' : 'Écrire un avis'}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)}>
                    <Star className={`h-8 w-8 ${s <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                rows={3}
                placeholder="Votre avis sur ce produit..."
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submittingReview ? 'Publication...' : 'Publier'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Aucun avis pour ce produit</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.user?.name || 'Anonyme'}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{formatDate(review.created_at)}</span>
                </div>
                {review.comment && <p className="text-gray-600 mt-2">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
