'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Truck,
  Shield,
  ArrowRight,
  Star,
  ShoppingCart,
  Zap,
  RefreshCw,
  Headphones,
  BadgePercent,
  ChevronRight,
} from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import { formatPrice } from '@/lib/api-helpers';
import { useCartStore } from '@/stores/cart-store';
import type { Product, Category } from '@/types';
import toast from 'react-hot-toast';

const CATEGORY_ICONS: Record<string, string> = {
  'electronique-smartphones': '📱',
  'electronique-ordinateurs': '💻',
  'electronique-accessoires-tech': '🎧',
  'vetements-homme': '👔',
  'vetements-femme': '👗',
  'maison-jardin-mobilier': '🛋️',
  'maison-jardin-decoration': '🏮',
  'sports-fitness': '🏋️',
  'sports-football': '⚽',
  'sports-running': '👟',
  'livres-romans': '📚',
  'beaute-maquillage': '💄',
  'beaute-soins-peau': '🧴',
  'beaute-parfums': '🌸',
  'jouets-jeux-educatifs': '🧩',
  'jouets-jeux-de-societe': '🎲',
  'alimentation-epicerie': '🛒',
  'alimentation-boissons': '🥤',
  'alimentation-produits-locaux': '🌿',
};

const TRUST_BADGES = [
  {
    icon: Truck,
    title: 'Livraison rapide',
    desc: 'Partout au Bénin en 24–48h',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    icon: Shield,
    title: 'Paiement sécurisé',
    desc: 'MTN MoMo & Moov Money',
    color: 'bg-green-50 text-green-700',
  },
  {
    icon: RefreshCw,
    title: 'Retour facile',
    desc: 'Sous 7 jours sans question',
    color: 'bg-purple-50 text-purple-700',
  },
  {
    icon: Headphones,
    title: 'Support client',
    desc: 'Disponible 7j/7',
    color: 'bg-orange-50 text-orange-700',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { addItem } = useCartStore();

  useEffect(() => {
    productsApi.getFeatured(8).then(setFeatured).catch(() => {});
    categoriesApi.getAll().then(setCategories).catch(() => {});
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image_url || undefined,
      stock: product.stock,
      quantity: 1,
    });
    toast.success('Ajouté au panier !');
  };

  return (
    <div className="min-h-screen">

      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Zap className="h-4 w-4" />
              Livraison gratuite à partir de 50.000 FCFA
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Tout ce dont
              <br />
              vous avez besoin,{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-300">
                livré chez vous
              </span>
            </h1>

            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
              Découvrez des milliers de produits de qualité — électronique, mode, beauté, sport. Payez avec MTN MoMo ou Moov Money, livré partout au Bénin.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-base transition"
              >
                <ShoppingBag className="h-5 w-5" />
                Découvrir les produits
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-base transition backdrop-blur-sm"
              >
                Créer un compte gratuit
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
              <div>
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-sm text-slate-400">Produits</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-sm text-slate-400">Vendeurs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24–48h</p>
                <p className="text-sm text-slate-400">Livraison</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── TRUST BADGES ───── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_BADGES.map((b) => (
              <div key={b.title} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${b.color}`}>
                  <b.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{b.title}</p>
                  <p className="text-xs text-slate-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CATEGORIES ───── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Parcourir par catégorie</h2>
              <p className="text-sm text-slate-500 mt-1">Trouvez exactement ce que vous cherchez</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900 transition"
            >
              Tout voir <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition text-center"
              >
                <div className="w-12 h-12 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {CATEGORY_ICONS[cat.slug] ?? '🛍️'}
                </div>
                <p className="text-xs font-medium text-slate-700 leading-tight line-clamp-2">{cat.name}</p>
                {cat.products_count !== undefined && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{cat.products_count}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ───── PROMO BANNER ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-linear-to-r from-orange-500 to-amber-500 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BadgePercent className="h-5 w-5 text-white" />
              <span className="text-white/80 font-medium text-sm">Offre limitée</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Jusqu&apos;à -30% sur la tech !</h3>
            <p className="text-white/80 text-sm">Smartphones, laptops et accessoires en promotion</p>
          </div>
          <Link
            href="/products?category=electronique-smartphones"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-7 py-3.5 rounded-xl font-bold transition"
          >
            Voir les offres <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ───── PRODUITS VEDETTE ───── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Produits populaires</h2>
              <p className="text-sm text-slate-500 mt-1">Les favoris de nos clients</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900 transition"
            >
              Tout voir <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {featured.map((product) => (
              <div
                key={product.id}
                className="product-card bg-white rounded-2xl border border-slate-100 overflow-hidden group"
              >
                <Link href={`/products/${product.slug}`} className="block relative">
                  <div className="aspect-square bg-slate-50 overflow-hidden">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-14 w-14 text-slate-200" />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="bg-slate-800/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Rupture
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="p-3.5">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1.5 hover:text-blue-700 transition leading-snug">
                      {product.name}
                    </h3>
                  </Link>

                  {product.reviews_avg_rating && Number(product.reviews_avg_rating) > 0 && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <StarRating rating={Number(product.reviews_avg_rating)} />
                      <span className="text-xs text-slate-500">({Number(product.reviews_avg_rating).toFixed(1)})</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div>
                      <p className="font-bold text-blue-700 text-base">{formatPrice(product.price)}</p>
                      {product.compare_price && product.compare_price > product.price && (
                        <p className="text-xs text-slate-400 line-through leading-none">{formatPrice(product.compare_price)}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock < 1}
                      className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      title="Ajouter au panier"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-semibold transition"
            >
              Voir tous les produits
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      )}

      {/* ───── NEWSLETTER ───── */}
      <section className="bg-slate-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Restez informé des meilleures offres
          </h2>
          <p className="text-slate-400 mb-7 max-w-md mx-auto">
            Inscrivez-vous à notre newsletter et soyez les premiers à connaître nos promotions exclusives.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); toast.success('Merci pour votre inscription !'); }}>
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-5 py-3 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-400 transition"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition shrink-0"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
