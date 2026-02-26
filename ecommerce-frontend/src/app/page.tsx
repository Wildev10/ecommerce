'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Truck, Shield, ArrowRight, Star, ShoppingCart } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import { formatPrice } from '@/lib/api-helpers';
import { useCartStore } from '@/stores/cart-store';
import type { Product, Category } from '@/types';
import toast from 'react-hot-toast';

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
    toast.success('Ajouté au panier');
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6">
              Bienvenue sur <span className="text-yellow-300">E-Shop Bénin</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Découvrez nos produits de qualité à des prix imbattables. Paiement Mobile Money accepté.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition"
              >
                <ShoppingBag size={24} />
                <span>Voir les produits</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition"
              >
                <span>Créer un compte</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <Truck className="h-10 w-10 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Livraison rapide</h3>
            <p className="text-sm text-gray-600">Partout au Bénin en 24-48h</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <Shield className="h-10 w-10 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Paiement sécurisé</h3>
            <p className="text-sm text-gray-600">MTN MoMo & Moov Money</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <ShoppingBag className="h-10 w-10 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Produits de qualité</h3>
            <p className="text-sm text-gray-600">Sélection rigoureuse</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <Star className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Livraison gratuite</h3>
            <p className="text-sm text-gray-600">Dès {formatPrice(50000)} d&apos;achat</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Catégories</h2>
            <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
              Tout voir <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:bg-blue-200 transition">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <p className="font-medium text-gray-900 text-sm truncate">{cat.name}</p>
                {cat.products_count !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">{cat.products_count} produits</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Produits populaires</h2>
            <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
              Tout voir <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition">
                <Link href={`/products/${product.slug}`}>
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-3 sm:p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-medium text-gray-900 text-sm truncate hover:text-blue-600 transition">
                      {product.name}
                    </h3>
                  </Link>
                  {product.reviews_avg_rating && (
                    <div className="flex items-center mt-1">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-gray-600 ml-1">{Number(product.reviews_avg_rating).toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="font-bold text-blue-600">{formatPrice(product.price)}</p>
                      {product.compare_price && product.compare_price > product.price && (
                        <p className="text-xs text-gray-400 line-through">{formatPrice(product.compare_price)}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock < 1}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}