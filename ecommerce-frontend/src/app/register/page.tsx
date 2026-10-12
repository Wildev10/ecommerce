'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, Loader2, ShoppingBag, Store, Check, Sparkles, Truck, Shield, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const { isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    address: '',
    role: 'buyer' as 'buyer' | 'seller',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Le nom est requis';
    if (!formData.email.trim()) e.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "L'email n'est pas valide";
    if (!formData.password) e.password = 'Le mot de passe est requis';
    else if (formData.password.length < 8) e.password = 'Minimum 8 caractères';
    if (formData.password !== formData.password_confirmation) e.password_confirmation = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await register(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const fieldClass = (field: string) =>
    `w-full px-4 py-3 border-2 rounded-xl text-sm outline-none transition ${
      errors[field]
        ? 'border-red-400 bg-red-50 focus:border-red-500'
        : 'border-[var(--border)] bg-white focus:border-orange-400 focus:shadow-[0_0_0_3px_rgb(249_115_22_/_0.10)]'
    }`;

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
            Rejoignez la
            <br />
            <span className="gradient-orange">communauté</span>
            <br />
            E-Shop Bénin
          </h2>
          <p className="text-[var(--dark-muted)] text-base leading-relaxed max-w-sm">
            Créez votre compte gratuitement et profitez de milliers de produits livrés chez vous.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: ShoppingBag, text: 'Commandez en quelques clics' },
              { icon: Truck,       text: 'Livraison partout au Bénin en 24–48h' },
              { icon: Shield,      text: 'Paiement sécurisé MTN MoMo & Moov Money' },
              { icon: Star,        text: 'Accédez aux promotions exclusives' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-[var(--dark-muted)]">
                <div className="w-7 h-7 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Already have account */}
        <div className="relative z-10 text-sm text-[var(--dark-muted)]">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-orange-400 hover:text-orange-300 font-bold transition">
            Se connecter
          </Link>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 bg-[var(--background)] overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-7 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-[18px] w-[18px] text-white" />
            </div>
            <div className="leading-none">
              <div className="text-lg font-black text-[var(--foreground)] tracking-tight">
                E<span className="text-orange-500">·</span>Shop
              </div>
              <div className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase">Bénin</div>
            </div>
          </Link>

          <div className="mb-7">
            <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Créer un compte</h1>
            <p className="text-[var(--muted)] mt-1.5 text-sm">Rejoignez-nous pour commencer vos achats</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role selector */}
            <div>
              <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Je m&apos;inscris en tant que</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'buyer' }))}
                  className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition text-sm font-bold ${
                    formData.role === 'buyer'
                      ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-[0_0_0_3px_rgb(249_115_22_/_0.10)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-2)]'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5 shrink-0" />
                  <div className="text-left">
                    <div>Acheteur</div>
                    <div className="text-[10px] font-normal opacity-70">Commander des produits</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'seller' }))}
                  className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition text-sm font-bold ${
                    formData.role === 'seller'
                      ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-[0_0_0_3px_rgb(139_92_246_/_0.10)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-2)]'
                  }`}
                >
                  <Store className="h-5 w-5 shrink-0" />
                  <div className="text-left">
                    <div>Vendeur</div>
                    <div className="text-[10px] font-normal opacity-70">Vendre mes produits</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-[var(--foreground)] mb-2">Nom complet *</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={fieldClass('name')} placeholder="Jean Dupont" />
              {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">⚠ {errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[var(--foreground)] mb-2">Adresse email *</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={fieldClass('email')} placeholder="jean@exemple.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">⚠ {errors.email}</p>}
            </div>

            {/* Phone + Address */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-[var(--foreground)] mb-2">Téléphone</label>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className={fieldClass('phone')} placeholder="+229 97 00 00 00" />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-bold text-[var(--foreground)] mb-2">Quartier</label>
                <input id="address" name="address" type="text" value={formData.address} onChange={handleChange} className={fieldClass('address')} placeholder="Akpakpa, Cotonou" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[var(--foreground)] mb-2">Mot de passe *</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`${fieldClass('password')} pr-11`}
                  placeholder="Minimum 8 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">⚠ {errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-bold text-[var(--foreground)] mb-2">Confirmer le mot de passe *</label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={handleChange}
                className={fieldClass('password_confirmation')}
                placeholder="Retapez le mot de passe"
              />
              {errors.password_confirmation && <p className="text-red-500 text-xs mt-1.5 font-medium">⚠ {errors.password_confirmation}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-orange-200 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin h-4 w-4" /> Création en cours…</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Créer mon compte</>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--background)] px-3 text-xs text-[var(--muted)]">
                  Déjà un compte ?
                </span>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full flex items-center justify-center py-3 border-2 border-[var(--border)] hover:border-[var(--border-2)] text-[var(--foreground)] hover:bg-[var(--surface-2)] rounded-xl font-semibold text-sm transition"
            >
              Se connecter
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
