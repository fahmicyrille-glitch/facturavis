'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Calendar, CheckCircle, ChevronDown, ChevronUp, Clock, MapPin, Video, Bell, ArrowLeft } from 'lucide-react';
import { useIframeEmbed } from '@/lib/use-iframe-embed';

interface JourCreneaux {
  date: string;
  label: string;
  creneaux: string[];
}

interface MotifOption {
  id: string | null;
  nom: string;
  dureeMinutes: number;
}

interface PraticienInfo {
  nom: string;
  titre: string;
  logo_url: string;
  adresse: string;
  bio: string;
  visioDisponible: boolean;
  delaiAnnulationHeures: number;
  motifs: MotifOption[];
}

export default function ReserverPage() {
  useEffect(() => { document.title = 'Prendre rendez-vous — FacturAvis'; }, []);
  // Intégrée dans un <iframe> sur le site du praticien : pas de hauteur plein écran forcée,
  // et on signale la vraie hauteur du contenu au site parent pour un cadre auto-ajusté.
  const isEmbedded = useIframeEmbed();
  const screenBase = isEmbedded ? '' : 'min-h-screen ';

  const params = useParams();
  const praticienId = params?.id as string;

  const [info, setInfo] = useState<PraticienInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Motif choisi par le patient — détermine la durée, donc les créneaux proposés ensuite
  const [selectedMotif, setSelectedMotif] = useState<MotifOption | null>(null);
  const [jours, setJours] = useState<JourCreneaux[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  const [openDates, setOpenDates] = useState<Set<string>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; heure: string; label: string } | null>(null);
  const [mode, setMode] = useState<'cabinet' | 'visio'>('cabinet');

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [precisions, setPrecisions] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState<'reserve' | 'attente' | null>(null);
  const [showWaitlist, setShowWaitlist] = useState(false);

  useEffect(() => {
    if (!praticienId) return;
    fetch(`/api/reserver?praticien=${praticienId}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Erreur');
        setInfo(json);
        // Praticien sans motif configuré : un seul motif générique implicite (id null) —
        // on saute l'étape de sélection pour ne pas ajouter un clic inutile.
        if (json.motifs?.length === 1 && json.motifs[0].id === null) {
          chooseMotif(json.motifs[0], praticienId);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Praticien introuvable'))
      .finally(() => setLoading(false));
  }, [praticienId]);

  const chooseMotif = (motif: MotifOption, praticien: string) => {
    setSelectedMotif(motif);
    setJours(null);
    setSlotsError('');
    setSlotsLoading(true);
    const qs = motif.id ? `&motifId=${encodeURIComponent(motif.id)}` : '';
    fetch(`/api/reserver/slots?praticien=${praticien}${qs}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Erreur');
        setJours(json.jours);
        if (json.jours?.[0]) setOpenDates(new Set([json.jours[0].date]));
      })
      .catch((err) => setSlotsError(err.message || 'Impossible de charger les créneaux disponibles'))
      .finally(() => setSlotsLoading(false));
  };

  const toggleDate = (date: string) => {
    setOpenDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date); else next.add(date);
      return next;
    });
  };

  const validateContact = (): boolean => {
    if (!nom.trim()) { setFormError('Merci de renseigner votre nom.'); return false; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setFormError('Merci de renseigner un email valide.'); return false; }
    setFormError('');
    return true;
  };

  const handleReserver = async () => {
    if (!selectedSlot || !validateContact()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reserver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          praticienId,
          action: 'reserver',
          nom: nom.trim(),
          email: email.trim(),
          telephone: telephone.trim(),
          date: selectedSlot.date,
          heure: selectedSlot.heure,
          mode,
          motifId: selectedMotif?.id || undefined,
          precisions: precisions.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setDone('reserve');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttente = async () => {
    if (!validateContact()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reserver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ praticienId, action: 'attente', nom: nom.trim(), email: email.trim(), telephone: telephone.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setDone('attente');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className={`${screenBase}flex items-center justify-center bg-[#f7f4f1] text-[#7a6a5f] py-16`}>
      <Loader2 className="animate-spin mr-2" size={32} /> Chargement des disponibilités...
    </div>
  );

  if (error || !info) return (
    <div className={`${screenBase}flex items-center justify-center bg-[#f7f4f1] py-16`}>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center max-w-md w-full mx-4">
        <h1 className="text-xl font-bold text-red-600 mb-2">Oups !</h1>
        <p className="text-gray-600">{error || 'Praticien introuvable.'}</p>
      </div>
    </div>
  );

  if (done === 'reserve') return (
    <div className={`${screenBase}flex items-center justify-center bg-[#f7f4f1] p-4 py-16`}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 sm:p-10 text-center">
        <CheckCircle size={56} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-2xl font-extrabold text-[#3e2f25] mb-2">Rendez-vous confirmé !</h1>
        <p className="text-[#7a6a5f] leading-relaxed">
          Vous allez recevoir un email de confirmation avec tous les détails{mode === 'visio' ? ' et le lien de visioconférence' : ''}.
          Vous pourrez modifier ou annuler votre rendez-vous depuis cet email.
        </p>
      </div>
    </div>
  );

  if (done === 'attente') return (
    <div className={`${screenBase}flex items-center justify-center bg-[#f7f4f1] p-4 py-16`}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 sm:p-10 text-center">
        <Bell size={56} className="mx-auto text-[#a9825a] mb-4" />
        <h1 className="text-2xl font-extrabold text-[#3e2f25] mb-2">Vous êtes sur la liste !</h1>
        <p className="text-[#7a6a5f] leading-relaxed">
          Dès qu&apos;un créneau se libère chez {info.nom}, vous recevrez un email pour réserver en priorité.
        </p>
      </div>
    </div>
  );

  // Étape 0 : choix du motif de consultation (uniquement si le praticien en a configuré plusieurs)
  const showMotifStep = !selectedMotif;

  return (
    <div className={`${screenBase}bg-[#f7f4f1] py-8 px-4`}>
      <div className="max-w-lg mx-auto">

        {/* En-tête praticien */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0e6de] p-6 mb-4">
          <div className="flex items-center gap-4">
            {info.logo_url ? (
              <Image src={info.logo_url} alt={info.nom} width={64} height={64} unoptimized
                className="w-16 h-16 rounded-full object-contain border border-gray-100 bg-white shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#fdf2e9] flex items-center justify-center shrink-0">
                <Calendar size={28} className="text-[#a9825a]" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-extrabold text-[#3e2f25]">{info.nom}</h1>
              {info.titre && <p className="text-sm text-[#a9825a] font-bold">{info.titre}</p>}
              {selectedMotif && (
                <p className="text-xs text-[#7a6a5f] mt-1 flex items-center gap-1">
                  <Clock size={12} /> {selectedMotif.nom} · {selectedMotif.dureeMinutes} min
                </p>
              )}
            </div>
          </div>

          {info.bio && (
            <p className="text-sm text-[#5d4a3e] leading-relaxed mt-4 pt-4 border-t border-[#f0e6de]">{info.bio}</p>
          )}

          {info.adresse && (
            <div className={`flex items-start gap-2 text-sm text-[#7a6a5f] ${info.bio ? 'mt-2' : 'mt-4 pt-4 border-t border-[#f0e6de]'}`}>
              <MapPin size={15} className="text-[#a9825a] shrink-0 mt-0.5" />
              <span className="flex-1">{info.adresse}</span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.adresse)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#a9825a] hover:underline whitespace-nowrap shrink-0"
              >
                Voir la carte
              </a>
            </div>
          )}
        </div>

        {showMotifStep ? (
          /* Étape 1 : motif de consultation */
          <>
            <h2 className="text-lg font-extrabold text-[#3e2f25] mb-3 px-1">Motif de consultation</h2>
            <div className="space-y-2.5">
              {info.motifs.map((motif) => (
                <button
                  key={motif.id ?? 'default'}
                  onClick={() => chooseMotif(motif, praticienId)}
                  className="w-full flex items-center justify-between bg-white border border-[#f0e6de] rounded-2xl px-5 py-4 shadow-sm hover:border-[#a9825a] hover:shadow-md transition-all text-left"
                >
                  <span className="font-bold text-[#3e2f25] text-sm">{motif.nom}</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#a9825a] bg-[#fdf2e9] px-3 py-1.5 rounded-full shrink-0 ml-3">
                    <Clock size={12} /> {motif.dureeMinutes} min
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Retour au choix du motif, uniquement si plusieurs motifs existent */}
            {info.motifs.length > 1 && (
              <button
                onClick={() => { setSelectedMotif(null); setJours(null); setSelectedSlot(null); setFormError(''); }}
                className="text-sm text-[#a9825a] font-bold mb-3 hover:underline flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Changer de motif
              </button>
            )}

            {/* Mode cabinet / visio */}
            {info.visioDisponible && !selectedSlot && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#f0e6de] p-4 mb-4 flex gap-2">
                <button
                  onClick={() => setMode('cabinet')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${mode === 'cabinet' ? 'bg-[#3e2f25] text-white' : 'bg-[#fdfaf8] text-[#7a6a5f] hover:bg-[#fdf2e9]'}`}
                >
                  <MapPin size={16} /> Au cabinet
                </button>
                <button
                  onClick={() => setMode('visio')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${mode === 'visio' ? 'bg-[#3e2f25] text-white' : 'bg-[#fdfaf8] text-[#7a6a5f] hover:bg-[#fdf2e9]'}`}
                >
                  <Video size={16} /> En visio
                </button>
              </div>
            )}

            {!selectedSlot ? (
              <>
                <h2 className="text-lg font-extrabold text-[#3e2f25] mb-3 px-1">Choisissez la date de consultation</h2>

                {slotsLoading ? (
                  <div className="flex items-center justify-center py-10 text-[#7a6a5f]">
                    <Loader2 className="animate-spin mr-2" size={24} /> Recherche des créneaux disponibles...
                  </div>
                ) : slotsError ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 text-center">
                    <p className="text-sm text-red-600">{slotsError}</p>
                  </div>
                ) : !jours || jours.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-[#f0e6de] p-6 text-center">
                    <p className="text-sm text-gray-500 italic">Aucun créneau disponible pour le moment.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jours.map((jour) => {
                      const isOpen = openDates.has(jour.date);
                      return (
                        <div key={jour.date} className="bg-white border border-[#f0e6de] rounded-2xl overflow-hidden shadow-sm">
                          <button
                            onClick={() => toggleDate(jour.date)}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#fdfaf8] transition-colors"
                          >
                            <span className="font-bold text-[#3e2f25] capitalize text-sm">{jour.label}</span>
                            {isOpen ? <ChevronUp size={18} className="text-[#a9825a]" /> : <ChevronDown size={18} className="text-[#a9825a]" />}
                          </button>
                          {isOpen && (
                            <div className="flex flex-wrap gap-2 p-4 border-t border-[#f0e6de]">
                              {jour.creneaux.map((heure) => (
                                <button
                                  key={heure}
                                  onClick={() => setSelectedSlot({ date: jour.date, heure, label: jour.label })}
                                  className="px-4 py-2 rounded-lg bg-[#fdf2e9] text-[#8b6a48] font-bold text-sm hover:bg-[#f0e0cc] transition-colors"
                                >
                                  {heure}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Liste d'attente */}
                <div className="mt-6 text-center">
                  {!showWaitlist ? (
                    <button onClick={() => setShowWaitlist(true)} className="text-sm text-[#a9825a] font-bold hover:underline">
                      🔔 Aucun créneau ne convient ? Être alerté(e) dès qu&apos;une place se libère
                    </button>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#f0e6de] p-5 text-left space-y-3">
                      <p className="text-sm font-bold text-[#3e2f25] flex items-center gap-2"><Bell size={16} className="text-[#a9825a]" /> Liste d&apos;attente</p>
                      <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Votre nom"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm" />
                      {formError && <p className="text-sm text-red-600">{formError}</p>}
                      <button onClick={handleAttente} disabled={submitting}
                        className="w-full py-2.5 bg-[#a9825a] hover:bg-[#8b6a48] text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : 'M\'alerter par email'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Formulaire de confirmation */
              <div className="bg-white rounded-2xl shadow-sm border border-[#f0e6de] p-6">
                <button onClick={() => { setSelectedSlot(null); setFormError(''); }} className="text-sm text-[#a9825a] font-bold mb-4 hover:underline">
                  ← Choisir un autre créneau
                </button>

                <div className="bg-[#fdfaf8] border border-[#f0e6de] rounded-xl p-4 mb-5 text-center">
                  <p className="text-sm font-bold text-[#3e2f25] capitalize">📅 {selectedSlot.label} à {selectedSlot.heure}</p>
                  <p className="text-xs text-[#7a6a5f] mt-1">
                    {selectedMotif?.nom} · {mode === 'visio' ? '💻 En visioconférence' : '🏥 Au cabinet'} · {selectedMotif?.dureeMinutes} min
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Votre nom *</label>
                    <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Prénom Nom"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Votre email *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@email.fr"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Téléphone</label>
                    <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="06 00 00 00 00"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Un détail à préciser ? (optionnel)</label>
                    <textarea value={precisions} onChange={(e) => setPrecisions(e.target.value)} rows={2} placeholder="Ex : douleur au dos depuis 3 jours..."
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm resize-none" />
                  </div>

                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium">{formError}</div>
                  )}

                  <button onClick={handleReserver} disabled={submitting}
                    className="w-full py-3.5 bg-[#a9825a] hover:bg-[#8b6a48] text-white font-black rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base">
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirmer mon rendez-vous'}
                  </button>
                  <p className="text-[11px] text-gray-400 text-center">
                    {info.delaiAnnulationHeures > 0
                      ? `Vous recevrez une confirmation par email. Vous pourrez modifier ou annuler en ligne jusqu'à ${info.delaiAnnulationHeures}h avant le rendez-vous.`
                      : "Vous recevrez une confirmation par email, avec la possibilité de modifier ou d'annuler en ligne."}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-center text-[11px] text-gray-400 mt-8">
          Prise de rendez-vous sécurisée via <Link href="/" className="text-[#a9825a] font-bold hover:underline">FacturAvis</Link>
        </p>
      </div>
    </div>
  );
}
