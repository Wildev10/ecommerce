'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Mail, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

export default function DeliveryProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: (user as unknown as Record<string, unknown>).phone as string || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      if (form.phone) formData.append('phone', form.phone);
      if (form.current_password && form.password) {
        formData.append('current_password', form.current_password);
        formData.append('password', form.password);
        formData.append('password_confirmation', form.password_confirmation);
      }
      const updated = await authApi.updateProfile(formData);
      setUser(updated);
      setForm(prev => ({ ...prev, current_password: '', password: '', password_confirmation: '' }));
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <User className="h-4 w-4" /> Nom complet
          </label>
          <input
            required
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Mail className="h-4 w-4" /> Email
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Phone className="h-4 w-4" /> Téléphone
          </label>
          <input
            value={form.phone}
            onChange={e => setForm({...form, phone: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="+229 XX XX XX XX"
          />
        </div>

        <hr />
        <h3 className="font-medium text-gray-900">Changer le mot de passe</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
          <input
            type="password"
            value={form.current_password}
            onChange={e => setForm({...form, current_password: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
            <input
              type="password"
              value={form.password_confirmation}
              onChange={e => setForm({...form, password_confirmation: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </button>
      </form>
    </div>
  );
}
