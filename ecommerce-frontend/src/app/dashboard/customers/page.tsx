'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

interface CustomerUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  seller: 'bg-blue-100 text-blue-700',
  buyer: 'bg-green-100 text-green-700',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  seller: 'Vendeur',
  buyer: 'Client',
};

export default function DashboardCustomersPage() {
  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');

  const loadUsers = useCallback(async () => {
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
  }, [page]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

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

  const filtered = search
    ? users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Clients inscrits</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Rôle</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Inscrit le</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">Aucun client trouvé</td></tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_COLORS[user.role] || 'bg-gray-100'}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggle(user.id)} className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Précédent</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} / {lastPage}</span>
          <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Suivant</button>
        </div>
      )}
    </div>
  );
}
