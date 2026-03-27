'use client'; // Important car on utilise useEffect

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowLeft, Calendar, Sparkles } from 'lucide-react';

export default function MerciPage() {

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Déclenchement de la conversion Google Ads en préparation...');

      // Astuce pour éviter l'erreur TypeScript sur window.dataLayer
      const w = window as any;

      // 1. On s'assure que le dataLayer existe, même si le script global n'a pas fini de charger
      w.dataLayer = w.dataLayer || [];

      // 2. On définit la fonction gtag localement si elle n'existe pas encore pour pousser dans la file d'attente
      function gtag(...args: any[]) {
        w.dataLayer.push(args);
      }

      // 3. On envoie l'événement !
      gtag('event', 'conversion', {
        'send_to': 'AW-18043378456/ip0TCJrQkpAcEJi24JtD',
        'value': 1.0,
        'currency': 'EUR'
      });
      console.log('Conversion poussée dans le dataLayer !');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#3e2f25] font-sans flex items-center justify-center p-4 selection:bg-[#a9825a] selection:text-white">
      <div className="max-w-xl w-full bg-white rounded-[32px] p-8 md:p-12 shadow-2xl border border-[#f0e6de] text-center relative overflow-hidden">

        {/* Décoration d'arrière-plan */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#d4b494] to-[#a9825a]"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#fdf2e9] rounded-full blur-[40px] opacity-60"></div>

        {/* Icône Succès */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-70"></div>
          <div className="relative w-full h-full bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
            <CheckCircle size={48} className="text-white" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fdf2e9] text-[#a9825a] text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 border border-[#f0e6de]">
          <Sparkles size={14} className="fill-[#a9825a]" />
          Place Réservée avec succès
        </div>

        <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-[#3e2f25]">
          Félicitations !
        </h1>

        <p className="text-base md:text-lg text-[#7a6a5f] font-medium leading-relaxed mb-8">
          Votre demande pour rejoindre les Membres Fondateurs de FacturAvis a bien été prise en compte. Vous avez fait le bon choix pour votre cabinet.
        </p>

        {/* Bloc Prochaines Étapes */}
        <div className="bg-[#fcfaf8] border border-[#f0e6de] rounded-2xl p-6 mb-10 text-left relative">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#3e2f25] mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-[#a9825a]" />
            Prochaines étapes
          </h2>
          <ul className="space-y-3 text-sm font-medium text-[#7a6a5f]">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#d4b494] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
              Un expert de notre équipe va analyser votre dossier.
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#d4b494] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
              Nous vous appelons sous 24h ouvrées pour configurer votre espace.
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#d4b494] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
              Vous profitez de vos 14 jours d'essai gratuit.
            </li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#7a6a5f] font-black uppercase tracking-widest text-[10px] md:text-xs hover:text-[#a9825a] transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retourner à l'accueil
        </Link>
      </div>
    </div>
  );
}
