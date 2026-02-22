// src/components/layout/Footer.tsx

import Link from 'next/link';
import { Package } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">E-Shop</span>
            </div>
            <p className="text-sm">
              Votre boutique en ligne de confiance. Produits de qualité, livraison rapide.
            </p>
          </div>

          {/* Liens */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition">
                  Produits
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition">
                  Panier
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition">
                  Mes commandes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>support@eshop.com</li>
              <li>+229 XX XX XX XX</li>
              <li>Cotonou, Bénin</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} E-Shop. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
