'use client';

import { useEffect, useState } from 'react';
import { sellerApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Shop } from '@/types';
import { Store, Camera, Save, Loader2, ExternalLink } from 'lucide-react';

export default function SellerShopPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', phone: '', city: '' });
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await sellerApi.getMyShop();
      if (res) {
        setShop(res);
        setForm({ name: res.name || '', description: res.description || '', phone: res.phone || '', city: res.city || '' });
      }
    } catch { /* No shop yet */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogo(file);
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBanner(file);
    if (file) setBannerPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('phone', form.phone);
      fd.append('city', form.city);
      if (logo) fd.append('logo', logo);
      if (banner) fd.append('banner', banner);

      const res = await sellerApi.upsertShop(fd);
      setShop(res);
      setLogo(null);
      setBanner(null);
      setLogoPreview(null);
      setBannerPreview(null);
      toast.success(shop ? 'Boutique mise à jour' : 'Boutique créée');
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading text="Chargement..." />;

  const inputCls = 'w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 transition';

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Ma boutique</h1>
          <p className="text-sm text-slate-400 mt-0.5">Personnalisez votre espace vendeur</p>
        </div>
        {shop?.slug && (
          <a
            href={`/shops/${shop.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            <ExternalLink className="h-4 w-4" />
            Voir ma boutique
          </a>
        )}
      </div>

      {/* Banner preview */}
      <div className="relative rounded-2xl overflow-hidden h-36 bg-slate-100 border-2 border-dashed border-slate-200">
        {(bannerPreview || shop?.banner_url) ? (
          // eslint-disable-next-line @next/next/no-img-element
          (<img src={bannerPreview || shop!.banner_url!} alt="Bannière" className="w-full h-full object-cover" />)
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Camera className="h-8 w-8 mb-1" />
            <span className="text-xs">Bannière de la boutique</span>
          </div>
        )}
        <label className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer shadow transition">
          <Camera className="h-3.5 w-3.5 inline mr-1" />
          Changer
          <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
        {/* Logo */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border-2 border-slate-200">
            {(logoPreview || shop?.logo_url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              (<img src={logoPreview || shop!.logo_url!} alt="Logo" className="w-full h-full object-cover" />)
            ) : (
              <Store className="h-8 w-8 text-slate-300" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1.5">Logo de la boutique</p>
            <label className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition">
              <Camera className="h-4 w-4" />
              Choisir une image
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
            {logo && <p className="text-xs text-emerald-600 mt-1">✓ {logo.name}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom de la boutique *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls} placeholder="Ex: Tech Shop Bénin" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4} className={`${inputCls} resize-none`}
            placeholder="Décrivez votre boutique, vos spécialités..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputCls} placeholder="+229 97 00 00 00" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ville</label>
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={inputCls} placeholder="Cotonou" />
          </div>
        </div>

        {shop?.slug && (
          <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-2">
            🔗 Lien public : <span className="font-mono text-blue-600">/shops/{shop.slug}</span>
          </p>
        )}

        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Enregistrement...' : shop ? 'Mettre à jour la boutique' : 'Créer ma boutique'}
        </button>
      </form>
    </div>
  );
}
