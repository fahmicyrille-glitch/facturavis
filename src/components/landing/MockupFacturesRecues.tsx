import {
  Inbox, TrendingUp, FileText, Calendar,
  RefreshCw, Download, Eye
} from 'lucide-react';

const stats = [
  { label: 'Factures reçues', value: '5', icon: Inbox, color: 'bg-green-50 text-green-600' },
  { label: 'Total', value: '4 747 €', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Ce mois', value: '5', icon: Calendar, color: 'bg-teal-50 text-teal-600' },
];

const factures = [
  {
    company: 'Châtillon Médical',
    siret: '412 874 201',
    date: '18 juin 2026',
    amount: '340,00 €',
    category: 'Matériel médical',
    categoryColor: 'bg-blue-100 text-blue-700',
    status: 'Traitée',
    statusColor: 'bg-green-100 text-green-700',
  },
  {
    company: 'Formation Ostéo Pro',
    siret: '538 192 047',
    date: '15 juin 2026',
    amount: '890,00 €',
    category: 'Formation',
    categoryColor: 'bg-indigo-100 text-indigo-700',
    status: 'Traitée',
    statusColor: 'bg-green-100 text-green-700',
  },
  {
    company: 'EDF Entreprises',
    siret: '552 081 317',
    date: '12 juin 2026',
    amount: '187,50 €',
    category: 'Énergie',
    categoryColor: 'bg-yellow-100 text-yellow-700',
    status: 'Traitée',
    statusColor: 'bg-green-100 text-green-700',
  },
  {
    company: 'Cabinet Morel Compta',
    siret: '891 204 563',
    date: '10 juin 2026',
    amount: '2 129,50 €',
    category: 'Comptable',
    categoryColor: 'bg-purple-100 text-purple-700',
    status: 'Traitée',
    statusColor: 'bg-green-100 text-green-700',
  },
  {
    company: 'Loyer Cabinet Santé',
    siret: '334 571 089',
    date: '01 juin 2026',
    amount: '1 200,00 €',
    category: 'Loyer',
    categoryColor: 'bg-orange-100 text-orange-700',
    status: 'Traitée',
    statusColor: 'bg-green-100 text-green-700',
  },
];

export default function MockupFacturesRecues() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
      {/* Browser chrome */}
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 ml-4 flex items-center gap-2 border border-gray-200">
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
          facturavis.fr/dashboard/factures-recues
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-5 bg-gray-50/50">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm md:text-base font-black text-gray-900 flex items-center gap-2">
              <Inbox size={16} className="text-green-600" />
              Factures Fournisseurs Re&ccedil;ues
            </h3>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">Plateforme Agr&eacute;&eacute;e DGFiP &mdash; Synchronisation automatique</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-gray-200 shadow-sm">
              <Download size={11} />
              Export FEC
            </div>
            <div className="bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
              <RefreshCw size={11} />
              Synchroniser
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-7 h-7 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={14} />
                </div>
                <span className="text-[9px] md:text-[10px] text-gray-400 font-medium">{stat.label}</span>
              </div>
              <p className="text-lg md:text-xl font-black text-gray-900 leading-none">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
            <span className="col-span-3">Fournisseur</span>
            <span className="col-span-2">SIRET</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-1">Montant</span>
            <span className="col-span-2">Cat&eacute;gorie</span>
            <span className="col-span-1">Statut</span>
            <span className="col-span-1"></span>
          </div>

          {/* Table rows */}
          {factures.map((f) => (
            <div
              key={f.company}
              className="grid grid-cols-2 md:grid-cols-12 gap-2 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors items-center"
            >
              <div className="col-span-1 md:col-span-3 flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-gray-400" />
                </div>
                <span className="text-[11px] font-bold text-gray-800 truncate">{f.company}</span>
              </div>
              <span className="hidden md:block col-span-2 text-[10px] text-gray-400 font-mono">{f.siret}</span>
              <span className="hidden md:block col-span-2 text-[10px] text-gray-500">{f.date}</span>
              <span className="col-span-1 text-[11px] font-black text-gray-900 text-right md:text-left">{f.amount}</span>
              <span className="hidden md:block col-span-2">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${f.categoryColor}`}>{f.category}</span>
              </span>
              <span className="hidden md:block col-span-1">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${f.statusColor}`}>{f.status}</span>
              </span>
              <span className="hidden md:flex col-span-1 justify-end">
                <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center hover:bg-gray-100 cursor-pointer">
                  <Eye size={11} className="text-gray-400" />
                </div>
              </span>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="flex items-center justify-center gap-2 text-[9px] text-gray-400">
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          Derni&egrave;re synchronisation : il y a 2 heures &mdash; Plateforme Agr&eacute;&eacute;e certifi&eacute;e DGFiP
        </div>
      </div>
    </div>
  );
}
