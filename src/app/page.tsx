'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nouveaux états pour le mot de passe oublié
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const router = useRouter();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  // Fonction de Connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  // Fonction de Mot de passe oublié
  // Fonction de Mot de passe oublié
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const lienReel = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${lienReel}/update-password`,
    });

    if (error) {
      // 💡 CORRECTION ICI : Supabase peut renvoyer l'erreur "429" sous plusieurs formes
      if (error.status === 429 || error.message.includes('rate limit') || error.message.includes('too many')) {
        setError("Par sécurité, veuillez patienter 60 secondes avant de redemander un lien.");
      } else {
        setError("Erreur lors de l'envoi de l'e-mail. Vérifiez l'adresse.");
      }
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f4f1] flex flex-col justify-center items-center p-4">

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-[#3e2f25] tracking-tight mb-2">FacturAvis</h1>
        <p className="text-[#7a6a5f] font-medium">L'espace praticien intelligent</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border border-gray-100">

        {/* MODE RÉINITIALISATION DE MOT DE PASSE */}
        {isResetMode ? (
          resetSent ? (
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="bg-green-50 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">E-mail envoyé !</h2>
              <p className="text-sm text-gray-600 mb-6">
                Si un compte existe pour <strong>{email}</strong>, vous allez recevoir un lien pour créer votre nouveau mot de passe.
              </p>
              <button
                onClick={() => { setIsResetMode(false); setResetSent(false); }}
                className="text-[#a9825a] font-bold hover:underline text-sm"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Mot de passe oublié ?</h2>
              <p className="text-sm text-gray-500 mb-6">Entrez votre e-mail pour recevoir un lien de réinitialisation sécurisé.</p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email" required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#a9825a] focus:border-[#a9825a] outline-none transition-colors"
                      placeholder="praticien@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center"><AlertCircle size={16} className="mr-2 shrink-0"/> {error}</div>}

                <button
                  type="submit" disabled={loading || !email}
                  className="w-full bg-[#3e2f25] hover:bg-black text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center disabled:bg-gray-400"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Envoyer le lien'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button onClick={() => { setIsResetMode(false); setError(null); }} className="text-sm text-gray-500 hover:text-gray-800 font-medium">
                  Annuler et retourner à la connexion
                </button>
              </div>
            </div>
          )
        ) : (

          /* MODE CONNEXION CLASSIQUE */
          <div className="animate-in slide-in-from-left-4 duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Connexion à votre espace</h2>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email" required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#a9825a] focus:border-[#a9825a] outline-none transition-colors"
                    placeholder="praticien@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                  <button type="button" onClick={() => setIsResetMode(true)} className="text-xs font-bold text-[#a9825a] hover:underline focus:outline-none">
                    Oublié ?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password" required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#a9825a] focus:border-[#a9825a] outline-none transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#a9825a] focus:ring-[#a9825a] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Rester connecté sur cet appareil
                </label>
              </div>

              {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center"><AlertCircle size={16} className="mr-2 shrink-0"/> {error}</div>}

              <button
                type="submit" disabled={loading}
                className="w-full bg-[#a9825a] hover:bg-[#8b6a48] text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center disabled:bg-gray-400 group"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>Se connecter <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <p className="mt-8 text-sm text-[#7a6a5f] font-medium">
        Sécurisé par <span className="font-bold">Supabase</span>
      </p>
    </div>
  );
}
