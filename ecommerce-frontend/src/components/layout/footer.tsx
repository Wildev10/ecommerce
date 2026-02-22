// src/components/layout/footer.tsx

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">
              {process.env.NEXT_PUBLIC_APP_NAME || 'E-Commerce'}
            </h3>
            <p className="text-sm">
              Votre boutique en ligne de confiance.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition">Accueil</a></li>
              <li><a href="/products" className="hover:text-white transition">Produits</a></li>
              <li><a href="/cart" className="hover:text-white transition">Panier</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email : contact@ecommerce.com</li>
              <li>Tél : +229 XX XX XX XX</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          © {new Date().getFullYear()} E-Commerce. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
