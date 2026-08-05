import { Video, Bell, Link as LinkIcon, Mail } from 'lucide-react';

const jours = ['Lun 6', 'Mar 7', 'Mer 8', 'Jeu 9', 'Ven 10'];
const heures = ['8h', '9h', '10h', '11h', '12h'];

interface Rdv {
  jour: number;
  ligne: number;
  hauteur: number;
  nom: string;
  visio?: boolean;
}

const rdvs: Rdv[] = [
  { jour: 0, ligne: 1, hauteur: 1, nom: 'M. Fahmi Cyrille' },
  { jour: 1, ligne: 0, hauteur: 1, nom: 'Consultation' },
  { jour: 1, ligne: 2, hauteur: 1, nom: 'Mme Dubreuil', visio: true },
  { jour: 1, ligne: 4, hauteur: 1, nom: 'Consultation' },
  { jour: 3, ligne: 1, hauteur: 2, nom: 'Mme Lemoine' },
];

export default function MockupAgenda() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-5xl mx-auto">
      {/* Browser chrome */}
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 ml-4 flex items-center gap-2 border border-gray-200">
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
          facturavis.fr/dashboard/agenda
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-4">
        {/* Header : lien de réservation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-black text-gray-900">Mon agenda</h3>
            <p className="text-[10px] text-gray-400">Semaine du 6 au 10 juillet</p>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-blue-100 shrink-0">
            <LinkIcon size={11} /> facturavis.fr/reserver/vous
          </div>
        </div>

        {/* Grille semaine */}
        <div className="flex border border-gray-100 rounded-xl overflow-hidden">
          <div className="w-10 shrink-0 border-r border-gray-100">
            <div className="h-9 border-b border-gray-100" />
            {heures.map((h) => (
              <div key={h} className="h-12 text-[9px] font-bold text-gray-300 text-right pr-1.5 pt-0.5">{h}</div>
            ))}
          </div>
          {jours.map((j, jIdx) => (
            <div key={j} className="flex-1 border-r border-gray-50 last:border-r-0 min-w-[70px]">
              <div className="h-9 flex flex-col items-center justify-center border-b border-gray-100 bg-gray-50/50">
                <p className="text-[8px] font-black uppercase text-gray-400">{j.split(' ')[0]}</p>
                <p className={`text-[11px] font-black ${jIdx === 1 ? 'text-blue-600' : 'text-gray-800'}`}>{j.split(' ')[1]}</p>
              </div>
              <div className="relative" style={{ height: heures.length * 48 }}>
                {heures.map((_, hIdx) => (
                  <div key={hIdx} className="absolute inset-x-0 border-b border-gray-50" style={{ top: hIdx * 48, height: 48 }} />
                ))}
                {rdvs.filter((r) => r.jour === jIdx).map((r, i) => (
                  <div
                    key={i}
                    className={`absolute left-0.5 right-0.5 rounded-md border px-1.5 py-1 overflow-hidden ${r.visio ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}
                    style={{ top: r.ligne * 48 + 2, height: r.hauteur * 48 - 4 }}
                  >
                    <p className={`text-[8px] font-black truncate flex items-center gap-1 ${r.visio ? 'text-purple-800' : 'text-blue-900'}`}>
                      {r.visio && <Video size={8} className="shrink-0" />}
                      {r.nom}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bandeau notifications automatiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            <Mail size={14} className="text-green-600 shrink-0" />
            <p className="text-[10px] font-bold text-green-800">Confirmation + rappel 24h envoyés automatiquement</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <Bell size={14} className="text-amber-600 shrink-0" />
            <p className="text-[10px] font-bold text-amber-800">Liste d&apos;attente alertée : créneau libéré</p>
          </div>
        </div>
      </div>
    </div>
  );
}
