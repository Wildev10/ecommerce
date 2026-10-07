import Link from 'next/link';
import { CreditCard, ArrowLeft, CheckCircle, ShieldCheck, Phone, AlertCircle, ChevronRight } from 'lucide-react';

const MTN_STEPS = [
  'Ajoutez vos articles au panier et cliquez sur "Commander"',
  'Choisissez "MTN MoMo" comme méthode de paiement',
  'Entrez votre numéro MTN Mobile Money',
  'Vous recevez une notification sur votre téléphone',
  'Confirmez le paiement en entrant votre code PIN MTN MoMo',
  'Votre commande est validée instantanément',
];

const MOOV_STEPS = [
  'Ajoutez vos articles au panier et cliquez sur "Commander"',
  'Choisissez "Moov Money" comme méthode de paiement',
  'Entrez votre numéro Moov Money',
  'Vous recevez un message de confirmation',
  'Tapez *155# et validez le paiement',
  'Votre commande est confirmée dès validation',
];

const FAQ = [
  { q: 'Mon paiement a été débité mais la commande est toujours "En attente" ?', r: 'Patientez 5 à 10 minutes. Si le problème persiste, appelez-nous au +229 01 61 79 07 66 avec votre référence de transaction.' },
  { q: 'Puis-je payer en plusieurs fois ?', r: 'Actuellement, le paiement en plusieurs fois n\'est pas disponible. Chaque commande doit être réglée en une seule fois.' },
  { q: 'Mon paiement a échoué, que faire ?', r: 'Vérifiez votre solde Mobile Money, puis réessayez. Si le problème persiste, contactez notre service client.' },
  { q: 'Le paiement est-il sécurisé ?', r: 'Oui. Nous utilisons FedaPay, une plateforme certifiée et sécurisée pour tous les paiements Mobile Money au Bénin.' },
];

export default function PaiementMobileMoneyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-linear-to-br from-slate-900 to-blue-950 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-wide">Paiement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Paiement Mobile Money</h1>
          <p className="text-slate-300 text-lg">Payez facilement et en toute sécurité avec MTN MoMo ou Moov Money.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

        {/* Sécurité */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
          <ShieldCheck className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-green-800 mb-1">Paiement 100% sécurisé via FedaPay</p>
            <p className="text-green-700 text-sm">E-Shop Bénin utilise FedaPay, la plateforme de paiement numéro 1 en Afrique de l'Ouest. Vos données sont chiffrées et protégées.</p>
          </div>
        </div>

        {/* MTN MoMo */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-yellow-400 px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">📱</span>
            <div>
              <h2 className="font-black text-yellow-900 text-lg">MTN Mobile Money</h2>
              <p className="text-yellow-800 text-sm">Comment payer avec MTN MoMo</p>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {MTN_STEPS.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-6 h-6 bg-yellow-100 text-yellow-700 font-black rounded-full flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Moov Money */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-blue-600 px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">📱</span>
            <div>
              <h2 className="font-black text-white text-lg">Moov Money</h2>
              <p className="text-blue-100 text-sm">Comment payer avec Moov Money</p>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {MOOV_STEPS.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 font-black rounded-full flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Avantages */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-4">Pourquoi Mobile Money ?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '⚡', title: 'Instantané', desc: 'Paiement confirmé en quelques secondes' },
              { icon: '🔒', title: 'Sécurisé', desc: 'Chiffrement de bout en bout FedaPay' },
              { icon: '🇧🇯', title: 'Local', desc: 'Solution adaptée au Bénin' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-bold text-slate-900 mb-1">{item.title}</p>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-5">Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <p className="font-semibold text-slate-900 mb-2 flex items-start gap-2">
                  <span className="text-orange-500 font-black shrink-0">Q.</span>{item.q}
                </p>
                <p className="text-slate-600 text-sm leading-relaxed pl-5">{item.r}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerte */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 mb-1">Ne partagez jamais votre code PIN</p>
            <p className="text-amber-700 text-sm">E-Shop Bénin ne vous demandera jamais votre code PIN ou mot de passe. Méfiez-vous des arnaques.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-linear-to-br from-slate-900 to-blue-950 rounded-2xl p-6 text-white text-center">
          <h3 className="text-lg font-black mb-2">Besoin d'aide pour payer ?</h3>
          <p className="text-slate-300 text-sm mb-4">Notre équipe vous accompagne du lundi au samedi, 8h – 20h.</p>
          <a href="tel:+22901617907 66" className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition text-sm">
            <Phone className="h-4 w-4" /> +229 01 61 79 07 66
          </a>
        </div>
      </div>
    </div>
  );
}
