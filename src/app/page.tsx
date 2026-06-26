import {
  CheckCircle2, Star, ShieldCheck, FileCheck,
  Cloud, FilePlus,
  Users, Building2,
  ShieldAlert, UploadCloud, Sparkles,
  Inbox, BarChart3, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import CountdownBanner from '@/components/landing/CountdownBanner';
import HeroAnimations from '@/components/landing/HeroAnimations';
import ContactForm from '@/components/landing/ContactForm';
import MockupDashboard from '@/components/landing/MockupDashboard';
import MockupPatients from '@/components/landing/MockupPatients';
import MockupFacturesRecues from '@/components/landing/MockupFacturesRecues';
import AnimatedDemo from '@/components/landing/AnimatedDemo';

export default function LandingPage() {
  // --- DONNÉES STRUCTURÉES (JSON-LD) ---
  const jsonLdApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FacturAvis",
    "applicationCategory": "HealthBusinessApplication",
    "operatingSystem": "Web",
    "url": "https://facturavis.fr",
    "description": "Logiciel de gestion de cabinet, facturation Factur-X 2026 et automatisation d'avis Google pour les Ostéopathes, Chiropracteurs, Psychologues, Psychothérapeutes, Diététiciens, Kinésiologues et tous les praticiens libéraux.",
    "offers": [
      {
        "@type": "Offer",
        "name": "Gratuit",
        "price": "0",
        "priceCurrency": "EUR",
        "description": "Réception factures fournisseurs, Plateforme Agréée DGFiP, export FEC",
      },
      {
        "@type": "Offer",
        "name": "Pro",
        "price": "19.00",
        "priceCurrency": "EUR",
        "priceValidUntil": "2026-12-31",
        "description": "Facturation patients Factur-X, avis Google automatiques, dossiers patients, dashboard",
      },
    ],
  };

  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FacturAvis",
    "url": "https://facturavis.fr",
    "description": "Logiciel de facturation Factur-X et d'automatisation d'avis Google pour praticiens libéraux.",
    "publisher": {
      "@type": "Organization",
      "name": "FacturAvis",
      "url": "https://facturavis.fr",
      "logo": {
        "@type": "ImageObject",
        "url": "https://facturavis.fr/logo/logo.png",
      },
    },
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Est-ce que FacturAvis remplace Doctolib ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Non, c'est complémentaire. Doctolib gère l'agenda, FacturAvis gère tout ce qui se passe APRÈS la séance : dossier patient, édition de la facture conforme aux normes Factur-X 2026, comptabilité et réputation Google.",
        },
      },
      {
        "@type": "Question",
        "name": "Est-ce que FacturAvis est adapté à ma spécialité ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolument. Que vous soyez ostéopathe, chiropracteur, psychologue, diététicien, naturopathe ou sophrologue, les factures générées respectent les mentions légales propres à votre activité pour un remboursement mutuelle parfait.",
        },
      },
      {
        "@type": "Question",
        "name": "Puis-je utiliser FacturAvis si j'ai déjà un logiciel de facturation ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui ! Si vous générez vos factures avec un autre logiciel, importez simplement le PDF sur FacturAvis. Nous gérons l'envoi sécurisé au patient et la récolte automatique d'avis Google Maps.",
        },
      },
      {
        "@type": "Question",
        "name": "Qu'est-ce que la réforme Factur-X 2026 ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Même exonéré de TVA, tous les professionnels doivent pouvoir RECEVOIR les factures électroniques de leurs fournisseurs dès septembre 2026. L'émission aux patients n'est pas obligatoire pour les professions de santé exonérées, mais FacturAvis le fait quand même au format Factur-X. Résultat : vous êtes conforme et en avance.",
        },
      },
      {
        "@type": "Question",
        "name": "Comment FacturAvis collecte-t-il des avis Google ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Lors du téléchargement de sa facture, le patient est invité à laisser un avis sur Google Maps. Le moment est idéal : le patient vient de finir sa séance et télécharge son document pour sa mutuelle. Résultat : +300% d'avis en moyenne.",
        },
      },
      {
        "@type": "Question",
        "name": "Comment FacturAvis gère-t-il la réforme de septembre 2026 ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "L'obligation de RÉCEPTION de factures fournisseurs s'applique à tous, même les praticiens exonérés de TVA. FacturAvis vous connecte automatiquement à une Plateforme Agréée certifiée DGFiP. Aucune démarche sur impots.gouv.fr. En bonus, vos factures patients sont émises au format Factur-X, conforme aux normes même si ce n'est pas encore obligatoire pour vous.",
        },
      },
      {
        "@type": "Question",
        "name": "Qu'est-ce que la réception de factures fournisseurs ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "À partir de septembre 2026, tous les professionnels doivent pouvoir recevoir les factures de leurs fournisseurs au format électronique. FacturAvis est connecté à une Plateforme Agréée qui reçoit automatiquement ces factures pour vous : comptable, loyer, télécom, matériel médical... Tout arrive dans votre espace sans manipulation.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#3e2f25] font-sans selection:bg-[#a9825a] selection:text-white overflow-x-clip scroll-smooth">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

      {/* --- STICKY HEADER : bannière + navbar collent ensemble --- */}
      <div className="sticky top-0 z-50">
        <CountdownBanner />
        <Navbar />
      </div>

      {/* --- HERO SECTION (Client Component for animations) --- */}
      <HeroAnimations />

      {/* --- HERO MOCKUP : Factures Reçues --- */}
      <div className="-mt-8 mb-16 relative max-w-5xl mx-auto px-4 group">
        <div className="absolute -inset-1 bg-gradient-to-b from-green-200/30 to-transparent rounded-2xl md:rounded-[2rem] blur-xl -z-10 opacity-70 group-hover:opacity-100 transition duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf8] via-transparent to-transparent z-10 h-full w-full pointer-events-none rounded-b-2xl"></div>
        <div className="transform hover:scale-[1.01] transition-transform duration-500">
          <MockupFacturesRecues />
        </div>
      </div>

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
               <p className="text-sm md:text-base text-[#7a6a5f]">La note d&apos;honoraires est envoyée par email instantanément, prête pour sa mutuelle.</p>
             </div>

             <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#f0e6de] shadow-sm relative z-10 hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
               <div className="w-12 h-12 bg-yellow-400 text-white font-black text-xl flex items-center justify-center rounded-2xl mx-auto mb-5 shadow-lg shadow-yellow-400/20">3</div>
               <h3 className="font-black text-lg md:text-xl mb-2">Vous rayonnez</h3>
               <p className="text-sm md:text-base text-[#7a6a5f]">FacturAvis l&apos;invite automatiquement à laisser 5 étoiles sur la page Google de votre cabinet.</p>
             </div>
          </div>

          {/* Mockup Dashboard */}
          <div className="mt-12 md:mt-16 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4b494]/20 to-[#a9825a]/20 rounded-3xl blur-xl -z-10 opacity-50 group-hover:opacity-100 transition" />
            <div className="transform hover:scale-[1.01] transition-transform duration-500 rotate-0 md:-rotate-1">
              <MockupDashboard />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#fdf2e9]/50 to-transparent pointer-events-none rounded-b-2xl" />
          </div>
        </div>
      </section>

      {/* --- DEMO ANIMEE --- */}
      <AnimatedDemo />

      {/* --- SECTION : LES 2 METHODES DE FACTURATION --- */}
      <section className="py-16 md:py-24 bg-white border-t border-[#f0e6de] px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#3e2f25] mb-4 tracking-tighter">
              Deux méthodes simples. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]">Un seul objectif : vos avis.</span>
            </h2>
            <p className="text-[#7a6a5f] text-lg font-medium max-w-2xl mx-auto">
              Que vous ayez déjà votre propre système ou que vous partiez de zéro, FacturAvis s&apos;adapte à votre façon de travailler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {/* METHODE 1 : UPLOAD */}
            <div className="bg-[#fcfaf8] p-8 md:p-10 rounded-[32px] border border-[#f0e6de] hover:border-[#a9825a]/50 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4b494]/10 rounded-full blur-3xl -z-10 group-hover:bg-[#d4b494]/20 transition-all"></div>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[#f0e6de] flex items-center justify-center mb-6 text-[#a9825a] group-hover:scale-110 transition-transform">
                <UploadCloud size={32} />
              </div>
              <div className="inline-block self-start bg-[#3e2f25] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Méthode 1</div>
              <h3 className="text-2xl md:text-3xl font-black text-[#3e2f25] mb-4">L&apos;Import Express</h3>
              <p className="text-[#7a6a5f] leading-relaxed font-medium mb-8 flex-grow">
                Vous utilisez déjà un autre logiciel pour éditer vos factures ? Parfait. Déposez simplement votre PDF existant sur notre plateforme.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-green-100 p-1 rounded-full"><CheckCircle2 size={16} className="text-green-600 shrink-0" /></div>
                  <span className="text-[#3e2f25] font-bold text-sm">Le thérapeute dépose son PDF en 1 clic</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-green-100 p-1 rounded-full"><CheckCircle2 size={16} className="text-green-600 shrink-0" /></div>
                  <span className="text-[#3e2f25] font-bold text-sm">Le patient reçoit un email avec un lien sécurisé</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-yellow-100 p-1 rounded-full"><Star size={16} className="text-yellow-600 shrink-0 fill-current" /></div>
                  <span className="text-[#3e2f25] font-bold text-sm">Le téléchargement déclenche une demande d&apos;avis Google</span>
                </li>
              </ul>
            </div>

            {/* METHODE 2 : FORMULAIRE */}
            <div className="bg-[#fdf2e9]/30 p-8 md:p-10 rounded-[32px] border border-[#f0e6de] hover:border-[#a9825a]/50 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#a9825a]/10 rounded-full blur-3xl -z-10 group-hover:bg-[#a9825a]/20 transition-all"></div>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[#f0e6de] flex items-center justify-center mb-6 text-[#a9825a] group-hover:scale-110 transition-transform">
                <FilePlus size={32} />
              </div>
              <div className="inline-block self-start bg-[#a9825a] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Méthode 2</div>
              <h3 className="text-2xl md:text-3xl font-black text-[#3e2f25] mb-4">Le Générateur Intégré</h3>
              <p className="text-[#7a6a5f] leading-relaxed font-medium mb-8 flex-grow">
                Vous n&apos;avez pas de solution de facturation ? Remplissez notre formulaire ultra-rapide et laissez la magie opérer.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-green-100 p-1 rounded-full"><CheckCircle2 size={16} className="text-green-600 shrink-0" /></div>
                  <span className="text-[#3e2f25] font-bold text-sm">Formulaire thérapeute simple et intuitif</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-green-100 p-1 rounded-full"><CheckCircle2 size={16} className="text-green-600 shrink-0" /></div>
                  <span className="text-[#3e2f25] font-bold text-sm">Création automatique d&apos;une facture aux normes</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-yellow-100 p-1 rounded-full"><Star size={16} className="text-yellow-600 shrink-0 fill-current" /></div>
                  <span className="text-[#3e2f25] font-bold text-sm">Envoi par lien avec récolte d&apos;avis intégrée</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- RÉCEPTION FOURNISSEURS (NOUVEAU) --- */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#fcfaf8] to-white border-t border-[#f0e6de] px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-green-100 mb-6">
              <ShieldCheck size={14} /> Nouveau — Conforme sept. 2026
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#3e2f25] mb-4 tracking-tighter">
              Vos factures fournisseurs <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">arrivent toutes seules.</span>
            </h2>
            <p className="text-[#7a6a5f] text-lg font-medium max-w-3xl mx-auto">
              Vous avez reçu le courrier de la DGFiP ? Même exonéré de TVA, vous devez pouvoir recevoir les factures de vos fournisseurs au format électronique. En vous inscrivant sur FacturAvis, c&apos;est automatique. Aucune démarche sur impots.gouv.fr.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-green-200 text-xs font-bold text-green-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Connecté à une Plateforme Agréée certifiée par la DGFiP
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-8 rounded-3xl border border-green-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-black text-lg mb-2 text-[#3e2f25]">Plateforme Agréée DGFiP</h3>
              <p className="text-sm text-[#7a6a5f]">FacturAvis est connecté à une Plateforme Agréée certifiée. Votre conformité est assurée sans effort.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-green-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Inbox size={32} />
              </div>
              <h3 className="font-black text-lg mb-2 text-[#3e2f25]">Réception Automatique</h3>
              <p className="text-sm text-[#7a6a5f]">Les factures de votre comptable, loyer, télécom, matériel... arrivent automatiquement dans votre espace.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-green-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3 className="font-black text-lg mb-2 text-[#3e2f25]">Envoi au comptable en 1 clic</h3>
              <p className="text-sm text-[#7a6a5f]">Sélectionnez une période, cliquez Envoyer. Votre comptable reçoit un ZIP avec toutes vos factures fournisseurs — CSV + PDFs.</p>
            </div>
          </div>

          {/* Mockup Dashboard */}
          <div className="mt-12 md:mt-16 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-3xl blur-xl -z-10 opacity-50 group-hover:opacity-100 transition" />
            <div className="transform hover:scale-[1.01] transition-transform duration-500 rotate-0 md:-rotate-1">
              <MockupDashboard />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-2xl" />
          </div>
        </div>
      </section>

      {/* --- RAPPORT COMPTABLE --- */}
      <section className="py-16 md:py-24 bg-white border-t border-[#f0e6de] px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 md:gap-16">

          {/* Texte */}
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-amber-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
              Nouveau — Rapport comptable
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#3e2f25] leading-tight tracking-tighter">
              Votre comptable reçoit<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">tout en un clic.</span>
            </h2>
            <p className="text-[#7a6a5f] text-lg font-medium leading-relaxed">
              Sélectionnez une période, saisissez l&apos;email de votre comptable, appuyez sur <strong className="text-[#3e2f25]">Envoyer</strong>. Il reçoit un email professionnel avec toutes vos factures fournisseurs — CSV récapitulatif et PDFs inclus dans un ZIP prêt à importer.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 bg-amber-100 p-1 rounded-full shrink-0"><CheckCircle2 size={16} className="text-amber-600" /></div>
                <p className="text-[#3e2f25] text-sm font-bold">Période en 1 clic : <span className="font-medium text-[#7a6a5f]">ce mois, mois dernier, ce trimestre, trimestre précédent — ou dates libres.</span></p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 bg-amber-100 p-1 rounded-full shrink-0"><CheckCircle2 size={16} className="text-amber-600" /></div>
                <p className="text-[#3e2f25] text-sm font-bold">ZIP automatique : <span className="font-medium text-[#7a6a5f]">CSV compatible Excel + tous les PDFs de vos factures, classés et nommés proprement.</span></p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 bg-amber-100 p-1 rounded-full shrink-0"><CheckCircle2 size={16} className="text-amber-600" /></div>
                <p className="text-[#3e2f25] text-sm font-bold">Email sauvegardé : <span className="font-medium text-[#7a6a5f]">enregistrez l&apos;adresse de votre comptable une fois dans les paramètres, elle est pré-remplie à chaque envoi.</span></p>
              </li>
            </ul>
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-7 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Essayer gratuitement
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>

          {/* Mockup email comptable */}
          <div className="flex-1 w-full max-w-md mx-auto lg:mx-0">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-[32px] blur-2xl -z-10" />
              <div className="bg-white rounded-[24px] border border-[#f0e6de] shadow-2xl overflow-hidden">

                {/* Email header bar */}
                <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400 truncate">
                    📧 comptable@votre-cabinet.fr
                  </div>
                </div>

                {/* Email subject */}
                <div className="px-5 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">Objet</p>
                  <p className="text-sm font-bold text-gray-800 truncate">Rapport fournisseurs — Dr. Marie Dupont — janv. au mars 2026</p>
                </div>

                {/* Email body */}
                <div className="p-5 space-y-4">
                  {/* Header email */}
                  <div className="bg-gradient-to-r from-[#3e2f25] to-[#a9825a] rounded-xl p-4">
                    <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">FacturAvis</p>
                    <p className="text-white font-black text-base mt-1">Rapport factures fournisseurs</p>
                    <p className="text-white/80 text-xs mt-0.5">Dr. Marie Dupont · 1 janv. — 31 mars 2026</p>
                  </div>

                  {/* Totaux */}
                  <div className="bg-[#fdf2e9] rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-[#a9825a] font-bold uppercase tracking-wide">Total</p>
                      <p className="text-xl font-black text-[#3e2f25]">1 850,00 €</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#a9825a] font-bold uppercase tracking-wide">Factures</p>
                      <p className="text-xl font-black text-[#3e2f25]">11</p>
                    </div>
                  </div>

                  {/* Tableau mini */}
                  <div className="space-y-1.5">
                    {[
                      { date: '15/01', nom: 'EDF Électricité', cat: 'Énergie', montant: '120,00 €' },
                      { date: '20/01', nom: 'Orange Mobile', cat: 'Télécom', montant: '45,00 €' },
                      { date: '01/02', nom: 'Loyer Cabinet', cat: 'Loyer', montant: '850,00 €' },
                      { date: '10/03', nom: 'Formation CPF', cat: 'Formation', montant: '490,00 €' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-50 last:border-0">
                        <span className="text-gray-400 w-10 shrink-0">{row.date}</span>
                        <span className="text-gray-700 font-semibold flex-1 truncate">{row.nom}</span>
                        <span className="text-gray-400 hidden sm:block w-16 text-right shrink-0">{row.cat}</span>
                        <span className="text-[#3e2f25] font-black w-16 text-right shrink-0">{row.montant}</span>
                      </div>
                    ))}
                    <p className="text-[10px] text-gray-400 text-center pt-1">+ 7 autres factures dans le ZIP</p>
                  </div>

                  {/* Pièce jointe */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-800 truncate">factures_fournisseurs_2026-01-01_au_2026-03-31.zip</p>
                      <p className="text-[10px] text-blue-600">CSV + 11 PDFs · prêt à importer</p>
                    </div>
                  </div>
                </div>
              </div>
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
              Septembre 2026 : <br/>
              <span className="text-red-500">la réception devient obligatoire.</span>
            </h2>
            <p className="text-[#7a6a5f] text-lg font-medium leading-relaxed">
              Même exonéré de TVA, vous <strong className="text-[#3e2f25]">devez pouvoir recevoir</strong> les factures électroniques de vos fournisseurs dès septembre 2026. L&apos;émission aux patients n&apos;est pas obligatoire, mais FacturAvis le fait quand même — au format Factur-X, prêt pour votre comptable.
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
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20}/>
                <p className="text-[#3e2f25] font-bold">Réception Automatique : <span className="font-medium text-[#7a6a5f]">Vos factures fournisseurs arrivent directement dans votre espace via notre Plateforme Agréée certifiée par la DGFiP. Zéro manipulation.</span></p>
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
                   <div className="text-green-400">&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;</div>
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
            <p className="text-[#7a6a5f] font-bold text-base md:text-lg">8 outils en 1 pour vous faire gagner 5 heures par semaine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Users, title: "Dossiers Auto-Save", desc: "Historique et notes thérapeutiques sauvegardées à chaque frappe. Ne perdez plus jamais une observation." },
              { icon: FilePlus, title: "Facturation Express", desc: "Générez des reçus d'honoraires conformes. Envoyés par email et classés pour votre comptabilité." },
              { icon: Star, title: "Machine à Avis", desc: "Le patient télécharge sa facture pour sa mutuelle = invitation automatique à laisser un avis 5 étoiles." },
              { icon: ShieldCheck, title: "Sécurité & Normes", desc: "Factures Factur-X à l'émission + réception via Plateforme Agréée. Doublement conforme." },
              { icon: Cloud, title: "Export Comptable", desc: "Export CSV et FEC en 1 clic. Le format légal que votre comptable adore." },
              { icon: Building2, title: "Multi-Cabinets", desc: "Plusieurs lieux ? Associez chaque facture au bon numéro SIRET et à la bonne page Google Maps." },
              { icon: Inbox, title: "Réception Fournisseurs", desc: "Recevez automatiquement les factures de vos fournisseurs via notre Plateforme Agréée. Conforme à la réforme sept. 2026." },
              { icon: BarChart3, title: "Dashboard & Analytics", desc: "Suivez votre CA mensuel, votre taux d'avis et vos performances en temps réel avec des graphiques clairs." }
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

          {/* Mockup Patients */}
          <div className="mt-12 md:mt-16 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4b494]/20 to-[#a9825a]/20 rounded-3xl blur-xl -z-10 opacity-50 group-hover:opacity-100 transition" />
            <div className="transform hover:scale-[1.01] transition-transform duration-500 rotate-0 md:rotate-1">
              <MockupPatients />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#fcfaf8] to-transparent pointer-events-none rounded-b-2xl" />
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
              Un flux régulier d&apos;avis positifs booste le référencement local de votre cabinet. FacturAvis utilise le moment où le patient télécharge sa facture pour lui demander gentiment. Résultat : <strong className="text-white">+300% d&apos;avis en moyenne.</strong>
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
               &quot;C&apos;est un outil incroyable. Mes patients laissent enfin des avis d&apos;eux-mêmes ! J&apos;en ai eu 45 le mois dernier. Avec les nouveaux patients que ça m&apos;attire, le logiciel se paie tout seul.&quot;
             </p>
          </div>
        </div>
      </section>

      {/* --- CONTACT FORM (Client Component) --- */}
      <ContactForm />

      {/* --- PRICING FREEMIUM --- */}
      <section className="py-16 md:py-24 bg-white border-t border-[#f0e6de] px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-[#3e2f25] mb-4 tracking-tighter">
              Commencez gratuitement. <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Évoluez quand vous êtes prêt.</span>
            </h2>
            <p className="text-[#7a6a5f] text-lg font-medium max-w-2xl mx-auto">
              La réception de factures fournisseurs est gratuite. Pour toujours. Ajoutez la facturation patients et les avis Google quand vous le souhaitez.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE PLAN */}
            <div className="bg-white p-8 md:p-10 rounded-[32px] border-2 border-gray-200 relative">
              <div className="inline-block bg-green-100 text-green-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">Gratuit</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-[#3e2f25]">0€</span>
                <span className="text-[#7a6a5f] font-bold">/mois</span>
              </div>
              <p className="text-sm text-[#7a6a5f] font-medium mb-6">Conforme à la réforme sept. 2026</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm font-medium text-[#3e2f25]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  Réception factures fournisseurs
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-[#3e2f25]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  Plateforme Agréée DGFiP incluse
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-[#3e2f25]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  Classement par catégorie
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-[#3e2f25]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  Export FEC pour comptable
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-[#3e2f25]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  Prévisualisation PDF
                </li>
              </ul>
              <Link href="/inscription" className="w-full flex items-center justify-center bg-[#3e2f25] text-white py-4 rounded-2xl font-black text-lg hover:bg-black transition-all">
                S'inscrire gratuitement
              </Link>
              <p className="text-[10px] text-center text-[#7a6a5f] mt-3 font-bold">Sans carte bancaire • Pour toujours</p>
            </div>

            {/* PRO PLAN */}
            <div className="bg-gradient-to-b from-[#fdf2e9] to-white p-8 md:p-10 rounded-[32px] border-2 border-[#a9825a] relative shadow-xl shadow-[#a9825a]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#a9825a] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Le plus populaire</div>
              <div className="inline-block bg-[#a9825a]/10 text-[#a9825a] text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">Pro</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-[#3e2f25]">19€</span>
                <span className="text-[#7a6a5f] font-bold">/mois</span>
              </div>
              <p className="text-sm text-[#7a6a5f] font-medium mb-6">Tout-en-un pour votre cabinet</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm font-bold text-[#a9825a]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#a9825a] shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  Tout le plan Gratuit +
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-[#3e2f25]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#a9825a] shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  Facturation patients Factur-X
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-[#3e2f25]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#a9825a] shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  Avis Google automatiques (+300%)
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-[#3e2f25]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#a9825a] shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  Dossiers patients sécurisés
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-[#3e2f25]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#a9825a] shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  Dashboard & analytics temps réel
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-[#3e2f25]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#a9825a] shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  Multi-cabinets & relances auto
                </li>
              </ul>
              <Link href="/inscription" className="w-full flex items-center justify-center bg-gradient-to-r from-[#d4b494] to-[#a9825a] text-white py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-lg shadow-[#a9825a]/20">
                Essai gratuit 14 jours
              </Link>
              <p className="text-[10px] text-center text-[#7a6a5f] mt-3 font-bold">Sans carte bancaire • Annulable à tout moment</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8 text-xs font-bold text-green-700 bg-green-50 px-4 py-2 rounded-full border border-green-200 w-fit mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Connecté à une Plateforme Agréée certifiée par la Direction Générale des Finances Publiques
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-16 md:py-24 bg-[#fcfaf8] border-t border-[#f0e6de] px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-[#3e2f25] mb-10 md:mb-16 tracking-tight">Questions Fréquentes</h2>
          <div className="space-y-4 md:space-y-6">
            <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-[24px] border border-[#f0e6de] hover:shadow-md transition-shadow">
              <h3 className="font-black text-base md:text-lg mb-2 text-[#3e2f25]">Est-ce que FacturAvis remplace Doctolib ?</h3>
              <p className="text-[#7a6a5f] text-sm md:text-base leading-relaxed font-medium">Non, c&apos;est complémentaire. Doctolib gère l&apos;agenda, FacturAvis gère tout ce qui se passe APRÈS la séance : dossier patient, édition de la facture conforme, comptabilité et réputation Google.</p>
            </div>
            <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-[24px] border border-[#f0e6de] hover:shadow-md transition-shadow">
              <h3 className="font-black text-base md:text-lg mb-2 text-[#3e2f25]">Est-ce adapté à ma spécialité ?</h3>
              <p className="text-[#7a6a5f] text-sm md:text-base leading-relaxed font-medium">Absolument. Que vous soyez ostéopathe, chiropracteur, psychologue ou diététicien, les factures générées respectent les mentions légales propres à votre activité pour un remboursement mutuelle parfait.</p>
            </div>
            <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-[24px] border border-[#f0e6de] hover:shadow-md transition-shadow">
              <h3 className="font-black text-base md:text-lg mb-2 text-[#3e2f25]">Puis-je facturer si j&apos;ai déjà un PDF ?</h3>
              <p className="text-[#7a6a5f] text-sm md:text-base leading-relaxed font-medium">Oui ! Et c&apos;est justement la force de l&apos;outil. Si vous générez vos factures avec un autre logiciel, uploadez simplement le PDF sur FacturAvis. Nous nous chargeons de l&apos;envoi au patient et de la récolte d&apos;avis Maps.</p>
            </div>
            <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-[24px] border border-[#f0e6de] hover:shadow-md transition-shadow">
              <h3 className="font-black text-base md:text-lg mb-2 text-[#3e2f25]">Je suis exonéré de TVA, suis-je concerné par la réforme ?</h3>
              <p className="text-[#7a6a5f] text-sm md:text-base leading-relaxed font-medium">Oui, partiellement. Vous n&apos;êtes <strong>pas obligé d&apos;émettre</strong> des factures électroniques à vos patients. En revanche, vous <strong>devez pouvoir recevoir</strong> celles de vos fournisseurs (comptable, loyer, télécom...) dès septembre 2026. FacturAvis vous met en conformité automatiquement via sa Plateforme Agréée. En bonus, vos factures patients sont déjà au format Factur-X.</p>
            </div>
            <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-[24px] border border-[#f0e6de] hover:shadow-md transition-shadow">
              <h3 className="font-black text-base md:text-lg mb-2 text-[#3e2f25]">Qu&apos;est-ce que la réception de factures fournisseurs ?</h3>
              <p className="text-[#7a6a5f] text-sm md:text-base leading-relaxed font-medium">Dès septembre 2026, vos fournisseurs n&apos;enverront plus de PDF par email. Leurs factures transiteront par le réseau des Plateformes Agréées. FacturAvis vous connecte automatiquement — les factures de votre comptable, loyer, télécom, matériel médical arrivent dans votre espace sans manipulation. Aucune inscription sur impots.gouv.fr n&apos;est nécessaire.</p>
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
        <Link href="/inscription" className="relative inline-flex group">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-[#a9825a] rounded-[24px] blur opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
          <button className="relative bg-white text-[#3e2f25] px-10 md:px-14 py-5 md:py-6 rounded-[24px] font-black text-xl md:text-2xl hover:scale-105 transition-transform flex items-center gap-3">
            <Sparkles size={24} className="text-[#a9825a]"/>
            Tester Gratuitement
          </button>
        </Link>

        <footer className="mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-[10px] font-black uppercase tracking-widest max-w-7xl mx-auto">
          <p className="text-gray-400 text-[10px] mb-4">Plateforme Agréée certifiée par la Direction Générale des Finances Publiques (DGFiP)</p>
          <p>&copy; 2026 FacturAvis — Logiciel certifié Factur-X.</p>
          <div className="flex gap-8">
            <Link href="/login" className="hover:text-white transition-colors">Accès Praticien</Link>
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link href="/cgv" className="hover:text-white transition-colors">CGV</Link>
            <Link href="/politique-confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
          </div>
        </footer>
      </section>
    </div>
  );
}
