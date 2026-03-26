'use client';

import { useState } from 'react';
import {
  CheckCircle, ArrowRight, Loader2, ShieldCheck,
  Cloud, Lock, Sparkles, Check, User, Mail, Phone
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { trackConversion } from '@/lib/gtag'; // <-- IMPORT DE LA BALISE GA4

export default function FondateurPage() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

      // 🔥 BALISE DE CONVERSION GA4 DÉCLENCHÉE ICI
      trackConversion('/fondateur');

      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue. Nous avons pourtant bien besoin de vous !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#3e2f25] font-sans selection:bg-[#a9825a] selection:text-white pb-20 overflow-hidden">

      {/* --- HEADER --- */}
      <header className="w-full p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo/logo.png" alt="FacturAvis" className="w-10 h-10 object-contain" />
          <span className="text-xl font-black tracking-tighter text-[#3e2f25]">FacturAvis</span>
        </Link>
        <Link href="/" className="text-xs md:text-sm font-bold text-[#7a6a5f] hover:text-[#a9825a] transition-all flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#f0e6de] shadow-sm">
            Retour <ArrowRight size={14} className="rotate-180" />
        </Link>
      </header>

      {/* --- HERO & URGENCY --- */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8 md:pt-16 text-center relative z-10">

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fdf2e9] border border-[#f0e6de] text-[#a9825a] text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8 shadow-sm animate-in slide-in-from-top-4 duration-700">
          <Sparkles size={14} className="fill-[#a9825a] animate-pulse" /> Pack Ambassadeur 2026
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-[#3e2f25] mb-6 md:mb-8 leading-[1.1] animate-in fade-in duration-1000">
          Devenez <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]">Membre Fondateur</span><br className="hidden md:block"/> et ne payez plus jamais le prix fort.
        </h1>

        <p className="text-base md:text-xl text-[#7a6a5f] font-medium max-w-3xl mx-auto mb-10 md:mb-12 leading-relaxed px-2 animate-in fade-in duration-1000 delay-150">
          Oubliez les logiciels usines à gaz. Nous construisons l'outil le plus simple au monde pour gérer vos <span className="text-[#3e2f25] font-bold border-b-2 border-[#d4b494]/30 pb-0.5">dossiers patients</span>, vos <span className="text-[#3e2f25] font-bold border-b-2 border-[#d4b494]/30 pb-0.5">factures</span> et exploser vos <span className="text-[#3e2f25] font-bold border-b-2 border-[#d4b494]/30 pb-0.5">avis Google</span>.
        </p>

        <div className="max-w-md mx-auto mb-12 md:mb-20 space-y-3 px-4 animate-in zoom-in-95 duration-700 delay-300">
            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-[#a9825a]">
                <span className="flex items-center gap-1.5"><Lock size={12}/> Places Fondateur restantes</span>
                <span className="text-sm bg-[#fdf2e9] px-2 py-0.5 rounded-md">{spotsLeft} / {totalSpots}</span>
            </div>
            <div className="h-3 md:h-4 w-full bg-white border border-[#f0e6de] rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-[#d4b494] via-[#a9825a] to-[#8a6543] rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${100 - progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -skew-x-12"></div>
                </div>
            </div>
            <p className="text-[10px] text-[#7a6a5f] font-bold italic text-right opacity-80 flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Dernière inscription il y a 4 heures
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start text-left">

            {/* COLONNE GAUCHE : ARGUMENTS */}
            <div className="space-y-6 md:space-y-10 max-w-md mx-auto lg:mx-0 order-2 lg:order-1 pt-4 lg:pt-8 px-4 sm:px-0">
                <h3 className="font-black text-xl md:text-2xl text-[#3e2f25] border-b border-[#f0e6de] pb-4">Inclus dans le pack :</h3>

                <div className="flex items-start gap-4 md:gap-5 group cursor-default">
                    <div className="mt-1 bg-white border border-[#f0e6de] text-[#a9825a] rounded-2xl p-2.5 md:p-3 shrink-0 shadow-sm group-hover:bg-[#fdf2e9] group-hover:border-[#a9825a]/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Check size={20} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="font-black text-base md:text-lg text-[#3e2f25] mb-1.5 group-hover:text-[#a9825a] transition-colors">Dossiers Patients Pro</p>
                        <p className="text-xs md:text-sm text-[#7a6a5f] leading-relaxed font-medium">Fiches complètes, observations thérapeutiques et auto-sauvegarde sécurisée en temps réel.</p>
                    </div>
                </div>

                <div className="flex items-start gap-4 md:gap-5 group cursor-default">
                    <div className="mt-1 bg-white border border-[#f0e6de] text-[#a9825a] rounded-2xl p-2.5 md:p-3 shrink-0 shadow-sm group-hover:bg-[#fdf2e9] group-hover:border-[#a9825a]/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Sparkles size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="font-black text-base md:text-lg text-[#3e2f25] mb-1.5 group-hover:text-[#a9825a] transition-colors">Boost Réputation Google</p>
                        <p className="text-xs md:text-sm text-[#7a6a5f] leading-relaxed font-medium">Récoltez automatiquement des avis 5 étoiles après chaque séance. Dominez les recherches de votre ville.</p>
                    </div>
                </div>

                <div className="flex items-start gap-4 md:gap-5 group cursor-default">
                    <div className="mt-1 bg-white border border-[#f0e6de] text-[#a9825a] rounded-2xl p-2.5 md:p-3 shrink-0 shadow-sm group-hover:bg-[#fdf2e9] group-hover:border-[#a9825a]/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <ShieldCheck size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="font-black text-base md:text-lg text-[#3e2f25] mb-1.5 group-hover:text-[#a9825a] transition-colors">Zéro Stress Administratif</p>
                        <p className="text-xs md:text-sm text-[#7a6a5f] leading-relaxed font-medium">Factures PDF certifiées en 1 clic, export comptable et archivage Cloud conforme RGPD.</p>
                    </div>
                </div>
            </div>

            {/* COLONNE DROITE : LE PRIX & FORMULAIRE */}
            <div className="relative w-full order-1 lg:order-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#d4b494] to-[#a9825a] rounded-[2.5rem] md:rounded-[3.5rem] blur opacity-20 animate-pulse"></div>

              <div className="bg-white border border-[#f0e6de] rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">

                  <div className="absolute top-0 left-0 right-0 h-1.5 md:h-2 bg-gradient-to-r from-[#d4b494] to-[#a9825a]"></div>

                  <div className="absolute top-5 right-5 md:top-8 md:right-8 bg-[#3e2f25] text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl">
                      Offre Limitée
                  </div>

                  <div className="mb-8 md:mb-10 mt-2">
                      <h2 className="text-2xl md:text-3xl font-black text-[#3e2f25] mb-1 tracking-tight">Accès Privilège</h2>
                      <p className="text-[10px] md:text-xs text-[#7a6a5f] font-bold mb-4 uppercase tracking-widest">Tout inclus. Sans limite.</p>

                      <div className="flex items-baseline gap-3 md:gap-4 bg-[#fdf2e9] p-4 rounded-2xl border border-[#f0e6de]/50 inline-flex">
                          <span className="text-5xl md:text-6xl font-black text-[#a9825a]">19€</span>
                          <span className="text-lg md:text-xl text-[#7a6a5f] line-through decoration-[#3e2f25]/30 font-bold">29€/mois</span>
                      </div>

                      <p className="text-[10px] md:text-[11px] text-[#3e2f25] font-black mt-4 uppercase tracking-widest flex items-center gap-1.5">
                          <Lock size={12} className="text-[#a9825a]" /> Tarif mensuel bloqué à vie
                      </p>
                  </div>

                  {!success && (
                    <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600">JP</div>
                        <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-xs font-bold text-green-600">M</div>
                        <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-xs font-bold text-orange-600">S</div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">Rejoignez les <span className="font-bold text-[#3e2f25]">38 fondateurs</span> déjà inscrits.</p>
                    </div>
                  )}

                  {success ? (
                      <div className="bg-green-50 border border-green-100 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 text-center animate-in zoom-in duration-500 shadow-inner">
                          <div className="bg-green-500 text-white w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg shadow-green-200">
                              <CheckCircle size={28} />
                          </div>
                          <h3 className="text-xl md:text-2xl font-black text-green-900 mb-2">Place réservée !</h3>
                          <p className="text-green-800 font-bold text-xs md:text-sm leading-relaxed">
                              Félicitations {prenom}. Un expert de notre équipe vous appellera dans les 24h pour activer votre compte.
                          </p>
                      </div>
                  ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5 relative">
                                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Prénom</label>
                                  <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" required value={prenom} onChange={(e) => setPrenom(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 text-sm font-bold text-gray-800 focus:bg-white focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none transition-all shadow-sm" placeholder="Marc" />
                                  </div>
                              </div>
                              <div className="space-y-1.5 relative">
                                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Nom</label>
                                  <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 text-sm font-bold text-gray-800 focus:bg-white focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none transition-all shadow-sm" placeholder="Vandamme" />
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-1.5">
                              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Email Professionnel</label>
                              <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 text-sm font-bold text-gray-800 focus:bg-white focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none transition-all shadow-sm" placeholder="contact@cabinet.fr" />
                              </div>
                          </div>

                          <div className="space-y-1.5">
                              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Téléphone Mobile</label>
                              <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="tel" required value={telephone} onChange={(e) => setTelephone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 text-sm font-bold text-gray-800 focus:bg-white focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none transition-all shadow-sm" placeholder="06 00 00 00 00" />
                              </div>
                          </div>

                          <button type="submit" disabled={loading} className="w-full mt-6 bg-gradient-to-r from-[#3e2f25] to-[#2a1f18] hover:from-black hover:to-[#3e2f25] text-white font-black text-lg md:text-xl py-4 md:py-5 rounded-xl transition-all flex items-center justify-center shadow-[0_10px_20px_-10px_rgba(62,47,37,0.5)] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden">
                              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>

                              {loading ? <Loader2 size={24} className="animate-spin relative z-10" /> : <><span className="relative z-10">Réserver mon accès</span> <ArrowRight size={20} className="ml-2 relative z-10 group-hover:translate-x-1 transition-transform" /></>}
                          </button>

                          <p className="text-[9px] md:text-[10px] text-center text-[#7a6a5f] font-bold uppercase tracking-widest pt-2">
                              14 jours d'essai gratuit • Sans engagement
                          </p>
                      </form>
                  )}
              </div>
            </div>
        </div>
      </main>

      {/* --- TRUST BADGES --- */}
      <section className="mt-20 md:mt-32 max-w-4xl mx-auto px-4 border-t border-[#f0e6de] pt-8 md:pt-12 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 md:gap-12 opacity-60">
          <div className="flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-[#7a6a5f]"><Lock size={16} /> Sécurité AES-256</div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-[#d4b494]"></div>
          <div className="flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-[#7a6a5f]"><ShieldCheck size={16} /> Conformité RGPD</div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-[#d4b494]"></div>
          <div className="flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-[#7a6a5f]"><Cloud size={16} /> Hébergement Français</div>
      </section>

    </div>
  );
}
