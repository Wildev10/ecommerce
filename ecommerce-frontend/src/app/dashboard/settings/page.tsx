'use client';

import { useState } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const inputCls = 'w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition';

export default function DashboardSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'E-Shop',
    siteDescription: 'Votre boutique en ligne',
    contactEmail: '',
    contactPhone: '',
    currency: 'XOF',
    shippingFee: '1000',
    freeShippingThreshold: '25000',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Paramètres sauvegardés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Paramètres du site</h1>
        <p className="text-sm text-slate-400 mt-0.5">Configuration générale de la plateforme</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Informations générales */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Settings className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Informations générales</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom du site</label>
              <input name="siteName" value={settings.siteName} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
              <input name="siteDescription" value={settings.siteDescription} onChange={handleChange} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Contact</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email de contact</label>
              <input name="contactEmail" type="email" value={settings.contactEmail} onChange={handleChange}
                placeholder="contact@eshop.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone</label>
              <input name="contactPhone" type="tel" value={settings.contactPhone} onChange={handleChange}
                placeholder="+229 97 00 00 00" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Commerce */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Commerce</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Devise</label>
              <select name="currency" value={settings.currency} onChange={handleChange} className={inputCls}>
                <option value="XOF">FCFA (XOF)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dollar (USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Frais de livraison (FCFA)</label>
              <input name="shippingFee" type="number" value={settings.shippingFee} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Livraison gratuite à partir de</label>
              <input name="freeShippingThreshold" type="number" value={settings.freeShippingThreshold} onChange={handleChange} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Sauvegarder les paramètres
          </button>
        </div>
      </form>
    </div>
  );
}
