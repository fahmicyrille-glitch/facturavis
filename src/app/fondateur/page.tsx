'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle, ArrowRight, Loader2, ShieldCheck,
  Cloud, Lock, Sparkles, Check, User, Mail, Phone, Stethoscope, AlertCircle, Star, Quote
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { trackConversion } from '@/lib/gtag';

export default function FondateurPage() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [profession, setProfession] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const spotsLeft = 12;
  const totalSpots = 50;
  const progressPercentage = (spotsLeft / totalSpots) * 100;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prenom.trim() || !nom.trim()) {
      setErrorMsg("Veuillez renseigner votre prénom et nom.");
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg("Veuillez renseigner une adresse email valide.");
      return;
    }
    if (!telephone.trim() || telephone.length < 10) {
      setErrorMsg("Veuillez renseigner un numéro de téléphone valide.");
      return;
    }
    if (!profession) {
      setErrorMsg("Veuillez sélectionner votre profession.");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error: dbError } = await supabase
        .from('prospects')
        .insert([{ nom, prenom, email, telephone, profession }]);

      if (dbError) throw dbError;

      const emailResponse = await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, email, telephone, profession }),
      });

      if (!emailResponse.ok) {
        console.error("L'email de notification a échoué.");
      }

      trackConversion('/fondateur');
      router.push('/merci');

    } catch (error) {
      console.error(error);
      setErrorMsg("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // --- DONNÉES STRUCTURÉES SEO (JSON-LD) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SpecialAnnouncement",
    "name": "Offre Membre Fondateur FacturAvis",
    "description": "Accès privilégié au logiciel de gestion de cabinet FacturAvis pour les praticiens de santé. Inclut dossiers patients, facturation Factur-X et gestion des avis Google.",
    "category": "Logiciel médical et facturation",
    "provider": {
      "@type": "Organization",
      "name": "FacturAvis"
    },
    "offers": {
      "@type": "Offer",
      "price": "19.00",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/LimitedAvailability",
      "validThrough": "2026-12-31"
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#3e2f25] font-sans selection:bg-[#a9825a] selection:text-white pb-20 overflow-x-hidden relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Background Ambient Effects */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#fdf2e9] to-transparent rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* --- HEADER --- */}
      <header className="w-full p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4b494] to-[#a9825a] rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            <img src="/logo/logo.png" alt="FacturAvis - Logiciel de gestion de cabinet libéral" className="relative w-10 h-10 object-contain shadow-sm rounded-xl" />
          </div>
          <span className="text-xl font-black tracking-tighter text-[#3e2f25]">FacturAvis</span>
        </Link>
        <Link href="/" className="text-xs md:text-sm font-bold text-[#7a6a5f] hover:text-[#3e2f25] transition-all flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#f0e6de] shadow-sm hover:shadow-md hover:-translate-x-1">
            <ArrowRight size={14} className="rotate-180" /> Retour
        </Link>
      </header>

      {/* --- HERO & URGENCY --- */}
      <main className={`max-w-6xl mx-auto px-4 md:px-8 pt-8 md:pt-12 text-center relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fdf2e9] border border-[#d4b494]/30 text-[#a9825a] text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8 shadow-sm animate-float">
          <Sparkles size={14} className="fill-[#a9825a] animate-pulse" /> Pack Ambassadeur 2026
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-[#3e2f25] mb-6 md:mb-8 leading-[1.1]">
          Le logiciel de votre cabinet.<br className="hidden md:block"/>
          <span className="relative inline-block mt-1">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]">Tarif Fondateur à vie.</span>
            <div className="absolute bottom-1 left-0 w-full h-3 bg-[#d4b494]/20 -z-10 -rotate-2"></div>
          </span>
        </h1>

        <h2 className="text-base md:text-xl text-[#7a6a5f] font-medium max-w-3xl mx-auto mb-10 md:mb-12 leading-relaxed px-2">
          Oubliez les logiciels usines à gaz. Nous construisons l'outil de facturation le plus simple au monde pour gérer vos <span className="text-[#3e2f25] font-bold border-b-2 border-[#d4b494]/30 pb-0.5">dossiers patients</span>, vos <span className="text-[#3e2f25] font-bold border-b-2 border-[#d4b494]/30 pb-0.5">factures</span> et exploser vos <span className="text-[#3e2f25] font-bold border-b-2 border-[#d4b494]/30 pb-0.5">avis Google</span>.
        </h2>

        <div className="max-w-md mx-auto mb-12 md:mb-20 space-y-3 px-4">
            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-[#a9825a]">
                <span className="flex items-center gap-1.5"><Lock size={12}/> Places Fondateur restantes</span>
                <span className="text-sm bg-white border border-[#f0e6de] shadow-sm px-2.5 py-1 rounded-md text-[#3e2f25]">{spotsLeft} / {totalSpots}</span>
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

            {/* COLONNE GAUCHE : ARGUMENTS & SOCIAL PROOF */}
            <div className="space-y-6 md:space-y-8 max-w-md mx-auto lg:mx-0 order-2 lg:order-1 pt-4 lg:pt-8 px-4 sm:px-0">
                <h3 className="font-black text-2xl text-[#3e2f25] border-b border-[#f0e6de] pb-4">Fonctionnalités incluses :</h3>

                {[
                  { icon: Check, title: "Dossiers Patients Pro", desc: "Fiches complètes, observations thérapeutiques et auto-sauvegarde sécurisée en temps réel." },
                  { icon: Sparkles, title: "Boost Réputation Google", desc: "Récoltez automatiquement des avis 5 étoiles après chaque séance. Dominez les recherches de votre ville." },
                  { icon: ShieldCheck, title: "Logiciel de Facturation 2026", desc: "Factures PDF certifiées Factur-X en 1 clic, export comptable et archivage Cloud conforme RGPD." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 md:gap-5 group cursor-default" style={{ animationDelay: `${(i + 1) * 200}ms` }}>
                      <div className="mt-1 bg-gradient-to-br from-[#fdf2e9] to-white border border-[#d4b494]/40 text-[#a9825a] rounded-2xl p-2.5 md:p-3 shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <item.icon size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                          <p className="font-black text-base md:text-lg text-[#3e2f25] mb-1.5 group-hover:text-[#a9825a] transition-colors">{item.title}</p>
                          <p className="text-xs md:text-sm text-[#7a6a5f] leading-relaxed font-medium">{item.desc}</p>
                      </div>
                  </div>
                ))}

                {/* Ajout d'une mini-preuve sociale pour rassurer */}
                <div className="mt-8 p-5 bg-white rounded-2xl border border-[#f0e6de] shadow-sm relative">
                  <Quote size={24} className="absolute -top-3 -left-3 text-[#d4b494] fill-current opacity-50" />
                  <div className="flex gap-1 mb-2 text-yellow-400">
                    <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
                  </div>
                  <p className="text-sm text-[#7a6a5f] italic font-medium mb-3">"Enfin un outil pensé pour les thérapeutes et pas pour les comptables. La demande d'avis automatique m'a ramené 7 nouveaux patients ce mois-ci."</p>
                  <p className="text-xs font-black text-[#3e2f25]">— Thomas R., Ostéopathe</p>
                </div>
            </div>

            {/* COLONNE DROITE : LE PRIX & FORMULAIRE */}
            <div className="relative w-full order-1 lg:order-2 z-20">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#d4b494] via-transparent to-[#a9825a] rounded-[3rem] md:rounded-[4rem] blur-xl opacity-40 animate-pulse -z-10"></div>

              <div className="bg-white border border-[#f0e6de] rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">

                  <div className="absolute top-0 left-0 right-0 h-1.5 md:h-2 bg-gradient-to-r from-[#d4b494] to-[#a9825a]"></div>

                  <div className="absolute top-5 right-5 md:top-8 md:right-8 bg-[#3e2f25] text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl">
                      Offre Limitée
                  </div>

                  <div className="mb-8 md:mb-10 mt-2">
                      <h3 className="text-2xl md:text-3xl font-black text-[#3e2f25] mb-1 tracking-tight">Accès Privilège</h3>
                      <p className="text-[10px] md:text-xs text-[#7a6a5f] font-bold mb-4 uppercase tracking-widest">Tout inclus. Sans limite.</p>

                      <div className="flex items-baseline gap-3 md:gap-4 bg-[#fdf2e9] p-4 rounded-2xl border border-[#f0e6de]/50 inline-flex shadow-inner">
                          <span className="text-5xl md:text-6xl font-black text-[#a9825a]">19€</span>
                          <span className="text-lg md:text-xl text-[#7a6a5f] line-through decoration-[#3e2f25]/30 font-bold">29€/mois</span>
                      </div>

                      <p className="text-[10px] md:text-[11px] text-[#3e2f25] font-black mt-4 uppercase tracking-widest flex items-center gap-1.5">
                          <Lock size={14} className="text-[#a9825a]" /> Tarif mensuel bloqué à vie
                      </p>
                  </div>

                  <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm">JP</div>
                      <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-xs font-bold text-green-600 shadow-sm">M</div>
                      <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-xs font-bold text-orange-600 shadow-sm">S</div>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Rejoignez les <span className="font-bold text-[#3e2f25]">38 fondateurs</span> déjà inscrits.</p>
                  </div>

                  {errorMsg && (
                    <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100 text-left">
                      <AlertCircle size={20} className="shrink-0 mt-0.5" />
                      <p className="text-sm font-bold">{errorMsg}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 relative text-left group">
                              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Prénom</label>
                              <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#a9825a] transition-colors z-10" />
                                <input type="text" required value={prenom} onChange={(e) => {setPrenom(e.target.value); setErrorMsg('');}} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-11 pr-4 text-sm font-bold text-gray-800 focus:bg-white focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 focus:-translate-y-0.5 outline-none transition-all duration-300 shadow-sm hover:shadow-md" placeholder="Marc" />
                              </div>
                          </div>
                          <div className="space-y-1.5 relative text-left group">
                              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Nom</label>
                              <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#a9825a] transition-colors z-10" />
                                <input type="text" required value={nom} onChange={(e) => {setNom(e.target.value); setErrorMsg('');}} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-11 pr-4 text-sm font-bold text-gray-800 focus:bg-white focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 focus:-translate-y-0.5 outline-none transition-all duration-300 shadow-sm hover:shadow-md" placeholder="Vandamme" />
                              </div>
                          </div>
                      </div>

                      <div className="space-y-1.5 text-left group">
                          <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Email Professionnel</label>
                          <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#a9825a] transition-colors z-10" />
                            <input type="email" required value={email} onChange={(e) => {setEmail(e.target.value); setErrorMsg('');}} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-11 pr-4 text-sm font-bold text-gray-800 focus:bg-white focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 focus:-translate-y-0.5 outline-none transition-all duration-300 shadow-sm hover:shadow-md" placeholder="contact@cabinet.fr" />
                          </div>
                      </div>

                      <div className="space-y-1.5 text-left group">
                          <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Téléphone Mobile</label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#a9825a] transition-colors z-10" />
                            <input type="tel" required value={telephone} onChange={(e) => {setTelephone(e.target.value); setErrorMsg('');}} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-11 pr-4 text-sm font-bold text-gray-800 focus:bg-white focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 focus:-translate-y-0.5 outline-none transition-all duration-300 shadow-sm hover:shadow-md" placeholder="06 00 00 00 00" />
                          </div>
                      </div>

                      <div className="space-y-1.5 text-left group">
                          <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#7a6a5f] ml-1">Profession</label>
                          <div className="relative">
                            <Stethoscope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#a9825a] transition-colors z-10" />
                            <select required value={profession} onChange={(e) => {setProfession(e.target.value); setErrorMsg('');}} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-11 pr-4 text-sm font-bold text-gray-800 focus:bg-white focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 focus:-translate-y-0.5 outline-none transition-all duration-300 shadow-sm hover:shadow-md appearance-none">
                              <option value="" disabled>Sélectionnez votre métier</option>
                              <option value="Ostéopathe">Ostéopathe</option>
                              <option value="Psychologue">Psychologue</option>
                              <option value="Chiropracteur">Chiropracteur</option>
                              <option value="Diététicien">Diététicien(ne)</option>
                              <option value="Kinésiologue">Kinésiologue</option>
                              <option value="Psychothérapeute">Psychothérapeute</option>
                              <option value="Autre">Autre praticien de santé</option>
                            </select>
                          </div>
                      </div>

                      <button type="submit" disabled={loading} className="w-full mt-8 bg-gradient-to-r from-[#3e2f25] to-[#2a1f18] hover:from-black hover:to-[#1a120d] text-white font-black text-lg md:text-xl py-4 md:py-5 rounded-2xl transition-all flex items-center justify-center shadow-[0_10px_20px_-10px_rgba(62,47,37,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(169,130,90,0.6)] hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden ring-4 ring-transparent hover:ring-[#a9825a]/20">
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
                          {loading ? <Loader2 size={24} className="animate-spin relative z-10" /> : <><span className="relative z-10">Verrouiller mon tarif à vie</span> <ArrowRight size={20} className="ml-2 relative z-10 group-hover:translate-x-1 transition-transform" /></>}
                      </button>

                      <p className="text-[10px] text-center text-[#7a6a5f] font-bold uppercase tracking-widest pt-3 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
                          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500"/> 14 jours d'essai gratuit</span>
                          <span className="hidden sm:inline-block w-1 h-1 bg-[#d4b494] rounded-full"></span>
                          <span className="flex items-center gap-1.5">Sans carte bancaire</span>
                      </p>
                  </form>
              </div>
            </div>
        </div>
      </main>

      {/* --- TRUST BADGES --- */}
      <section className="mt-20 md:mt-32 max-w-4xl mx-auto px-4 border-t border-[#f0e6de] pt-8 md:pt-12 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 md:gap-12 opacity-80">
          <div className="flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-[#7a6a5f] hover:text-[#3e2f25] transition-colors"><Lock size={16} className="text-[#a9825a]" /> Sécurité AES-256</div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[#d4b494]"></div>
          <div className="flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-[#7a6a5f] hover:text-[#3e2f25] transition-colors"><ShieldCheck size={16} className="text-[#a9825a]" /> Conformité RGPD & Factur-X</div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[#d4b494]"></div>
          <div className="flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-[#7a6a5f] hover:text-[#3e2f25] transition-colors"><Cloud size={16} className="text-[#a9825a]" /> Hébergement Français</div>
      </section>

      {/* CSS POUR ANIMATIONS */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
