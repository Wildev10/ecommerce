'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2, Truck, Shield, Star, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }
    >
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

      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[var(--dark)] flex-col justify-between p-12 relative overflow-hidden">

        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/8 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/6 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="leading-none">
            <div className="text-xl font-black text-white tracking-tight">
              E<span className="text-orange-500">·</span>Shop
            </div>
            <div className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase mt-0.5">
              Bénin
            </div>
          </div>
        </Link>

        {/* Main copy */}
        <div className="relative z-10">
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-[1.15] tracking-tight">
            Bienvenue sur la
            <br />
            <span className="gradient-orange">boutique en ligne</span>
            <br />
            de confiance au Bénin
          </h2>
          <p className="text-[var(--dark-muted)] text-base leading-relaxed max-w-sm">
            Des milliers de produits, une livraison en 24–48h, et un paiement sécurisé via Mobile Money.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: Truck,  text: 'Livraison partout au Bénin en 24–48h' },
              { icon: Shield, text: 'Paiement sécurisé MTN MoMo & Moov Money' },
              { icon: Star,   text: 'Produits vérifiés par notre équipe' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-[var(--dark-muted)]">
                <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-orange-400" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/6 border border-white/10 rounded-2xl p-5">
          <div className="flex gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-[var(--dark-muted)] text-sm italic leading-relaxed">
            &ldquo;Excellent service ! Mon colis a été livré en moins de 24h à Cotonou. Je recommande fortement.&rdquo;
          </p>
          <p className="text-[var(--dark-muted)] text-xs mt-3 font-semibold">— Aïssatou K., Cotonou</p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--background)]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 h-[18px] w-[18px] text-white" />
            </div>
            <div className="leading-none">
              <div className="text-lg font-black text-[var(--foreground)] tracking-tight">
                E<span className="text-orange-500">·</span>Shop
              </div>
              <div className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase">Bénin</div>
            </div>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
              Bon retour 👋
            </h1>
            <p className="text-[var(--muted)] mt-1.5 text-sm">
              Connectez-vous à votre compte pour continuer
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[var(--foreground)] mb-2">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="jean@exemple.com"
                className={`w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition ${
                  errors.email
                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                    : 'border-[var(--border)] bg-white focus:border-orange-400 focus:shadow-[0_0_0_3px_rgb(249_115_22_/_0.10)]'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">⚠ {errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-bold text-[var(--foreground)]">
                  Mot de passe
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                >
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
                  placeholder="Votre mot de passe"
                  className={`w-full px-4 py-3 pr-11 rounded-xl text-sm border-2 outline-none transition ${
                    errors.password
                      ? 'border-red-400 bg-red-50 focus:border-red-500'
                      : 'border-[var(--border)] bg-white focus:border-orange-400 focus:shadow-[0_0_0_3px_rgb(249_115_22_/_0.10)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">⚠ {errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-orange-200 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin h-4 w-4" /> Connexion…</>
              ) : (
                <><LogIn className="h-4 w-4" /> Se connecter</>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--background)] px-3 text-xs text-[var(--muted)]">
                  Pas encore de compte ?
                </span>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full flex items-center justify-center py-3 border-2 border-[var(--border)] hover:border-[var(--border-2)] text-[var(--foreground)] hover:bg-[var(--surface-2)] rounded-xl font-semibold text-sm transition"
            >
              Créer un compte gratuitement
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
