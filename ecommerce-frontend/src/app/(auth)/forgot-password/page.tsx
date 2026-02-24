'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success('Email envoyé !');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-4 w-4" /> Retour à la connexion
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email envoyé !</h1>
              <p className="text-gray-500 mb-6">
                Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous recevrez un lien pour réinitialiser votre mot de passe.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-blue-600 hover:underline text-sm"
              >
                Renvoyer un email
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Mail className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
                <p className="text-gray-500 mt-2">Entrez votre email pour recevoir un lien de réinitialisation.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Envoyer le lien
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
