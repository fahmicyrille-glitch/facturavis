import {
  CheckCircle2, Star, ShieldCheck,
  FilePlus, Users, Inbox, BarChart3, Sparkles,
  MessageSquare, ArrowRight, Zap, TrendingUp, CalendarDays, X,
  RefreshCw, Video, Bell, ClipboardList, Hourglass, Ban, RotateCw
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import CountdownBanner from '@/components/landing/CountdownBanner';
import HeroAnimations from '@/components/landing/HeroAnimations';
import ContactForm from '@/components/landing/ContactForm';
import MockupFacturesRecues from '@/components/landing/MockupFacturesRecues';
import AnimatedDemo from '@/components/landing/AnimatedDemo';
import MockupPatients from '@/components/landing/MockupPatients';
import MockupAgenda from '@/components/landing/MockupAgenda';
import MockupReserver from '@/components/landing/MockupReserver';
import Reveal from '@/components/landing/Reveal';

export default function LandingPage() {
  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FacturAvis",
    "url": "https://facturavis.fr",
    "logo": "https://facturavis.fr/logo/logo.png",
    "description": "Logiciel tout-en-un pour praticiens libéraux : agenda et réservation en ligne, facturation Factur-X, avis Google automatiques et réception de factures fournisseurs conforme à la réforme 2026.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": "https://facturavis.fr/#contact",
      "areaServed": "FR",
      "availableLanguage": "French",
    },
  };

  const jsonLdApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FacturAvis",
    "applicationCategory": "HealthBusinessApplication",
    "operatingSystem": "Web",
    "url": "https://facturavis.fr",
    "description": "Alternative à Doctolib pour praticiens bien-être : agenda et prise de rendez-vous en ligne, facturation Factur-X, automatisation d'avis Google et réception de factures fournisseurs via Plateforme Agréée DGFiP.",
    "offers": [
      { "@type": "Offer", "name": "Gratuit", "price": "0", "priceCurrency": "EUR" },
      { "@type": "Offer", "name": "Pro", "price": "19.00", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31" },
    ],
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Est-ce que FacturAvis remplace Doctolib ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui, et il va plus loin. Depuis 2023, Doctolib est réservé aux professions à numéro RPPS/ADELI : les praticiens bien-être en sont exclus. FacturAvis vous donne un agenda avec prise de rendez-vous en ligne par vos patients, rappels automatiques, dossiers patients, facturation conforme 2026 et avis Google automatiques — à 19€/mois, contre 30 à 40€ chez les alternatives." } },
      { "@type": "Question", "name": "Quel est le prix de FacturAvis ?", "acceptedAnswer": { "@type": "Answer", "text": "La réception de factures fournisseurs est totalement gratuite, sans limite dans le temps et sans carte bancaire. Le plan Pro à 19€/mois débloque la facturation patients Factur-X, l'automatisation des avis Google, les dossiers patients et le dashboard analytique." } },
      { "@type": "Question", "name": "Je suis exonéré de TVA, suis-je concerné par la réforme 2026 ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui. Vous n'êtes pas obligé d'émettre des factures électroniques à vos patients. En revanche, vous devez pouvoir recevoir celles de vos fournisseurs dès septembre 2026. FacturAvis vous met en conformité automatiquement." } },
      { "@type": "Question", "name": "Comment FacturAvis collecte-t-il des avis Google ?", "acceptedAnswer": { "@type": "Answer", "text": "Lors du téléchargement de sa facture, le patient est invité à laisser un avis sur Google Maps. C'est une simple invitation, sans contrepartie ni récompense : 100% organique. Résultat : +300% d'avis en moyenne." } },
      { "@type": "Question", "name": "Puis-je utiliser FacturAvis si j'ai déjà un logiciel de facturation ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui ! Déposez simplement votre PDF existant sur notre plateforme. Nous gérons l'envoi sécurisé au patient et la récolte automatique d'avis Google Maps." } },
      { "@type": "Question", "name": "Comment mes patients réservent-ils un rendez-vous en ligne ?", "acceptedAnswer": { "@type": "Answer", "text": "Vous partagez votre lien de réservation personnel (sur votre site, Instagram, WhatsApp...). Le patient choisit un créneau réellement libre selon vos horaires, en cabinet ou en visio. Il reçoit une confirmation avec fichier calendrier, un rappel automatique 24h avant, et peut annuler ou reprogrammer lui-même en ligne." } },
      { "@type": "Question", "name": "Puis-je proposer des consultations en visio ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui. Ajoutez votre lien de visioconférence dans vos réglages : vos patients pourront choisir une consultation à distance lors de la réservation, et le lien leur est envoyé automatiquement par email." } },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#3e2f25] font-sans selection:bg-[#a9825a] selection:text-white overflow-x-clip scroll-smooth">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

      {/* HEADER STICKY */}
      <div className="sticky top-0 z-50">
        <CountdownBanner />
        <Navbar />
      </div>

      {/* 1. HERO */}
      <HeroAnimations />

      {/* 2. RÉCEPTION FOURNISSEURS 2026 — angle chaud, remonté en priorité */}
      <section id="reforme" className="py-16 md:py-24 bg-[#fcfaf8] border-t border-[#f0e6de] px-4 md:px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <Reveal variant="up" className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-red-100 mb-5">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span>
              Obligatoire dès septembre 2026
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#3e2f25] mb-4 tracking-tighter">
              Vos factures fournisseurs<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"> arrivent toutes seules.</span>
            </h2>
            <p className="text-[#7a6a5f] text-lg font-medium max-w-2xl mx-auto">
              Même exonéré de TVA, vous devez pouvoir recevoir les factures de vos fournisseurs au format électronique dès septembre 2026. FacturAvis le fait automatiquement. <strong className="text-[#3e2f25]">Gratuit. Pour toujours.</strong>
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: ShieldCheck, color: "bg-green-50 text-green-600", title: "Plateforme Agréée DGFiP", desc: "Connecté à une plateforme certifiée. Votre conformité est assurée sans démarche sur impots.gouv.fr." },
              { icon: Inbox, color: "bg-green-50 text-green-600", title: "Réception automatique", desc: "Comptable, loyer, télécom, matériel médical... tout arrive dans votre espace sans manipulation." },
              { icon: TrendingUp, color: "bg-amber-50 text-amber-600", title: "Envoi comptable en 1 clic", desc: "Sélectionnez une période, saisissez l'email de votre comptable. Il reçoit un ZIP avec tout." },
            ].map((f, i) => (
              <Reveal key={i} variant="up" delay={i * 100} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mx-auto mb-5`}><f.icon size={32} /></div>
                <h3 className="font-black text-lg mb-2 text-[#3e2f25]">{f.title}</h3>
                <p className="text-sm text-[#7a6a5f]">{f.desc}</p>
              </Reveal>
            ))}
          </div>

          <Reveal variant="zoom" className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-b from-green-200/30 to-transparent rounded-2xl blur-xl -z-10 opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf8] via-transparent to-transparent z-10 pointer-events-none rounded-b-2xl" />
            <MockupFacturesRecues />
          </Reveal>

          <Reveal variant="up" className="mt-8 text-center">
            <Link href="/inscription" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black text-base transition-all hover:scale-105 shadow-lg shadow-green-600/20">
              Me mettre en conformité gratuitement <ArrowRight size={18} />
            </Link>
            <p className="text-xs text-[#7a6a5f] font-bold mt-3">Sans carte bancaire · Gratuit pour toujours</p>
          </Reveal>
        </div>
      </section>

      {/* 2bis. AGENDA & RDV EN LIGNE — flagship différenciateur, prime position */}
      <section id="agenda" className="py-16 md:py-24 bg-white border-t border-[#f0e6de] px-4 md:px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <Reveal variant="up" className="text-center mb-10">
            <p className="text-xs font-black text-[#a9825a] uppercase tracking-widest mb-3">Nouveau — Agenda & réservation en ligne</p>
            <h2 className="text-3xl md:text-5xl font-black text-[#3e2f25] mb-4 tracking-tighter">
              Vos patients réservent seuls,<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]"> vous ne faites rien.</span>
            </h2>
            <p className="text-[#7a6a5f] text-lg font-medium max-w-2xl mx-auto">
              Partagez votre lien de réservation. Vos patients choisissent un créneau libre 24h/24, selon vos horaires et vos motifs de consultation, en cabinet ou en visio. Confirmation, rappel 24h avant et reprogrammation en ligne : tout est automatique.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10 items-start">
            <Reveal variant="left" className="relative">
              <div className="absolute -inset-1 bg-gradient-to-b from-[#fdf2e9]/50 to-transparent rounded-2xl blur-xl -z-10 opacity-70" />
              <p className="text-center text-xs font-black text-[#a9825a] uppercase tracking-widest mb-3">Ce que voit votre patient</p>
              <MockupReserver />
            </Reveal>
            <Reveal variant="right" delay={150} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-b from-[#fdf2e9]/50 to-transparent rounded-2xl blur-xl -z-10 opacity-70" />
              <p className="text-center text-xs font-black text-[#a9825a] uppercase tracking-widest mb-3">Ce que vous voyez</p>
              <MockupAgenda />
            </Reveal>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            {[
              { icon: CalendarDays, title: "Réservation 24h/24", desc: "Lien personnel à partager partout" },
              { icon: RefreshCw, title: "Reprogrammation en ligne", desc: "Le patient change sa date lui-même" },
              { icon: Video, title: "Visio intégrée", desc: "Lien de consultation à distance" },
              { icon: Bell, title: "Liste d'attente", desc: "Alerte auto dès qu'un créneau se libère" },
              { icon: ClipboardList, title: "Motifs personnalisés", desc: "Une durée différente par type de séance" },
              { icon: Hourglass, title: "Délais configurables", desc: "Bloquez les annulations de dernière minute" },
              { icon: Ban, title: "Congés & indisponibilités", desc: "Bloqués automatiquement, sans y penser" },
              { icon: RotateCw, title: "Sync Google/Apple Calendar", desc: "Votre agenda perso toujours à jour" },
            ].map((f, i) => (
              <Reveal key={i} variant="up" delay={i * 60} className="bg-[#fcfaf8] rounded-2xl p-5 border border-[#f0e6de] text-center hover:border-[#a9825a] transition-colors">
                <f.icon size={22} className="text-[#a9825a] mx-auto mb-2" />
                <p className="text-xs font-black text-[#3e2f25] mb-1">{f.title}</p>
                <p className="text-[10px] text-[#7a6a5f] font-medium">{f.desc}</p>
              </Reveal>
            ))}
          </div>

          {/* Widget intégrable — différenciateur fort, mis en avant à part */}
          <Reveal variant="zoom" className="max-w-4xl mx-auto bg-gradient-to-br from-[#3e2f25] to-[#2a201a] rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex-1 text-center md:text-left">
              <p className="text-[#d4b494] text-xs font-black uppercase tracking-widest mb-2">Bonus — Widget intégrable</p>
              <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">
                Votre agenda directement sur votre site.
              </h3>
              <p className="text-gray-300 text-sm md:text-base font-medium">
                Un lien à coller dans votre site Wix/WordPress, votre bio Instagram ou votre Linktree. Vos patients réservent sans jamais quitter votre page.
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-[11px] md:text-xs text-[#d4b494] overflow-x-auto">
                <span className="text-gray-500">&lt;</span>iframe<span className="text-gray-500"> src=</span><span className="text-green-400">&quot;facturavis.fr/reserver/vous&quot;</span><span className="text-gray-500">&gt;&lt;/</span>iframe<span className="text-gray-500">&gt;</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. DOSSIERS PATIENTS — remonté plus tôt dans le tunnel, différenciateur clé */}
      <section className="py-16 md:py-24 bg-[#fcfaf8] border-t border-[#f0e6de] px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal variant="up" className="text-center mb-10">
            <p className="text-xs font-black text-[#a9825a] uppercase tracking-widest mb-3">Dossiers patients</p>
            <h2 className="text-3xl md:text-5xl font-black text-[#3e2f25] mb-4 tracking-tighter">
              Tout l'historique de vos patients,<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]"> en un coup d'œil.</span>
            </h2>
            <p className="text-[#7a6a5f] text-lg font-medium max-w-2xl mx-auto">
              Fiche complète, observations de séance, historique de facturation. Tout est lié — vous facturez en 10 secondes depuis la fiche patient.
            </p>
          </Reveal>

          <Reveal variant="zoom" className="relative">
            <div className="absolute -inset-1 bg-gradient-to-b from-[#fdf2e9]/50 to-transparent rounded-2xl blur-xl -z-10 opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf8] via-transparent to-transparent z-10 pointer-events-none rounded-b-2xl" />
            <MockupPatients />
          </Reveal>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
            {[
              { val: "10s", label: "pour facturer depuis la fiche" },
              { val: "100%", label: "sécurisé RGPD" },
              { val: "∞", label: "patients & observations" },
            ].map((s, i) => (
              <Reveal key={i} variant="up" delay={i * 100} className="bg-white rounded-2xl p-5 border border-[#f0e6de] shadow-sm">
                <p className="text-3xl font-black text-[#3e2f25]">{s.val}</p>
                <p className="text-xs text-[#7a6a5f] font-bold mt-1">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DEMO ANIMÉE — show don't tell */}
      <div id="demo">
        <AnimatedDemo />
      </div>

      {/* 5. COMMENT ÇA MARCHE */}
      <section className="py-12 md:py-20 bg-[#fdf2e9]/50 border-t border-[#f0e6de]">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <Reveal variant="up" className="text-center mb-10">
            <p className="text-xs font-black text-[#a9825a] uppercase tracking-widest mb-3">Simple comme bonjour</p>
            <h2 className="text-3xl md:text-5xl font-black text-[#3e2f25] tracking-tighter">
              De la séance à l'avis Google <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]">en 3 étapes.</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center relative">
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-[#d4b494]/30 -z-10" />
            {[
              { num: "1", title: "Vous facturez", desc: "En 10 secondes depuis votre téléphone. Formulaire pré-rempli, conforme à votre profession.", color: "bg-[#3e2f25]" },
              { num: "2", title: "Le patient reçoit", desc: "La note d'honoraires arrive par email instantanément, prête pour sa mutuelle.", color: "bg-gradient-to-br from-[#d4b494] to-[#a9825a]" },
              { num: "3", title: "L'avis tombe", desc: "En téléchargeant sa facture, le patient est invité à noter votre cabinet sur Google Maps.", color: "bg-yellow-400" },
            ].map((step, i) => (
              <Reveal key={i} variant="up" delay={i * 120} className="bg-white p-6 md:p-8 rounded-3xl border border-[#f0e6de] shadow-sm relative z-10 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 ${step.color} text-white font-black text-xl flex items-center justify-center rounded-2xl mx-auto mb-5 shadow-lg`}>{step.num}</div>
                <h3 className="font-black text-lg md:text-xl mb-2">{step.title}</h3>
                <p className="text-sm text-[#7a6a5f]">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* 6. AVIS GOOGLE — preuve sociale, émotion */}
      <section id="avis" className="py-16 md:py-24 px-4 md:px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-[#3e2f25] to-black rounded-[32px] md:rounded-[40px] p-8 sm:p-12 md:p-20 text-white flex flex-col lg:flex-row items-center gap-10 md:gap-16 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#a9825a]/20 rounded-full blur-[100px] pointer-events-none" />

          <Reveal variant="left" className="flex-1 space-y-6 text-center lg:text-left relative z-10">
            <div className="flex justify-center lg:justify-start gap-1 text-yellow-400">
              {[1,2,3,4,5].map(s => <Star key={s} fill="currentColor" size={24} />)}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">+300% d'avis Google.</span>
              <br />Sans rien demander.
            </h2>
            <p className="text-gray-300 text-base md:text-lg font-medium leading-relaxed">
              Vos patients téléchargent leur facture pour leur mutuelle. FacturAvis en profite pour les inviter à noter votre cabinet. <strong className="text-white">C'est automatique. Vous ne faites rien.</strong>
            </p>
            <p className="text-[#d4b494] text-xs font-black uppercase tracking-widest">
              100% organique — aucun avis acheté, aucune récompense promise au patient
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/inscription" className="inline-flex items-center gap-2 bg-white text-[#3e2f25] px-6 py-3 rounded-2xl font-black text-sm hover:bg-yellow-50 transition-colors">
                Commencer gratuitement <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          <Reveal variant="right" delay={150} className="flex-1 bg-white/5 backdrop-blur-xl rounded-[24px] p-6 md:p-8 border border-white/10 w-full relative z-10 space-y-4">
            {/* Témoignage */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4b494] to-[#a9825a] flex items-center justify-center font-black text-white text-lg shrink-0">N</div>
              <div>
                <p className="font-black text-white">Nicolas I.</p>
                <p className="text-[11px] text-[#d4b494] font-black uppercase tracking-widest">Ostéopathe D.O.</p>
              </div>
              <div className="ml-auto flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />)}</div>
            </div>
            <p className="text-base italic text-gray-200 leading-relaxed font-medium">
              "J'ai eu 45 avis Google le mois dernier. Avec les nouveaux patients que ça m'attire, le logiciel se paie tout seul."
            </p>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { val: "+300%", label: "d'avis en moy." },
                { val: "4.9★", label: "note moyenne" },
                { val: "10s", label: "pour facturer" },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-white">{s.val}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>


      {/* 6. FONCTIONNALITÉS */}
      <section id="fonctionnalites" className="py-16 md:py-24 bg-white border-t border-[#f0e6de] px-4 md:px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <Reveal variant="up" className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 text-[#3e2f25] tracking-tighter">Un outil. Sept super-pouvoirs.</h2>
            <p className="text-[#7a6a5f] font-bold text-base md:text-lg">Tout ce dont un praticien libéral a besoin, sans le superflu.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CalendarDays, title: "Agenda & RDV en ligne", desc: "Vos patients réservent seuls sur vos créneaux libres, 24h/24, via votre lien ou un widget intégrable à votre site. Motifs personnalisés, rappels 24h avant, reprogrammation, visio, liste d'attente et synchronisation Google/Apple Calendar." },
              { icon: Star, title: "Machine à Avis Google", desc: "Le patient télécharge sa facture pour sa mutuelle = invitation à laisser 5 étoiles. 100% organique, sans contrepartie. +300% d'avis en moyenne." },
              { icon: Zap, title: "Facturation Express", desc: "Factures patients conformes Factur-X en 10 secondes. PDF, email, tout est automatique." },
              { icon: Users, title: "Dossiers Patients & Anamnèse", desc: "Fiches complètes, anamnèse structurée, pièces jointes, séances liées à l'agenda, observations auto-sauvegardées." },
              { icon: Inbox, title: "Réception Fournisseurs", desc: "Factures fournisseurs reçues automatiquement via notre partenaire Plateforme Agréée certifié DGFiP. Conforme 2026." },
              { icon: BarChart3, title: "Dashboard & Analytics", desc: "CA mensuel, taux d'avis, performances en temps réel, multi-cabinets. Export FEC en 1 clic pour votre comptable." },
              { icon: FilePlus, title: "Import de PDF existants", desc: "Vous avez déjà un logiciel ? Importez votre PDF, on gère l'envoi et la récolte d'avis." },
            ].map((feat, i) => (
              <Reveal key={i} variant="up" delay={(i % 3) * 100} className="bg-[#fcfaf8] p-6 md:p-8 rounded-3xl border border-[#f0e6de] hover:border-[#a9825a] hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                <div className="w-14 h-14 bg-white text-[#a9825a] rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm border border-[#f0e6de]">
                  <feat.icon size={26} />
                </div>
                <h3 className="text-xl font-black text-[#3e2f25] mb-2">{feat.title}</h3>
                <p className="text-[#7a6a5f] font-medium leading-relaxed text-sm">{feat.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PRICING */}
      <section id="tarifs" className="py-16 md:py-24 bg-[#fcfaf8] border-t border-[#f0e6de] px-4 md:px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <Reveal variant="up" className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-[#3e2f25] mb-4 tracking-tighter">
              Commencez gratuitement.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Évoluez quand vous êtes prêt.</span>
            </h2>
            <p className="text-[#7a6a5f] text-lg font-medium max-w-2xl mx-auto">
              La réception de factures fournisseurs est gratuite. Pour toujours. Sans carte bancaire.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE */}
            <Reveal variant="left" className="bg-white p-8 md:p-10 rounded-[32px] border-2 border-gray-200 relative">
              <div className="inline-block bg-green-100 text-green-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">Gratuit</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-[#3e2f25]">0€</span>
                <span className="text-[#7a6a5f] font-bold">/mois</span>
              </div>
              <p className="text-sm text-[#7a6a5f] font-medium mb-6">Conforme réforme sept. 2026</p>
              <ul className="space-y-3 mb-8">
                {["Réception factures fournisseurs", "Plateforme Agréée DGFiP incluse", "Classement par catégorie", "Export FEC pour comptable", "Prévisualisation PDF"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-medium text-[#3e2f25]">
                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <Link href="/inscription" className="w-full flex items-center justify-center bg-[#3e2f25] text-white py-4 rounded-2xl font-black text-lg hover:bg-black transition-all">
                S'inscrire gratuitement
              </Link>
              <p className="text-[10px] text-center text-[#7a6a5f] mt-3 font-bold">Sans carte bancaire · Pour toujours</p>
            </Reveal>

            {/* PRO */}
            <Reveal variant="right" delay={150} className="bg-gradient-to-b from-[#fdf2e9] to-white p-8 md:p-10 rounded-[32px] border-2 border-[#a9825a] relative shadow-xl shadow-[#a9825a]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#a9825a] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Le plus populaire</div>
              <div className="inline-block bg-[#a9825a]/10 text-[#a9825a] text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">Pro</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-[#3e2f25]">19€</span>
                <span className="text-[#7a6a5f] font-bold">/mois</span>
              </div>
              <p className="text-sm text-[#7a6a5f] font-medium mb-6">Tout-en-un pour votre cabinet</p>
              <ul className="space-y-3 mb-8">
                {[
                  { text: "Tout le plan Gratuit +", highlight: true },
                  { text: "Agenda + réservation en ligne 24h/24", highlight: false },
                  { text: "Rappels RDV automatiques (anti no-show)", highlight: false },
                  { text: "Facturation patients Factur-X", highlight: false },
                  { text: "Avis Google automatiques (+300%)", highlight: false },
                  { text: "Dossiers patients & anamnèse", highlight: false },
                  { text: "Dashboard, multi-cabinets & relances", highlight: false },
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-2 text-sm ${item.highlight ? 'font-bold text-[#a9825a]' : 'font-medium text-[#3e2f25]'}`}>
                    <CheckCircle2 size={18} className="text-[#a9825a] shrink-0" />{item.text}
                  </li>
                ))}
              </ul>
              <Link href="/inscription" className="w-full flex items-center justify-center bg-gradient-to-r from-[#d4b494] to-[#a9825a] text-white py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-lg shadow-[#a9825a]/20">
                Essai gratuit 14 jours
              </Link>
              <p className="text-[10px] text-center text-[#7a6a5f] mt-3 font-bold">Sans carte bancaire · Annulable à tout moment</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 7bis. COMPARATEUR — l'alternative Doctolib pour les praticiens bien-être */}
      <section id="comparatif" className="py-16 md:py-24 bg-white border-t border-[#f0e6de] px-4 md:px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <Reveal variant="up" className="text-center mb-10">
            <p className="text-xs font-black text-[#a9825a] uppercase tracking-widest mb-3">Exclu de Doctolib depuis 2023 ?</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#3e2f25] tracking-tighter mb-4">
              L&apos;alternative complète.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]">À moitié prix.</span>
            </h2>
            <p className="text-[#7a6a5f] font-medium text-base md:text-lg max-w-2xl mx-auto">
              Doctolib est réservé aux professions RPPS/ADELI. Les alternatives pour praticiens bien-être coûtent 30 à 40€/mois — sans facturation conforme 2026, et sans machine à avis Google.
            </p>
          </Reveal>

          <Reveal variant="zoom" className="overflow-x-auto rounded-3xl border border-[#f0e6de] shadow-sm">
            <table className="w-full min-w-[640px] text-sm bg-white">
              <thead>
                <tr className="border-b border-[#f0e6de]">
                  <th className="text-left p-4 font-black text-[#7a6a5f] text-xs uppercase tracking-widest"></th>
                  <th className="p-4 bg-[#fdf2e9]/60">
                    <span className="block font-black text-[#3e2f25] text-base">FacturAvis</span>
                    <span className="block text-[#a9825a] font-black text-xl mt-1">19€<span className="text-xs font-bold text-[#7a6a5f]">/mois TTC</span></span>
                  </th>
                  <th className="p-4">
                    <span className="block font-bold text-[#7a6a5f]">Crenolibre</span>
                    <span className="block text-[#3e2f25] font-black text-lg mt-1">~36€<span className="text-xs font-medium text-[#7a6a5f]">/mois TTC</span></span>
                  </th>
                  <th className="p-4">
                    <span className="block font-bold text-[#7a6a5f]">Resalib</span>
                    <span className="block text-[#3e2f25] font-black text-lg mt-1">~30€<span className="text-xs font-medium text-[#7a6a5f]">/mois TTC</span></span>
                  </th>
                  <th className="p-4">
                    <span className="block font-bold text-[#7a6a5f]">Therapeutes.com</span>
                    <span className="block text-[#3e2f25] font-black text-lg mt-1">~40€<span className="text-xs font-medium text-[#7a6a5f]">/mois TTC</span></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feat: "Prise de RDV en ligne 24h/24", fa: true, others: [true, true, true] },
                  { feat: "Rappels automatiques anti no-show", fa: true, others: [true, true, true] },
                  { feat: "Avis Google automatiques (+300%)", fa: true, others: [false, false, false] },
                  { feat: "Facturation conforme Factur-X 2026", fa: true, others: [false, false, false] },
                  { feat: "Réception factures fournisseurs (DGFiP)", fa: true, others: [false, false, false] },
                  { feat: "Dossiers patients & anamnèse", fa: true, others: [true, false, false] },
                  { feat: "Consultation en visio", fa: true, others: [true, false, false] },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#f0e6de] last:border-b-0">
                    <td className="p-4 font-bold text-[#3e2f25]">{row.feat}</td>
                    <td className="p-4 text-center bg-[#fdf2e9]/60">
                      <CheckCircle2 size={20} className="text-green-600 inline" />
                    </td>
                    {row.others.map((has, j) => (
                      <td key={j} className="p-4 text-center">
                        {has ? <CheckCircle2 size={20} className="text-gray-300 inline" /> : <X size={20} className="text-red-300 inline" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
          <p className="text-[10px] text-[#7a6a5f] mt-3 text-center font-medium">
            Tarifs publics constatés en juillet 2026 sur les sites des éditeurs (Crenolibre Pro 29,95€ HT, Resalib 29,99€ TTC, Therapeutes.com 39,90€ TTC). Fonctionnalités selon leurs pages tarifs.
          </p>

          <Reveal variant="up" className="text-center mt-8">
            <Link href="/inscription" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#d4b494] to-[#a9825a] text-white px-8 py-4 rounded-2xl font-black text-base hover:opacity-90 transition-all shadow-lg shadow-[#a9825a]/20">
              Essayer FacturAvis gratuitement <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 8. FAQ — juste après le pricing */}
      <section className="py-16 md:py-20 bg-white border-t border-[#f0e6de] px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal variant="up">
            <h2 className="text-3xl md:text-4xl font-black text-center text-[#3e2f25] mb-10 tracking-tight">Questions fréquentes</h2>
          </Reveal>
          <div className="space-y-4">
            {[
              { q: "Est-ce que FacturAvis remplace Doctolib ?", a: "Oui, et il va plus loin. Depuis 2023, Doctolib est réservé aux professions RPPS/ADELI : les praticiens bien-être en sont exclus. FacturAvis vous donne l'agenda avec réservation en ligne par vos patients, les rappels automatiques, les dossiers patients, la facturation conforme 2026 ET les avis Google automatiques — à 19€/mois." },
              { q: "Je suis exonéré de TVA, suis-je concerné par la réforme 2026 ?", a: "Oui, partiellement. Vous n'êtes pas obligé d'émettre des factures électroniques à vos patients. En revanche, vous devez pouvoir recevoir celles de vos fournisseurs dès septembre 2026. FacturAvis vous met en conformité automatiquement et gratuitement." },
              { q: "Puis-je l'utiliser si j'ai déjà un logiciel de facturation ?", a: "Oui ! Importez simplement votre PDF existant sur FacturAvis. On s'occupe de l'envoi au patient et de la récolte d'avis Google. Vous gardez votre logiciel actuel." },
              { q: "Comment FacturAvis génère-t-il des avis Google ?", a: "Quand le patient clique pour télécharger sa facture, FacturAvis l'invite à noter votre cabinet sur Google Maps. Aucune contrepartie n'est offerte : l'invitation est 100% organique, seul le timing (juste après la séance) fait la différence. Résultat : +300% d'avis en moyenne." },
              { q: "C'est vraiment gratuit pour la réception fournisseurs ?", a: "Oui, sans condition et sans limite dans le temps. Pas de carte bancaire demandée. La réception automatique de vos factures fournisseurs via notre Plateforme Agréée DGFiP est 100% gratuite pour toujours." },
              { q: "Comment mes patients réservent-ils un rendez-vous en ligne ?", a: "Vous partagez votre lien de réservation personnel (site, Instagram, WhatsApp...). Le patient choisit un créneau réellement libre selon vos horaires, en cabinet ou en visio. Il reçoit une confirmation avec fichier calendrier, un rappel automatique 24h avant, et peut annuler ou reprogrammer lui-même en ligne." },
              { q: "Puis-je proposer des consultations en visio ?", a: "Oui. Ajoutez votre lien de visioconférence dans vos réglages : vos patients peuvent choisir une consultation à distance lors de la réservation, et le lien leur est envoyé automatiquement par email." },
            ].map((faq, i) => (
              <Reveal key={i} variant="up" delay={Math.min(i, 4) * 60} duration={500} className="p-6 md:p-8 bg-[#fcfaf8] rounded-2xl border border-[#f0e6de] hover:border-[#d4b494] hover:shadow-md transition-all">
                <h3 className="font-black text-base md:text-lg mb-2 text-[#3e2f25]">{faq.q}</h3>
                <p className="text-[#7a6a5f] text-sm md:text-base leading-relaxed font-medium">{faq.a}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CONTACT — renforcé */}
      <section className="py-12 bg-[#3e2f25] border-t border-white/10 px-4 md:px-6">
        <Reveal variant="up" className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5">
            <MessageSquare size={14} /> Réponse en moins de 24h
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            Une question ?<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]">On vous répond personnellement.</span>
          </h2>
          <p className="text-gray-300 text-lg font-medium mb-8">
            Pas un chatbot. Une vraie personne de l'équipe FacturAvis vous lit et vous répond.
          </p>
          <a
            href={`https://wa.me/33609234854?text=${encodeURIComponent("Bonjour, j'ai une question sur FacturAvis ou la réforme 2026/2027.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black px-8 py-4 rounded-2xl text-base transition-all hover:scale-105 shadow-xl shadow-green-500/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Poser ma question sur WhatsApp
          </a>
        </Reveal>
      </section>
      <ContactForm />

      {/* 10. FOOTER CTA */}
      <section className="py-20 md:py-32 text-center px-4 md:px-6 bg-[#fcfaf8] border-t border-[#f0e6de]">
        <Reveal variant="zoom" duration={800} className="max-w-3xl mx-auto">
          <p className="text-xs font-black text-[#a9825a] uppercase tracking-widest mb-4">Rejoignez +340 praticiens</p>
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-[#3e2f25]">Votre cabinet mérite mieux.</h2>
          <p className="text-[#7a6a5f] text-lg md:text-xl mb-10 max-w-xl mx-auto font-medium">
            Déléguez la paperasse, récoltez des avis Google automatiquement et préparez votre cabinet à 2026.
          </p>
          <Link href="/inscription" className="relative inline-flex group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-[#a9825a] rounded-[24px] blur opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse" />
            <button className="relative bg-[#3e2f25] text-white px-10 md:px-14 py-5 md:py-6 rounded-[24px] font-black text-xl md:text-2xl hover:scale-105 transition-transform flex items-center gap-3">
              <Sparkles size={24} className="text-yellow-400" />
              Essai gratuit — Sans CB
            </button>
          </Link>
          <p className="mt-4 text-sm text-[#7a6a5f] font-bold">14 jours offerts · Aucune carte bancaire requise · Annulable en 1 clic</p>
        </Reveal>

        <footer className="mt-24 pt-8 border-t border-[#f0e6de] flex flex-col md:flex-row justify-between items-center gap-6 text-[#7a6a5f] text-[10px] font-black uppercase tracking-widest max-w-7xl mx-auto">
          <p className="text-[10px]">Connecté à une Plateforme Agréée certifiée par la Direction Générale des Finances Publiques (DGFiP)</p>
          <p>&copy; 2026 FacturAvis</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-[#3e2f25] transition-colors">Accès Praticien</Link>
            <Link href="/mentions-legales" className="hover:text-[#3e2f25] transition-colors">Mentions Légales</Link>
            <Link href="/cgv" className="hover:text-[#3e2f25] transition-colors">CGV</Link>
            <Link href="/politique-confidentialite" className="hover:text-[#3e2f25] transition-colors">Confidentialité</Link>
          </div>
        </footer>
      </section>
    </div>
  );
}
