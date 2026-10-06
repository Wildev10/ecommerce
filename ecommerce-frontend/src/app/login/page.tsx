'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2, Package, Shield, Truck, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading } = useAuth();
  const { isAuthenticated, user } = useAuthStore();
  const redirectTo = searchParams.get('from');

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') router.push('/dashboard');
      else if (user?.role === 'seller') router.push('/seller');
      else if (user?.role === 'delivery') router.push('/delivery');
      else router.push(redirectTo ?? '/');
    }
  }, [isAuthenticated, user, router, redirectTo]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.email.trim()) e.email = "L'email est requis";
    if (!formData.password) e.password = 'Le mot de passe est requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await login(formData, redirectTo);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="block text-xl font-bold text-white leading-tight">E-Shop</span>
            <span className="block text-[11px] font-medium text-orange-400 leading-tight tracking-widest uppercase">Bénin</span>
          </div>
        </Link>

        {/* Quote */}
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
            Bienvenue sur la<br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-300">
              boutique en ligne
            </span><br />
            de confiance au Bénin
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Des milliers de produits, une livraison en 24–48h, et un paiement sécurisé via Mobile Money.
          </p>

          {/* Trust bullets */}
          <div className="mt-8 space-y-3">
            {[
              { icon: Truck, text: 'Livraison partout au Bénin en 24–48h' },
              { icon: Shield, text: 'Paiement sécurisé MTN MoMo & Moov Money' },
              { icon: Star, text: 'Produits vérifiés par notre équipe' },
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

        {/* Testimonial */}
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex gap-0.5 mb-2">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
          </div>
          <p className="text-slate-300 text-sm italic leading-relaxed">
            &ldquo;Excellent service ! Mon colis a été livré en moins de 24h à Cotonou. Je recommande fortement.&rdquo;
          </p>
          <p className="text-slate-500 text-xs mt-2 font-medium">— Aïssatou K., Cotonou</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">E-Shop <span className="text-orange-500 text-sm font-medium">Bénin</span></span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Bon retour 👋</h1>
            <p className="text-slate-500 mt-1">Connectez-vous à votre compte pour continuer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-blue-600 bg-white transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                placeholder="jean@exemple.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Mot de passe
                </label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-11 border-2 rounded-xl text-sm focus:outline-none focus:border-blue-600 bg-white transition ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin h-4.5 w-4.5" /> Connexion en cours…</>
              ) : (
                <><LogIn className="h-4.5 w-4.5" /> Se connecter</>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 px-3 text-xs text-slate-400">Pas encore de compte ?</span>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full flex items-center justify-center py-3 border-2 border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 rounded-xl font-semibold text-sm transition"
            >
              Créer un compte gratuitement
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
