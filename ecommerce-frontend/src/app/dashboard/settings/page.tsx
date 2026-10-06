'use client';

import { useState } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
      // Settings save endpoint would go here
      // await adminApi.updateSettings(settings);
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Paramètres sauvegardés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-7 w-7 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900">Paramètres du site</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du site</label>
              <input name="siteName" value={settings.siteName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input name="siteDescription" value={settings.siteDescription} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
              <input name="contactEmail" type="email" value={settings.contactEmail} onChange={handleChange} placeholder="contact@eshop.com" className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input name="contactPhone" type="tel" value={settings.contactPhone} onChange={handleChange} placeholder="+229 97 00 00 00" className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
        </div>

        {/* Commerce */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Commerce</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
              <select name="currency" value={settings.currency} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
                <option value="XOF">FCFA (XOF)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dollar (USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais de livraison (FCFA)</label>
              <input name="shippingFee" type="number" value={settings.shippingFee} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Livraison gratuite à partir de (FCFA)</label>
              <input name="freeShippingThreshold" type="number" value={settings.freeShippingThreshold} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
}
