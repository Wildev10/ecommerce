// src/app/seller/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/api-helpers';
import Link from 'next/link';
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addedId, setAddedId] = useState<number | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productsApi.getMyProducts();
      setProducts(res.data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      quantity: 1,
      stock: product.stock,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nos Produits</h1>
        <div className="relative max-w-md w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <p className="text-gray-500 mb-6">
        {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé
        {filteredProducts.length > 1 ? 's' : ''}
      </p>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <FunnelIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-blue-600 hover:underline"
            >
              Réinitialiser la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
            >
              <Link href={`/seller/products/${product.id}`}>
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingCartIcon className="h-16 w-16" />
                    </div>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                        Rupture de stock
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/seller/products/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      product.stock > 5
                        ? 'bg-green-100 text-green-700'
                        : product.stock > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} en stock` : 'Épuisé'}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className={`w-full mt-3 flex items-center justify-center space-x-2 py-2 rounded-lg transition-colors font-medium text-sm ${
                    addedId === product.id
                      ? 'bg-green-600 text-white'
                      : product.stock <= 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  <span>
                    {addedId === product.id ? 'Ajouté ✓' : 'Ajouter au panier'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
