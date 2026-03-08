'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { shopApi, conversationApi } from '@/lib/api';
import { formatPrice, extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Shop, Product } from '@/types';
import { Store, MapPin, Phone, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [shop, setShop] = useState<(Shop & { products: Product[] }) | null>(null);
  const [loading, setLoading] = useState(true);

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
    try {
      const res = await conversationApi.create({ seller_id: shop.user_id });
      router.push('/messages');
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  if (loading) return <Loading text="Chargement de la boutique..." />;
  if (!shop) return <p className="text-center py-12 text-gray-500">Boutique introuvable</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      {shop.banner_url && (
        <div className="relative rounded-2xl overflow-hidden h-48 md:h-64">
          <img src={shop.banner_url} alt={shop.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 flex items-center gap-4">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt="Logo" className="w-16 h-16 rounded-xl border-2 border-white object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center">
                <Store className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{shop.name}</h1>
              <div className="flex items-center gap-3 text-sm text-white/80 mt-1">
                {shop.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {shop.city}</span>}
                {shop.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {shop.phone}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {!shop.banner_url && (
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          {shop.logo_url ? (
            <img src={shop.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
              <Store className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              {shop.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {shop.city}</span>}
              {shop.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {shop.phone}</span>}
            </div>
          </div>
          <button onClick={handleContact} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <MessageCircle className="h-4 w-4" /> Contacter
          </button>
        </div>
      )}

      {shop.description && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-700">{shop.description}</p>
        </div>
      )}

      {/* Products */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Produits ({shop.products?.length || 0})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {shop.products?.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Store className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-900 truncate">{product.name}</h3>
                <p className="text-blue-600 font-bold text-sm mt-1">{formatPrice(product.price)}</p>
                {product.compare_price && (
                  <p className="text-xs text-gray-400 line-through">{formatPrice(product.compare_price)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
        {(!shop.products || shop.products.length === 0) && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">Cette boutique n&apos;a pas encore de produits</p>
          </div>
        )}
      </div>
    </div>
  );
}
