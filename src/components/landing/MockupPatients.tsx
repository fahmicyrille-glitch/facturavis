import {
  User, Mail, Phone, MapPin, Shield,
  FileText, PenLine, ChevronRight
} from 'lucide-react';

const patients = [
  { name: 'Marie Dupont', initials: 'MD', color: 'bg-blue-500', lastVisit: '23 juin' },
  { name: 'Jean-Pierre Martin', initials: 'JM', color: 'bg-purple-500', lastVisit: '22 juin' },
  { name: 'Sophie Lefebvre', initials: 'SL', color: 'bg-pink-500', lastVisit: '21 juin' },
  { name: 'Thomas Moreau', initials: 'TM', color: 'bg-emerald-500', lastVisit: '20 juin' },
  { name: 'Camille Bernard', initials: 'CB', color: 'bg-orange-500', lastVisit: '19 juin' },
];

const invoiceHistory = [
  { date: '23 juin 2026', num: 'FA-2026-047', amount: '65,00 €', status: 'Payée' },
  { date: '18 mai 2026', num: 'FA-2026-031', amount: '65,00 €', status: 'Payée' },
  { date: '22 avr 2026', num: 'FA-2026-019', amount: '80,00 €', status: 'Payée' },
];

export default function MockupPatients() {
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
          facturavis.fr/dashboard/patients
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-[340px] md:min-h-[400px]">
        {/* Sidebar - patient list */}
        <div className="w-48 md:w-56 border-r border-gray-100 bg-gray-50/50 shrink-0 hidden md:block">
          <div className="p-3 border-b border-gray-100">
            <div className="bg-white rounded-lg px-3 py-1.5 text-[10px] text-gray-400 border border-gray-200 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Rechercher un patient...
            </div>
          </div>
          <div className="p-1.5">
            {patients.map((p, i) => (
              <div
                key={p.name}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  i === 0
                    ? 'bg-blue-50 border border-blue-100'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${p.color} text-white text-[10px] font-black flex items-center justify-center shrink-0`}>
                  {p.initials}
                </div>
                <div className="min-w-0">
                  <p className={`text-[11px] font-bold truncate ${i === 0 ? 'text-blue-700' : 'text-gray-700'}`}>{p.name}</p>
                  <p className="text-[9px] text-gray-400">{p.lastVisit}</p>
                </div>
                {i === 0 && <ChevronRight size={12} className="text-blue-400 ml-auto shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Main content - patient detail */}
        <div className="flex-1 p-4 md:p-5 space-y-4 overflow-hidden">
          {/* Patient header */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-11 h-11 rounded-xl bg-blue-500 text-white font-black flex items-center justify-center text-sm shadow-md">
              MD
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-gray-900">Marie Dupont</h3>
              <p className="text-[10px] text-gray-400">Patiente depuis mars 2025 &middot; 12 consultations</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <div className="bg-blue-600 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                <FileText size={10} />
                Facturer
              </div>
              <div className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                <PenLine size={10} />
                Modifier
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact info */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Informations</h4>
              <div className="space-y-2">
                {[
                  { icon: Mail, label: 'marie.dupont@email.fr', color: 'text-blue-500' },
                  { icon: Phone, label: '06 12 34 56 78', color: 'text-green-500' },
                  { icon: MapPin, label: '14 rue de la Paix, 75002 Paris', color: 'text-orange-500' },
                  { icon: Shield, label: '2 85 06 75 102 045 67', color: 'text-purple-500' },
                ].map((info) => (
                  <div key={info.label} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
                      <info.icon size={11} className={info.color} />
                    </div>
                    <span className="text-[11px] text-gray-600 truncate">{info.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Observations */}
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Observations Th&eacute;rapeutiques</h4>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-[10px] text-gray-500 leading-relaxed h-[100px] overflow-hidden relative">
                <p className="font-medium text-gray-700 mb-1">[23/06/2026] S&eacute;ance n&deg;12</p>
                <p>Douleur cervicale persistante c&ocirc;t&eacute; gauche. Test de mobilit&eacute; r&eacute;duit en rotation. Technique structurelle appliqu&eacute;e sur C3-C4. Am&eacute;lioration imm&eacute;diate de l&rsquo;amplitude. Conseil : &eacute;tirement quotidien 2x/jour.</p>
                <p className="mt-1.5 font-medium text-gray-700">[18/05/2026] S&eacute;ance n&deg;11</p>
                <p>Suivi lombalgie chronique. Nette progression depuis la derni&egrave;re s&eacute;ance...</p>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50 to-transparent" />
              </div>
            </div>
          </div>

          {/* Invoice history */}
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Historique Facturation</h4>
            <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-4 gap-2 px-3 py-1.5 text-[8px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <span>Date</span>
                <span>Num&eacute;ro</span>
                <span>Montant</span>
                <span>Statut</span>
              </div>
              {invoiceHistory.map((inv) => (
                <div key={inv.num} className="grid grid-cols-4 gap-2 px-3 py-2 text-[10px] border-b border-gray-50 last:border-0 hover:bg-white transition-colors">
                  <span className="text-gray-500">{inv.date}</span>
                  <span className="text-gray-700 font-bold">{inv.num}</span>
                  <span className="text-gray-900 font-bold">{inv.amount}</span>
                  <span><span className="bg-green-100 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full">{inv.status}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
