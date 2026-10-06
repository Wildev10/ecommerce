'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, Loader2, Package, ShoppingBag, Store, Check } from 'lucide-react';
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

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-blue-600 bg-white transition ${errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200'}`;

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

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
            Rejoignez la<br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-300">
              communauté
            </span><br />
            E-Shop Bénin
          </h2>
          <p className="text-slate-400 text-base mb-8 leading-relaxed">
            Créez votre compte gratuitement et profitez de milliers de produits livrés chez vous.
          </p>

          <div className="space-y-3">
            {[
              'Commandez en quelques clics',
              'Suivez vos livraisons en temps réel',
              'Payez avec MTN MoMo ou Moov Money',
              'Accédez aux promotions exclusives',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-green-400" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition">
            Se connecter
          </Link>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-7 lg:hidden">
            <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">E-Shop <span className="text-orange-500 text-sm font-medium">Bénin</span></span>
          </Link>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
            <p className="text-slate-500 mt-1 text-sm">Rejoignez-nous pour commencer vos achats</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Je m&apos;inscris en tant que</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'buyer' }))}
                  className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition text-sm font-semibold ${
                    formData.role === 'buyer'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
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
                  className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition text-sm font-semibold ${
                    formData.role === 'seller'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
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
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">Nom complet *</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={inputClass('name')} placeholder="Jean Dupont" />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse email *</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass('email')} placeholder="jean@exemple.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.email}</p>}
            </div>

            {/* Phone + Address on same row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone</label>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className={inputClass('phone')} placeholder="+229 97 00 00 00" />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-1.5">Quartier</label>
                <input id="address" name="address" type="text" value={formData.address} onChange={handleChange} className={inputClass('address')} placeholder="Akpakpa, Cotonou" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe *</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} className={`${inputClass('password')} pr-11`} placeholder="Minimum 8 caractères" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmer le mot de passe *</label>
              <input id="password_confirmation" name="password_confirmation" type={showPassword ? 'text' : 'password'} value={formData.password_confirmation} onChange={handleChange} className={inputClass('password_confirmation')} placeholder="Retapez le mot de passe" />
              {errors.password_confirmation && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password_confirmation}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <><Loader2 className="animate-spin h-4 w-4" /> Création en cours…</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Créer mon compte</>
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition">
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
