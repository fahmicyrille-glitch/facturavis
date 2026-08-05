import { Calendar, CheckCircle2, Clock, MapPin } from 'lucide-react';

const creneaux = ['09:00', '09:45', '11:00', '14:15', '15:00', '16:30'];

export default function MockupReserver() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-md mx-auto">
      {/* Browser chrome */}
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-gray-400 ml-3 flex items-center gap-1.5 border border-gray-200 truncate">
          <svg className="w-3 h-3 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
          facturavis.fr/reserver/vous
        </div>
      </div>

      {/* Content — vue patient, palette chaleureuse identique à la vraie page publique */}
      <div className="p-5 bg-[#f7f4f1] space-y-4">
        <div className="bg-white rounded-2xl border border-[#f0e6de] p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#fdf2e9] flex items-center justify-center shrink-0">
            <Calendar size={20} className="text-[#a9825a]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-[#3e2f25] truncate">Dr. Camille Martin</p>
            <p className="text-[10px] text-[#a9825a] font-bold flex items-center gap-1">
              <Clock size={10} /> Consultation de suivi &middot; 45 min
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-[#3e2f25] uppercase tracking-widest mb-2">Jeudi 14 ao&ucirc;t</p>
          <div className="grid grid-cols-3 gap-2">
            {creneaux.map((c, i) => (
              <div
                key={c}
                className={`text-center text-xs font-bold py-2 rounded-lg border transition-colors ${
                  i === 3
                    ? 'bg-[#a9825a] border-[#a9825a] text-white shadow-sm'
                    : 'bg-[#fdf2e9] border-[#f0e6de] text-[#8b6a48]'
                }`}
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#f0e6de] p-3 flex items-center gap-2 text-[10px] text-[#7a6a5f]">
          <MapPin size={12} className="text-[#a9825a] shrink-0" />
          12 rue des Lilas, 75011 Paris
        </div>

        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center space-y-1.5">
          <CheckCircle2 size={22} className="text-green-500 mx-auto" />
          <p className="text-xs font-black text-green-800">Rendez-vous confirm&eacute; !</p>
          <p className="text-[10px] text-green-700 font-medium">Email envoy&eacute; avec fichier calendrier joint &middot; rappel automatique 24h avant</p>
        </div>
      </div>
    </div>
  );
}
