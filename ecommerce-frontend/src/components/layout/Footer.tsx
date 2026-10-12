import Link from 'next/link';
import {
  Phone, Mail, MapPin,
  Facebook, Instagram, Twitter,
  ShieldCheck, Truck, RotateCcw, Headphones,
  ArrowUpRight, Sparkles,
} from 'lucide-react';

const LINKS_SHOP = [
  { label: 'Tous les produits', href: '/products' },
  { label: 'Promotions', href: '/products?sort=popular' },
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

const TRUST = [
  { icon: ShieldCheck, label: 'Paiement sécurisé', sub: 'FedaPay certifié' },
  { icon: Truck,       label: 'Livraison express', sub: '24h à Cotonou' },
  { icon: RotateCcw,   label: 'Retour offert',     sub: '7 jours garantis' },
  { icon: Headphones,  label: 'Support 7j/7',      sub: '8h – 20h' },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--dark)] text-[var(--dark-muted)]">

      {/* ── Trust strip ── */}
      <div className="border-b border-[var(--dark-border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3.5 bg-[var(--dark-2)] border border-[var(--dark-border)] rounded-2xl px-5 py-4 hover:border-orange-500/20 transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-[var(--dark-text)] text-sm font-bold leading-tight">{item.label}</p>
                    <p className="text-[var(--dark-muted)] text-xs mt-0.5">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="leading-none">
                <div className="text-lg font-black text-white tracking-tight">
                  E<span className="text-orange-500">·</span>Shop
                </div>
                <div className="text-[9px] font-bold text-blue-400 tracking-[0.2em] uppercase mt-0.5">
                  Bénin
                </div>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-[var(--dark-muted)] mb-6 max-w-[260px]">
              Votre marketplace de confiance au Bénin. Produits authentiques, vendeurs vérifiés, paiement Mobile Money et livraison express.
            </p>

            {/* Social */}
            <div>
              <p className="text-[10px] font-bold text-[var(--dark-muted)] uppercase tracking-wider mb-3">
                Rejoignez-nous
              </p>
              <div className="flex gap-2">
                {[
                  { href: '#', icon: Facebook, label: 'Facebook', hover: 'hover:bg-blue-600 hover:border-blue-600' },
                  { href: '#', icon: Instagram, label: 'Instagram', hover: 'hover:bg-pink-600 hover:border-pink-600' },
                  { href: '#', icon: Twitter, label: 'Twitter', hover: 'hover:bg-sky-500 hover:border-sky-500' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className={`w-9 h-9 rounded-xl bg-[var(--dark-2)] border border-[var(--dark-border)] flex items-center justify-center text-[var(--dark-muted)] hover:text-white ${s.hover} transition-all`}
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-[var(--dark-text)] font-black text-xs tracking-widest uppercase mb-5">
              Boutique
            </h3>
            <ul className="space-y-3">
              {LINKS_SHOP.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm text-[var(--dark-muted)] hover:text-[var(--dark-text)] transition"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-[var(--dark-text)] font-black text-xs tracking-widest uppercase mb-5">
              Aide
            </h3>
            <ul className="space-y-3">
              {LINKS_HELP.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm text-[var(--dark-muted)] hover:text-[var(--dark-text)] transition"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[var(--dark-text)] font-black text-xs tracking-widest uppercase mb-5">
              Contact
            </h3>
            <ul className="space-y-4 mb-7">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[var(--dark-2)] border border-[var(--dark-border)] rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                </div>
                <div className="text-sm">
                  <p className="text-[var(--dark-text)] font-semibold">Cotonou, Bénin</p>
                  <p className="text-[var(--dark-muted)] text-xs">Quartier Cadjehoun</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--dark-2)] border border-[var(--dark-border)] rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="h-3.5 w-3.5 text-orange-400" />
                </div>
                <a href="tel:+22901617907 66" className="text-sm text-[var(--dark-muted)] hover:text-[var(--dark-text)] transition font-medium">
                  +229 01 61 79 07 66
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--dark-2)] border border-[var(--dark-border)] rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="h-3.5 w-3.5 text-orange-400" />
                </div>
                <a href="mailto:wilfried.deguenon@epitech.eu" className="text-sm text-[var(--dark-muted)] hover:text-[var(--dark-text)] transition break-all">
                  wilfried.deguenon@epitech.eu
                </a>
              </li>
            </ul>

            {/* Hours */}
            <div className="bg-[var(--dark-2)] border border-[var(--dark-border)] rounded-xl p-4 mb-5">
              <p className="text-[10px] font-bold text-[var(--dark-muted)] uppercase tracking-wider mb-2">Horaires</p>
              <p className="text-sm text-[var(--dark-text)] font-semibold">Lun – Sam : 8h00 – 20h00</p>
              <p className="text-xs text-[var(--dark-muted)] mt-0.5">Dim : 10h00 – 17h00</p>
            </div>

            {/* Payment */}
            <div>
              <p className="text-[10px] font-bold text-[var(--dark-muted)] uppercase tracking-wider mb-3">
                Paiements acceptés
              </p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-yellow-400/8 border border-yellow-400/15 rounded-xl">
                  <span className="text-sm">📱</span>
                  <span className="text-xs font-bold text-yellow-400">MTN MoMo</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/8 border border-blue-500/15 rounded-xl">
                  <span className="text-sm">📱</span>
                  <span className="text-xs font-bold text-blue-400">Moov Money</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-[var(--dark-border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--dark-muted)]">
            &copy; {new Date().getFullYear()}{' '}
            <span className="text-[var(--dark-text)] font-semibold">E-Shop Bénin</span>.
            Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-5 text-xs text-[var(--dark-muted)]">
            {["Conditions d'utilisation", "Confidentialité", "Cookies"].map((t) => (
              <a key={t} href="#" className="hover:text-[var(--dark-text)] transition">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
