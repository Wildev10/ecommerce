import Link from 'next/link';
import { Package, Phone, Mail, MapPin, Facebook, Instagram, Twitter, ArrowRight } from 'lucide-react';

const LINKS_SHOP = [
  { label: 'Tous les produits', href: '/products' },
  { label: 'Promotions', href: '/products?sort=popular' },
  { label: 'Nouveautés', href: '/products?sort=newest' },
  { label: 'Mon panier', href: '/cart' },
  { label: 'Mes commandes', href: '/orders' },
];

const LINKS_HELP = [
  { label: 'Comment commander ?', href: '#' },
  { label: 'Livraison & délais', href: '#' },
  { label: 'Retours & remboursements', href: '#' },
  { label: 'Paiement Mobile Money', href: '#' },
  { label: 'Devenir vendeur', href: '/register' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="block text-lg font-bold text-white leading-tight">E-Shop</span>
                <span className="block text-[10px] font-medium text-orange-400 leading-tight tracking-wide uppercase">Bénin</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-5">
              Votre boutique en ligne de confiance au Bénin. Produits de qualité, paiement Mobile Money, livraison rapide.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-700 flex items-center justify-center text-slate-400 hover:text-white transition">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-pink-600 flex items-center justify-center text-slate-400 hover:text-white transition">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-sky-500 flex items-center justify-center text-slate-400 hover:text-white transition">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Boutique */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm tracking-wide uppercase">Boutique</h3>
            <ul className="space-y-3">
              {LINKS_SHOP.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 text-sm hover:text-white transition group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-orange-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm tracking-wide uppercase">Aide</h3>
            <ul className="space-y-3">
              {LINKS_HELP.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 text-sm hover:text-white transition group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-orange-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm tracking-wide uppercase">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Cotonou, Bénin<br />Quartier Cadjehoun</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-orange-400 shrink-0" />
                <a href="tel:+22961790766" className="hover:text-white transition">+229 61 79 07 66</a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-orange-400 shrink-0" />
                <a href="mailto:wilfried.deguenon@epitech.eu" className="hover:text-white transition">wilfried.deguenon@epitech.eu</a>
              </li>
            </ul>

            {/* Payment badges */}
            <div className="mt-6">
              <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">Paiements acceptés</p>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-semibold rounded-lg">MTN MoMo</span>
                <span className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-lg">Moov Money</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} E-Shop Bénin. Tous droits réservés.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition">Conditions d&apos;utilisation</a>
            <a href="#" className="hover:text-slate-300 transition">Confidentialité</a>
            <a href="#" className="hover:text-slate-300 transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
