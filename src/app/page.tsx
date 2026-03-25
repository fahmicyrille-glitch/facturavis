'use client';

import React from 'react';
import {
  CheckCircle2, Star, ShieldCheck, ArrowRight, FileCheck,
  TrendingUp, Clock, Cloud, Lock, Search, Euro, Mail, FilePlus,
  Users, ClipboardList, Zap, ShieldAlert, Building2
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#3e2f25] font-sans selection:bg-[#a9825a] selection:text-white">

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#f0e6de]">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo/logo.png" alt="FacturAvis" className="w-10 h-10 object-contain" />
            <span className="text-xl font-black tracking-tighter text-[#3e2f25]">FacturAvis</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[#7a6a5f]">
            <a href="#fonctionnalites" className="hover:text-[#a9825a] transition">Fonctionnalités</a>
            <a href="#dossiers" className="hover:text-[#a9825a] transition">Dossiers Patients</a>
            <a href="#avis" className="hover:text-[#a9825a] transition">Avis Google</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-bold text-[#7a6a5f] hover:text-[#3e2f25] px-4 py-2 transition">
              Connexion
            </Link>
            <Link
              href="/fondateur"
              className="bg-[#3e2f25] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black transition shadow-lg shadow-[#3e2f25]/20"
            >
              Essai Gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden text-center">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#fdf2e9] text-[#a9825a] px-4 py-2 rounded-full text-xs font-black mb-8 shadow-sm border border-[#f0e6de] uppercase tracking-widest">
            <Clock size={14} className="animate-pulse" />
            <span>Offre Membre Fondateur — -10€ à vie</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.05] text-[#3e2f25]">
            Gérez vos patients, <br/>
            <span className="text-[#a9825a]">facturez</span> & rayonnez.
          </h1>
          <p className="text-lg md:text-xl text-[#7a6a5f] max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            L'outil tout-en-un pour les thérapeutes. <span className="text-[#3e2f25] font-bold text-lg underline decoration-[#a9825a]/30">Dossiers patients sécurisés</span>, factures PDF en 10 secondes et récolte automatisée d'avis Google.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/fondateur"
              className="w-full sm:w-auto flex items-center justify-center bg-[#a9825a] text-white px-10 py-5 rounded-[20px] font-black text-lg hover:bg-[#8b6a48] transition transform hover:-translate-y-1 shadow-2xl shadow-[#a9825a]/30"
            >
              Démarrer mon essai gratuit
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center bg-white text-[#7a6a5f] border border-[#f0e6de] px-10 py-5 rounded-[20px] font-bold text-lg hover:bg-gray-50 transition"
            >
              Déjà membre ?
            </Link>
          </div>

          {/* PREUVE SOCIALE AJOUTÉE ICI */}
          <div className="mt-12 flex flex-col items-center gap-3">
            <div className="flex -space-x-3">
              {[11, 32, 45, 68, 90].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#fcfaf8] bg-slate-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i}`} alt="Praticien" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-[#7a6a5f] uppercase tracking-widest">
              Rejoignez plus de <span className="text-[#3e2f25]">150 thérapeutes</span> en France
            </p>
          </div>
        </div>
      </section>

      {/* --- COMMENT CA MARCHE (AJOUT) --- */}
      <section className="py-16 bg-[#fdf2e9]/50 border-t border-[#f0e6de]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-sm font-black text-[#a9825a] uppercase tracking-widest mb-10">Automatisez votre croissance en 3 étapes</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
             <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-[#f0e6de] -z-10"></div>
             <div className="bg-white p-6 rounded-3xl border border-[#f0e6de] shadow-sm relative z-10">
               <div className="w-12 h-12 bg-[#3e2f25] text-white font-black text-xl flex items-center justify-center rounded-2xl mx-auto mb-4">1</div>
               <h4 className="font-black text-lg mb-2">Vous facturez</h4>
               <p className="text-sm text-[#7a6a5f]">Générez un PDF conforme en 10s depuis votre téléphone ou PC.</p>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-[#f0e6de] shadow-sm relative z-10">
               <div className="w-12 h-12 bg-[#a9825a] text-white font-black text-xl flex items-center justify-center rounded-2xl mx-auto mb-4">2</div>
               <h4 className="font-black text-lg mb-2">Le patient reçoit</h4>
               <p className="text-sm text-[#7a6a5f]">La facture est envoyée par email instantanément et proprement.</p>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-[#f0e6de] shadow-sm relative z-10">
               <div className="w-12 h-12 bg-yellow-500 text-white font-black text-xl flex items-center justify-center rounded-2xl mx-auto mb-4">3</div>
               <h4 className="font-black text-lg mb-2">Vous rayonnez</h4>
               <p className="text-sm text-[#7a6a5f]">FacturAvis l'invite automatiquement à laisser 5 étoiles sur Google Maps.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section id="fonctionnalites" className="py-24 bg-white px-6 border-y border-[#f0e6de] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#3e2f25] tracking-tighter text-center">Un cabinet 100% digital.</h2>
            <p className="text-[#7a6a5f] font-bold text-lg">Tout ce dont vous avez besoin pour vous concentrer sur le soin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Dossiers Patients */}
            <div className="group space-y-6">
              <div className="w-16 h-16 bg-[#fdf2e9] text-[#a9825a] rounded-[24px] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-black">Dossiers Patients</h3>
              <p className="text-[#7a6a5f] leading-relaxed font-medium">
                Historique des séances, coordonnées complètes et <span className="text-[#3e2f25] font-bold">notes thérapeutiques</span> avec sauvegarde automatique en temps réel.
              </p>
            </div>

            {/* Factures */}
            <div className="group space-y-6">
              <div className="w-16 h-16 bg-[#fdf2e9] text-[#a9825a] rounded-[24px] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <FilePlus size={32} />
              </div>
              <h3 className="text-2xl font-black">Facturation Express</h3>
              <p className="text-[#7a6a5f] leading-relaxed font-medium">
                Générez des reçus d'honoraires PDF conformes ou uploadez les vôtres. Envoyés par email instantanément et archivés.
              </p>
            </div>

            {/* Multi Lieux (REMPLACE AVIS GOOGLE ICI CAR DÉJÀ UNE GROSSE SECTION APRÈS) */}
            <div className="group space-y-6">
              <div className="w-16 h-16 bg-[#fdf2e9] text-[#a9825a] rounded-[24px] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Building2 size={32} />
              </div>
              <h3 className="text-2xl font-black">Multi-Cabinets</h3>
              <p className="text-[#7a6a5f] leading-relaxed font-medium">
                Vous travaillez dans plusieurs villes ? Gérez plusieurs lieux de consultation et liez une fiche Google Maps par cabinet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOCUS DOSSIER PATIENT --- */}
      <section id="dossiers" className="py-24 px-6 bg-[#fcfaf8] scroll-mt-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 order-2 lg:order-1">
             <div className="relative">
                <div className="absolute -inset-4 bg-[#a9825a]/10 rounded-[40px] blur-2xl"></div>
                <div className="relative bg-white border border-[#f0e6de] rounded-[32px] p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">CF</div>
                            <div>
                                <p className="font-black text-sm">Cyrille F.</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dossier Actif</p>
                            </div>
                        </div>
                        <div className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                            <CloudCheck size={10}/> ENREGISTRÉ
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 w-1/2 bg-gray-100 rounded-full"></div>
                        <div className="space-y-2">
                            <div className="h-3 w-full bg-gray-50 rounded-full"></div>
                            <div className="h-3 w-full bg-gray-50 rounded-full"></div>
                            <div className="h-3 w-3/4 bg-gray-50 rounded-full"></div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex gap-2">
                            <div className="h-8 w-24 bg-[#3e2f25] rounded-lg"></div>
                            <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
          <div className="flex-1 space-y-8 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-[#a9825a]/10 text-[#a9825a] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
              <Zap size={14} />
              <span>Zéro perte de données</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#3e2f25] leading-tight">
              Vos notes de séance, <br/>
              <span className="text-[#a9825a]">en toute sécurité.</span>
            </h2>
            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="mt-1 bg-white p-2 rounded-xl shadow-sm border border-[#f0e6de] text-[#a9825a] shrink-0"><ClipboardList size={20}/></div>
                    <div>
                        <p className="font-black text-lg text-[#3e2f25]">Auto-Sauvegarde intelligente</p>
                        <p className="text-[#7a6a5f] font-medium">Plus besoin de cliquer sur "Enregistrer". Chaque mot que vous tapez est sécurisé instantanément.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="mt-1 bg-white p-2 rounded-xl shadow-sm border border-[#f0e6de] text-[#a9825a] shrink-0"><History size={20}/></div>
                    <div>
                        <p className="font-black text-lg text-[#3e2f25]">Historique des paiements</p>
                        <p className="text-[#7a6a5f] font-medium">Consultez d'un coup d'oeil le montant total investi par votre patient et ses avis laissés.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="mt-1 bg-white p-2 rounded-xl shadow-sm border border-[#f0e6de] text-[#a9825a] shrink-0"><ShieldCheck size={20}/></div>
                    <div>
                        <p className="font-black text-lg text-[#3e2f25]">Confidentialité Absolue</p>
                        <p className="text-[#7a6a5f] font-medium">Vos dossiers sont stockés sur une base de données sécurisée, accessibles uniquement par vous.</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- AVIS GOOGLE SECTION --- */}
      <section id="avis" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="bg-gradient-to-br from-[#4a3a2f] to-[#3e2f25] rounded-[40px] p-10 md:p-20 text-white flex flex-col md:flex-row items-center gap-16 overflow-hidden relative shadow-2xl">
          <div className="flex-1 space-y-8 text-center md:text-left relative z-10">
            <div className="flex justify-center md:justify-start gap-1 text-yellow-400">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} fill="currentColor" size={24} />)}
            </div>
            <h2 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tighter">
              Battez vos concurrents sur <span className="text-[#a9825a]">Google Maps</span>.
            </h2>
            <p className="text-[#d4c9c0] text-xl font-medium leading-relaxed">
              Un flux régulier d'avis positifs booste votre référencement local. Plus besoin de demander, FacturAvis s'occupe de transformer vos patients satisfaits en ambassadeurs.
            </p>
          </div>
          <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 w-full relative z-10 shadow-inner">
             <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
               <div className="w-12 h-12 rounded-2xl bg-[#a9825a] flex items-center justify-center font-black text-white shadow-lg">M</div>
               <div>
                 <p className="font-black text-lg text-white">Marc A.</p>
                 <p className="text-xs text-[#a9825a] font-black uppercase tracking-widest">Kinésithérapeute</p>
               </div>
               <div className="ml-auto flex text-yellow-400 gap-1"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
             </div>
             <p className="text-lg italic text-[#d4c9c0] leading-relaxed font-medium">
               "Indispensable. J'ai doublé mon nombre d'avis en deux mois. Mon cabinet est désormais n°1 dans ma ville, de nouveaux patients m'appellent tous les jours."
             </p>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION (NOUVEAU) --- */}
      <section className="py-24 bg-white border-t border-[#f0e6de]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center text-[#3e2f25] mb-12 tracking-tight">Questions Fréquentes</h2>
          <div className="space-y-6">
            <div className="p-6 bg-[#fcfaf8] rounded-2xl border border-[#f0e6de]">
              <h3 className="font-black text-lg mb-2">Est-ce que FacturAvis remplace Doctolib ?</h3>
              <p className="text-[#7a6a5f] text-sm leading-relaxed">Non, FacturAvis ne gère pas la prise de rendez-vous en ligne. C'est un outil pensé pour l'après-séance (Facturation, Suivi patient, Comptabilité et Réputation Google).</p>
            </div>
            <div className="p-6 bg-[#fcfaf8] rounded-2xl border border-[#f0e6de]">
              <h3 className="font-black text-lg mb-2">Mes données sont-elles sécurisées ?</h3>
              <p className="text-[#7a6a5f] text-sm leading-relaxed">Absolument. Vos données et celles de vos patients sont chiffrées et hébergées sur des serveurs sécurisés en Europe. Seul vous avez accès à votre espace professionnel.</p>
            </div>
            <div className="p-6 bg-[#fcfaf8] rounded-2xl border border-[#f0e6de]">
              <h3 className="font-black text-lg mb-2">Puis-je facturer si j'ai déjà un PDF ?</h3>
              <p className="text-[#7a6a5f] text-sm leading-relaxed">Oui ! Si vous générez vos factures avec un autre logiciel, vous pouvez simplement "uploader" le PDF dans FacturAvis. Nous nous chargeons de l'envoi par email et de la récolte d'avis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-32 text-center px-6">
        <h2 className="text-5xl font-black mb-6 text-[#3e2f25] tracking-tighter">Prêt à simplifier votre cabinet ?</h2>
        <p className="text-[#7a6a5f] text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          Rejoignez la communauté des praticiens libéraux qui ont choisi la sérénité administrative.
        </p>
        <Link
          href="/fondateur"
          className="inline-flex items-center justify-center bg-[#3e2f25] text-white px-12 py-6 rounded-[24px] font-black text-2xl hover:scale-105 transition shadow-2xl shadow-[#3e2f25]/30"
        >
          Devenir Membre Fondateur
        </Link>
        <footer className="mt-32 pt-8 border-t border-[#f0e6de] flex flex-col md:flex-row justify-between items-center gap-6 text-[#9ca3af] text-[10px] font-black uppercase tracking-widest">
          <p>© 2026 FacturAvis — Développé pour les praticiens modernes.</p>
          <div className="flex gap-8">
            <Link href="/login" className="hover:text-[#3e2f25]">Accès Praticien</Link>
            <a href="#" className="hover:text-[#3e2f25]">CGV & Mentions Légales</a>
          </div>
        </footer>
      </section>

    </div>
  );
}

// Composants icônes additionnels pour l'illustration
function CloudCheck({ size }: { size: number }) {
    return <Cloud size={size} className="fill-current" />
}

function History({ size }: { size: number }) {
    return <Clock size={size} />
}
