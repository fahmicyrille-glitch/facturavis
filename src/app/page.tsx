import React from 'react';
import { Metadata } from 'next';
import {
  CheckCircle2, Star, ShieldCheck, ArrowRight, FileCheck,
  TrendingUp, Clock, Cloud, Lock, Search, Euro, Mail, FilePlus,
  Users, ClipboardList, Zap, ShieldAlert, Building2
} from 'lucide-react';
import Link from 'next/link';

// --- 1. LE MOTEUR SEO (METADATA NEXT.JS) ---
export const metadata: Metadata = {
  title: 'FacturAvis | Le Logiciel de Facturation et Avis Google pour Thérapeutes',
  description: "Gérez vos dossiers patients, générez vos factures en 10s et récoltez automatiquement des avis Google 5 étoiles. L'outil tout-en-un des praticiens libéraux (Ostéopathes, Kinés, Psy...).",
  keywords: "logiciel thérapeute, facturation ostéopathe, gestion cabinet médical, logiciel kinésithérapeute, avis Google cabinet, logiciel patientèle, psychologue, praticien libéral",
  openGraph: {
    title: 'FacturAvis | Boostez votre cabinet libéral',
    description: "Le logiciel le plus simple pour gérer vos patients, vos factures et exploser votre visibilité sur Google Maps.",
    url: 'https://www.facturavis.fr', // Remplace par ton vrai nom de domaine
    siteName: 'FacturAvis',
    images: [
      {
        url: '/og-image.jpg', // À CRÉER : Une belle image 1200x630px dans ton dossier /public
        width: 1200,
        height: 630,
        alt: 'Dashboard de FacturAvis',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FacturAvis | Le Logiciel des Thérapeutes',
    description: "Dossiers, factures et avis automatisés. Simplifiez votre quotidien.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function LandingPage() {
  // --- 2. DONNÉES STRUCTURÉES (JSON-LD) POUR GOOGLE ---
  // Ce script invisible indique à Google exactement ce que tu vends
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FacturAvis",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Logiciel de gestion de cabinet, facturation et automatisation d'avis Google pour les thérapeutes et praticiens libéraux.",
    "offers": {
      "@type": "Offer",
      "price": "19.00",
      "priceCurrency": "EUR",
      "priceValidUntil": "2026-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "38"
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#3e2f25] font-sans selection:bg-[#a9825a] selection:text-white overflow-x-hidden">

      {/* Injection du JSON-LD dans le HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#f0e6de]">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <img src="/icon.png" alt="Logo FacturAvis" className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform" />
            <span className="text-lg md:text-xl font-black tracking-tighter text-[#3e2f25]">FacturAvis</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-[#7a6a5f]">
            <a href="#fonctionnalites" className="hover:text-[#a9825a] transition">Fonctionnalités</a>
            <a href="#dossiers" className="hover:text-[#a9825a] transition">Dossiers Patients</a>
            <a href="#avis" className="hover:text-[#a9825a] transition">Avis Google</a>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/login" className="hidden sm:block text-xs md:text-sm font-bold text-[#7a6a5f] hover:text-[#3e2f25] px-3 py-2 transition">
              Connexion
            </Link>
            <Link
              href="/fondateur"
              className="bg-[#3e2f25] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold hover:bg-black transition shadow-lg shadow-[#3e2f25]/20 hover:-translate-y-0.5"
            >
              Essai Gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-28 md:pt-40 pb-16 md:pb-24 px-4 overflow-hidden text-center">
        <div className="max-w-7xl mx-auto">

          <div className="inline-flex items-center gap-2 bg-[#fdf2e9] text-[#a9825a] px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black mb-6 md:mb-8 shadow-sm border border-[#f0e6de] uppercase tracking-widest animate-in slide-in-from-top-4 duration-700 fade-in">
            <Clock size={14} className="animate-pulse" />
            <span>Offre Membre Fondateur — -10€ à vie</span>
          </div>

          {/* SEO OPTI: H1 avec mots clés forts "cabinet" et "thérapeutes" */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 md:mb-8 leading-[1.1] text-[#3e2f25] animate-in slide-in-from-bottom-4 duration-1000 fade-in delay-100">
            Le logiciel des thérapeutes. <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]">Facturez</span> & rayonnez.
          </h1>

          {/* SEO OPTI: Paragraphe riche en mots clés sémantiques */}
          <p className="text-base sm:text-lg md:text-xl text-[#7a6a5f] max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed font-medium animate-in slide-in-from-bottom-4 duration-1000 fade-in delay-200 px-2">
            L'outil tout-en-un pour gérer votre cabinet libéral. <span className="text-[#3e2f25] font-bold md:text-lg border-b-2 border-[#d4b494]/30 pb-0.5">Dossiers patients sécurisés</span>, factures PDF conformes et récolte automatisée d'avis Google.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 animate-in zoom-in-95 duration-1000 fade-in delay-300">
            <Link
              href="/fondateur"
              className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-[#d4b494] to-[#a9825a] text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[20px] font-black text-base md:text-lg hover:from-[#c2a385] hover:to-[#8b6a48] transition transform hover:-translate-y-1 shadow-2xl shadow-[#a9825a]/30 group"
            >
              Démarrer mon essai gratuit
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center bg-white text-[#7a6a5f] border border-[#f0e6de] px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[20px] font-bold text-base md:text-lg hover:bg-gray-50 transition"
            >
              Déjà membre ?
            </Link>
          </div>

          {/* PREUVE SOCIALE */}
          <div className="mt-12 md:mt-16 flex flex-col items-center gap-3 animate-in fade-in duration-1000 delay-500">
            <div className="flex -space-x-3">
              {[11, 32, 45, 68, 25].map((i) => (
                <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#fcfaf8] bg-slate-200 overflow-hidden shadow-sm hover:-translate-y-1 transition-transform">
                  <img src={`https://i.pravatar.cc/100?img=${i}`} alt={`Praticien utilisateur de FacturAvis ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-[10px] md:text-xs font-bold text-[#7a6a5f] uppercase tracking-widest">
              Rejoignez plus de <span className="text-[#3e2f25]">150 thérapeutes</span> en France
            </p>
          </div>
        </div>
      </section>

      {/* --- COMMENT CA MARCHE --- */}
      <section className="py-12 md:py-20 bg-[#fdf2e9]/50 border-t border-[#f0e6de]">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* SEO OPTI: Remplacement d'un p par un h2 sémantique visuellement stylisé comme avant */}
          <h2 className="text-center text-xs md:text-sm font-black text-[#a9825a] uppercase tracking-widest mb-8 md:mb-12">Automatisez la croissance de votre cabinet de santé en 3 étapes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center relative">
             <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-[#d4b494]/30 -z-10"></div>

             <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#f0e6de] shadow-sm relative z-10 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 bg-[#3e2f25] text-white font-black text-xl flex items-center justify-center rounded-2xl mx-auto mb-5 shadow-lg shadow-[#3e2f25]/20">1</div>
               <h3 className="font-black text-lg md:text-xl mb-2">Vous facturez</h3>
               <p className="text-sm md:text-base text-[#7a6a5f]">Générez une facture ostéopathe ou kiné conforme en 10s depuis votre téléphone ou PC.</p>
             </div>

             <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#f0e6de] shadow-sm relative z-10 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 bg-gradient-to-br from-[#d4b494] to-[#a9825a] text-white font-black text-xl flex items-center justify-center rounded-2xl mx-auto mb-5 shadow-lg shadow-[#a9825a]/20">2</div>
               <h3 className="font-black text-lg md:text-xl mb-2">Le patient reçoit</h3>
               <p className="text-sm md:text-base text-[#7a6a5f]">La note d'honoraires est envoyée par email instantanément, prête pour sa mutuelle.</p>
             </div>

             <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#f0e6de] shadow-sm relative z-10 hover:shadow-md transition-shadow">
               <div className="w-12 h-12 bg-yellow-400 text-white font-black text-xl flex items-center justify-center rounded-2xl mx-auto mb-5 shadow-lg shadow-yellow-400/20">3</div>
               <h3 className="font-black text-lg md:text-xl mb-2">Vous rayonnez</h3>
               <p className="text-sm md:text-base text-[#7a6a5f]">FacturAvis l'invite automatiquement à laisser 5 étoiles sur la page Google de votre cabinet.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section id="fonctionnalites" className="py-16 md:py-24 bg-white px-4 md:px-6 border-y border-[#f0e6de] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-[#3e2f25] tracking-tighter text-center leading-tight">Un cabinet 100% digital.</h2>
            <p className="text-[#7a6a5f] font-bold text-base md:text-lg">Le logiciel de gestion de cabinet pensé pour le soin avant tout.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="group space-y-4 md:space-y-6 p-6 rounded-3xl border border-transparent hover:border-[#f0e6de] hover:bg-[#fcfaf8] transition-all">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#fdf2e9] text-[#a9825a] rounded-2xl md:rounded-[24px] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Users size={28} className="md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-[#3e2f25]">Dossiers Patients</h3>
              <p className="text-sm md:text-base text-[#7a6a5f] leading-relaxed font-medium">
                Historique des consultations, coordonnées et <span className="text-[#3e2f25] font-bold">notes thérapeutiques</span> avec sauvegarde automatique en temps réel.
              </p>
            </div>

            <div className="group space-y-4 md:space-y-6 p-6 rounded-3xl border border-transparent hover:border-[#f0e6de] hover:bg-[#fcfaf8] transition-all">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#fdf2e9] text-[#a9825a] rounded-2xl md:rounded-[24px] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <FilePlus size={28} className="md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-[#3e2f25]">Facturation Express</h3>
              <p className="text-sm md:text-base text-[#7a6a5f] leading-relaxed font-medium">
                Générez des reçus d'honoraires PDF conformes. Envoyés par email et classés pour votre comptabilité praticien.
              </p>
            </div>

            <div className="group space-y-4 md:space-y-6 p-6 rounded-3xl border border-transparent hover:border-[#f0e6de] hover:bg-[#fcfaf8] transition-all">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#fdf2e9] text-[#a9825a] rounded-2xl md:rounded-[24px] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Building2 size={28} className="md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-[#3e2f25]">Multi-Cabinets</h3>
              <p className="text-sm md:text-base text-[#7a6a5f] leading-relaxed font-medium">
                Vous exercez dans plusieurs villes ? Gérez vos différents lieux de consultation et reliez chaque facture à sa fiche Google Maps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOCUS DOSSIER PATIENT --- */}
      <section id="dossiers" className="py-16 md:py-24 px-4 md:px-6 bg-[#fcfaf8] scroll-mt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          <div className="flex-1 w-full order-2 lg:order-1">
             <div className="relative max-w-md mx-auto lg:max-w-none">
                <div className="absolute -inset-2 md:-inset-4 bg-[#a9825a]/10 rounded-[40px] blur-2xl"></div>
                <div className="relative bg-white border border-[#f0e6de] rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">CF</div>
                            <div>
                                <p className="font-black text-sm text-[#3e2f25]">Cyrille F.</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dossier Actif</p>
                            </div>
                        </div>
                        <div className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 w-fit">
                            <CloudCheck size={12}/> ENREGISTRÉ
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 w-2/3 md:w-1/2 bg-gray-100 rounded-full"></div>
                        <div className="space-y-2.5">
                            <div className="h-3 w-full bg-gray-50 rounded-full"></div>
                            <div className="h-3 w-full bg-gray-50 rounded-full"></div>
                            <div className="h-3 w-4/5 bg-gray-50 rounded-full"></div>
                        </div>
                        <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-2">
                            <div className="h-8 w-20 md:w-24 bg-[#3e2f25] rounded-lg"></div>
                            <div className="h-8 w-20 md:w-24 bg-gray-100 rounded-lg"></div>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          <div className="flex-1 space-y-6 md:space-y-8 order-1 lg:order-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#a9825a]/10 text-[#a9825a] px-3 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest">
              <Zap size={14} />
              <span>Zéro perte de données</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#3e2f25] leading-tight">
              Vos notes de séance, <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]">en toute sécurité.</span>
            </h2>
            <div className="space-y-6 text-left">
                <div className="flex gap-3 md:gap-4 group">
                    <div className="mt-1 bg-white p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-sm border border-[#f0e6de] text-[#a9825a] shrink-0 group-hover:scale-110 transition-transform"><ClipboardList size={20} className="md:w-6 md:h-6"/></div>
                    <div>
                        <h3 className="font-black text-base md:text-lg text-[#3e2f25] mb-1">Auto-Sauvegarde intelligente</h3>
                        <p className="text-sm md:text-base text-[#7a6a5f] font-medium">Plus besoin de cliquer sur "Enregistrer". Chaque mot que vous tapez dans le dossier médical est sécurisé instantanément.</p>
                    </div>
                </div>
                <div className="flex gap-3 md:gap-4 group">
                    <div className="mt-1 bg-white p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-sm border border-[#f0e6de] text-[#a9825a] shrink-0 group-hover:scale-110 transition-transform"><History size={20} className="md:w-6 md:h-6"/></div>
                    <div>
                        <h3 className="font-black text-base md:text-lg text-[#3e2f25] mb-1">Historique de facturation</h3>
                        <p className="text-sm md:text-base text-[#7a6a5f] font-medium">Consultez d'un coup d'oeil le CA généré par votre patient et ses avis laissés sur votre cabinet.</p>
                    </div>
                </div>
                <div className="flex gap-3 md:gap-4 group">
                    <div className="mt-1 bg-white p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-sm border border-[#f0e6de] text-[#a9825a] shrink-0 group-hover:scale-110 transition-transform"><ShieldCheck size={20} className="md:w-6 md:h-6"/></div>
                    <div>
                        <h3 className="font-black text-base md:text-lg text-[#3e2f25] mb-1">Confidentialité Absolue</h3>
                        <p className="text-sm md:text-base text-[#7a6a5f] font-medium">Vos dossiers sont stockés sur une base de données sécurisée hébergée en France, respectant le RGPD.</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- AVIS GOOGLE SECTION --- */}
      <section id="avis" className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="bg-gradient-to-br from-[#4a3a2f] to-[#3e2f25] rounded-[32px] md:rounded-[40px] p-6 sm:p-10 md:p-20 text-white flex flex-col lg:flex-row items-center gap-10 md:gap-16 overflow-hidden relative shadow-2xl">

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left relative z-10">
            <div className="flex justify-center lg:justify-start gap-1 text-yellow-400">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} fill="currentColor" size={24} className="md:w-7 md:h-7" />)}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black leading-[1.1] tracking-tighter">
              Battez vos concurrents sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">Google Maps</span>.
            </h2>
            <p className="text-[#d4c9c0] text-base md:text-xl font-medium leading-relaxed">
              Un flux régulier d'avis positifs booste le référencement local de votre cabinet. Plus besoin de quémander, FacturAvis s'occupe de transformer vos patients satisfaits en ambassadeurs.
            </p>
          </div>

          <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-[24px] md:rounded-[32px] p-6 md:p-10 border border-white/10 w-full relative z-10 shadow-inner">
             <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 border-b border-white/10 pb-4 md:pb-6">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#d4b494] to-[#a9825a] flex items-center justify-center font-black text-white shadow-lg shrink-0">M</div>
               <div className="flex-1 min-w-0">
                 <p className="font-black text-base md:text-lg text-white truncate">Marc A.</p>
                 <p className="text-[10px] md:text-xs text-[#d4b494] font-black uppercase tracking-widest truncate">Ostéopathe D.O.</p>
               </div>
               <div className="flex text-yellow-400 gap-0.5 shrink-0"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
             </div>
             <p className="text-base md:text-xl italic text-[#d4c9c0] leading-relaxed font-medium">
               "Indispensable. J'ai doublé mon nombre d'avis en deux mois. Mon cabinet est désormais n°1 dans ma ville sur Google, de nouveaux patients m'appellent tous les jours."
             </p>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-16 md:py-24 bg-white border-t border-[#f0e6de] px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-[#3e2f25] mb-10 md:mb-16 tracking-tight">Questions Fréquentes</h2>
          <div className="space-y-4 md:space-y-6">
            <div className="p-5 md:p-8 bg-[#fcfaf8] rounded-2xl md:rounded-[24px] border border-[#f0e6de] hover:shadow-md transition-shadow">
              <h3 className="font-black text-base md:text-lg mb-2 text-[#3e2f25]">Est-ce que FacturAvis remplace Doctolib ?</h3>
              <p className="text-[#7a6a5f] text-sm md:text-base leading-relaxed font-medium">Non, FacturAvis ne gère pas l'agenda. C'est un logiciel complémentaire pensé pour la fin de consultation : gestion du dossier patient, édition de la note d'honoraires, comptabilité et réputation Google.</p>
            </div>
            <div className="p-5 md:p-8 bg-[#fcfaf8] rounded-2xl md:rounded-[24px] border border-[#f0e6de] hover:shadow-md transition-shadow">
              <h3 className="font-black text-base md:text-lg mb-2 text-[#3e2f25]">Mes données médicales sont-elles sécurisées ?</h3>
              <p className="text-[#7a6a5f] text-sm md:text-base leading-relaxed font-medium">Absolument. Vos données et celles de votre patientèle sont chiffrées (AES-256) et hébergées sur des serveurs sécurisés en Europe. Vous seul y avez accès.</p>
            </div>
            <div className="p-5 md:p-8 bg-[#fcfaf8] rounded-2xl md:rounded-[24px] border border-[#f0e6de] hover:shadow-md transition-shadow">
              <h3 className="font-black text-base md:text-lg mb-2 text-[#3e2f25]">Puis-je facturer si j'ai déjà un PDF ?</h3>
              <p className="text-[#7a6a5f] text-sm md:text-base leading-relaxed font-medium">Oui ! Si vous générez vos factures avec un logiciel de facturation tiers, vous pouvez simplement uploader le PDF. Nous nous chargeons de l'envoi au patient et de la récolte d'avis Maps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-20 md:py-32 text-center px-4 md:px-6">
        <h2 className="text-4xl md:text-6xl font-black mb-6 text-[#3e2f25] tracking-tighter leading-tight">Prêt à simplifier <br className="hidden sm:block"/>votre cabinet ?</h2>
        <p className="text-[#7a6a5f] text-base md:text-xl mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium px-2">
          Rejoignez la communauté des praticiens de santé qui ont choisi la sérénité administrative.
        </p>
        <Link
          href="/fondateur"
          className="inline-flex items-center justify-center bg-gradient-to-r from-[#3e2f25] to-[#2a1f18] text-white px-8 md:px-12 py-5 md:py-6 rounded-[20px] md:rounded-[24px] font-black text-xl md:text-2xl hover:scale-105 transition-transform shadow-2xl shadow-[#3e2f25]/30 group"
        >
          Devenir Membre Fondateur
          <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={24}/>
        </Link>

        <footer className="mt-20 md:mt-32 pt-8 border-t border-[#f0e6de] flex flex-col md:flex-row justify-between items-center gap-6 text-[#9ca3af] text-[10px] font-black uppercase tracking-widest max-w-7xl mx-auto">
          <p>© 2026 FacturAvis — Le logiciel des praticiens modernes.</p>
          <div className="flex gap-6 md:gap-8">
            <Link href="/login" className="hover:text-[#3e2f25] transition-colors">Accès Praticien</Link>
            <a href="#" className="hover:text-[#3e2f25] transition-colors">CGV & Mentions Légales</a>
          </div>
        </footer>
      </section>

    </div>
  );
}

// Composants icônes additionnels pour l'illustration
function CloudCheck({ size }: { size: number }) {
  return <Cloud size={size} className="fill-current text-green-600" />
}

function History({ size, className }: { size: number, className?: string }) {
  return <Clock size={size} className={className} />
}
