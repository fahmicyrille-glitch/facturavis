'use client';

import { useState } from 'react';
import { Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';
import type { Anamnese } from '@/lib/types';

interface AnamneseSectionProps {
  anamnese: Anamnese;
  onChange: (anamnese: Anamnese) => void;
}

const CHAMPS: { cle: keyof Anamnese; label: string; placeholder: string }[] = [
  { cle: 'motif', label: 'Motif de consultation initial', placeholder: 'Ex : lombalgie chronique, stress, trouble du sommeil...' },
  { cle: 'antecedents', label: 'Antécédents médicaux & chirurgicaux', placeholder: 'Opérations, pathologies, accidents...' },
  { cle: 'traitements', label: 'Traitements en cours', placeholder: 'Médicaments, suivis en cours...' },
  { cle: 'allergies', label: 'Allergies & contre-indications', placeholder: 'Allergies connues, zones à éviter...' },
  { cle: 'mode_de_vie', label: 'Mode de vie & activité', placeholder: 'Profession, sport, sommeil, alimentation...' },
];

export default function AnamneseSection({ anamnese, onChange }: AnamneseSectionProps) {
  const filled = CHAMPS.filter((c) => (anamnese[c.cle] || '').trim()).length;
  const [isOpen, setIsOpen] = useState(filled > 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Stethoscope size={18} className="text-emerald-600" /> Anamnèse
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {filled}/{CHAMPS.length} sections
          </span>
        </h3>
        {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {isOpen && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
          {CHAMPS.map((champ) => (
            <div key={champ.cle}>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1.5 block">{champ.label}</label>
              <textarea
                rows={2}
                value={anamnese[champ.cle] || ''}
                onChange={(e) => onChange({ ...anamnese, [champ.cle]: e.target.value })}
                placeholder={champ.placeholder}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none resize-none transition-all placeholder:text-gray-300"
              />
            </div>
          ))}
          <p className="text-[11px] text-gray-400">Enregistré avec le bouton &quot;Enregistrer&quot; du dossier.</p>
        </div>
      )}
    </div>
  );
}
