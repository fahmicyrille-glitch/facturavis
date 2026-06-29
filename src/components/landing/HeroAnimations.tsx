'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';

const praticiens = [
  "Ostéopathes", "Psychologues", "Chiropracteurs", "Psychothérapeutes",
  "Diététiciens", "Kinésiologues", "Naturopathes", "Sophrologues",
  "Hypnothérapeutes", "Réflexologues", "Pédicures-Podologues"
];

const COUNTDOWN_TARGET = new Date('2026-09-01T00:00:00');

function useCountdown() {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const tick = () => setDiff(Math.max(0, COUNTDOWN_TARGET.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const days = Math.floor(diff / 86400000);
  return days;
}

export default function HeroAnimations() {
  const [isVisible, setIsVisible] = useState(false);
  const daysLeft = useCountdown();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative pt-28 md:pt-40 pb-16 md:pb-20 px-4 overflow-hidden text-center">
      {/* Fond doux */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#fdf2e9] via-[#fdf9f5] to-transparent rounded-full blur-3xl -z-10 opacity-80" />

      <div className={`max-w-5xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

        {/* Badge urgence réforme */}
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest mb-6 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          Réforme sept. 2026 — {daysLeft} jours restants — Conforme Plateforme Agréée DGFiP
        </div>

        {/* H1 */}
        <h1 className="text-4xl sm:text-5xl md:text-[68px] font-black tracking-tighter mb-5 leading-[1.05] text-[#3e2f25]">
          Recevez vos factures fournisseurs.{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Gratuitement.</span>
            <div className="absolute bottom-1 left-0 w-full h-3 md:h-4 bg-green-200/40 -z-10 -rotate-1 rounded" />
          </span>
        </h1>

        {/* Sous-titre */}
        <p className="text-base sm:text-lg md:text-xl text-[#7a6a5f] max-w-2xl mx-auto mb-3 leading-relaxed font-medium">
          <strong className="text-[#3e2f25]">Ostéopathes, Psychologues, Chiropracteurs, Diététiciens…</strong>{' '}
          Dès septembre 2026 vous devez pouvoir recevoir les factures électroniques de vos fournisseurs.
          Avec FacturAvis, c'est <span className="text-green-600 font-black">gratuit et automatique</span>.
        </p>
        <p className="text-sm text-[#7a6a5f] max-w-xl mx-auto mb-10 font-medium">
          Et quand vous êtes prêt : facturation Factur-X, avis Google +300%, dossiers patients — à partir de 19€/mois.
        </p>

        {/* CTA BLOC */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">

          {/* CTA Principal */}
          <Link href="/inscription" className="w-full sm:w-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4b494] to-[#a9825a] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
            <button className="relative w-full sm:w-auto flex items-center justify-center bg-[#3e2f25] text-white px-8 py-5 rounded-2xl font-black text-base md:text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform gap-2">
              Essai gratuit 14 jours
              <ArrowRight className="group-hover:translate-x-1 transition-transform shrink-0" size={18} />
            </button>
          </Link>

          {/* CTA Secondaire */}
          <Link
            href="/inscription"
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-[#d4b494] text-[#3e2f25] hover:border-[#a9825a] hover:bg-[#fdf2e9] px-7 py-5 rounded-2xl font-bold text-sm md:text-base transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="7" y1="15" x2="7.01" y2="15"/></svg>
            Sans carte bancaire
          </Link>
        </div>

        {/* Badges de confiance */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12 text-[11px] font-bold text-[#7a6a5f]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-green-600" />
            Données sécurisées RGPD
          </span>
          <span className="text-[#d4b494]">·</span>
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>
            Annulable à tout moment
          </span>
          <span className="text-[#d4b494]">·</span>
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>
            Plateforme Agréée DGFiP incluse
          </span>
        </div>

        {/* Preuve sociale */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 sm:mb-20">
          {/* Avatars */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['bg-[#d4b494]','bg-[#a9825a]','bg-green-400','bg-blue-400','bg-[#3e2f25]'].map((c, i) => (
                <div key={i} className={`w-9 h-9 rounded-full border-2 border-white ${c} flex items-center justify-center text-white text-xs font-black`}>
                  {['M','A','L','P','R'][i]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={13} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-xs font-black text-[#3e2f25]">
                <span className="text-green-600">+340 praticiens</span> déjà inscrits
              </p>
            </div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-[#f0e6de]" />
          <p className="text-xs text-[#7a6a5f] font-bold italic max-w-[220px] text-center sm:text-left">
            "J'ai eu 45 avis Google le mois dernier — le logiciel se paie tout seul."
            <span className="block text-[10px] text-[#a9825a] font-black mt-0.5">— Nicolas I., Ostéopathe D.O.</span>
          </p>
        </div>

        {/* Bandeau défilant professions */}
        <div className="overflow-hidden relative">
          <div className="flex gap-4 animate-marquee whitespace-nowrap">
            {[...praticiens, ...praticiens].map((p, i) => (
              <span key={i} className="text-[#d4b494] font-black uppercase tracking-widest text-[10px] border border-[#f0e6de] px-5 py-2.5 rounded-full bg-white shadow-sm cursor-default hover:border-[#a9825a] transition-colors">
                {p}
              </span>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-16 md:w-28 bg-gradient-to-r from-[#fcfaf8] to-transparent pointer-events-none z-20" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-28 bg-gradient-to-l from-[#fcfaf8] to-transparent pointer-events-none z-20" />
        </div>
      </div>
    </section>
  );
}
