'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Vérifications de base
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    // 2. Mise à jour sécurisée via Supabase
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      // 💡 NOUVEAU : On regarde si l'erreur vient du fait que le mot de passe est le même
      if (updateError.message.includes('different') || updateError.message.includes('same')) {
        setError("Le nouveau mot de passe doit être différent de l'actuel.");
      } else {
        setError("Le lien a expiré ou est invalide. Veuillez refaire une demande.");
      }
      setLoading(false);
    } else {
      setSuccess(true);
      // Redirection automatique vers le Dashboard après 2 secondes
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4f1] flex flex-col justify-center items-center p-4">

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-[#3e2f25] tracking-tight mb-2">FacturAvis</h1>
        <p className="text-[#7a6a5f] font-medium">Sécurité du compte</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border border-gray-100">

        {success ? (
          <div className="text-center animate-in zoom-in duration-300">
            <div className="bg-green-50 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Mot de passe modifié !</h2>
            <p className="text-sm text-gray-600 mb-6">
              Votre nouveau mot de passe est enregistré. Vous allez être redirigé vers votre espace...
            </p>
            <Loader2 className="animate-spin text-[#a9825a] mx-auto" size={24} />
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h2>
            <p className="text-sm text-gray-500 mb-6">Veuillez choisir un nouveau mot de passe pour sécuriser votre accès praticien.</p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password" required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#a9825a] focus:border-[#a9825a] outline-none transition-colors"
                    placeholder="Au moins 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password" required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#a9825a] focus:border-[#a9825a] outline-none transition-colors"
                    placeholder="Répétez le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center">
                  <AlertCircle size={16} className="mr-2 shrink-0"/> {error}
                </div>
              )}

              <button
                type="submit" disabled={loading || !password || !confirmPassword}
                className="w-full bg-[#3e2f25] hover:bg-black text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center mt-2 disabled:bg-gray-400"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>Enregistrer <ArrowRight size={18} className="ml-2" /></>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
