'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Star, ShieldCheck, ArrowRight, FileCheck,
  Clock, Cloud, Lock, Euro, Mail, FilePlus,
  Users, ClipboardList, Zap, Building2, MessageSquare,
  Send, AlertCircle, FileBadge, Sparkles, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  // --- ÉTATS DU FORMULAIRE DE CONTACT ---
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        setIsSent(true);
        setContactForm({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setIsSent(false), 5000);
      } else {
        let errorMsg = "Oups, une erreur est survenue lors de l'envoi.";
        try {
            const data = await response.json();
            if(data.error) errorMsg = data.error;
        } catch(e) {}
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      setErrorMessage("Impossible de joindre le serveur. Vérifiez votre connexion internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DONNÉES STRUCTURÉES (JSON-LD) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FacturAvis",
    "applicationCategory": "HealthBusinessApplication",
    "operatingSystem": "Web",
    "description": "Logiciel de gestion de cabinet, facturation et automatisation d'avis Google pour les Ostéopathes, Chiropracteurs, Psychologues, Psychothérapeutes, Diététiciens, Kinésiologues et tous les praticiens libéraux.",
    "offers": {
      "@type": "Offer",
      "price": "19.00",
      "priceCurrency": "EUR",
      "priceValidUntil": "2026-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "158"
    }
  };

  const praticiens = [
    "Ostéopathes", "Psychologues", "Chiropracteurs", "Psychothérapeutes",
    "Diététiciens", "Kinésiologues", "Naturopathes", "Sophrologues",
    "Hypnothérapeutes", "Réflexologues", "Pédicures-Podologues"
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#3e2f25] font-sans selection:bg-[#a9825a] selection:text-white overflow-x-hidden scroll-smooth">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#f0e6de]">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#d4b494] to-[#a9825a] rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
              <img src="/logo/logo.png" alt="Logo FacturAvis" className="relative w-8 h-8 md:w-10 md:h-10 object-contain rounded-xl shadow-sm" />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter text-[#3e2f25]">FacturAvis</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-[#7a6a5f]">
            <a href="#fonctionnalites" className="hover:text-[#a9825a] transition">Fonctionnalités</a>
            <a href="#reforme" className="flex items-center gap-1 text-orange-600 hover:text-orange-700 transition"><AlertCircle size={14}/> Réforme 2026</a>
            <a href="#avis" className="hover:text-[#a9825a] transition">Avis Google</a>
            <a href="#contact" className="hover:text-[#a9825a] transition">Contact</a>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/login" className="hidden sm:block text-xs md:text-sm font-bold text-[#7a6a5f] hover:text-[#3e2f25] px-3 py-2 transition">
              Connexion
            </Link>
            <Link href="/fondateur" className="relative group overflow-hidden bg-[#3e2f25] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold shadow-lg shadow-[#3e2f25]/20 hover:shadow-xl transition-all hover:-translate-y-0.5">
              <span className="relative z-10">Essai Gratuit</span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION MAX CONVERSION --- */}
      <section className="relative pt-32 md:pt-44 pb-16 md:pb-24 px-4 overflow-hidden text-center">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#fdf2e9] to-transparent rounded-full blur-3xl -z-10"></div>

        <div className={`max-w-7xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

          <div className="inline-flex items-center gap-2 bg-[#fdf2e9] text-[#a9825a] px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black mb-6 md:mb-8 shadow-sm border border-[#f0e6de] uppercase tracking-widest animate-float">
            <Clock size={14} className="animate-pulse" />
            <span>Offre Membre Fondateur — -10€ à vie</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1] text-[#3e2f25]">
            Remplissez votre agenda. <br className="hidden sm:block"/>
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]">Oubliez la paperasse.</span>
              <div className="absolute bottom-1 left-0 w-full h-3 md:h-5 bg-[#d4b494]/20 -z-10 -rotate-1"></div>
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#7a6a5f] max-w-3xl mx-auto mb-10 leading-relaxed font-medium px-2">
            <span className="text-[#3e2f25] font-bold">Ostéopathes, Psychologues, Chiropracteurs, Diététiciens...</span> L'outil tout-en-un pour gérer votre cabinet. Dossiers sécurisés, factures conformes Factur-X 2026 et récolte automatisée d'avis Google.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 relative z-20">
            <Link href="/fondateur" className="w-full sm:w-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#d4b494] to-[#a9825a] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <button className="relative w-full sm:w-auto flex items-center justify-center bg-[#3e2f25] text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-base md:text-lg hover:scale-[1.02] transition transform">
                Démarrer mon essai sans CB
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </Link>
          </div>

          {/* --- BANDEAU DÉFILANT --- */}
          <div className="mt-20 overflow-hidden relative group">
            <div className="flex gap-6 md:gap-8 animate-marquee whitespace-nowrap">
              {[...praticiens, ...praticiens].map((p, i) => (
                <span key={i} className="text-[#d4b494] font-black uppercase tracking-widest text-[10px] md:text-xs border border-[#f0e6de] px-5 py-2.5 rounded-full bg-white shadow-sm cursor-default hover:border-[#a9825a] transition-colors">
                  {p}
                </span>
              ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#fcfaf8] to-transparent pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#fcfaf8] to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* --- COMMENT CA MARCHE --- */}
      <section className="py-12 md:py-20 bg-[#fdf2e9]/50 border-t border-[#f0e6de]">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-center text-xs md:text-sm font-black text-[#a9825a] uppercase tracking-widest mb-8 md:mb-12">
            Automatisez la croissance de votre cabinet de santé en 3 étapes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center relative">
             <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-[#d4b494]/30 -z-10"></div>

             <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#f0e6de] shadow-sm relative z-10 hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
               <div className="w-12 h-12 bg-[#3e2f25] text-white font-black text-xl flex items-center justify-center rounded-2xl mx-auto mb-5 shadow-lg shadow-[#3e2f25]/20">1</div>
               <h3 className="font-black text-lg md:text-xl mb-2">Vous facturez</h3>
               <p className="text-sm md:text-base text-[#7a6a5f]">Générez une facture conforme en 10s depuis votre téléphone ou PC, <span className="font-bold text-[#3e2f25]">propre à votre profession</span>.</p>
             </div>

             <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#f0e6de] shadow-sm relative z-10 hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
               <div className="w-12 h-12 bg-gradient-to-br from-[#d4b494] to-[#a9825a] text-white font-black text-xl flex items-center justify-center rounded-2xl mx-auto mb-5 shadow-lg shadow-[#a9825a]/20">2</div>
               <h3 className="font-black text-lg md:text-xl mb-2">Le patient reçoit</h3>
               <p className="text-sm md:text-base text-[#7a6a5f]">La note d'honoraires est envoyée par email instantanément, prête pour sa mutuelle.</p>
             </div>

             <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#f0e6de] shadow-sm relative z-10 hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
               <div className="w-12 h-12 bg-yellow-400 text-white font-black text-xl flex items-center justify-center rounded-2xl mx-auto mb-5 shadow-lg shadow-yellow-400/20">3</div>
               <h3 className="font-black text-lg md:text-xl mb-2">Vous rayonnez</h3>
               <p className="text-sm md:text-base text-[#7a6a5f]">FacturAvis l'invite automatiquement à laisser 5 étoiles sur la page Google de votre cabinet.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- REFORME 2026 --- */}
      <section id="reforme" className="py-16 md:py-24 bg-white border-y border-[#f0e6de] px-4 md:px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-red-100">
              <ShieldAlert size={14} /> Loi de Finances
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#3e2f25] leading-tight">
              La fin du PDF simple <br/>
              <span className="text-red-500">est actée pour 2026.</span>
            </h2>
            <p className="text-[#7a6a5f] text-lg font-medium leading-relaxed">
              La réforme de la facturation électronique oblige tous les professionnels libéraux à émettre et recevoir des factures au format structuré (Factur-X).
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20}/>
                <p className="text-[#3e2f25] font-bold">Générateur XML Intégré : <span className="font-medium text-[#7a6a5f]">Vos factures sont déjà compatibles à 100% avec les logiciels de vos comptables.</span></p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20}/>
                <p className="text-[#3e2f25] font-bold">Collaborations & B2B : <span className="font-medium text-[#7a6a5f]">Rétrocessions et interventions en entreprises légales et certifiées.</span></p>
              </li>
            </ul>
          </div>
          <div className="flex-1 relative w-full">
             <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 transform rotate-3 rounded-3xl -z-10"></div>
             <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                   <div className="flex items-center gap-2 text-gray-800 font-black"><FileCheck className="text-blue-600"/> Validation Fiscale</div>
                   <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded uppercase">Conforme</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-gray-500 bg-gray-900 p-4 rounded-xl overflow-hidden relative">
                   <div className="text-green-400">&lt;?xml version="1.0" encoding="UTF-8"?&gt;</div>
                   <div className="text-blue-300">&lt;rsm:CrossIndustryInvoice&gt;</div>
                   <div className="pl-4 text-gray-400">...</div>
                   <div className="pl-4 text-yellow-300">&lt;ram:ID&gt;urn:factur-x.eu:1p0:minimum&lt;/ram:ID&gt;</div>
                   <div className="pl-4 text-gray-400">...</div>
                   <div className="text-blue-300">&lt;/rsm:CrossIndustryInvoice&gt;</div>
                   <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>
                <p className="text-center text-sm font-bold text-gray-800 mt-4">Le code invisible qui ravit votre expert-comptable.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section id="fonctionnalites" className="py-16 md:py-24 bg-[#fcfaf8] px-4 md:px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-[#3e2f25] tracking-tighter leading-tight">Un outil métier, pour votre métier.</h2>
            <p className="text-[#7a6a5f] font-bold text-base md:text-lg">6 outils en 1 pour vous faire gagner 5 heures par semaine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Users, title: "Dossiers Auto-Save", desc: "Historique et notes thérapeutiques sauvegardées à chaque frappe. Ne perdez plus jamais une observation." },
              { icon: FilePlus, title: "Facturation Express", desc: "Générez des reçus d'honoraires conformes. Envoyés par email et classés pour votre comptabilité." },
              { icon: Star, title: "Machine à Avis", desc: "Le patient télécharge sa facture pour sa mutuelle = invitation automatique à laisser un avis 5 étoiles." },
              { icon: ShieldCheck, title: "Sécurité & Normes", desc: "Hébergement européen sécurisé et factures embarquant le XML exigé pour la réforme Factur-X." },
              { icon: Cloud, title: "Export Comptable", desc: "Finies les soirées à trier des papiers. Un clic et votre comptable reçoit tout au format parfait." },
              { icon: Building2, title: "Multi-Cabinets", desc: "Plusieurs lieux ? Associez chaque facture au bon numéro SIRET et à la bonne page Google Maps." }
            ].map((feat, i) => (
              <div key={i} className="bg-white p-6 md:p-8 rounded-3xl border border-[#f0e6de] hover:border-[#a9825a] hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                <div className="w-14 h-14 bg-[#fdf2e9] text-[#a9825a] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <feat.icon size={26} />
                </div>
                <h3 className="text-xl font-black text-[#3e2f25] mb-3">{feat.title}</h3>
                <p className="text-[#7a6a5f] font-medium leading-relaxed text-sm md:text-base">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- AVIS GOOGLE SECTION --- */}
      <section id="avis" className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="bg-gradient-to-br from-[#3e2f25] to-black rounded-[32px] md:rounded-[40px] p-6 sm:p-10 md:p-20 text-white flex flex-col lg:flex-row items-center gap-10 md:gap-16 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#a9825a]/20 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left relative z-10">
            <div className="flex justify-center lg:justify-start gap-1 text-yellow-400 animate-pulse">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} fill="currentColor" size={24} className="md:w-7 md:h-7" />)}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black leading-[1.1] tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">Surpassez la concurrence</span> <br/> sur Google Maps.
            </h2>
            <p className="text-gray-300 text-base md:text-xl font-medium leading-relaxed">
              Un flux régulier d'avis positifs booste le référencement local de votre cabinet. FacturAvis utilise le moment où le patient télécharge sa facture pour lui demander gentiment. Résultat : <strong className="text-white">+300% d'avis en moyenne.</strong>
            </p>
          </div>

          <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-[24px] md:rounded-[32px] p-6 md:p-10 border border-white/10 w-full relative z-10 shadow-inner hover:bg-white/10 transition duration-500">
             <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 border-b border-white/10 pb-4 md:pb-6">
               <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#d4b494] to-[#a9825a] flex items-center justify-center font-black text-white shadow-lg shrink-0 text-xl">N</div>
               <div className="flex-1 min-w-0">
                 <p className="font-black text-base md:text-xl text-white truncate">Dr. Nicolas I.</p>
                 <p className="text-[10px] md:text-xs text-[#d4b494] font-black uppercase tracking-widest truncate">Ostéopathe D.O.</p>
               </div>
             </div>
             <p className="text-base md:text-xl italic text-gray-200 leading-relaxed font-medium">
               "C'est un outil incroyable. Mes patients laissent enfin des avis d'eux-mêmes ! J'en ai eu 45 le mois dernier. Avec les nouveaux patients que ça m'attire, le logiciel se paie tout seul."
             </p>
          </div>
        </div>
      </section>

      {/* --- CUSTOM / SUR-MESURE SECTION (LE FORMULAIRE COMPLET) --- */}
      <section id="contact" className="py-16 md:py-20 bg-white border-t border-[#f0e6de] px-4 md:px-6 scroll-mt-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[#f0e6de] to-transparent"></div>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-[#fdf2e9] text-[#a9825a] rounded-full mb-6 shadow-sm border border-[#f0e6de]">
            <MessageSquare size={24} className="md:w-8 md:h-8" />
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-[#3e2f25] mb-4">
            Un besoin spécifique pour votre cabinet ?
          </h2>
          <p className="text-[#7a6a5f] text-base md:text-lg font-medium mb-8 max-w-2xl mx-auto">
            Nous développons FacturAvis pour qu'il s'adapte à <span className="font-bold text-[#3e2f25]">votre</span> réalité terrain. Si vous avez une demande particulière, notre équipe est à votre écoute.
          </p>

          <form onSubmit={handleContactSubmit} className="max-w-md mx-auto bg-[#fcfaf8] p-6 md:p-8 rounded-[32px] border border-[#f0e6de] shadow-xl text-left space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-black text-[#3e2f25] uppercase tracking-widest mb-2">Nom complet</label>
              <input
                id="name" required type="text" placeholder="Dr. Dupont" value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 bg-white text-[#3e2f25] placeholder-gray-400 transition-all font-medium"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-black text-[#3e2f25] uppercase tracking-widest mb-2">Email professionnel</label>
              <input
                id="email" required type="email" placeholder="cabinet@email.com" value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 bg-white text-[#3e2f25] placeholder-gray-400 transition-all font-medium"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-black text-[#3e2f25] uppercase tracking-widest mb-2">Téléphone (optionnel)</label>
              <input
                id="phone" type="tel" placeholder="06 12 34 56 78" value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 bg-white text-[#3e2f25] placeholder-gray-400 transition-all font-medium"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-black text-[#3e2f25] uppercase tracking-widest mb-2">Votre besoin</label>
              <textarea
                id="message" required rows={4} placeholder="Décrivez votre besoin spécifique..." value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 bg-white text-[#3e2f25] placeholder-gray-400 resize-none transition-all font-medium"
              />
            </div>

             {errorMessage && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            {isSent && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.</p>
              </div>
            )}

            <button
              type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#a9825a] hover:bg-[#8b6a48] text-white font-black px-6 py-4 rounded-2xl transition-all disabled:opacity-70 group shadow-lg shadow-[#a9825a]/30"
            >
              {isSubmitting ? (
                <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Envoyer ma demande
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-16 md:py-24 bg-[#fcfaf8] border-t border-[#f0e6de] px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-[#3e2f25] mb-10 md:mb-16 tracking-tight">Questions Fréquentes</h2>
          <div className="space-y-4 md:space-y-6">
            <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-[24px] border border-[#f0e6de] hover:shadow-md transition-shadow">
              <h3 className="font-black text-base md:text-lg mb-2 text-[#3e2f25]">Est-ce que FacturAvis remplace Doctolib ?</h3>
              <p className="text-[#7a6a5f] text-sm md:text-base leading-relaxed font-medium">Non, c'est complémentaire. Doctolib gère l'agenda, FacturAvis gère tout ce qui se passe APRÈS la séance : dossier patient, édition de la facture conforme, comptabilité et réputation Google.</p>
            </div>
            <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-[24px] border border-[#f0e6de] hover:shadow-md transition-shadow">
              <h3 className="font-black text-base md:text-lg mb-2 text-[#3e2f25]">Est-ce adapté à ma spécialité ?</h3>
              <p className="text-[#7a6a5f] text-sm md:text-base leading-relaxed font-medium">Absolument. Que vous soyez ostéopathe, chiropracteur, psychologue ou diététicien, les factures générées respectent les mentions légales propres à votre activité pour un remboursement mutuelle parfait.</p>
            </div>
            <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-[24px] border border-[#f0e6de] hover:shadow-md transition-shadow">
              <h3 className="font-black text-base md:text-lg mb-2 text-[#3e2f25]">Puis-je facturer si j'ai déjà un PDF ?</h3>
              <p className="text-[#7a6a5f] text-sm md:text-base leading-relaxed font-medium">Oui ! Si vous générez vos factures avec un autre logiciel, uploadez simplement le PDF sur FacturAvis. Nous nous chargeons de l'envoi au patient et de la récolte d'avis Maps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA MAX CONVERSION --- */}
      <section className="py-20 md:py-32 text-center px-4 md:px-6 bg-[#3e2f25] text-white">
        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">Votre temps est précieux.</h2>
        <p className="text-gray-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
          Déléguez la paperasse, sécurisez vos données et devenez le praticien le plus recommandé de votre ville.
        </p>
        <Link href="/fondateur" className="relative inline-flex group">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-[#a9825a] rounded-[24px] blur opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
          <button className="relative bg-white text-[#3e2f25] px-10 md:px-14 py-5 md:py-6 rounded-[24px] font-black text-xl md:text-2xl hover:scale-105 transition-transform flex items-center gap-3">
            <Sparkles size={24} className="text-[#a9825a]"/>
            Tester Gratuitement
          </button>
        </Link>

        <footer className="mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-[10px] font-black uppercase tracking-widest max-w-7xl mx-auto">
          <p>© 2026 FacturAvis — Logiciel certifié Factur-X.</p>
          <div className="flex gap-8">
            <Link href="/login" className="hover:text-white transition-colors">Accès Praticien</Link>
            <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
          </div>
        </footer>
      </section>

      {/* CSS POUR ANIMATIONS */}
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
}
