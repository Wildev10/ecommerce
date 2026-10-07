import Link from 'next/link';
import { ShoppingCart, Search, CreditCard, Package, CheckCircle, ArrowLeft, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    color: 'bg-blue-100 text-blue-600',
    title: 'Trouver vos produits',
    description: 'Parcourez nos catégories ou utilisez la barre de recherche pour trouver le produit que vous souhaitez. Vous pouvez filtrer par prix, catégorie ou popularité.',
    tips: ['Utilisez la barre de recherche en haut de la page', 'Filtrez par catégorie dans le menu "Produits"', 'Cliquez sur un produit pour voir les détails et les photos'],
  },
  {
    icon: ShoppingCart,
    color: 'bg-orange-100 text-orange-600',
    title: 'Ajouter au panier',
    description: 'Une fois votre produit trouvé, cliquez sur "Ajouter au panier". Vous pouvez continuer vos achats et ajouter d\'autres articles avant de passer commande.',
    tips: ['Vérifiez la quantité avant d\'ajouter', 'Vous pouvez modifier votre panier à tout moment', 'Les articles sont réservés pendant 30 minutes'],
  },
  {
    icon: CreditCard,
    color: 'bg-green-100 text-green-600',
    title: 'Passer commande & payer',
    description: 'Cliquez sur "Commander" dans votre panier. Entrez votre adresse de livraison et choisissez votre méthode de paiement : MTN MoMo ou Moov Money.',
    tips: ['Paiement sécurisé via Mobile Money', 'Vous recevrez un code de confirmation sur votre téléphone', 'La commande est validée après confirmation du paiement'],
  },
  {
    icon: Package,
    color: 'bg-purple-100 text-purple-600',
    title: 'Suivi & livraison',
    description: 'Après validation, vous recevrez un email de confirmation. Vous pouvez suivre l\'état de votre commande en temps réel depuis votre espace "Mes commandes".',
    tips: ['Email de confirmation envoyé immédiatement', 'Suivi en temps réel dans "Mes commandes"', 'Livraison sous 24 à 72h à Cotonou'],
  },
];

const FAQ = [
  { q: 'Faut-il un compte pour commander ?', r: 'Oui, vous devez créer un compte gratuit pour passer commande. Cela vous permet de suivre vos commandes et de sauvegarder vos adresses.' },
  { q: 'Puis-je modifier ma commande après validation ?', r: 'Vous pouvez modifier votre commande tant qu\'elle est en statut "En attente". Contactez-nous rapidement au +229 01 61 79 07 66.' },
  { q: 'Comment annuler une commande ?', r: 'Une commande peut être annulée depuis "Mes commandes" si elle n\'a pas encore été expédiée. Après expédition, contactez notre service client.' },
];

export default function CommentCommanderPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-linear-to-br from-slate-900 to-blue-950 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-wide">Guide d'achat</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Comment commander ?</h1>
          <p className="text-slate-300 text-lg">Suivez ces 4 étapes simples pour passer votre première commande sur E-Shop Bénin.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Steps */}
        <div className="space-y-6 mb-14">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex gap-5">
                <div className="shrink-0">
                  <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex justify-center mt-2">
                    <span className="text-xs font-black text-slate-300">0{i + 1}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">{step.description}</p>
                  <ul className="space-y-1.5">
                    {step.tips.map((tip, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-500">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <h2 className="text-xl font-black text-slate-900 mb-5">Questions fréquentes</h2>
        <div className="space-y-3 mb-10">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <p className="font-semibold text-slate-900 mb-2 flex items-start gap-2">
                <span className="text-orange-500 font-black shrink-0">Q.</span>{item.q}
              </p>
              <p className="text-slate-600 text-sm leading-relaxed pl-5">{item.r}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-lg font-black mb-2">Prêt à commander ?</h3>
          <p className="text-orange-100 text-sm mb-4">Découvrez nos milliers de produits disponibles au Bénin.</p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-2.5 rounded-xl hover:bg-orange-50 transition text-sm">
            Voir les produits <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
