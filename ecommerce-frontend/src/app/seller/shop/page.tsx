'use client';

import { useEffect, useState } from 'react';
import { sellerApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import type { Shop } from '@/types';
import { Store, Camera } from 'lucide-react';

export default function SellerShopPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', phone: '', city: '' });
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);

  const load = async () => {
    try {
      const res = await sellerApi.getMyShop();
      if (res) {
        setShop(res);
        setForm({
          name: res.name || '',
          description: res.description || '',
          phone: res.phone || '',
          city: res.city || '',
        });
      }
    } catch {
      // No shop yet, form stays empty
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

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
      toast.success(shop ? 'Boutique mise à jour' : 'Boutique créée');
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading text="Chargement..." />;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ma boutique</h1>

      {shop?.banner_url && (
        <div className="relative rounded-xl overflow-hidden h-40">
          <img src={shop.banner_url} alt="Bannière" className="w-full h-full object-cover" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
            {shop?.logo_url ? (
              <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} className="text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bannière</label>
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5 text-gray-400" />
            <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files?.[0] || null)} className="text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique *</label>
          <input
            type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4} className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input
              type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 text-sm"
            />
          </div>
        </div>

        {shop?.slug && (
          <p className="text-xs text-gray-400">Lien public : /shops/{shop.slug}</p>
        )}

        <button type="submit" disabled={saving} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Enregistrement...' : shop ? 'Mettre à jour' : 'Créer ma boutique'}
        </button>
      </form>
    </div>
  );
}
