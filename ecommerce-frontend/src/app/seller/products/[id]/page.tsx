// src/app/seller/products/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/api-helpers';
import { useCartStore } from '@/stores/cart-store';
import Link from 'next/link';
import {
  ShoppingCartIcon,
  ArrowLeftIcon,
  MinusIcon,
  PlusIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (params.id) {
      loadProduct(Number(params.id));
    }
  }, [params.id]);

  const loadProduct = async (id: number) => {
    try {
      setLoading(true);
      const data = await productsApi.getById(id);
      setProduct(data);
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/seller/products');
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
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Produit non trouvé</p>
        <Link href="/seller/products" className="text-blue-600 hover:underline mt-4 inline-block">
          Retour aux produits
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span>Retour</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="aspect-square bg-gray-100">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ShoppingCartIcon className="h-24 w-24" />
              </div>
            )}
          </div>

          <div className="p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                  product.stock > 5
                    ? 'bg-green-100 text-green-700'
                    : product.stock > 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
              </span>

              <p className="text-gray-600 leading-relaxed mb-6">
                {product.description}
              </p>

              <p className="text-4xl font-bold text-blue-600 mb-8">
                {formatPrice(product.price)}
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-gray-600 font-medium">Quantité :</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium text-lg transition-colors ${
                  added
                    ? 'bg-green-600 text-white'
                    : product.stock <= 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {added ? (
                  <>
                    <CheckCircleIcon className="h-6 w-6" />
                    <span>Ajouté au panier !</span>
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="h-6 w-6" />
                    <span>Ajouter au panier</span>
                  </>
                )}
              </button>

              {added && (
                <Link
                  href="/cart"
                  className="block text-center mt-3 text-blue-600 hover:underline"
                >
                  Voir le panier →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
