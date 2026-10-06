'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle, Package, Shield, Truck } from 'lucide-react';
import { authApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success('Email envoyé !');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="block text-xl font-bold text-white leading-tight">E-Shop</span>
            <span className="block text-[11px] font-medium text-orange-400 leading-tight tracking-widest uppercase">Bénin</span>
          </div>
        </Link>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
            Récupérez<br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-300">
              votre accès
            </span><br />
            en quelques secondes
          </h2>
          <p className="text-slate-400 text-base mb-8 leading-relaxed">
            Renseignez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: Mail, text: 'Lien envoyé en moins d\'une minute' },
              { icon: Shield, text: 'Réinitialisation sécurisée' },
              { icon: Truck, text: 'Retrouvez vos commandes et adresses' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-orange-400" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          Vous vous souvenez de votre mot de passe ?{' '}
          <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition">
            Se connecter
          </Link>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">E-Shop <span className="text-orange-500 text-sm font-medium">Bénin</span></span>
          </Link>

          <Link href="/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium mb-8 transition">
            <ArrowLeft className="h-4 w-4" /> Retour à la connexion
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Email envoyé !</h1>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Si un compte existe avec l&apos;adresse <strong className="text-slate-800">{email}</strong>, vous recevrez un lien de réinitialisation dans quelques instants.
              </p>
              <p className="text-sm text-slate-500 mb-4">Vérifiez également votre dossier spam.</p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition"
              >
                Renvoyer un email
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Mot de passe oublié ?</h1>
                <p className="text-slate-500 mt-1">Entrez votre email pour recevoir un lien de réinitialisation.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin h-4 w-4" /> Envoi en cours…</>
                  ) : (
                    <><Mail className="h-4 w-4" /> Envoyer le lien de réinitialisation</>
                  )}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Vous vous souvenez ?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition">
                    Se connecter
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
