import Link from 'next/link';
import { RotateCcw, ArrowLeft, CheckCircle, XCircle, Clock, Phone, ChevronRight } from 'lucide-react';

const CONDITIONS_OK = [
  'Article dans son état d\'origine, non utilisé',
  'Emballage d\'origine intact',
  'Retour demandé dans les 7 jours après réception',
  'Article défectueux ou non conforme à la description',
  'Erreur de livraison (mauvais produit reçu)',
];

const CONDITIONS_NOK = [
  'Article endommagé par le client',
  'Retour demandé après 7 jours',
  'Article personnalisé ou sur-mesure',
  'Produits alimentaires ou périssables',
  'Logiciels ou contenus numériques déjà utilisés',
];

const STEPS = [
  { num: '01', title: 'Contactez-nous', desc: 'Appelez le +229 01 61 79 07 66 ou envoyez un email en précisant votre numéro de commande et le motif du retour.' },
  { num: '02', title: 'Validation du retour', desc: 'Notre équipe vérifie votre demande sous 24h et vous envoie les instructions pour le retour.' },
  { num: '03', title: 'Renvoi de l\'article', desc: 'Emballez soigneusement l\'article et remettez-le au livreur ou déposez-le à notre point relais à Cotonou.' },
  { num: '04', title: 'Remboursement', desc: 'Après réception et vérification, le remboursement est effectué sous 3 à 5 jours ouvrables via Mobile Money.' },
];

export default function RetoursPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-linear-to-br from-slate-900 to-blue-950 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <RotateCcw className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-wide">SAV</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Retours & remboursements</h1>
          <p className="text-slate-300 text-lg">Votre satisfaction est notre priorité. Retour gratuit sous 7 jours si le produit ne vous convient pas.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

        {/* Délai */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
          <Clock className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-800 mb-1">Politique de retour : 7 jours</p>
            <p className="text-blue-700 text-sm">Vous disposez de 7 jours après réception de votre commande pour initier un retour. Passé ce délai, les retours ne seront plus acceptés sauf défaut constaté.</p>
          </div>
        </div>

        {/* Conditions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" /> Retour accepté si…
            </h2>
            <ul className="space-y-2.5">
              {CONDITIONS_OK.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />{c}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" /> Retour refusé si…
            </h2>
            <ul className="space-y-2.5">
              {CONDITIONS_NOK.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />{c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Processus */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-5">Comment faire un retour ?</h2>
          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex gap-4 items-start">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-orange-600 font-black text-sm">{step.num}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 mb-1">{step.title}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-black mb-1">Initier un retour</h3>
          <p className="text-orange-100 text-sm mb-4">Contactez-nous directement pour démarrer votre retour.</p>
          <div className="flex flex-wrap gap-3">
            <a href="tel:+22901617907 66" className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-5 py-2.5 rounded-xl hover:bg-orange-50 transition text-sm">
              <Phone className="h-4 w-4" /> +229 01 61 79 07 66
            </a>
            <Link href="/orders" className="inline-flex items-center gap-2 bg-orange-700/40 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-orange-700/60 transition text-sm border border-white/20">
              <ChevronRight className="h-4 w-4" /> Mes commandes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
