'use client';

import type { RendezVous } from '@/lib/types';

export const HOUR_START = 8;
export const HOUR_END = 20;
const HOUR_HEIGHT = 60; // px

interface PatientMin {
  id: string;
  nom_complet: string;
}

interface CalendarGridProps {
  days: Date[];
  rendezVous: RendezVous[];
  patients: PatientMin[];
  onSlotClick: (day: Date, hour: number) => void;
  onRdvClick: (rdv: RendezVous) => void;
}

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const STATUT_STYLES: Record<RendezVous['statut'], string> = {
  confirme: 'bg-blue-100 border-blue-300 text-blue-900',
  en_attente: 'bg-amber-100 border-amber-300 text-amber-900',
  termine: 'bg-gray-100 border-gray-300 text-gray-600',
  annule: 'bg-red-50 border-red-200 text-red-500 line-through',
};

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarGrid({ days, rendezVous, patients, onSlotClick, onRdvClick }: CalendarGridProps) {
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
  const today = new Date();
  const patientNom = (id: string | null) => patients.find((p) => p.id === id)?.nom_complet;

  return (
    <div className="flex bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="w-14 shrink-0 border-r border-gray-100">
        <div className="h-[57px] border-b border-gray-100" />
        {hours.map((h) => (
          <div key={h} style={{ height: HOUR_HEIGHT }} className="text-[11px] font-bold text-gray-400 text-right pr-2 -translate-y-2">
            {h}h
          </div>
        ))}
      </div>

      {days.map((day) => {
        const dayRdv = rendezVous.filter((r) => isSameDay(new Date(r.date_debut), day));
        return (
          <div key={day.toISOString()} className="flex-1 border-r border-gray-100 last:border-r-0 min-w-[100px]">
            <div className="h-[57px] flex flex-col items-center justify-center border-b border-gray-100">
              <p className="text-[11px] font-black uppercase text-gray-400">{DAY_LABELS[day.getDay()]}</p>
              <p className={`text-base font-black ${isSameDay(day, today) ? 'text-blue-600' : 'text-gray-900'}`}>{day.getDate()}</p>
            </div>
            <div className="relative" style={{ height: (HOUR_END - HOUR_START) * HOUR_HEIGHT }}>
              {hours.map((h) => (
                <div
                  key={h}
                  onClick={() => onSlotClick(day, h)}
                  style={{ height: HOUR_HEIGHT }}
                  className="border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
                />
              ))}

              {dayRdv.map((rdv) => {
                const start = new Date(rdv.date_debut);
                const end = new Date(rdv.date_fin);
                const startMin = (start.getHours() - HOUR_START) * 60 + start.getMinutes();
                const durationMin = Math.max((end.getTime() - start.getTime()) / 60000, 15);
                const nom = patientNom(rdv.patient_id);
                return (
                  <button
                    key={rdv.id}
                    onClick={(e) => { e.stopPropagation(); onRdvClick(rdv); }}
                    style={{
                      top: (startMin / 60) * HOUR_HEIGHT,
                      height: (durationMin / 60) * HOUR_HEIGHT,
                    }}
                    className={`absolute left-1 right-1 rounded-lg border px-2 py-1 text-left overflow-hidden shadow-sm hover:shadow-md transition-shadow z-10 ${STATUT_STYLES[rdv.statut]}`}
                  >
                    <p className="text-[11px] font-black truncate">{rdv.titre}</p>
                    {nom && <p className="text-[10px] font-medium truncate">{nom}</p>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
