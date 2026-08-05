'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Trash2, X, Video, Copy, Check, ExternalLink, ClipboardList, Ban } from 'lucide-react';
import type { RendezVous, MotifConsultation } from '@/lib/types';

interface PatientMin {
  id: string;
  nom_complet: string;
  email?: string;
  telephone?: string;
}

interface CabinetMin {
  id: string;
  nom: string;
}

export interface RdvDraft {
  id?: string;
  patient_id: string;
  patientNom: string;
  cabinet_id: string;
  titre: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  statut: RendezVous['statut'];
  notes: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  mode: RendezVous['mode'];
  motif_id: string | null;
  type: RendezVous['type'];
}

interface RdvModalProps {
  isOpen: boolean;
  draft: RdvDraft | null;
  patients: PatientMin[];
  cabinets: CabinetMin[];
  motifs: MotifConsultation[];
  visioUrl?: string;
  saving: boolean;
  onClose: () => void;
  onChange: (draft: RdvDraft) => void;
  onSave: () => void;
  onDelete?: () => void;
}

function heureToMinutes(heure: string): number | null {
  const [h, m] = heure.split(':').map((v) => parseInt(v, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

// Additionne des minutes à une heure "HH:mm", avec repli sur 24h (rare pour un RDV, mais évite un débordement silencieux).
function addMinutesToHeure(heure: string, minutes: number): string {
  const total = heureToMinutes(heure);
  if (total === null) return heure;
  const wrapped = (total + minutes + 1440) % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
}

// Créneaux par pas de 15 min sur toute la journée — même granularité que le reste de
// l'agenda, en remplacement du picker natif du navigateur (peu lisible, peu cohérent).
const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const total = i * 15;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
});

const STATUTS: { value: RendezVous['statut']; label: string }[] = [
  { value: 'confirme', label: 'Confirmé' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'termine', label: 'Terminé' },
  { value: 'annule', label: 'Annulé' },
];

export default function RdvModal({
  isOpen, draft, patients, cabinets, motifs, visioUrl, saving, onClose, onChange, onSave, onDelete,
}: RdvModalProps) {
  const [error, setError] = useState('');
  const [visioCopied, setVisioCopied] = useState(false);

  const copyVisioLink = () => {
    if (!visioUrl) return;
    navigator.clipboard.writeText(visioUrl);
    setVisioCopied(true);
    setTimeout(() => setVisioCopied(false), 2000);
  };
  const [patientQuery, setPatientQuery] = useState(
    () => patients.find((p) => p.id === draft?.patient_id)?.nom_complet || ''
  );
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);

  const filteredPatients = useMemo(
    () => patients.filter((p) => p.nom_complet.toLowerCase().includes(patientQuery.toLowerCase())),
    [patients, patientQuery]
  );

  if (!isOpen || !draft) return null;

  const selectPatient = (p: PatientMin | null) => {
    onChange({
      ...draft,
      patient_id: p?.id || '',
      patientNom: p?.nom_complet || '',
      email: draft.email || p?.email || '',
      telephone: draft.telephone || p?.telephone || '',
    });
    setPatientQuery(p?.nom_complet || '');
    setIsPatientListOpen(false);
  };

  const isIndisponibilite = draft.type === 'indisponibilite';

  // Un nom tapé qui ne correspond à aucun patient existant sera créé en fiche patient à l'enregistrement
  const isNewPatient = !isIndisponibilite && !draft.patient_id && patientQuery.trim().length > 0;

  const handleSave = () => {
    if (!draft.date || !draft.heureDebut || !draft.heureFin) {
      setError('Merci de renseigner la date et les horaires.');
      return;
    }
    if (draft.heureFin <= draft.heureDebut) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    if (!isIndisponibilite) {
      if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) {
        setError('Adresse email invalide.');
        return;
      }
      if (isNewPatient && !draft.email.trim()) {
        setError("L'email est obligatoire pour créer la fiche de ce nouveau patient.");
        return;
      }
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
          <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button
              type="button"
              onClick={() => onChange({ ...draft, type: 'consultation' })}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${!isIndisponibilite ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Rendez-vous patient
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...draft, type: 'indisponibilite', titre: draft.titre === 'Consultation' ? 'Indisponible' : draft.titre })}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 ${isIndisponibilite ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Ban size={14} /> Indisponibilité
            </button>
          </div>

          {isIndisponibilite && (
            <p className="text-xs text-gray-400 -mt-2">Bloque ce créneau (congés, formation, pause...) — aucun patient ne pourra le réserver en ligne.</p>
          )}

          {!isIndisponibilite && motifs.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <ClipboardList size={12} /> Motif de consultation
              </label>
              <select
                value={draft.motif_id || ''}
                onChange={(e) => {
                  const motif = motifs.find((m) => m.id === e.target.value);
                  if (!motif) { onChange({ ...draft, motif_id: null }); return; }
                  onChange({
                    ...draft,
                    motif_id: motif.id,
                    titre: motif.nom,
                    heureFin: draft.heureDebut ? addMinutesToHeure(draft.heureDebut, motif.duree_minutes) : draft.heureFin,
                  });
                }}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
              >
                <option value="">— Aucun / horaires libres —</option>
                {motifs.map((m) => (
                  <option key={m.id} value={m.id}>{m.nom} ({m.duree_minutes} min)</option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1.5">Pré-remplit le titre et la durée — les horaires restent modifiables ensuite.</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{isIndisponibilite ? 'Motif' : 'Titre'}</label>
            <input
              type="text"
              value={draft.titre}
              onChange={(e) => onChange({ ...draft, titre: e.target.value })}
              placeholder={isIndisponibilite ? 'Indisponible, Congés, Formation...' : 'Consultation'}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
            />
          </div>

          {!isIndisponibilite && (
            <>
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Patient</label>
                  {draft.patient_id && (
                    <Link
                      href={`/dashboard/patients?id=${draft.patient_id}`}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Voir la fiche <ExternalLink size={12} />
                    </Link>
                  )}
                </div>
                <input
                  type="text"
                  value={patientQuery}
                  onChange={(e) => {
                    // Ne touche PAS à patient_id ici : sinon, retaper/corriger un nom sur un RDV
                    // déjà lié à un patient délie silencieusement la fiche (perte de l'historique).
                    // patient_id n'est modifié que via une sélection explicite dans la liste ci-dessous.
                    setPatientQuery(e.target.value);
                    setIsPatientListOpen(true);
                    onChange({ ...draft, patientNom: e.target.value });
                  }}
                  onFocus={() => setIsPatientListOpen(true)}
                  onBlur={() => setTimeout(() => setIsPatientListOpen(false), 150)}
                  placeholder="Tapez un nom..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                />
                {isNewPatient && (
                  <p className="text-xs text-blue-600 mt-1.5">✨ Nouveau patient — sa fiche sera créée automatiquement à l&apos;enregistrement.</p>
                )}
                {draft.patient_id && (
                  <p className="text-[11px] text-gray-400 mt-1.5">Pour changer de patient, sélectionnez-le dans la liste ou choisissez « Aucun ».</p>
                )}
                {isPatientListOpen && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectPatient(null)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
                    >
                      — Aucun / créneau bloqué —
                    </button>
                    {filteredPatients.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectPatient(p)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-blue-50"
                      >
                        {p.nom_complet}
                      </button>
                    ))}
                    {filteredPatients.length === 0 && (
                      <p className="px-3 py-2 text-sm text-gray-400 italic">Aucun patient trouvé</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Email patient{isNewPatient && <span className="text-red-500"> *</span>}
                  </label>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => onChange({ ...draft, email: e.target.value })}
                    placeholder="patient@email.fr"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Téléphone</label>
                  <input
                    type="tel"
                    value={draft.telephone}
                    onChange={(e) => onChange({ ...draft, telephone: e.target.value })}
                    placeholder="06 00 00 00 00"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                  />
                </div>
              </div>
              {draft.email && (
                <p className="text-xs text-gray-400 -mt-2">📧 Une confirmation sera envoyée à cette adresse.</p>
              )}

              {isNewPatient && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Date de naissance</label>
                  <input
                    type="date"
                    value={draft.dateNaissance}
                    onChange={(e) => onChange({ ...draft, dateNaissance: e.target.value })}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm cursor-pointer"
                  />
                </div>
              )}
            </>
          )}

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
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Début</label>
              <select
                value={draft.heureDebut}
                onChange={(e) => {
                  const newDebut = e.target.value;
                  // Décale la fin pour conserver la durée en cours (ex: motif sélectionné,
                  // ou durée déjà ajustée manuellement) plutôt que de la laisser figée.
                  const debutMin = heureToMinutes(draft.heureDebut);
                  const finMin = heureToMinutes(draft.heureFin);
                  const dureeActuelle = debutMin !== null && finMin !== null && finMin > debutMin
                    ? finMin - debutMin
                    : (motifs.find((m) => m.id === draft.motif_id)?.duree_minutes ?? 60);
                  onChange({ ...draft, heureDebut: newDebut, heureFin: addMinutesToHeure(newDebut, dureeActuelle) });
                }}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
              >
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Fin</label>
              <select
                value={draft.heureFin}
                onChange={(e) => {
                  const newFin = e.target.value;
                  // Symétrique du champ Début : décale le début pour conserver la durée en cours.
                  const debutMin = heureToMinutes(draft.heureDebut);
                  const finMin = heureToMinutes(draft.heureFin);
                  const dureeActuelle = debutMin !== null && finMin !== null && finMin > debutMin
                    ? finMin - debutMin
                    : (motifs.find((m) => m.id === draft.motif_id)?.duree_minutes ?? 60);
                  onChange({ ...draft, heureFin: newFin, heureDebut: addMinutesToHeure(newFin, -dureeActuelle) });
                }}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
              >
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {!isIndisponibilite && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Mode</label>
                <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => onChange({ ...draft, mode: 'cabinet' })}
                    className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${draft.mode === 'cabinet' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    🏥 Cabinet
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...draft, mode: 'visio' })}
                    className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${draft.mode === 'visio' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    💻 Visio
                  </button>
                </div>
                {draft.mode === 'visio' && (
                  visioUrl ? (
                    <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                      <Video size={14} className="text-blue-600 shrink-0" />
                      <a href={visioUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 font-medium truncate flex-1 hover:underline">
                        {visioUrl}
                      </a>
                      <button type="button" onClick={copyVisioLink} className="shrink-0 p-1.5 hover:bg-blue-100 rounded-md transition-colors" title="Copier le lien">
                        {visioCopied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-blue-600" />}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-amber-600">⚠️ Aucun lien visio configuré — ajoutez-en un dans Réglages.</p>
                  )
                )}
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
            </>
          )}

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
