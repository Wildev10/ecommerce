import Link from 'next/link';
import { Truck, Clock, MapPin, Package, ArrowLeft, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

const ZONES = [
  { zone: 'Cotonou centre', delai: '24h', prix: 'Gratuit dès 50 000 FCFA', icon: '🏙️' },
  { zone: 'Grand Cotonou (Abomey-Calavi, Sèmè)', delai: '24 – 48h', prix: '1 500 FCFA', icon: '🌆' },
  { zone: 'Porto-Novo & environs', delai: '48h', prix: '2 000 FCFA', icon: '🏛️' },
  { zone: 'Bohicon, Parakou', delai: '48 – 72h', prix: '3 500 FCFA', icon: '🌍' },
  { zone: 'Autres villes du Bénin', delai: '72h', prix: 'Sur devis', icon: '📍' },
];

const STATUTS = [
  { label: 'En attente', desc: 'Commande reçue, en cours de traitement par le vendeur.', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Confirmée', desc: 'Le vendeur a accepté votre commande.', color: 'bg-blue-100 text-blue-700' },
  { label: 'En préparation', desc: 'Le vendeur prépare votre colis.', color: 'bg-purple-100 text-purple-700' },
  { label: 'Expédiée', desc: 'Votre colis est pris en charge par notre livreur.', color: 'bg-indigo-100 text-indigo-700' },
  { label: 'En livraison', desc: 'Le livreur est en route vers chez vous.', color: 'bg-orange-100 text-orange-700' },
  { label: 'Livrée', desc: 'Colis remis. Pensez à laisser un avis !', color: 'bg-green-100 text-green-700' },
];

export default function LivraisonPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-linear-to-br from-slate-900 to-blue-950 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Truck className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-wide">Livraison</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Livraison & délais</h1>
          <p className="text-slate-300 text-lg">Tout ce que vous devez savoir sur nos zones de livraison et nos délais.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

        {/* Livraison gratuite */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
          <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-green-800 mb-1">Livraison gratuite à partir de 50 000 FCFA</p>
            <p className="text-green-700 text-sm">Pour toute commande dépassant 50 000 FCFA livrée à Cotonou, la livraison est offerte automatiquement.</p>
          </div>
        </div>

        {/* Zones */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" /> Zones & tarifs
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide border-b border-slate-100">
              <span>Zone</span><span className="text-center">Délai</span><span className="text-right">Frais</span>
            </div>
            {ZONES.map((z, i) => (
              <div key={i} className={`grid grid-cols-3 items-center px-5 py-4 text-sm ${i < ZONES.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <span className="font-medium text-slate-800 flex items-center gap-1.5">{z.icon} {z.zone}</span>
                <span className="text-center text-slate-600 flex items-center justify-center gap-1"><Clock className="h-3.5 w-3.5 text-orange-400" />{z.delai}</span>
                <span className="text-right font-semibold text-slate-700">{z.prix}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suivi */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-500" /> Statuts de commande
          </h2>
          <div className="space-y-2">
            {STATUTS.map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-start gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${s.color}`}>{s.label}</span>
                <p className="text-sm text-slate-600 pt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerte */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 mb-1">Délais non garantis lors des jours fériés</p>
            <p className="text-amber-700 text-sm">Les délais de livraison peuvent être allongés pendant les jours fériés officiels au Bénin. Nous vous informerons par email en cas de retard.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-linear-to-br from-slate-900 to-blue-950 rounded-2xl p-6 text-white text-center">
          <h3 className="text-lg font-black mb-2">Une question sur votre livraison ?</h3>
          <p className="text-slate-300 text-sm mb-4">Notre équipe est disponible du lundi au samedi de 8h à 20h.</p>
          <a href="tel:+22901617907 66" className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition text-sm">
            <ChevronRight className="h-4 w-4" /> +229 01 61 79 07 66
          </a>
        </div>
      </div>
    </div>
  );
}
