'use client';

import { useEffect, useState } from 'react';
import { Search, Loader2, Trash2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate, extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin:    'bg-red-100 text-red-700',
  seller:   'bg-blue-100 text-blue-700',
  buyer:    'bg-emerald-100 text-emerald-700',
  delivery: 'bg-orange-100 text-orange-700',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin', seller: 'Vendeur', buyer: 'Acheteur', delivery: 'Livreur',
};

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadUsers(); }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ page, per_page: 15 });
      setUsers(res.data);
      setLastPage(res.meta?.last_page || 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, role: string) => {
    setUpdatingId(userId);
    try {
      await adminApi.updateUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      toast.success('Rôle mis à jour');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggle = async (userId: number) => {
    try {
      await adminApi.toggleUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
      toast.success('Statut modifié');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Utilisateur supprimé');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Gestion des utilisateurs</h1>
        <p className="text-sm text-slate-400 mt-0.5">Gérez les rôles et accès de tous les utilisateurs</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition"
          />
        </div>
        <select
          value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400 transition"
        >
          <option value="">Tous les rôles</option>
          <option value="buyer">Acheteurs</option>
          <option value="seller">Vendeurs</option>
          <option value="delivery">Livreurs</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5">Utilisateur</th>
                <th className="text-left px-5 py-3.5">Rôle</th>
                <th className="text-left px-5 py-3.5">Statut</th>
                <th className="text-left px-5 py-3.5">Inscrit le</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Users className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Aucun utilisateur trouvé</p>
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer disabled:opacity-50 ${ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-700'}`}
                      >
                        <option value="buyer">Acheteur</option>
                        <option value="seller">Vendeur</option>
                        <option value="delivery">Livreur</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggle(user.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          user.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {lastPage > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-400">Page {page} / {lastPage}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                className="p-2 border-2 border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
