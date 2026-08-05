'use client';

import type { RendezVous } from '@/lib/types';

interface MonthGridProps {
  monthAnchor: Date;
  rendezVous: RendezVous[];
  onDayClick: (day: Date) => void;
  onRdvClick: (rdv: RendezVous) => void;
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MAX_VISIBLE = 3;

const DOT_STYLES: Record<RendezVous['statut'], string> = {
  confirme: 'bg-blue-500',
  en_attente: 'bg-amber-500',
  termine: 'bg-gray-400',
  annule: 'bg-red-300',
};

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Grille de 6 semaines (42 cases, lundi en premier) couvrant le mois — inclut les jours du
// mois précédent/suivant en bordure pour que la grille reste toujours complète et alignée.
function getMonthGridDays(anchor: Date): { date: Date; inMonth: boolean }[] {
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const firstWeekday = firstOfMonth.getDay(); // 0 = dimanche
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - offset);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { date, inMonth: date.getMonth() === anchor.getMonth() };
  });
}

export default function MonthGrid({ monthAnchor, rendezVous, onDayClick, onRdvClick }: MonthGridProps) {
  const cells = getMonthGridDays(monthAnchor);
  const today = new Date();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_LABELS.map((label) => (
          <div key={label} className="py-2 text-center text-[11px] font-black uppercase text-gray-400">{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map(({ date, inMonth }) => {
          const dayRdv = rendezVous
            .filter((r) => isSameDay(new Date(r.date_debut), date) && r.statut !== 'annule')
            .sort((a, b) => a.date_debut.localeCompare(b.date_debut));
          const visible = dayRdv.slice(0, MAX_VISIBLE);
          const remaining = dayRdv.length - visible.length;

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDayClick(date)}
              className={`min-h-[92px] border-b border-r border-gray-50 p-1.5 text-left align-top hover:bg-blue-50/40 transition-colors ${!inMonth ? 'bg-gray-50/50' : ''}`}
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black mb-1 ${
                isSameDay(date, today) ? 'bg-blue-600 text-white' : inMonth ? 'text-gray-800' : 'text-gray-300'
              }`}>
                {date.getDate()}
              </span>
              <div className="space-y-0.5">
                {visible.map((rdv) => {
                  const isIndispo = rdv.type === 'indisponibilite';
                  return (
                    <div
                      key={rdv.id}
                      onClick={(e) => { e.stopPropagation(); onRdvClick(rdv); }}
                      className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] font-bold truncate hover:opacity-75 ${
                        isIndispo ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-800'
                      }`}
                      title={rdv.titre}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isIndispo ? 'bg-gray-400' : DOT_STYLES[rdv.statut]}`} />
                      <span className="truncate">{new Date(rdv.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} {rdv.titre}</span>
                    </div>
                  );
                })}
                {remaining > 0 && (
                  <p className="text-[10px] font-bold text-gray-400 px-1">+{remaining} de plus</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
