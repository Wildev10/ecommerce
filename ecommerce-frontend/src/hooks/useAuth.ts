// src/hooks/useAuth.ts

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { extractErrorMessage } from '@/lib/api-helpers';
import { ApiResponse, User } from '@/types';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'buyer' | 'seller';
}

interface LoginData {
  email: string;
  password: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();

  const { setAuth, setUser, logout: logoutStore, user, isAuthenticated } = useAuthStore();
  const { clearCart } = useCartStore();

  /**
   * Inscription
   */
  const register = async (data: RegisterData) => {
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>(
        '/register',
        data
      );

      const { user, token } = response.data.data!;
      setAuth(user, token);
      toast.success('Inscription réussie !');

      // Redirection vers la page de connexion après inscription
      router.push('/login');
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      toast.error(message);

      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Connexion
   */
  const login = async (data: LoginData) => {
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>(
        '/login',
        data
      );

      const { user, token } = response.data.data!;
      setAuth(user, token);
      toast.success(`Bienvenue, ${user.name} !`);

      // Redirection selon le rôle
      switch (user.role) {
        case 'admin':
          router.push('/dashboard');
          break;
        case 'seller':
          router.push('/seller/dashboard');
          break;
        default:
          router.push('/');
      }
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      toast.error(message);

      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // On déconnecte même si l'API échoue
    } finally {
      logoutStore();
      clearCart();
      toast.success('Déconnexion réussie');
      router.push('/login');
    }
  };

  /**
   * Récupérer le profil utilisateur
   */
  const fetchUser = async () => {
    try {
      const response = await api.get<ApiResponse<{ user: User }>>('/user');
      const user = response.data.data!.user;
      setUser(user);
      return user;
    } catch {
      logoutStore();
      return null;
    }
  };

  /**
   * Mot de passe oublié
   */
  const forgotPassword = async (data: ForgotPasswordData) => {
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post<ApiResponse<null>>('/auth/forgot-password', data);
      toast.success(response.data.message);
      return true;
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      toast.error(message);

      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Réinitialiser le mot de passe
   */
  const resetPassword = async (data: ResetPasswordData) => {
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post<ApiResponse<null>>('/auth/reset-password', data);
      toast.success(response.data.message);
      router.push('/login');
      return true;
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      toast.error(message);

      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    user,
    isAuthenticated,
    loading,
    errors,

    // Actions
    register,
    login,
    logout,
    fetchUser,
    forgotPassword,
    resetPassword,
  };
}
