'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const praticiens = [
  "Ostéopathes", "Psychologues", "Chiropracteurs", "Psychothérapeutes",
  "Diététiciens", "Kinésiologues", "Naturopathes", "Sophrologues",
  "Hypnothérapeutes", "Réflexologues", "Pédicures-Podologues"
];

export default function HeroAnimations() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative pt-32 md:pt-44 pb-16 md:pb-24 px-4 overflow-hidden text-center">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#fdf2e9] to-transparent rounded-full blur-3xl -z-10"></div>

      <div className={`max-w-7xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

        <div className="inline-flex items-center gap-2 bg-[#fdf2e9] text-[#a9825a] px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black mb-6 md:mb-8 shadow-sm border border-[#f0e6de] uppercase tracking-widest animate-float">
          <Clock size={14} className="animate-pulse" />
          <span>Offre Membre Fondateur &mdash; -10&euro; &agrave; vie</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1] text-[#3e2f25]">
          Remplissez votre agenda. <br className="hidden sm:block"/>
          <span className="relative inline-block mt-2">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]">Oubliez la paperasse.</span>
            <div className="absolute bottom-1 left-0 w-full h-3 md:h-5 bg-[#d4b494]/20 -z-10 -rotate-1"></div>
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-[#7a6a5f] max-w-3xl mx-auto mb-10 leading-relaxed font-medium px-2">
          <span className="text-[#3e2f25] font-bold">Ost&eacute;opathes, Psychologues, Chiropracteurs, Di&eacute;t&eacute;ticiens...</span> L&apos;outil tout-en-un pour g&eacute;rer votre cabinet. Dossiers s&eacute;curis&eacute;s, factures conformes Factur-X 2026 et r&eacute;colte automatis&eacute;e d&apos;avis Google.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 relative z-20 mb-16 md:mb-24">
          <Link href="/inscription" className="w-full sm:w-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4b494] to-[#a9825a] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <button className="relative w-full sm:w-auto flex items-center justify-center bg-[#3e2f25] text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-base md:text-lg hover:scale-[1.02] transition transform">
              Réception gratuite — S'inscrire
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </Link>
        </div>

        {/* --- DASHBOARD IMAGE --- */}
        <div className="relative max-w-5xl mx-auto px-4 group">
          <div className="absolute -inset-1 bg-gradient-to-b from-[#d4b494]/30 to-transparent rounded-2xl md:rounded-[2rem] blur-xl -z-10 opacity-70 group-hover:opacity-100 transition duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf8] via-transparent to-transparent z-10 h-full w-full pointer-events-none"></div>
          <Image
            src="/Saas_Show.png"
            alt="Interface FacturAvis — tableau de bord facturation et avis Google pour praticiens libéraux"
            width={1200}
            height={750}
            priority
            className="relative w-full rounded-xl md:rounded-[2rem] shadow-2xl border border-[#f0e6de] transform transition-transform duration-500 hover:scale-[1.01]"
          />
        </div>

        {/* --- BANDEAU DÉFILANT --- */}
        <div className="mt-12 md:mt-20 overflow-hidden relative group">
          <div className="flex gap-6 md:gap-8 animate-marquee whitespace-nowrap">
            {[...praticiens, ...praticiens].map((p, i) => (
              <span key={i} className="text-[#d4b494] font-black uppercase tracking-widest text-[10px] md:text-xs border border-[#f0e6de] px-5 py-2.5 rounded-full bg-white shadow-sm cursor-default hover:border-[#a9825a] transition-colors">
                {p}
              </span>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#fcfaf8] to-transparent pointer-events-none z-20"></div>
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#fcfaf8] to-transparent pointer-events-none z-20"></div>
        </div>
      </div>
    </section>
  );
}
