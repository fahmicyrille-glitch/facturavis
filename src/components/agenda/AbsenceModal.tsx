'use client';

import { useState } from 'react';
import { Loader2, X, CalendarOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { RendezVous, HorairesOuverture } from '@/lib/types';

interface AbsenceModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onCreated: (rows: RendezVous[]) => void;
}

function formatLocalYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Créneaux par pas de 15 min — même granularité que le reste de l'agenda.
const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const total = i * 15;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
});

const MAX_JOURS = 60;

export default function AbsenceModal({ isOpen, userId, onClose, onCreated }: AbsenceModalProps) {
  const today = formatLocalYYYYMMDD(new Date());
  const [dateDebut, setDateDebut] = useState(today);
  const [dateFin, setDateFin] = useState(today);
  const [motif, setMotif] = useState('');
  const [journeeComplete, setJourneeComplete] = useState(true);
  const [heureDebut, setHeureDebut] = useState('12:00');
  const [heureFin, setHeureFin] = useState('14:00');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError('');
    if (!dateDebut || !dateFin) { setError('Merci de renseigner les dates.'); return; }
    if (dateFin < dateDebut) { setError('La date de fin doit être après la date de début.'); return; }
    if (!journeeComplete && heureFin <= heureDebut) { setError("L'heure de fin doit être après l'heure de début."); return; }

    const start = new Date(`${dateDebut}T00:00:00`);
    const end = new Date(`${dateFin}T00:00:00`);
    const nbJours = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    if (nbJours > MAX_JOURS) {
      setError(`Période trop longue (maximum ${MAX_JOURS} jours en une fois).`);
      return;
    }

    setSaving(true);
    try {
      let horaires: HorairesOuverture | undefined;
      if (journeeComplete) {
        const { data } = await supabase.from('therapeutes').select('horaires_ouverture').eq('id', userId).single();
        horaires = data?.horaires_ouverture as HorairesOuverture | undefined;
      }

      const titre = motif.trim() || 'Indisponible';
      const rows: { therapeute_id: string; titre: string; type: 'indisponibilite'; date_debut: string; date_fin: string }[] = [];

      for (let i = 0; i < nbJours; i++) {
        const day = new Date(start);
        day.setDate(day.getDate() + i);
        const cle = String(day.getDay());

        let debutHM = heureDebut;
        let finHM = heureFin;
        if (journeeComplete) {
          const conf = horaires?.[cle];
          if (conf && !conf.actif) continue; // jour déjà fermé, rien à bloquer
          debutHM = conf?.debut || '08:00';
          finHM = conf?.fin || '20:00';
        }

        const jour = formatLocalYYYYMMDD(day);
        rows.push({
          therapeute_id: userId,
          titre,
          type: 'indisponibilite',
          date_debut: new Date(`${jour}T${debutHM}:00`).toISOString(),
          date_fin: new Date(`${jour}T${finHM}:00`).toISOString(),
        });
      }

      if (rows.length === 0) {
        setError('Aucun jour ouvert dans cette période — rien à bloquer.');
        setSaving(false);
        return;
      }

      const { data, error: insError } = await supabase.from('rendez_vous').insert(rows).select();
      if (insError) {
        setError(
          (insError as { code?: string }).code === '23P01'
            ? "Cette période chevauche un rendez-vous ou une indisponibilité déjà existante. Ajustez les dates, ou libérez d'abord le créneau concerné."
            : "Erreur lors de l'enregistrement."
        );
        setSaving(false);
        return;
      }

      onCreated((data || []) as RendezVous[]);
      setMotif('');
      onClose();
    } catch {
      setError('Erreur inattendue.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><CalendarOff size={18} /> Bloquer une période</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Motif</label>
            <input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Congés, Formation, Fermeture exceptionnelle..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Du</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => { setDateDebut(e.target.value); if (dateFin < e.target.value) setDateFin(e.target.value); }}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Au</label>
              <input
                type="date"
                value={dateFin}
                min={dateDebut}
                onChange={(e) => setDateFin(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm cursor-pointer"
              />
            </div>
          </div>

          <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setJourneeComplete(true)}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${journeeComplete ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Journée(s) complète(s)
            </button>
            <button
              type="button"
              onClick={() => setJourneeComplete(false)}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${!journeeComplete ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Horaires précis
            </button>
          </div>

          {!journeeComplete && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Début</label>
                <select
                  value={heureDebut}
                  onChange={(e) => setHeureDebut(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                >
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Fin</label>
                <select
                  value={heureFin}
                  onChange={(e) => setHeureFin(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                >
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}

          <p className="text-[11px] text-gray-400">
            {journeeComplete
              ? "Bloque toute la journée sur vos horaires d'ouverture habituels, chaque jour de la période (les jours déjà fermés sont ignorés)."
              : 'Cet horaire sera bloqué chaque jour de la période sélectionnée.'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium">{error}</div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-black transition flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : 'Bloquer cette période'}
          </button>
        </div>
      </div>
    </div>
  );
}
