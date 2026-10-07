import Link from 'next/link';
import {
  Phone, Mail, MapPin,
  Facebook, Instagram, Twitter,
  Store, ShieldCheck, Truck, RotateCcw,
  ArrowRight, Flame,
} from 'lucide-react';

const LINKS_SHOP = [
  { label: 'Tous les produits', href: '/products' },
  { label: 'Promotions en cours', href: '/products?sort=popular' },
  { label: 'Nouveautés', href: '/products?sort=newest' },
  { label: 'Mon panier', href: '/cart' },
  { label: 'Mes commandes', href: '/orders' },
  { label: 'Devenir vendeur', href: '/register?role=seller' },
];

const LINKS_HELP = [
  { label: 'Comment commander ?', href: '/aide/comment-commander' },
  { label: 'Livraison & délais', href: '/aide/livraison' },
  { label: 'Retours & remboursements', href: '/aide/retours-remboursements' },
  { label: 'Paiement Mobile Money', href: '/aide/paiement-mobile-money' },
  { label: 'Devenir vendeur', href: '/register' },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Paiement sécurisé', sub: 'FedaPay certifié' },
  { icon: Truck, label: 'Livraison rapide', sub: '24h à Cotonou' },
  { icon: RotateCcw, label: 'Retour facile', sub: '7 jours offerts' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400">

      {/* ── TRUST STRIP ── */}
      <div className="border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TRUST_BADGES.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.label} className="flex items-center gap-3.5 bg-slate-900/50 rounded-2xl px-5 py-4 border border-slate-800/60">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold leading-tight">{badge.label}</p>
                    <p className="text-slate-500 text-xs">{badge.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative w-11 h-11 shrink-0">
                <div className="w-11 h-11 bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Store className="h-5.5 w-5.5 h-[22px] w-[22px] text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-700 rounded-full border-2 border-slate-950 flex items-center justify-center">
                  <span className="text-white font-black text-[8px] leading-none">B</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white tracking-tight leading-none">E</span>
                  <span className="text-xl font-black text-orange-500 leading-none">·</span>
                  <span className="text-xl font-black text-white tracking-tight leading-none">Shop</span>
                </div>
                <span className="text-[10px] font-bold text-blue-400 tracking-[0.15em] uppercase leading-none">Bénin</span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-slate-400 mb-6">
              Votre marketplace de confiance au Bénin. Produits authentiques, vendeurs vérifiés, paiement Mobile Money et livraison rapide partout.
            </p>

            {/* Promo badge */}
            <Link
              href="/products?sort=popular"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-full hover:bg-orange-500/20 transition mb-6"
            >
              <Flame className="h-3.5 w-3.5 animate-pulse" />
              Promotions en cours
            </Link>

            {/* Social */}
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Suivez-nous</p>
              <div className="flex gap-2.5">
                <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:bg-blue-700 hover:border-blue-700 flex items-center justify-center text-slate-500 hover:text-white transition">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:border-pink-500 flex items-center justify-center text-slate-500 hover:text-white transition">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" aria-label="Twitter / X" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:bg-sky-500 hover:border-sky-500 flex items-center justify-center text-slate-500 hover:text-white transition">
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Boutique */}
          <div>
            <h3 className="text-white font-black mb-5 text-xs tracking-widest uppercase">Boutique</h3>
            <ul className="space-y-2.5">
              {LINKS_SHOP.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition group"
                  >
                    <ArrowRight className="h-3 w-3 text-orange-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h3 className="text-white font-black mb-5 text-xs tracking-widest uppercase">Aide</h3>
            <ul className="space-y-2.5">
              {LINKS_HELP.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition group"
                  >
                    <ArrowRight className="h-3 w-3 text-orange-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-black mb-5 text-xs tracking-widest uppercase">Contact</h3>
            <ul className="space-y-4 mb-7">
              <li className="flex items-start gap-3.5">
                <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                </div>
                <div className="text-sm">
                  <p className="text-white font-semibold">Cotonou, Bénin</p>
                  <p className="text-slate-500">Quartier Cadjehoun</p>
                </div>
              </li>
              <li className="flex items-center gap-3.5">
                <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="h-3.5 w-3.5 text-orange-400" />
                </div>
                <a href="tel:+22901617907 66" className="text-sm hover:text-white transition font-medium">+229 01 61 79 07 66</a>
              </li>
              <li className="flex items-center gap-3.5">
                <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="h-3.5 w-3.5 text-orange-400" />
                </div>
                <a href="mailto:wilfried.deguenon@epitech.eu" className="text-sm hover:text-white transition break-all">wilfried.deguenon@epitech.eu</a>
              </li>
            </ul>

            {/* Horaires */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 mb-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Horaires du service client</p>
              <p className="text-sm text-white font-semibold">Lun – Sam : 8h00 – 20h00</p>
              <p className="text-xs text-slate-500 mt-0.5">Dimanche : 10h00 – 17h00</p>
            </div>

            {/* Paiements */}
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Paiements acceptés</p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                  <span className="text-sm">📱</span>
                  <span className="text-xs font-bold text-yellow-400">MTN MoMo</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <span className="text-sm">📱</span>
                  <span className="text-xs font-bold text-blue-400">Moov Money</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} <span className="text-slate-400 font-semibold">E-Shop Bénin</span>. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-600">
            <a href="#" className="hover:text-slate-300 transition">Conditions d&apos;utilisation</a>
            <span className="text-slate-800">·</span>
            <a href="#" className="hover:text-slate-300 transition">Politique de confidentialité</a>
            <span className="text-slate-800">·</span>
            <a href="#" className="hover:text-slate-300 transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
