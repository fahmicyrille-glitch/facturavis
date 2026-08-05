'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Calendar, Clock, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface RdvPublicData {
  titre: string;
  date_debut: string;
  date_fin: string;
  statut: 'confirme' | 'en_attente' | 'annule' | 'termine';
  editable: boolean;
  editableReason: string | null;
  deadline: string | null;
  therapeute_nom: string;
}

interface JourCreneaux {
  date: string;
  label: string;
  creneaux: string[];
}

const STATUT_LABELS: Record<RdvPublicData['statut'], string> = {
  confirme: 'Confirmé',
  en_attente: 'En attente',
  annule: 'Annulé',
  termine: 'Terminé',
};

export default function RdvPublicPage() {
  useEffect(() => { document.title = 'Mon rendez-vous — FacturAvis'; }, []);

  const params = useParams();
  const rdvId = params?.id as string;

  const [data, setData] = useState<RdvPublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<'view' | 'reprogrammer' | 'annuler-confirm'>('view');
  const [submitting, setSubmitting] = useState(false);
  const [actionResult, setActionResult] = useState<'annule' | 'reprogramme' | null>(null);
  const [formError, setFormError] = useState('');

  const [jours, setJours] = useState<JourCreneaux[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [openDates, setOpenDates] = useState<Set<string>>(new Set());
  const [pendingSlot, setPendingSlot] = useState<{ date: string; heure: string } | null>(null);

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualDate, setManualDate] = useState('');
  const [manualHeure, setManualHeure] = useState('');

  useEffect(() => {
    if (!rdvId) return;
    fetch(`/api/rdv/public?id=${rdvId}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Erreur');
        setData(json);
      })
      .catch((err) => setError(err.message || 'Rendez-vous introuvable'))
      .finally(() => setLoading(false));
  }, [rdvId]);

  const openReprogrammer = () => {
    setMode('reprogrammer');
    if (jours !== null) return;
    setSlotsLoading(true);
    fetch(`/api/rdv/public/slots?id=${rdvId}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Erreur');
        setJours(json.jours);
        if (json.jours[0]) setOpenDates(new Set([json.jours[0].date]));
      })
      .catch((err) => setFormError(err.message || 'Impossible de charger les créneaux disponibles'))
      .finally(() => setSlotsLoading(false));
  };

  const toggleDate = (date: string) => {
    setOpenDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date); else next.add(date);
      return next;
    });
  };

  const handleCancel = async () => {
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch('/api/rdv/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rdvId, action: 'annuler' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setActionResult('annule');
    } catch (err: any) {
      setFormError(err.message || "Erreur lors de l'annulation");
    } finally {
      setSubmitting(false);
    }
  };

  const submitReschedule = async (date: string, heure: string) => {
    setPendingSlot({ date, heure });
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch('/api/rdv/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rdvId, action: 'reprogrammer', date, heureDebut: heure }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setActionResult('reprogramme');
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la reprogrammation');
    } finally {
      setSubmitting(false);
      setPendingSlot(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4f1] text-[#7a6a5f]">
      <Loader2 className="animate-spin mr-2" size={32} /> Chargement de votre rendez-vous...
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4f1]">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center max-w-md w-full mx-4">
        <h1 className="text-xl font-bold text-red-600 mb-2">Oups !</h1>
        <p className="text-gray-600">{error || 'Rendez-vous introuvable.'}</p>
      </div>
    </div>
  );

  const start = new Date(data.date_debut);
  const dateLabel = start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const heureLabel = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#f7f4f1] flex items-center justify-center p-4">
      <div className={`bg-white w-full rounded-2xl shadow-xl p-8 sm:p-10 text-center ${mode === 'reprogrammer' ? 'max-w-lg' : 'max-w-md'}`}>

        {actionResult === 'annule' ? (
          <div className="py-4">
            <XCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-[#3e2f25] mb-2">Rendez-vous annulé</h1>
            <p className="text-[#7a6a5f]">Votre praticien a été prévenu. À bientôt !</p>
          </div>
        ) : actionResult === 'reprogramme' ? (
          <div className="py-4">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-[#3e2f25] mb-2">Rendez-vous reprogrammé</h1>
            <p className="text-[#7a6a5f]">Votre praticien a été prévenu du changement.</p>
          </div>
        ) : (
          <>
            {mode !== 'reprogrammer' && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="bg-[#fdf2e9] p-6 rounded-full">
                    <Calendar size={40} className="text-[#a9825a]" />
                  </div>
                </div>

                <h1 className="text-2xl font-extrabold text-[#3e2f25] mb-1">{data.titre}</h1>
                {data.therapeute_nom && <p className="text-[#7a6a5f] mb-6">avec {data.therapeute_nom}</p>}

                <div className="bg-[#fdfaf8] border border-[#f0e6de] rounded-xl p-5 mb-6 text-left">
                  <p className="flex items-center gap-2 text-[#3e2f25] font-bold capitalize mb-1"><Calendar size={16} className="text-[#a9825a]" /> {dateLabel}</p>
                  <p className="flex items-center gap-2 text-[#3e2f25] font-bold"><Clock size={16} className="text-[#a9825a]" /> {heureLabel}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-3">{STATUT_LABELS[data.statut]}</p>
                </div>
              </>
            )}

            {!data.editable ? (
              <p className="text-sm text-gray-500 italic">{data.editableReason || 'Ce rendez-vous ne peut plus être modifié en ligne.'}</p>
            ) : mode === 'view' ? (
              <div className="flex flex-col gap-3">
                {data.deadline && (
                  <p className="text-xs text-gray-400 text-center -mb-1">
                    Modifiable en ligne jusqu&apos;au{' '}
                    <span className="font-bold text-gray-500">
                      {new Date(data.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à {new Date(data.deadline).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                )}
                <button
                  onClick={openReprogrammer}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold bg-[#a9825a] hover:bg-[#8b6a48] transition-colors"
                >
                  <RefreshCw size={18} /> Changer la date
                </button>
                <button
                  onClick={() => setMode('annuler-confirm')}
                  className="w-full py-3 px-4 rounded-xl text-red-600 font-bold border border-red-200 hover:bg-red-50 transition-colors"
                >
                  Annuler mon rendez-vous
                </button>
              </div>
            ) : mode === 'annuler-confirm' ? (
              <div className="text-left">
                <p className="text-sm text-gray-600 mb-4 text-center">Confirmez-vous l&apos;annulation de ce rendez-vous ?</p>
                {formError && <p className="text-sm text-red-600 mb-3 text-center">{formError}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setMode('view')} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                    Retour
                  </button>
                  <button onClick={handleCancel} disabled={submitting} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirmer'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-left">
                <button onClick={() => { setMode('view'); setFormError(''); }} className="text-sm text-[#a9825a] font-bold mb-4 hover:underline">
                  ← Étape précédente
                </button>
                <h2 className="text-lg font-extrabold text-[#3e2f25] mb-4">Choisissez la date de consultation</h2>

                {slotsLoading ? (
                  <div className="flex items-center justify-center py-10 text-[#7a6a5f]">
                    <Loader2 className="animate-spin mr-2" size={24} /> Recherche des créneaux disponibles...
                  </div>
                ) : jours && jours.length > 0 ? (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {jours.map((jour) => {
                      const isOpen = openDates.has(jour.date);
                      return (
                        <div key={jour.date} className="border border-[#f0e6de] rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleDate(jour.date)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-[#fdfaf8] hover:bg-[#fdf2e9] transition-colors"
                          >
                            <span className="font-bold text-[#3e2f25] capitalize text-sm">{jour.label}</span>
                            {isOpen ? <ChevronUp size={18} className="text-[#a9825a]" /> : <ChevronDown size={18} className="text-[#a9825a]" />}
                          </button>
                          {isOpen && (
                            <div className="flex flex-wrap gap-2 p-4 border-t border-[#f0e6de]">
                              {jour.creneaux.map((heure) => {
                                const isPending = pendingSlot?.date === jour.date && pendingSlot?.heure === heure;
                                return (
                                  <button
                                    key={heure}
                                    disabled={submitting}
                                    onClick={() => submitReschedule(jour.date, heure)}
                                    className="px-4 py-2 rounded-lg bg-[#fdf2e9] text-[#8b6a48] font-bold text-sm hover:bg-[#f0e0cc] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                  >
                                    {isPending && <Loader2 size={12} className="animate-spin" />}
                                    {heure}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic py-4 text-center">Aucun créneau disponible prochainement.</p>
                )}

                {formError && <p className="text-sm text-red-600 text-center mt-3">{formError}</p>}

                {!showManualForm ? (
                  <button onClick={() => setShowManualForm(true)} className="text-xs text-gray-400 hover:text-[#a9825a] mt-4 underline">
                    Aucun créneau ne convient ? Proposer un autre horaire
                  </button>
                ) : (
                  <div className="mt-4 pt-4 border-t border-[#f0e6de] space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Date souhaitée</label>
                      <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Heure souhaitée</label>
                      <input type="time" value={manualHeure} onChange={(e) => setManualHeure(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 outline-none text-sm" />
                    </div>
                    <button
                      onClick={() => {
                        if (!manualDate || !manualHeure) { setFormError('Merci de renseigner la date et l\'heure.'); return; }
                        submitReschedule(manualDate, manualHeure);
                      }}
                      disabled={submitting}
                      className="w-full py-2.5 bg-[#a9825a] hover:bg-[#8b6a48] text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Proposer cet horaire'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
