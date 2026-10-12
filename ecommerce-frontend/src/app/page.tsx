'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Truck, Shield, ArrowRight, Star,
  ShoppingCart, RefreshCw, Headphones, ChevronRight,
  Zap, BadgePercent, Sparkles, TrendingUp,
} from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import { formatPrice } from '@/lib/api-helpers';
import { useCartStore } from '@/stores/cart-store';
import type { Product, Category } from '@/types';
import toast from 'react-hot-toast';

const CATEGORY_ICONS: Record<string, string> = {
  'electronique-smartphones':      '📱',
  'electronique-ordinateurs':      '💻',
  'electronique-accessoires-tech': '🎧',
  'vetements-homme':               '👔',
  'vetements-femme':               '👗',
  'maison-jardin-mobilier':        '🛋️',
  'maison-jardin-decoration':      '🏮',
  'sports-fitness':                '🏋️',
  'sports-football':               '⚽',
  'sports-running':                '👟',
  'livres-romans':                 '📚',
  'beaute-maquillage':             '💄',
  'beaute-soins-peau':             '🧴',
  'beaute-parfums':                '🌸',
  'jouets-jeux-educatifs':         '🧩',
  'alimentation-epicerie':         '🛒',
  'alimentation-produits-locaux':  '🌿',
};

const CATEGORY_COLORS: Record<string, string> = {
  'electronique-smartphones':      'bg-blue-50 group-hover:bg-blue-100',
  'electronique-ordinateurs':      'bg-violet-50 group-hover:bg-violet-100',
  'electronique-accessoires-tech': 'bg-cyan-50 group-hover:bg-cyan-100',
  'vetements-homme':               'bg-slate-50 group-hover:bg-slate-100',
  'vetements-femme':               'bg-pink-50 group-hover:bg-pink-100',
  'maison-jardin-mobilier':        'bg-amber-50 group-hover:bg-amber-100',
  'maison-jardin-decoration':      'bg-indigo-50 group-hover:bg-indigo-100',
  'sports-fitness':                'bg-red-50 group-hover:bg-red-100',
  'beaute-maquillage':             'bg-fuchsia-50 group-hover:bg-fuchsia-100',
  'alimentation-produits-locaux':  'bg-green-50 group-hover:bg-green-100',
};

