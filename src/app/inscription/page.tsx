'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, Lock, Mail, User, Eye, EyeOff, Stethoscope, Building, ShieldCheck } from 'lucide-react';

export default function InscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Profile
  const [nom, setNom] = useState('');
  const [titre, setTitre] = useState('');
  const [telephone, setTelephone] = useState('');
  const [siret, setSiret] = useState('');
  const [adresseCabinet, setAdresseCabinet] = useState('');

  // Step 3: Cabinet
  const [nomCabinet, setNomCabinet] = useState('');
  const [lienGoogle, setLienGoogle] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('already')) {
          setError('Un compte existe déjà avec cet email. Connectez-vous.');
        } else if (authError.message.includes('rate') || authError.message.includes('limit')) {
          setError('Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.');
        } else if (authError.message.includes('valid') || authError.message.includes('email')) {
          setError('Adresse email invalide. Vérifiez votre saisie.');
        } else if (authError.message.includes('password') || authError.message.includes('weak')) {
          setError('Le mot de passe doit contenir au moins 6 caractères.');
        } else {
          setError('Une erreur est survenue. Réessayez dans quelques instants.');
        }
        setLoading(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) { setError('Erreur lors de la création du compte'); setLoading(false); return; }

      // 2. Create therapeute profile
      const { error: profileError } = await supabase.from('therapeutes').insert([{
        id: userId,
        email,
        nom: nom.trim(),
        titre: titre.trim(),
        telephone: telephone.trim(),
        siret: siret.replace(/\s/g, ''),
        adresse_cabinet: adresseCabinet.trim(),
      }]);

      if (profileError) {
        console.error('Profile error:', profileError);
        // Don't block — the account is created, profile can be completed later
      }

      // 3. Create cabinet
      if (nomCabinet.trim()) {
        await supabase.from('cabinets').insert([{
          therapeute_id: userId,
          nom: nomCabinet.trim(),
          lien_avis_google: lienGoogle.trim() || '',
        }]);
      }

      // 4. Auto-login and redirect
      await supabase.auth.signInWithPassword({ email, password });
      router.push('/dashboard');

    } catch (err) {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] flex flex-col justify-center items-center p-4 font-sans text-[#3e2f25]">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-black tracking-tight text-[#3e2f25]">FacturAvis</h1>
        </Link>
        <p className="text-[#7a6a5f] font-medium mt-2">Créez votre espace praticien en 2 minutes</p>
      </div>

      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl shadow-[#a9825a]/10 p-8 md:p-10 border border-[#f0e6de]">

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                step >= s ? 'bg-[#a9825a] text-white' : 'bg-gray-100 text-gray-400'
              }`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-1 rounded-full ${step > s ? 'bg-[#a9825a]' : 'bg-gray-100'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-black">Votre compte</h2>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">Email professionnel</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a9825a]" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none font-medium"
                  placeholder="cabinet@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a9825a]" />
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none font-medium"
                  placeholder="6 caractères minimum" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button onClick={() => {
              if (!email || !password || password.length < 6) { setError('Email et mot de passe (6+ car.) requis'); return; }
              setError(''); setStep(2);
            }} className="w-full bg-[#a9825a] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#8b6a48] transition-all flex items-center justify-center gap-2">
              Continuer <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black">Votre profil praticien</h2>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">Nom complet *</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a9825a]" />
                <input type="text" required value={nom} onChange={(e) => setNom(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none font-medium"
                  placeholder="Dr. Jean Dupont" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">Profession *</label>
              <div className="relative">
                <Stethoscope size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a9825a]" />
                <input type="text" required value={titre} onChange={(e) => setTitre(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none font-medium"
                  placeholder="Ostéopathe D.O." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">Téléphone</label>
                <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none font-medium text-sm"
                  placeholder="06 00 00 00 00" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1">SIRET <ShieldCheck size={12} className="text-green-500" /></label>
                <input type="text" value={siret} onChange={(e) => setSiret(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none font-medium text-sm"
                  placeholder="14 chiffres" maxLength={18} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">Adresse du cabinet</label>
              <div className="relative">
                <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a9825a]" />
                <input type="text" value={adresseCabinet} onChange={(e) => setAdresseCabinet(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none font-medium"
                  placeholder="104 Grande Rue, 92310 Sèvres" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">Retour</button>
              <button onClick={() => {
                if (!nom.trim() || !titre.trim()) { setError('Nom et profession requis'); return; }
                setError(''); setStep(3);
              }} className="flex-1 bg-[#a9825a] text-white py-3 rounded-xl font-black hover:bg-[#8b6a48] transition-all flex items-center justify-center gap-2">
                Continuer <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-black">Votre cabinet</h2>
            <p className="text-sm text-[#7a6a5f]">Ces informations permettent d'associer vos factures au bon cabinet et de récolter les avis Google au bon endroit.</p>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">Nom du cabinet *</label>
              <input type="text" required value={nomCabinet} onChange={(e) => setNomCabinet(e.target.value)}
                className="w-full px-4 py-3 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none font-medium"
                placeholder="Cabinet d'Ostéopathie de Sèvres" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">Lien Google Avis (optionnel)</label>
              <input type="url" value={lienGoogle} onChange={(e) => setLienGoogle(e.target.value)}
                className="w-full px-4 py-3 bg-[#fcfaf8] border-2 border-[#f0e6de] rounded-xl focus:border-[#a9825a] outline-none font-medium text-sm"
                placeholder="https://g.page/r/..." />
              <p className="text-[10px] text-[#7a6a5f] mt-1">Vous pourrez l&apos;ajouter plus tard dans les paramètres.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">Retour</button>
              <button onClick={handleSignup} disabled={loading || !nomCabinet.trim()}
                className="flex-1 bg-[#3e2f25] text-white py-4 rounded-xl font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:bg-gray-300">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <>Créer mon espace <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold">{error}</div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#7a6a5f]">
          Déjà inscrit ? <Link href="/login" className="text-[#a9825a] font-black hover:underline">Se connecter</Link>
        </p>
      </div>

      <p className="mt-8 text-[10px] text-[#9ca3af] font-black uppercase tracking-[0.2em] flex items-center gap-2">
        <Lock size={12} /> Données sécurisées &bull; 14 jours d&apos;essai gratuit &bull; Sans CB
      </p>
    </div>
  );
}
