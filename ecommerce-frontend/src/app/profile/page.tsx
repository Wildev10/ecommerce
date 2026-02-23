'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { authApi, ordersApi, addressApi } from '@/lib/api';
import { extractErrorMessage, formatDate } from '@/lib/api-helpers';
import type { Address } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Package,
  MapPin,
  Heart,
  Edit3,
  Lock,
  ChevronRight,
  Save,
  X,
  Eye,
  EyeOff,
  Camera,
  Store,
  ShoppingBag,
  Loader2,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();

  // Tabs
  const [activeTab, setActiveTab] = useState<'info' | 'edit' | 'password' | 'addresses'>('info');

  // Stats
  const [orderCount, setOrderCount] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Edit profile
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  // Change password
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // New address
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    city: '',
    quarter: '',
    street_address: '',
    landmark: '',
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
      return;
    }
    loadStats();
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const [ordersRes, addressesRes] = await Promise.all([
        ordersApi.getAll({ per_page: 1, page: 1 }).catch(() => null),
        addressApi.getAll().catch(() => []),
      ]);
      setOrderCount(ordersRes?.meta?.total || 0);
      setAddresses(addressesRes);
    } catch {
      // silent
    } finally {
      setStatsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('phone', editForm.phone || '');
      const updatedUser = await authApi.updateProfile(formData);
      setUser(updatedUser);
      toast.success('Profil mis à jour avec succès');
      setActiveTab('info');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setChangingPassword(true);
    try {
      await authApi.changePassword(passwordForm);
      toast.success('Mot de passe modifié avec succès');
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
      setActiveTab('info');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const addr = await addressApi.create({
        ...newAddress,
        is_default: addresses.length === 0,
      });
      setAddresses((prev) => [...prev, addr]);
      setShowNewAddress(false);
      setNewAddress({ full_name: '', phone: '', city: '', quarter: '', street_address: '', landmark: '' });
      toast.success('Adresse ajoutée');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await addressApi.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Adresse supprimée');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const roleConfig = {
    admin: { label: 'Administrateur', color: 'bg-red-100 text-red-700 border-red-200', icon: Shield },
    seller: { label: 'Vendeur', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Store },
    buyer: { label: 'Client', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ShoppingBag },
  };
  const role = roleConfig[user.role] || roleConfig.buyer;
  const RoleIcon = role.icon;

  const tabs = [
    { id: 'info' as const, label: 'Informations', icon: User },
    { id: 'edit' as const, label: 'Modifier', icon: Edit3 },
    { id: 'password' as const, label: 'Mot de passe', icon: Lock },
    { id: 'addresses' as const, label: 'Adresses', icon: MapPin },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <span className="text-4xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-400 h-5 w-5 rounded-full border-2 border-white" />
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
            <p className="text-blue-100 mt-1">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${role.color}`}>
                <RoleIcon className="h-3.5 w-3.5" />
                {role.label}
              </span>
              {user.email_verified_at && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  <Shield className="h-3 w-3" />
                  Vérifié
                </span>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6 sm:gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold">{statsLoading ? '...' : orderCount}</p>
              <p className="text-blue-200 text-xs">Commandes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{statsLoading ? '...' : addresses.length}</p>
              <p className="text-blue-200 text-xs">Adresses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* --- INFO TAB --- */}
        {activeTab === 'info' && (
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Informations personnelles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField icon={User} label="Nom complet" value={user.name} />
              <InfoField icon={Mail} label="Email" value={user.email} />
              <InfoField icon={Shield} label="Rôle" value={role.label} />
              <InfoField icon={Calendar} label="Membre depuis" value={formatDate(user.created_at)} />
              {user.phone && <InfoField icon={MapPin} label="Téléphone" value={user.phone} />}
            </div>

            {/* Quick actions */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Accès rapide</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <QuickLink href="/orders" icon={Package} label="Mes commandes" desc={`${orderCount} commande(s)`} />
                <QuickLink href="/wishlist" icon={Heart} label="Ma wishlist" desc="Produits favoris" />
                <QuickLink href="/products" icon={ShoppingBag} label="Boutique" desc="Découvrir les produits" />
                {user.role === 'seller' && (
                  <QuickLink href="/seller/dashboard" icon={Store} label="Espace vendeur" desc="Gérer mes ventes" />
                )}
                {user.role === 'admin' && (
                  <QuickLink href="/admin/dashboard" icon={Shield} label="Administration" desc="Tableau de bord" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- EDIT TAB --- */}
        {activeTab === 'edit' && (
          <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Modifier le profil</h2>
            <div className="space-y-5 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  disabled
                  value={editForm.email}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">L&apos;email ne peut pas être modifié</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="+229 XX XX XX XX"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </button>
              </div>
            </div>
          </form>
        )}

        {/* --- PASSWORD TAB --- */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Changer le mot de passe</h2>
            <div className="space-y-5 max-w-lg">
              <PasswordField
                label="Mot de passe actuel"
                value={passwordForm.current_password}
                onChange={(v) => setPasswordForm({ ...passwordForm, current_password: v })}
                show={showPasswords.current}
                onToggle={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              />
              <PasswordField
                label="Nouveau mot de passe"
                value={passwordForm.password}
                onChange={(v) => setPasswordForm({ ...passwordForm, password: v })}
                show={showPasswords.new}
                onToggle={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                hint="Minimum 8 caractères"
              />
              <PasswordField
                label="Confirmer le mot de passe"
                value={passwordForm.password_confirmation}
                onChange={(v) => setPasswordForm({ ...passwordForm, password_confirmation: v })}
                show={showPasswords.confirm}
                onToggle={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {changingPassword ? 'Modification...' : 'Modifier'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </button>
              </div>
            </div>
          </form>
        )}

        {/* --- ADDRESSES TAB --- */}
        {activeTab === 'addresses' && (
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Mes adresses</h2>
              <button
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
              >
                {showNewAddress ? <X className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                {showNewAddress ? 'Annuler' : 'Nouvelle adresse'}
              </button>
            </div>

            {showNewAddress && (
              <form onSubmit={handleCreateAddress} className="border border-blue-100 bg-blue-50/50 rounded-xl p-5 mb-6 space-y-4">
                <h3 className="font-medium text-gray-900">Ajouter une adresse</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input required value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} placeholder="Nom complet *" className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <input required value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} placeholder="Téléphone *" className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <input required value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} placeholder="Ville *" className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <input required value={newAddress.quarter} onChange={(e) => setNewAddress({ ...newAddress, quarter: e.target.value })} placeholder="Quartier *" className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <input required value={newAddress.street_address} onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })} placeholder="Adresse complète *" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <input value={newAddress.landmark} onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} placeholder="Point de repère (optionnel)" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <button type="submit" disabled={savingAddress} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                  {savingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {savingAddress ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </form>
            )}

            {addresses.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucune adresse enregistrée</p>
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="mt-3 text-blue-600 hover:underline text-sm font-medium"
                >
                  Ajouter votre première adresse
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`relative p-4 rounded-xl border transition ${
                      addr.is_default ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {addr.is_default && (
                      <span className="absolute top-3 right-3 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        Par défaut
                      </span>
                    )}
                    <p className="font-semibold text-gray-900">{addr.full_name}</p>
                    <p className="text-sm text-gray-600 mt-1">{addr.phone}</p>
                    <p className="text-sm text-gray-600">{addr.street_address}, {addr.quarter}, {addr.city}</p>
                    {addr.landmark && <p className="text-xs text-gray-400 mt-1">Repère: {addr.landmark}</p>}
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs text-red-500 hover:text-red-700 mt-2 font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Subcomponents ---- */

function InfoField({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="font-medium text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, desc }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition group"
    >
      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition" />
    </Link>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          required
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
