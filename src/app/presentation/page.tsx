'use client';

import React from 'react';
import {
  CheckCircle2,
  Zap,
  Star,
  ShieldCheck,
  ArrowRight,
  MousePointer2,
  FileCheck,
  TrendingUp,
  Clock,
  Cloud,
  Lock,
  Search
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <FileCheck className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">FacturAvis</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#avantages" className="hover:text-blue-600 transition">Avantages</a>
            <a href="#avis" className="hover:text-blue-600 transition">Avis Google</a>
            <a href="#securite" className="hover:text-blue-600 transition">Sécurité & Cloud</a>
          </div>
          <Link
            href="/"
            className="bg-slate-100 text-slate-900 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-200 transition"
          >
            Espace Praticien
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-8 shadow-sm">
            <Clock size={16} className="animate-pulse" />
            <span>Testez maintenant, payez plus tard — Offre de lancement</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
            Envoyez vos factures en <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">20 secondes</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            FacturAvis automatise l'envoi de vos reçus d'honoraires et booste votre visibilité sur Google Maps. <span className="text-slate-900 font-semibold italic">Commencez gratuitement sans carte bancaire.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://www.facturavis.fr/fondateur"
              className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition transform hover:-translate-y-1 shadow-xl shadow-blue-200"
            >
              Démarrer gratuitement
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <a
              href="#avantages"
              className="w-full sm:w-auto flex items-center justify-center bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition"
            >
              Découvrir les avantages
            </a>
          </div>

          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                   <img src={`https://i.pravatar.cc/150?img=${i+10}`} alt="user profile" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-slate-600">
              Déjà adopté par plus de <span className="text-slate-900 font-bold">50 praticiens</span> en France.
            </p>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="avantages" className="py-24 bg-slate-50 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900 tracking-tight">L'administratif n'est plus une corvée.</h2>
            <p className="text-slate-500 font-medium italic">"Testé maintenant, payé plus tard" : découvrez l'outil sans aucun risque.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <MousePointer2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Zéro perte de temps</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Glissez votre PDF, entrez l'email du patient, et c'est tout. Le mail part instantanément avec votre logo et vos coordonnées.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition duration-300">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Réputation Boostée</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Une fois la facture téléchargée, nous invitons vos patients à laisser un avis 5 étoiles sur Google Maps automatiquement.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition duration-300">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Conforme & Sécurisé</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Toutes vos factures sont archivées de manière sécurisée. Téléchargez votre historique en un clic pour votre comptable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CLOUD & SECURITY SECTION (ID FIXÉ) --- */}
      <section id="securite" className="py-24 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                <Cloud size={14} />
                <span>Stockage Cloud Illimité</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                Vos factures vous suivent <span className="text-blue-600 italic">partout</span>.
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Fini les PDF perdus sur un vieux disque dur. FacturAvis sauvegarde chaque document sur un Cloud sécurisé et crypté. Accédez à votre historique complet en un clic, à tout moment.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="flex items-start gap-3 justify-center lg:justify-start">
                  <div className="mt-1 bg-blue-100 p-1 rounded-full"><Lock size={16} className="text-blue-600"/></div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900">Données Cryptées</p>
                    <p className="text-sm text-slate-500">Protection totale des données patients.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 justify-center lg:justify-start">
                  <div className="mt-1 bg-blue-100 p-1 rounded-full"><Search size={16} className="text-blue-600"/></div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900">Recherche Instantanée</p>
                    <p className="text-sm text-slate-500">Retrouvez un patient en 2 secondes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
              <div className="bg-gradient-to-tr from-blue-600 to-blue-400 rounded-3xl p-1 shadow-2xl overflow-hidden shadow-blue-200 transform lg:rotate-2">
                <div className="bg-white rounded-[1.4rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-2 w-24 bg-slate-100 rounded-full"></div>
                    <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center"><Cloud size={16} className="text-blue-500"/></div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center"><FileCheck size={18} className="text-blue-500"/></div>
                          <div>
                            <div className="h-2 w-20 bg-slate-300 rounded-full mb-2"></div>
                            <div className="h-1.5 w-12 bg-slate-200 rounded-full"></div>
                          </div>
                        </div>
                        <div className="h-2 w-8 bg-blue-200 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={14}/> Backup Automatique Activé
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- AVIS GOOGLE SECTION --- */}
      <section id="avis" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden relative shadow-2xl">
          <div className="flex-1 space-y-6">
            <div className="flex gap-1 text-yellow-400">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} fill="currentColor" size={20} />)}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-white">
              Transformez chaque patient en un ambassadeur digital.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              FacturAvis détecte la satisfaction de vos patients. Les avis positifs sont redirigés vers Google, les retours constructifs vous sont envoyés en privé.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-blue-500" size={20} />
                <span className="text-slate-200 font-medium">Gain de 10 à 15 avis Google par mois en moyenne.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-blue-500" size={20} />
                <span className="text-slate-200 font-medium">Meilleur référencement local sur Google Maps.</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full rotate-2">
             <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
               <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">M</div>
               <div>
                 <p className="font-bold text-sm">Mathis D.</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-blue-400">Ostéopathe D.O.</p>
               </div>
               <div className="ml-auto flex text-yellow-400"><Star size={12} fill="currentColor"/></div>
             </div>
             <p className="text-sm italic text-slate-200 leading-relaxed">
               "L'envoi de la facture est super fluide. Le patient reçoit son lien propre, et j'ai déjà récolté 4 avis Google en une seule journée !"
             </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER / CTA FINAL --- */}
      <section className="py-24 text-center px-6">
        <h2 className="text-4xl font-black mb-4 text-slate-900 tracking-tight">Pas de carte bancaire, pas de stress.</h2>
        <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          Rejoignez FacturAvis aujourd'hui. Profitez du stockage cloud et boostez votre cabinet gratuitement.
        </p>
        <Link
          href="https://www.facturavis.fr/fondateur"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition shadow-2xl shadow-blue-100"
        >
          S'inscrire gratuitement
        </Link>
        <p className="mt-6 text-slate-400 text-sm font-medium">Inscription en 1 minute • Support humain 7j/7</p>

        <footer className="mt-24 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <p>© 2026 FacturAvis. Développé pour les praticiens libéraux.</p>
          <div className="flex gap-8">
            <span className="hover:text-slate-600 cursor-pointer transition">Mentions légales</span>
            <span className="hover:text-slate-600 cursor-pointer transition">Confidentialité</span>
            <span className="hover:text-slate-600 cursor-pointer transition">Support</span>
          </div>
        </footer>
      </section>

    </div>
  );
}