const TRUST_BADGES = [
  {
    icon: Truck,
    title: 'Livraison rapide',
    desc: 'Partout au Bénin en 24–48h',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Paiement sécurisé',
    desc: 'MTN MoMo & Moov Money',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: RefreshCw,
    title: 'Retour facile',
    desc: 'Sous 7 jours, sans question',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Headphones,
    title: 'Support client',
    desc: 'Disponible 7j/7',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'text-[var(--border)] fill-[var(--border)]'
          }`}
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

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[var(--dark)]">

        {/* Background accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-orange-500/6 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — Text */}
            <div>
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 text-orange-300 text-xs font-semibold px-4 py-2 rounded-full mb-7">
                <Zap className="h-3.5 w-3.5" />
                Livraison gratuite dès 50 000 FCFA
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black text-white leading-[1.08] tracking-tight mb-5">
                Tout ce dont vous
                <br />
                avez besoin,{' '}
                <span className="gradient-orange">livré chez vous</span>
              </h1>

              <p className="text-base sm:text-lg text-[var(--dark-muted)] leading-relaxed mb-8 max-w-lg">
                Des milliers de produits de qualité — électronique, mode, beauté, sport. Payez avec MTN MoMo ou Moov Money, livré partout au Bénin.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40"
                >
                  <ShoppingBag className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                  Explorer les produits
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/14 border border-white/15 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition backdrop-blur-sm"
                >
                  Créer un compte gratuit
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-8 border-t border-white/8">
                {[
                  { value: '500+', label: 'Produits' },
                  { value: '50+',  label: 'Vendeurs' },
                  { value: '24h',  label: 'Livraison' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-xs text-[var(--dark-muted)] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Visual grid */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Decorative floating cards */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Électronique', emoji: '📱', color: 'from-blue-500/15 to-violet-500/10', border: 'border-blue-500/20' },
                    { label: 'Mode & Style', emoji: '👗', color: 'from-pink-500/15 to-rose-500/10', border: 'border-pink-500/20' },
                    { label: 'Alimentation', emoji: '🌿', color: 'from-green-500/15 to-emerald-500/10', border: 'border-green-500/20' },
                    { label: 'Sports',       emoji: '🏋️', color: 'from-orange-500/15 to-amber-500/10', border: 'border-orange-500/20' },
                  ].map((card, i) => (
                    <div
                      key={card.label}
                      className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center hover:scale-105 transition-transform`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <span className="text-4xl">{card.emoji}</span>
                      <span className="text-white/80 text-sm font-semibold">{card.label}</span>
                    </div>
                  ))}
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-orange-500 text-white rounded-2xl px-4 py-3 shadow-xl shadow-orange-500/30 animate-float">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <div>
                      <p className="text-xs font-black">Promotions</p>
                      <p className="text-[10px] opacity-80">Jusqu&apos;à -30%</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-sm border border-white/15 text-white rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {['🇧🇯','🛍️','✨'].map((e, i) => (
                        <span key={i} className="text-lg">{e}</span>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-black">Made in Bénin</p>
                      <p className="text-[10px] opacity-70">Marketplace locale</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          TRUST BADGES
      ══════════════════════════════════ */}
      <section className="bg-white border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_BADGES.map((b) => (
              <div
                key={b.title}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--border-2)] hover:shadow-sm transition-all"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${b.bg}`}>
                  <b.icon className={`h-4.5 w-4.5 h-[18px] w-[18px] ${b.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">{b.title}</p>
                  <p className="text-xs text-[var(--muted)]">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CATEGORIES
      ══════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">
                Explorez
              </p>
              <h2 className="section-title">Parcourir par catégorie</h2>
              <p className="text-[var(--muted)] text-sm mt-1.5">
                Trouvez exactement ce que vous cherchez
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)] hover:text-orange-600 border border-[var(--border)] hover:border-orange-300 px-4 py-2 rounded-xl transition"
            >
              Tout voir <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`group flex flex-col items-center p-4 rounded-2xl border border-[var(--border)] hover:border-[var(--border-2)] hover:shadow-md transition-all text-center ${CATEGORY_COLORS[cat.slug] ?? 'bg-white hover:bg-[var(--surface-2)]'}`}
              >
                <div className="text-3xl mb-2.5 group-hover:scale-110 transition-transform">
                  {CATEGORY_ICONS[cat.slug] ?? '🛍️'}
                </div>
                <p className="text-xs font-semibold text-[var(--foreground-2)] leading-tight line-clamp-2">
                  {cat.name}
                </p>
                {cat.products_count !== undefined && (
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">{cat.products_count}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════
          PROMO BANNER
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 p-8 sm:p-10">
          {/* Decorative */}
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/8 rounded-full" />
          <div className="absolute -right-6 bottom-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BadgePercent className="h-5 w-5 text-white" />
                <span className="text-white/75 font-semibold text-sm">Offre limitée</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
                Jusqu&apos;à <span className="text-yellow-200">−30%</span> sur la tech !
              </h3>
              <p className="text-white/70 text-sm">
                Smartphones, laptops et accessoires en promotion
              </p>
            </div>
            <Link
              href="/products?category=electronique-smartphones"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-7 py-3.5 rounded-xl font-bold text-sm transition shadow-lg shadow-black/15"
            >
              Voir les offres
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">
                Tendances
              </p>
              <h2 className="section-title">Produits populaires</h2>
              <p className="text-[var(--muted)] text-sm mt-1.5">
                Les favoris de nos clients
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)] hover:text-orange-600 border border-[var(--border)] hover:border-orange-300 px-4 py-2 rounded-xl transition"
            >
              Tout voir <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[var(--foreground)] hover:bg-[var(--foreground-2)] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition shadow-lg shadow-black/10"
            >
              <Sparkles className="h-4 w-4" />
              Voir tous les produits
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════ */}
      <section className="bg-[var(--dark)] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs font-semibold px-4 py-2 rounded-full mb-5">
              <Zap className="h-3.5 w-3.5" />
              Newsletter
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
              Restez informé des meilleures offres
            </h2>
            <p className="text-[var(--dark-muted)] text-sm mb-8 leading-relaxed">
              Inscrivez-vous et soyez les premiers à connaître nos promotions exclusives et nouveaux produits.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Merci pour votre inscription !');
              }}
            >
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-5 py-3 rounded-xl text-sm bg-white/8 border border-white/12 text-white placeholder:text-[var(--dark-muted)] focus:outline-none focus:border-orange-400 focus:bg-white/12 transition"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-orange-500/25 shrink-0"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Product Card ── */
function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
}) {
  const discount =
    product.compare_price && product.compare_price > product.price
      ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
      : null;

  return (
    <div className="product-card group bg-white rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative img-zoom overflow-hidden">
        <div className="aspect-square bg-[var(--surface-2)]">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="product-img w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-[var(--border-2)]" />
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Rupture
            </span>
          )}
        </div>

        {/* Quick add overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-[var(--foreground)] line-clamp-2 mb-1.5 hover:text-orange-600 transition leading-snug">
            {product.name}
          </h3>
        </Link>

        {product.reviews_avg_rating !== undefined && Number(product.reviews_avg_rating) > 0 && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <StarRating rating={Number(product.reviews_avg_rating)} />
            <span className="text-xs text-[var(--muted)]">
              ({Number(product.reviews_avg_rating).toFixed(1)})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div>
            <p className="font-black text-[var(--foreground)] text-base leading-none">
              {formatPrice(product.price)}
            </p>
            {product.compare_price && product.compare_price > product.price && (
              <p className="text-xs text-[var(--muted)] line-through mt-0.5">
                {formatPrice(product.compare_price)}
              </p>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock < 1}
            className="flex items-center justify-center w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed shadow-sm shadow-orange-200 shrink-0"
            title="Ajouter au panier"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
