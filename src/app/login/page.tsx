'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail, ArrowRight, CheckCircle, AlertCircle, FileCheck } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const lienReel = window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${lienReel}/update-password`,
    });

    if (error) {
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
    <div className="min-h-screen bg-[#fcfaf8] flex flex-col justify-center items-center p-4 font-sans text-[#3e2f25]">

      {/* LOGO & TITRE */}
      <div className="mb-8 text-center">
        <div className="bg-[#a9825a] text-white p-3 rounded-2xl inline-block shadow-lg mb-4">
            <FileCheck size={32} />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2 text-[#3e2f25]">FacturAvis</h1>
        <p className="text-[#7a6a5f] font-medium italic">L'espace praticien intelligent</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl shadow-[#a9825a]/10 p-8 md:p-10 border border-[#f0e6de]">

        {isResetMode ? (
          resetSent ? (
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="bg-green-50 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">E-mail envoyé !</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Si un compte existe pour <strong>{email}</strong>, vous allez recevoir un lien pour créer votre nouveau mot de passe.
              </p>
              <button
                onClick={() => { setIsResetMode(false); setResetSent(false); }}
                className="text-[#a9825a] font-bold hover:text-[#8b6a48] transition-colors text-sm"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black text-[#3e2f25] mb-2">Mot de passe oublié ?</h2>
              <p className="text-sm text-[#7a6a5f] mb-6 font-medium">Entrez votre e-mail pour recevoir un lien de réinitialisation sécurisé.</p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#3e2f25] mb-2 ml-1">Adresse e-mail</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a9825a]">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email" required
                      className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none transition-all font-medium text-sm"
                      placeholder="praticien@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                    <div className="text-red-600 text-xs bg-red-50 p-3 rounded-xl flex items-center border border-red-100 font-bold">
                        <AlertCircle size={14} className="mr-2 shrink-0"/> {error}
                    </div>
                )}

                <button
                  type="submit" disabled={loading || !email}
                  className="w-full bg-[#3e2f25] hover:bg-black text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center disabled:bg-gray-300 shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Envoyer le lien de secours'}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-[#f0e6de] pt-6">
                <button onClick={() => { setIsResetMode(false); setError(null); }} className="text-sm text-[#7a6a5f] hover:text-[#3e2f25] font-bold transition-colors">
                  Annuler et retourner à la connexion
                </button>
              </div>
            </div>
          )
        ) : (

          <div className="animate-in slide-in-from-left-4 duration-300">
            <h2 className="text-2xl font-black text-[#3e2f25] mb-8 text-center uppercase tracking-tight">Connexion</h2>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#3e2f25] mb-2 ml-1">Adresse e-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a9825a]">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email" required
                    className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none transition-all font-medium text-sm"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-xs font-black uppercase tracking-wider text-[#3e2f25]">Mot de passe</label>
                  <button type="button" onClick={() => setIsResetMode(true)} className="text-[10px] font-black uppercase tracking-widest text-[#a9825a] hover:text-[#8b6a48] focus:outline-none transition-colors">
                    Oublié ?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a9825a]">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password" required
                    className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none transition-all font-medium text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center ml-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#a9825a] focus:ring-[#a9825a] border-[#f0e6de] rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-[#7a6a5f] font-bold cursor-pointer">
                  Rester connecté
                </label>
              </div>

              {error && (
                  <div className="text-red-600 text-xs bg-red-50 p-3 rounded-xl flex items-center border border-red-100 font-bold">
                    <AlertCircle size={14} className="mr-2 shrink-0"/> {error}
                  </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-[#a9825a] hover:bg-[#8b6a48] text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-[#a9825a]/20 flex justify-center items-center disabled:bg-gray-300 group text-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>Accéder à mon espace <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* LIEN VERS L'OFFRE FONDATEUR POUR LES NOUVEAUX */}
      <div className="mt-8 text-center">
        <p className="text-[#7a6a5f] font-medium text-sm">
          Pas encore de compte ?{' '}
          <Link href="/fondateur" className="text-[#a9825a] font-black hover:underline">
            Devenir membre fondateur
          </Link>
        </p>
      </div>

      <p className="mt-12 text-[10px] text-[#9ca3af] font-black uppercase tracking-[0.2em] flex items-center gap-2">
        <Lock size={12}/> Sécurisé par Supabase Encryption
      </p>
    </div>
  );
}
