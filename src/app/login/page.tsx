'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, FileCheck, Eye, EyeOff, MailCheck } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  useEffect(() => { document.title = 'Connexion — FacturAvis'; }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [confirmationResent, setConfirmationResent] = useState(false);

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const emailConfirmed = searchParams.get('confirmed') === 'true';

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
    setNeedsEmailConfirmation(false);
    setConfirmationResent(false);

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const code = (error as { code?: string }).code;
      const msg = error.message?.toLowerCase() || '';
      if (code === 'email_not_confirmed' || msg.includes('email not confirmed') || msg.includes('not confirmed')) {
        setNeedsEmailConfirmation(true);
      } else {
        setError('Email ou mot de passe incorrect.');
      }
      setLoading(false);
    } else {
      // Profil pas encore complété (inscription minimale) → onboarding avant le dashboard.
      const { data: profile } = await supabase
        .from('therapeutes')
        .select('nom')
        .eq('id', signInData.user.id)
        .single();
      if (!profile?.nom) {
        router.push('/dashboard/settings?onboarding=true#profil-infos');
      } else {
        router.push('/dashboard');
      }
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) return;
    setResendingConfirmation(true);
    setError(null);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (error.status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
        setError("Par sécurité, veuillez patienter 60 secondes avant de redemander un email.");
      } else {
        setError("Impossible de renvoyer l'email pour le moment.");
      }
    } else {
      setConfirmationResent(true);
    }
    setResendingConfirmation(false);
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

      {/* BANDEAU EMAIL CONFIRMÉ */}
      {emailConfirmed && (
        <div className="mb-6 w-full max-w-md bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500 shrink-0" />
          <div>
            <p className="font-bold text-green-800 text-sm">Email confirmé !</p>
            <p className="text-green-700 text-xs">Votre compte est activé. Connectez-vous ci-dessous.</p>
          </div>
        </div>
      )}

      {/* RETOUR ACCUEIL */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 bg-white border border-[#f0e6de] text-[#7a6a5f] font-bold hover:text-[#3e2f25] hover:border-[#a9825a] px-4 py-2 rounded-full text-sm transition-all shadow-sm hover:shadow-md">
          <ArrowLeft size={14} /> Retour à l&apos;accueil
        </Link>
      </div>

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
                  <button type="button" onClick={() => { setIsResetMode(true); setNeedsEmailConfirmation(false); setError(null); }} className="text-[10px] font-black uppercase tracking-widest text-[#a9825a] hover:text-[#8b6a48] focus:outline-none transition-colors">
                    Oublié ?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a9825a]">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'} required
                    className="w-full pl-11 pr-11 py-3.5 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none transition-all font-medium text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#a9825a] hover:text-[#3e2f25] transition-colors"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {needsEmailConfirmation && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <div className="bg-amber-100 text-amber-700 p-1.5 rounded-lg shrink-0">
                      <MailCheck size={16} />
                    </div>
                    <div className="text-xs leading-relaxed">
                      <p className="font-black text-amber-900 mb-1">Email en attente de confirmation</p>
                      <p className="text-amber-800 font-medium">
                        Vous devez d'abord valider votre adresse <strong className="font-black">{email}</strong> en cliquant sur le lien reçu par email.
                      </p>
                      <p className="text-amber-700 font-medium mt-1.5">
                        Pensez à vérifier vos <strong className="font-black">spams</strong> ou courriers indésirables.
                      </p>
                    </div>
                  </div>
                  {confirmationResent ? (
                    <div className="flex items-center gap-2 text-[11px] text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-lg font-bold">
                      <CheckCircle size={12} /> Nouvel email envoyé à {email}.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendingConfirmation}
                      className="w-full text-xs font-black bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 py-2.5 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {resendingConfirmation ? <Loader2 className="animate-spin" size={14} /> : <Mail size={14} />}
                      {resendingConfirmation ? 'Envoi en cours…' : "Renvoyer l'email de confirmation"}
                    </button>
                  )}
                </div>
              )}

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
          <Link href="/inscription" className="text-[#a9825a] font-black hover:underline">
            Créer mon espace gratuitement
          </Link>
        </p>
      </div>

      <p className="mt-12 text-[10px] text-[#9ca3af] font-black uppercase tracking-[0.2em] flex items-center gap-2">
        <Lock size={12}/> Sécurisé par Supabase Encryption
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
