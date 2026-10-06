'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { shopApi, conversationApi } from '@/lib/api';
import { formatPrice, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Shop, Product } from '@/types';
import { Store, MapPin, Phone, MessageCircle, Package } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [shop, setShop] = useState<(Shop & { products: Product[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await shopApi.getBySlug(params.slug as string);
        setShop(res);
      } catch (e) { toast.error(extractErrorMessage(e)); }
      finally { setLoading(false); }
    };
    load();
  }, [params.slug]);

  const handleContact = async () => {
    if (!user) { router.push('/login'); return; }
    if (!shop) return;
    setContacting(true);
    try {
      await conversationApi.create({ seller_id: shop.user_id });
      router.push('/messages');
    } catch (e) {
      toast.error(extractErrorMessage(e));
      setContacting(false);
    }
  };

  if (loading) return <Loading text="Chargement de la boutique..." />;
  if (!shop) return (
    <div className="text-center py-20 max-w-md mx-auto">
      <Store className="h-16 w-16 text-slate-200 mx-auto mb-4" />
      <p className="text-slate-500 font-medium">Boutique introuvable</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      {shop.banner_url ? (
        <div className="relative rounded-2xl overflow-hidden h-48 md:h-64">
          <Image src={shop.banner_url} alt={shop.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-white overflow-hidden bg-white shrink-0">
                {shop.logo_url ? (
                  <Image src={shop.logo_url} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <Store className="h-7 w-7 text-slate-400" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{shop.name}</h1>
                <div className="flex items-center gap-3 text-sm text-white/70 mt-1">
                  {shop.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {shop.city}</span>}
                  {shop.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {shop.phone}</span>}
                </div>
              </div>
            </div>
            <button
              onClick={handleContact}
              disabled={contacting}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white text-slate-900 rounded-xl text-sm font-semibold transition"
            >
              <MessageCircle className="h-4 w-4" />
              Contacter
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
            {shop.logo_url ? (
              <Image src={shop.logo_url} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <Store className="h-8 w-8 text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">{shop.name}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
              {shop.city && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {shop.city}</span>}
              {shop.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {shop.phone}</span>}
            </div>
          </div>
          <button
            onClick={handleContact}
            disabled={contacting}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60"
          >
            <MessageCircle className="h-4 w-4" />
            Contacter
          </button>
        </div>
      )}

      {/* Description */}
      {shop.description && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <p className="text-slate-600 leading-relaxed">{shop.description}</p>
        </div>
      )}

      {/* Products */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Produits de la boutique
            <span className="ml-2 text-sm text-slate-400 font-normal">({shop.products?.length || 0})</span>
          </h2>
        </div>

        {(!shop.products || shop.products.length === 0) ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Package className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">Cette boutique n&apos;a pas encore de produits</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {shop.products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Store className="h-8 w-8" />
                    </div>
                  )}
                  {product.compare_price && product.compare_price > product.price && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      -{Math.round((1 - product.price / product.compare_price) * 100)}%
                    </span>
                  )}
                </div>
                <div className="p-3.5">
                  <h3 className="font-semibold text-sm text-slate-900 truncate group-hover:text-blue-600 transition">{product.name}</h3>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-blue-600 font-bold text-sm">{formatPrice(product.price)}</span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-xs text-slate-400 line-through">{formatPrice(product.compare_price)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
