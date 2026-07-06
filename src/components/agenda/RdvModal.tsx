'use client';

import { useState } from 'react';
import { Loader2, Trash2, X } from 'lucide-react';
import type { RendezVous } from '@/lib/types';

interface PatientMin {
  id: string;
  nom_complet: string;
}

interface CabinetMin {
  id: string;
  nom: string;
}

export interface RdvDraft {
  id?: string;
  patient_id: string;
  cabinet_id: string;
  titre: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  statut: RendezVous['statut'];
  notes: string;
}

interface RdvModalProps {
  isOpen: boolean;
  draft: RdvDraft | null;
  patients: PatientMin[];
  cabinets: CabinetMin[];
  saving: boolean;
  onClose: () => void;
  onChange: (draft: RdvDraft) => void;
  onSave: () => void;
  onDelete?: () => void;
}

const STATUTS: { value: RendezVous['statut']; label: string }[] = [
  { value: 'confirme', label: 'Confirmé' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'termine', label: 'Terminé' },
  { value: 'annule', label: 'Annulé' },
];

export default function RdvModal({
  isOpen, draft, patients, cabinets, saving, onClose, onChange, onSave, onDelete,
}: RdvModalProps) {
  const [error, setError] = useState('');

  if (!isOpen || !draft) return null;

  const handleSave = () => {
    if (!draft.date || !draft.heureDebut || !draft.heureFin) {
      setError('Merci de renseigner la date et les horaires.');
      return;
    }
    if (draft.heureFin <= draft.heureDebut) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    setError('');
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{draft.id ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Titre</label>
            <input
              type="text"
              value={draft.titre}
              onChange={(e) => onChange({ ...draft, titre: e.target.value })}
              placeholder="Consultation"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Patient</label>
            <select
              value={draft.patient_id}
              onChange={(e) => onChange({ ...draft, patient_id: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
            >
              <option value="">— Aucun / créneau bloqué —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.nom_complet}</option>
              ))}
            </select>
          </div>

          {cabinets.length > 1 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Cabinet</label>
              <select
                value={draft.cabinet_id}
                onChange={(e) => onChange({ ...draft, cabinet_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
              >
                {cabinets.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Date</label>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => onChange({ ...draft, date: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Début</label>
              <input
                type="time"
                value={draft.heureDebut}
                onChange={(e) => onChange({ ...draft, heureDebut: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Fin</label>
              <input
                type="time"
                value={draft.heureFin}
                onChange={(e) => onChange({ ...draft, heureFin: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Statut</label>
            <select
              value={draft.statut}
              onChange={(e) => onChange({ ...draft, statut: e.target.value as RendezVous['statut'] })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
            >
              {STATUTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Notes</label>
            <textarea
              value={draft.notes}
              onChange={(e) => onChange({ ...draft, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium">{error}</div>
          )}
        </div>

        <div className="flex justify-between items-center gap-3 mt-6">
          {draft.id && onDelete ? (
            <button
              onClick={onDelete}
              disabled={saving}
              className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1.5"
            >
              <Trash2 size={16} /> Supprimer
            </button>
          ) : <span />}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
