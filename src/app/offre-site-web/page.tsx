'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, CheckCircle2, Globe, CalendarDays, Star, FileText,
  Loader2, Sparkles, Palette, Smartphone, Search,
} from 'lucide-react';

const PROFESSIONS = [
  'Ostéopathe', 'Psychologue', 'Chiropracteur', 'Sophrologue', 'Naturopathe',
  'Réflexologue', 'Hypnothérapeute', 'Diététicien(ne)', 'Psychothérapeute',
  'Kinésiologue', 'Autre',
];

export default function OffreSiteWebPage() {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [profession, setProfession] = useState('');
  const [siteActuel, setSiteActuel] = useState('');
  const [precisions, setPrecisions] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!prenom.trim() || !nom.trim()) { setErrorMsg('Merci de renseigner votre prénom et nom.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setErrorMsg('Merci de renseigner un email valide.'); return; }
    if (!profession) { setErrorMsg('Merci de sélectionner votre profession.'); return; }

    setSubmitting(true);
    try {
      const message = [
        'Demande via la page "Outil + Site Web" (39€/mois + 199€ de création unique).',
        `Profession : ${profession}`,
        `Site web actuel : ${siteActuel || 'non précisé'}`,
        precisions.trim() ? `\nPrécisions du praticien :\n${precisions.trim()}` : '',
      ].join('\n');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${prenom.trim()} ${nom.trim()}`,
          email: email.trim(),
          phone: telephone.trim(),
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'envoi.');
      setSent(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#3e2f25] font-sans selection:bg-[#a9825a] selection:text-white overflow-x-clip">
      {/* HEADER */}
      <header className="w-full p-4 md:p-6 flex justify-between items-center max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4b494] to-[#a9825a] rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-500" />
            <Image src="/logo/logo.png" alt="Logo FacturAvis" width={40} height={40} className="relative w-9 h-9 object-contain rounded-xl shadow-sm" />
          </div>
          <span className="text-lg font-black tracking-tighter">FacturAvis</span>
        </Link>
        <Link href="/" className="text-xs md:text-sm font-bold text-[#7a6a5f] hover:text-[#3e2f25] transition-all flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#f0e6de] shadow-sm">
          <ArrowRight size={14} className="rotate-180" /> Retour
        </Link>
      </header>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 pt-8 md:pt-14 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fdf2e9] border border-[#d4b494]/30 text-[#a9825a] text-[10px] md:text-xs font-black uppercase tracking-widest mb-6">
          <Globe size={13} /> Offre Outil + Site Web
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-5 leading-[1.08]">
          Votre cabinet, en ligne.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]">Sans rien construire vous-même.</span>
        </h1>
        <p className="text-base md:text-lg text-[#7a6a5f] font-medium max-w-2xl mx-auto leading-relaxed">
          FacturAvis s&apos;occupe de votre agenda, de vos factures et de vos avis Google. On y ajoute un vrai site web professionnel, construit pour votre cabinet — vous n&apos;avez rien à faire.
        </p>
      </section>

      {/* CE QUI EST INCLUS */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-[#f0e6de] p-7 md:p-8 shadow-sm">
            <div className="w-12 h-12 bg-[#fdf2e9] text-[#a9825a] rounded-2xl flex items-center justify-center mb-4">
              <CalendarDays size={24} />
            </div>
            <h2 className="font-black text-xl mb-4">L&apos;outil FacturAvis Pro</h2>
            <ul className="space-y-3">
              {[
                'Agenda avec réservation en ligne 24h/24',
                'Rappels automatiques anti no-show',
                'Facturation patients conforme Factur-X en 10 secondes',
                'Avis Google automatiques (+300% en moyenne)',
                'Dossiers patients & anamnèse',
                'Réception gratuite des factures fournisseurs (réforme 2026)',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-[#3e2f25]">
                  <CheckCircle2 size={17} className="text-[#a9825a] shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-[#f0e6de] p-7 md:p-8 shadow-sm">
            <div className="w-12 h-12 bg-[#fdf2e9] text-[#a9825a] rounded-2xl flex items-center justify-center mb-4">
              <Globe size={24} />
            </div>
            <h2 className="font-black text-xl mb-4">Votre site web dédié</h2>
            <ul className="space-y-3">
              {[
                { icon: Palette, text: 'Design sur-mesure pour votre cabinet, pas un template générique' },
                { icon: FileText, text: 'Présentation de votre pratique, vos tarifs, votre parcours' },
                { icon: CalendarDays, text: 'Bouton de réservation directement relié à votre agenda FacturAvis' },
                { icon: Smartphone, text: 'Adapté mobile et tablette' },
                { icon: Search, text: 'Optimisé pour apparaître sur Google (nom, ville, spécialité)' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-[#3e2f25]">
                  <item.icon size={17} className="text-[#a9825a] shrink-0 mt-0.5" /> {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PRIX */}
      <section className="max-w-2xl mx-auto px-4 md:px-6 pb-12 md:pb-16">
        <div className="bg-gradient-to-b from-[#fdf2e9] to-white rounded-[32px] border-2 border-[#a9825a] shadow-xl shadow-[#a9825a]/10 p-8 md:p-10 text-center">
          <p className="text-xs font-black text-[#a9825a] uppercase tracking-widest mb-4">Tarif</p>
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className="text-5xl md:text-6xl font-black">39€</span>
            <span className="text-[#7a6a5f] font-bold">/mois</span>
          </div>
          <p className="text-sm text-[#7a6a5f] font-medium mb-6">+ 199€ de création unique de votre site (un seul paiement, au démarrage)</p>
          <p className="text-xs text-[#7a6a5f] max-w-md mx-auto leading-relaxed mb-6">
            Un site vitrine professionnel construit sur-mesure coûte en général plusieurs centaines d&apos;euros chez une agence, avant même de compter l&apos;outil de gestion de cabinet. Ici, les deux sont réunis.
          </p>
          <a href="#demande" className="inline-flex items-center gap-2 bg-[#3e2f25] hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-base transition-all hover:scale-105">
            Être recontacté <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* FORMULAIRE */}
      <section id="demande" className="max-w-xl mx-auto px-4 md:px-6 pb-20 scroll-mt-10">
        <div className="bg-white rounded-[32px] border border-[#f0e6de] shadow-xl p-7 md:p-10">
          {sent ? (
            <div className="text-center py-8">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
              <h3 className="font-black text-xl mb-2">Demande envoyée !</h3>
              <p className="text-sm text-[#7a6a5f]">On revient vers vous personnellement sous 24h pour parler de votre cabinet et démarrer votre site.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="font-black text-2xl mb-2 flex items-center justify-center gap-2">
                  <Sparkles size={20} className="text-[#a9825a]" /> Être recontacté
                </h2>
                <p className="text-sm text-[#7a6a5f]">Décrivez votre cabinet, on revient vers vous personnellement — pas de paiement à cette étape.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Prénom *</label>
                    <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Nom *</label>
                    <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Téléphone</label>
                  <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Profession *</label>
                  <select value={profession} onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm">
                    <option value="">Sélectionnez...</option>
                    {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Avez-vous déjà un site web ?</label>
                  <select value={siteActuel} onChange={(e) => setSiteActuel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm">
                    <option value="">Sélectionnez...</option>
                    <option value="Non, aucun">Non, aucun</option>
                    <option value="Oui, mais je veux le refaire">Oui, mais je veux le refaire</option>
                    <option value="Oui, et je le garde">Oui, et je le garde</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Précisions (optionnel)</label>
                  <textarea value={precisions} onChange={(e) => setPrecisions(e.target.value)} rows={3}
                    placeholder="Votre cabinet, votre ville, ce que vous aimeriez sur votre site..."
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm resize-none" />
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium">{errorMsg}</div>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full py-3.5 bg-[#a9825a] hover:bg-[#8b6a48] text-white font-black rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <>Envoyer ma demande <ArrowRight size={16} /></>}
                </button>
                <p className="text-[11px] text-gray-400 text-center">Réponse personnelle sous 24h. Aucun paiement à cette étape.</p>
              </form>
            </>
          )}
        </div>
      </section>

      <footer className="text-center pb-10 text-[10px] font-black uppercase tracking-widest text-[#7a6a5f]">
        <Star size={12} className="inline mr-1 text-[#a9825a]" /> Un outil FacturAvis
      </footer>
    </div>
  );
}
