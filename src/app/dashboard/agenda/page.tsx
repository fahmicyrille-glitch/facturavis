'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ArrowRight, Plus, CalendarDays, Calendar as CalendarIcon, Share2, CalendarOff } from 'lucide-react';
import Link from 'next/link';
import { usePlan } from '@/hooks/usePlan';
import UpgradePrompt from '@/components/UpgradePrompt';
import type { RendezVous, MotifConsultation } from '@/lib/types';
import CalendarGrid from '@/components/agenda/CalendarGrid';
import MonthGrid from '@/components/agenda/MonthGrid';
import RdvModal, { type RdvDraft } from '@/components/agenda/RdvModal';
import AbsenceModal from '@/components/agenda/AbsenceModal';

interface PatientMin { id: string; nom_complet: string; email?: string; telephone?: string; }
interface CabinetMin { id: string; nom: string; }

type ViewMode = 'mois' | 'semaine' | 'jour';

const formatLocalYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatHM = (date: Date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

function getWeekDays(anchor: Date): Date[] {
  const day = anchor.getDay(); // 0 = dimanche
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function AgendaPage() {
  useEffect(() => { document.title = 'Agenda — FacturAvis'; }, []);

  const router = useRouter();
  const { isPro, daysLeft, hasUsedTrial, loading: planLoading } = usePlan();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [patients, setPatients] = useState<PatientMin[]>([]);
  const [cabinets, setCabinets] = useState<CabinetMin[]>([]);
  const [motifs, setMotifs] = useState<MotifConsultation[]>([]);
  const [visioUrl, setVisioUrl] = useState('');

  const [view, setView] = useState<ViewMode>('semaine');
  const [anchorDate, setAnchorDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<RdvDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async (uid: string) => {
    const [{ data: rdvData, error: rdvError }, { data: patData }, { data: cabData }, { data: therData }, { data: motifData }] = await Promise.all([
      supabase.from('rendez_vous').select('*').eq('therapeute_id', uid).order('date_debut'),
      supabase.from('patients').select('id, nom_complet, email, telephone').eq('therapeute_id', uid).order('nom_complet'),
      supabase.from('cabinets').select('id, nom').eq('therapeute_id', uid),
      supabase.from('therapeutes').select('visio_url').eq('id', uid).single(),
      supabase.from('motifs_consultation').select('*').eq('therapeute_id', uid).eq('actif', true).order('ordre'),
    ]);
    if (rdvError) { console.error('Erreur Agenda:', rdvError); showToast("Erreur lors du chargement de l'agenda", 'error'); }
    else if (rdvData) setRendezVous(rdvData);
    if (patData) setPatients(patData);
    if (cabData) setCabinets(cabData);
    if (therData?.visio_url) setVisioUrl(therData.visio_url);
    if (motifData) setMotifs(motifData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }
      setUserId(session.user.id);
      await fetchAll(session.user.id);
    };
    init();
  }, [router, fetchAll]);

  // Synchronisation temps réel : reflète les changements faits ailleurs
  // (patient qui annule/reprogramme depuis son email, autre onglet, etc.)
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`rdv-realtime-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rendez_vous', filter: `therapeute_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const rdv = payload.new as RendezVous;
            setRendezVous((prev) => (prev.some((r) => r.id === rdv.id) ? prev : [...prev, rdv]));
          } else if (payload.eventType === 'UPDATE') {
            const rdv = payload.new as RendezVous;
            setRendezVous((prev) => prev.map((r) => (r.id === rdv.id ? rdv : r)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as { id?: string }).id;
            if (oldId) setRendezVous((prev) => prev.filter((r) => r.id !== oldId));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const days = view === 'semaine' ? getWeekDays(anchorDate) : [anchorDate];

  const navigate = (delta: number) => {
    const next = new Date(anchorDate);
    if (view === 'mois') next.setMonth(anchorDate.getMonth() + delta);
    else next.setDate(anchorDate.getDate() + delta * (view === 'semaine' ? 7 : 1));
    setAnchorDate(next);
  };

  const openCreateModal = (day: Date, hour: number) => {
    setDraft({
      patient_id: '',
      cabinet_id: cabinets[0]?.id || '',
      titre: 'Consultation',
      date: formatLocalYYYYMMDD(day),
      heureDebut: `${String(hour).padStart(2, '0')}:00`,
      heureFin: `${String(hour + 1).padStart(2, '0')}:00`,
      statut: 'confirme',
      notes: '',
      email: '',
      telephone: '',
      mode: 'cabinet',
      patientNom: '',
      dateNaissance: '',
      motif_id: null,
      type: 'consultation',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rdv: RendezVous) => {
    const start = new Date(rdv.date_debut);
    const end = new Date(rdv.date_fin);
    setDraft({
      id: rdv.id,
      patient_id: rdv.patient_id || '',
      cabinet_id: rdv.cabinet_id || cabinets[0]?.id || '',
      titre: rdv.titre,
      date: formatLocalYYYYMMDD(start),
      heureDebut: formatHM(start),
      heureFin: formatHM(end),
      statut: rdv.statut,
      notes: rdv.notes,
      email: rdv.patient_email || '',
      telephone: rdv.patient_telephone || '',
      mode: rdv.mode || 'cabinet',
      patientNom: patients.find((p) => p.id === rdv.patient_id)?.nom_complet || rdv.patient_nom || '',
      dateNaissance: '',
      motif_id: rdv.motif_id || null,
      type: rdv.type || 'consultation',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setDraft(null); };

  const syncSeance = async (rdvId: string, patientId: string, date: string, notes: string) => {
    if (!userId) return;
    const { data: existing } = await supabase.from('consultations').select('id').eq('rendez_vous_id', rdvId).maybeSingle();

    if (existing) {
      await supabase.from('consultations').update({ patient_id: patientId, date_consultation: date, notes }).eq('id', existing.id);
    } else {
      await supabase.from('consultations').insert([{
        patient_id: patientId,
        therapeute_id: userId,
        date_consultation: date,
        notes,
        rendez_vous_id: rdvId,
      }]);
    }
  };

  const sendConfirmationEmail = async (rdvId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch('/api/rdv/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ rdvId }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      console.error('Échec envoi confirmation RDV:', json);
      showToast("RDV enregistré, mais l'email de confirmation n'est pas parti", 'error');
    }
  };

  // Si un nom a été tapé sans sélectionner de patient existant, crée sa fiche
  // (ou réutilise un patient déjà connu avec le même email pour éviter les doublons).
  // `createdPatientId` distingue une fiche VRAIMENT créée à l'instant (à défaire si le RDV
  // échoue ensuite) d'un patient existant simplement réutilisé.
  const ensurePatientId = async (): Promise<{ id: string | null; createdPatientId: string | null }> => {
    if (!draft || !userId) return { id: null, createdPatientId: null };
    if (draft.patient_id) return { id: draft.patient_id, createdPatientId: null };

    const nom = draft.patientNom.trim();
    const email = draft.email.trim().toLowerCase();
    if (!nom || !email) return { id: null, createdPatientId: null };

    const existing = patients.find((p) => (p.email || '').toLowerCase() === email);
    if (existing) return { id: existing.id, createdPatientId: null };

    const { data, error } = await supabase.from('patients').insert([{
      therapeute_id: userId,
      nom_complet: nom,
      email,
      telephone: draft.telephone.trim(),
      date_naissance: draft.dateNaissance || null,
      notes_consultation: '',
    }]).select().single();
    if (error) throw error;

    setPatients((prev) => [...prev, { id: data.id, nom_complet: data.nom_complet, email: data.email, telephone: data.telephone }]);
    return { id: data.id, createdPatientId: data.id };
  };

  const handleSave = async () => {
    if (!draft || !userId) return;
    setSaving(true);
    let createdPatientId: string | null = null;
    const isIndisponibilite = draft.type === 'indisponibilite';
    try {
      // Une indisponibilité ne concerne aucun patient : on ne crée/lie surtout pas de fiche.
      const patientResult = isIndisponibilite
        ? { id: null, createdPatientId: null }
        : await ensurePatientId();
      createdPatientId = patientResult.createdPatientId;
      const patientId = patientResult.id;

      const motif = draft.motif_id ? motifs.find((m) => m.id === draft.motif_id) : null;
      const dateDebut = new Date(`${draft.date}T${draft.heureDebut}:00`).toISOString();
      const dateFin = new Date(`${draft.date}T${draft.heureFin}:00`).toISOString();
      const payload = {
        therapeute_id: userId,
        patient_id: isIndisponibilite ? null : patientId,
        cabinet_id: draft.cabinet_id || null,
        titre: draft.titre.trim() || (isIndisponibilite ? 'Indisponible' : 'Consultation'),
        date_debut: dateDebut,
        date_fin: dateFin,
        statut: isIndisponibilite ? 'confirme' : draft.statut,
        notes: draft.notes,
        patient_email: isIndisponibilite ? '' : draft.email.trim(),
        patient_telephone: isIndisponibilite ? '' : draft.telephone.trim(),
        mode: draft.mode,
        motif_id: isIndisponibilite ? null : draft.motif_id,
        motif_nom: isIndisponibilite ? '' : (motif?.nom || ''),
        type: draft.type,
      };

      let rdvId = draft.id;
      if (draft.id) {
        const previous = rendezVous.find((r) => r.id === draft.id);
        const updatePayload = previous && previous.date_debut !== dateDebut
          ? { ...payload, rappel_envoye: false }
          : payload;
        const { data, error } = await supabase.from('rendez_vous').update(updatePayload).eq('id', draft.id).eq('therapeute_id', userId).select().single();
        if (error) throw error;
        setRendezVous((prev) => prev.map((r) => (r.id === draft.id ? data : r)));
        showToast(isIndisponibilite ? 'Indisponibilité mise à jour' : 'Rendez-vous mis à jour');
      } else {
        const { data, error } = await supabase.from('rendez_vous').insert([payload]).select().single();
        if (error) throw error;
        setRendezVous((prev) => [...prev, data]);
        rdvId = data.id;
        showToast(isIndisponibilite ? 'Créneau bloqué' : 'Rendez-vous créé');
      }

      if (!isIndisponibilite && payload.patient_id && rdvId) {
        await syncSeance(rdvId, payload.patient_id, draft.date, draft.notes);
      }

      if (!isIndisponibilite && payload.patient_email && rdvId) {
        sendConfirmationEmail(rdvId).catch((err) => console.error('Erreur envoi confirmation:', err));
      }

      closeModal();
    } catch (err) {
      console.error('Erreur sauvegarde RDV:', err);
      // La fiche patient venait d'être créée pour ce RDV : si le RDV échoue, on la retire
      // pour ne pas laisser un patient orphelin sans aucun rendez-vous ni séance.
      if (createdPatientId) {
        await supabase.from('patients').delete().eq('id', createdPatientId);
        setPatients((prev) => prev.filter((p) => p.id !== createdPatientId));
      }
      if ((err as { code?: string })?.code === '23P01') {
        showToast('Ce créneau chevauche un autre rendez-vous', 'error');
      } else {
        showToast("Erreur lors de l'enregistrement du rendez-vous", 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!draft?.id || !userId) return;
    setSaving(true);
    try {
      // La route serveur supprime ET prévient le patient (email) + la liste d'attente
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session expirée');
      const res = await fetch('/api/rdv/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ rdvId: draft.id }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur serveur');
      }
      setRendezVous((prev) => prev.filter((r) => r.id !== draft.id));
      const label = draft.type === 'indisponibilite' ? 'Indisponibilité supprimée' : 'Rendez-vous supprimé';
      showToast(draft.email ? `${label} — le patient a été prévenu par email` : label);
      closeModal();
    } catch (err) {
      console.error('Erreur suppression RDV:', err);
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || planLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-500">Chargement de votre agenda...</p>
    </div>
  );

  if (!isPro) return <UpgradePrompt feature="agenda" trialDaysLeft={daysLeft} hasUsedTrial={hasUsedTrial} />;

  const rangeLabel = view === 'mois'
    ? anchorDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : view === 'semaine'
      ? `${days[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — ${days[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
      : anchorDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-[1500px] w-[96%] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                <ArrowLeft size={16} /> Retour au dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Agenda</h1>
            {userId && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/reserver/${userId}`);
                  showToast('Lien de réservation copié ! Partagez-le à vos patients.');
                }}
                className="mt-2 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Share2 size={14} /> Copier mon lien de réservation en ligne
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setView('jour')}
                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${view === 'jour' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Jour
              </button>
              <button
                onClick={() => setView('semaine')}
                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${view === 'semaine' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Semaine
              </button>
              <button
                onClick={() => setView('mois')}
                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${view === 'mois' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Mois
              </button>
            </div>
            <button onClick={() => setAnchorDate(new Date())} className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition">
              Aujourd&apos;hui
            </button>
            <button onClick={() => navigate(-1)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition">
              <ArrowLeft size={16} />
            </button>
            <button onClick={() => navigate(1)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition">
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => openCreateModal(view === 'jour' ? anchorDate : new Date(), new Date().getHours())}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> Nouveau RDV
            </button>
            <button
              onClick={() => setIsAbsenceModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
            >
              <CalendarOff size={16} /> Bloquer une période
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500">
          {view === 'jour' ? <CalendarIcon size={16} /> : <CalendarDays size={16} />}
          <p className="text-sm font-bold capitalize">{rangeLabel}</p>
        </div>

        {view === 'mois' ? (
          <MonthGrid
            monthAnchor={anchorDate}
            rendezVous={rendezVous}
            onDayClick={(day) => { setAnchorDate(day); setView('jour'); }}
            onRdvClick={openEditModal}
          />
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[700px]">
              <CalendarGrid
                days={days}
                rendezVous={rendezVous}
                patients={patients}
                onSlotClick={openCreateModal}
                onRdvClick={openEditModal}
              />
            </div>
          </div>
        )}
      </div>

      <RdvModal
        key={draft?.id || (isModalOpen ? 'new' : 'closed')}
        isOpen={isModalOpen}
        draft={draft}
        patients={patients}
        cabinets={cabinets}
        motifs={motifs}
        visioUrl={visioUrl}
        saving={saving}
        onClose={closeModal}
        onChange={setDraft}
        onSave={handleSave}
        onDelete={draft?.id ? handleDelete : undefined}
      />

      {userId && (
        <AbsenceModal
          isOpen={isAbsenceModalOpen}
          userId={userId}
          onClose={() => setIsAbsenceModalOpen(false)}
          onCreated={(rows) => {
            setRendezVous((prev) => [...prev, ...rows]);
            showToast(`${rows.length} jour${rows.length > 1 ? 's' : ''} bloqué${rows.length > 1 ? 's' : ''}`);
          }}
        />
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium z-50 ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
