'use client';

import { useState } from 'react';
import {
  Star, CheckCircle, ArrowRight, Loader2, ShieldCheck,
  Zap, BarChart3, Cloud, Users, ClipboardList, Lock, Sparkles, Check
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function FondateurPage() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Simulation d'urgence (Places restantes)
  const spotsLeft = 12;
  const totalSpots = 50;
  const progressPercentage = (spotsLeft / totalSpots) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: dbError } = await supabase
        .from('prospects')
        .insert([{ nom, prenom, email, telephone }]);

      if (dbError) throw dbError;

      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, email, telephone }),
      });

      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue. Nous avons pourtant bien besoin de vous !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#3e2f25] font-sans selection:bg-[#a9825a] selection:text-white pb-20">

      {/* --- HEADER --- */}
      <header className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo/logo.png" alt="FacturAvis" className="w-10 h-10 object-contain" />
          <span className="font-black text-2xl tracking-tighter">FacturAvis</span>
        </Link>
        <Link href="/" className="text-sm font-bold text-[#7a6a5f] hover:text-[#a9825a] transition-all flex items-center gap-2">
           Retour <ArrowRight size={14} className="rotate-180" />
        </Link>
      </header>

      {/* --- HERO & URGENCY --- */}
      <main className="max-w-5xl mx-auto px-6 pt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fdf2e9] border border-[#f0e6de] text-[#a9825a] text-xs font-black uppercase tracking-widest mb-8">
          <Sparkles size={14} className="fill-current animate-pulse" /> Pack Ambassadeur 2026
        </div>

        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-[#3e2f25] mb-8 leading-[1.05]">
          Devenez <span className="text-[#a9825a]">Membre Fondateur</span> et ne payez plus jamais le prix fort.
        </h1>

        <p className="text-lg md:text-xl text-[#7a6a5f] font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
          Oubliez les logiciels usines à gaz. Nous construisons l'outil le plus simple au monde pour gérer vos <span className="text-[#3e2f25] font-bold">dossiers patients</span>, vos <span className="text-[#3e2f25] font-bold">factures</span> et vos <span className="text-[#3e2f25] font-bold">avis Google</span>.
        </p>

        {/* BARRE D'URGENCE VISUELLE */}
        <div className="max-w-md mx-auto mb-16 space-y-3">
            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-[#a9825a]">
                <span>Places Fondateur restantes</span>
                <span className="text-sm">{spotsLeft} / {totalSpots}</span>
            </div>
            <div className="h-3 w-full bg-white border border-[#f0e6de] rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-[#d4b494] to-[#a9825a] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${100 - progressPercentage}%` }}
                ></div>
            </div>
            <p className="text-[10px] text-[#7a6a5f] font-bold italic text-right opacity-60">Dernière inscription il y a 4 heures</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* COLONNE GAUCHE : ARGUMENTS ALLÉGÉS */}
            <div className="space-y-8 text-left max-w-md mx-auto lg:mx-0">

                <h3 className="font-black text-2xl mb-6">Ce qui est inclus dans le pack :</h3>

                <div className="flex items-start gap-4 group">
                    <div className="mt-1 bg-[#fdf2e9] text-[#a9825a] rounded-full p-1.5 shrink-0 group-hover:scale-110 transition-transform">
                        <Check size={18} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="font-black text-lg text-[#3e2f25] mb-1">Dossiers Patients Pro</p>
                        <p className="text-sm text-[#7a6a5f] leading-relaxed font-medium">Fiches complètes, observations thérapeutiques et auto-sauvegarde sécurisée en temps réel.</p>
                    </div>
                </div>

                <div className="flex items-start gap-4 group">
                    <div className="mt-1 bg-[#fdf2e9] text-[#a9825a] rounded-full p-1.5 shrink-0 group-hover:scale-110 transition-transform">
                        <Check size={18} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="font-black text-lg text-[#3e2f25] mb-1">Boost Réputation Google</p>
                        <p className="text-sm text-[#7a6a5f] leading-relaxed font-medium">Récoltez automatiquement des avis 5 étoiles après chaque séance. Dominez votre ville.</p>
                    </div>
                </div>

                <div className="flex items-start gap-4 group">
                    <div className="mt-1 bg-[#fdf2e9] text-[#a9825a] rounded-full p-1.5 shrink-0 group-hover:scale-110 transition-transform">
                        <Check size={18} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="font-black text-lg text-[#3e2f25] mb-1">Zéro Stress Administratif</p>
                        <p className="text-sm text-[#7a6a5f] leading-relaxed font-medium">Factures PDF certifiées en 1 clic, export comptable et archivage Cloud conforme RGPD.</p>
                    </div>
                </div>
            </div>

            {/* COLONNE DROITE : LE PRIX & FORMULAIRE */}
            <div className="bg-white/60 backdrop-blur-sm border border-[#f0e6de] rounded-[3rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(169,130,90,0.15)] text-left relative overflow-hidden">
                {/* Liseret coloré en haut du cadre */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#d4b494] to-[#a9825a]"></div>

                <div className="absolute top-6 right-8 bg-[#3e2f25] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Offre Limitée
                </div>

                <div className="mb-10 mt-2">
                    <h2 className="text-3xl font-black text-[#3e2f25] mb-1 tracking-tight">Accès Privilège</h2>
                    <p className="text-xs text-[#7a6a5f] font-bold mb-4 uppercase tracking-widest">Tout inclus. Sans limite.</p>
                    <div className="flex items-baseline gap-4">
                        <span className="text-6xl font-black text-[#3e2f25]">19€</span>
                        <span className="text-xl text-[#7a6a5f] line-through decoration-[#a9825a]/50 font-bold">29€/mois</span>
                    </div>
                    <p className="text-[11px] text-[#a9825a] font-black mt-3 uppercase tracking-widest flex items-center gap-1.5">
                        <Lock size={12} /> Tarif bloqué à vie
                    </p>
                </div>

                {success ? (
                    <div className="bg-green-50 border border-green-100 rounded-[2rem] p-8 text-center animate-in zoom-in duration-500 shadow-inner">
                        <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-green-900 mb-2">Place réservée !</h3>
                        <p className="text-green-800 font-bold text-sm leading-relaxed">
                            Félicitations {prenom}. Un expert de notre équipe vous appellera dans les 24h pour activer votre compte.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Prénom</label>
                                <input type="text" required value={prenom} onChange={(e) => setPrenom(e.target.value)} className="w-full bg-white border border-[#f0e6de] rounded-2xl p-4 text-sm font-bold focus:border-[#a9825a] focus:ring-1 focus:ring-[#a9825a]/20 outline-none transition-all shadow-sm" placeholder="Marc" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Nom</label>
                                <input type="text" required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full bg-white border border-[#f0e6de] rounded-2xl p-4 text-sm font-bold focus:border-[#a9825a] focus:ring-1 focus:ring-[#a9825a]/20 outline-none transition-all shadow-sm" placeholder="Vandamme" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Email Professionnel</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-[#f0e6de] rounded-2xl p-4 text-sm font-bold focus:border-[#a9825a] focus:ring-1 focus:ring-[#a9825a]/20 outline-none transition-all shadow-sm" placeholder="contact@cabinet.fr" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Téléphone Mobile</label>
                            <input type="tel" required value={telephone} onChange={(e) => setTelephone(e.target.value)} className="w-full bg-white border border-[#f0e6de] rounded-2xl p-4 text-sm font-bold focus:border-[#a9825a] focus:ring-1 focus:ring-[#a9825a]/20 outline-none transition-all shadow-sm" placeholder="06 00 00 00 00" />
                        </div>

                        <button type="submit" disabled={loading} className="w-full mt-6 bg-[#3e2f25] hover:bg-black text-white font-black text-xl py-5 rounded-2xl transition-all flex items-center justify-center shadow-xl hover:shadow-[#3e2f25]/40 active:scale-95 disabled:bg-gray-300">
                            {loading ? <Loader2 size={24} className="animate-spin" /> : <>Réserver mon accès <ArrowRight size={20} className="ml-2" /></>}
                        </button>

                        <p className="text-[9px] text-center text-[#7a6a5f] font-bold uppercase tracking-widest pt-2">
                            Essai gratuit 14 jours • Sans engagement
                        </p>
                    </form>
                )}
            </div>
        </div>
      </main>

      {/* --- TRUST BADGES --- */}
      <section className="mt-32 max-w-5xl mx-auto px-6 border-t border-[#f0e6de] pt-12 flex flex-wrap justify-center gap-12 opacity-50">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest"><Lock size={16}/> Sécurité AES-256</div>
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest"><ShieldCheck size={16}/> Conformité RGPD</div>
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest"><Cloud size={16}/> Cloud Français</div>
      </section>

    </div>
  );
}
