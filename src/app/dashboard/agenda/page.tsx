'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ArrowRight, Plus, CalendarDays, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { usePlan } from '@/hooks/usePlan';
import UpgradePrompt from '@/components/UpgradePrompt';
import type { RendezVous } from '@/lib/types';
import CalendarGrid from '@/components/agenda/CalendarGrid';
import RdvModal, { type RdvDraft } from '@/components/agenda/RdvModal';

interface PatientMin { id: string; nom_complet: string; }
interface CabinetMin { id: string; nom: string; }

type ViewMode = 'semaine' | 'jour';

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

  const [view, setView] = useState<ViewMode>('semaine');
  const [anchorDate, setAnchorDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<RdvDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async (uid: string) => {
    const [{ data: rdvData, error: rdvError }, { data: patData }, { data: cabData }] = await Promise.all([
      supabase.from('rendez_vous').select('*').eq('therapeute_id', uid).order('date_debut'),
      supabase.from('patients').select('id, nom_complet').eq('therapeute_id', uid).order('nom_complet'),
      supabase.from('cabinets').select('id, nom').eq('therapeute_id', uid),
    ]);
    if (rdvError) { console.error('Erreur Agenda:', rdvError); showToast("Erreur lors du chargement de l'agenda", 'error'); }
    else if (rdvData) setRendezVous(rdvData);
    if (patData) setPatients(patData);
    if (cabData) setCabinets(cabData);
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

  const days = view === 'semaine' ? getWeekDays(anchorDate) : [anchorDate];

  const navigate = (delta: number) => {
    const next = new Date(anchorDate);
    next.setDate(anchorDate.getDate() + delta * (view === 'semaine' ? 7 : 1));
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
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setDraft(null); };

  const handleSave = async () => {
    if (!draft || !userId) return;
    setSaving(true);
    try {
      const dateDebut = new Date(`${draft.date}T${draft.heureDebut}:00`).toISOString();
      const dateFin = new Date(`${draft.date}T${draft.heureFin}:00`).toISOString();
      const payload = {
        therapeute_id: userId,
        patient_id: draft.patient_id || null,
        cabinet_id: draft.cabinet_id || null,
        titre: draft.titre.trim() || 'Consultation',
        date_debut: dateDebut,
        date_fin: dateFin,
        statut: draft.statut,
        notes: draft.notes,
      };

      if (draft.id) {
        const { data, error } = await supabase.from('rendez_vous').update(payload).eq('id', draft.id).eq('therapeute_id', userId).select().single();
        if (error) throw error;
        setRendezVous((prev) => prev.map((r) => (r.id === draft.id ? data : r)));
        showToast('Rendez-vous mis à jour');
      } else {
        const { data, error } = await supabase.from('rendez_vous').insert([payload]).select().single();
        if (error) throw error;
        setRendezVous((prev) => [...prev, data]);
        showToast('Rendez-vous créé');
      }
      closeModal();
    } catch (err) {
      console.error('Erreur sauvegarde RDV:', err);
      showToast("Erreur lors de l'enregistrement du rendez-vous", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!draft?.id || !userId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('rendez_vous').delete().eq('id', draft.id).eq('therapeute_id', userId);
      if (error) throw error;
      setRendezVous((prev) => prev.filter((r) => r.id !== draft.id));
      showToast('Rendez-vous supprimé');
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

  const rangeLabel = view === 'semaine'
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
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500">
          {view === 'semaine' ? <CalendarDays size={16} /> : <CalendarIcon size={16} />}
          <p className="text-sm font-bold capitalize">{rangeLabel}</p>
        </div>

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
      </div>

      <RdvModal
        key={draft?.id || (isModalOpen ? 'new' : 'closed')}
        isOpen={isModalOpen}
        draft={draft}
        patients={patients}
        cabinets={cabinets}
        saving={saving}
        onClose={closeModal}
        onChange={setDraft}
        onSave={handleSave}
        onDelete={draft?.id ? handleDelete : undefined}
      />

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
