// src/app/page.tsx

import Link from 'next/link';
import { ShoppingBag, Truck, Shield, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenue sur <span className="text-yellow-300">E-Shop</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Découvrez nos produits de qualité à des prix imbattables
            </p>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition"
            >
              <ShoppingBag size={24} />
              <span>Voir les produits</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm">
            <Truck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Livraison rapide</h3>
            <p className="text-gray-600">Livraison partout au Bénin en 24-48h</p>
          </div>
          <div className="text-center p-8 bg-white rounded-xl shadow-sm">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Paiement sécurisé</h3>
            <p className="text-gray-600">Vos transactions sont 100% sécurisées</p>
          </div>
          <div className="text-center p-8 bg-white rounded-xl shadow-sm">
            <ShoppingBag className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Produits de qualité</h3>
            <p className="text-gray-600">Sélection rigoureuse de nos produits</p>
          </div>
        </div>
      </section>
    </div>
  );
}
