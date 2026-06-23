import {
  TrendingUp, FileText, Star, BarChart3,
  Calendar, ArrowUpRight
} from 'lucide-react';

const stats = [
  { label: 'CA Mensuel', value: '4 250 €', icon: TrendingUp, color: 'bg-blue-50 text-blue-600', trend: '+12%' },
  { label: 'Factures', value: '47', icon: FileText, color: 'bg-purple-50 text-purple-600', trend: '+8' },
  { label: 'Avis Google', value: '32', icon: Star, color: 'bg-yellow-50 text-yellow-600', trend: '+5' },
  { label: 'Note Moyenne', value: '4.8/5', icon: BarChart3, color: 'bg-green-50 text-green-600', trend: '↑' },
];

const chartData = [
  { month: 'Jan', value: 62, amount: '2 800 €' },
  { month: 'Fév', value: 70, amount: '3 150 €' },
  { month: 'Mar', value: 78, amount: '3 510 €' },
  { month: 'Avr', value: 65, amount: '2 925 €' },
  { month: 'Mai', value: 85, amount: '3 825 €' },
  { month: 'Juin', value: 94, amount: '4 250 €' },
];

const invoices = [
  { name: 'Marie Dupont', date: '23 juin 2026', amount: '65,00 €', status: 'Payée', statusColor: 'bg-green-100 text-green-700' },
  { name: 'Jean-Pierre Martin', date: '22 juin 2026', amount: '80,00 €', status: 'Envoyée', statusColor: 'bg-blue-100 text-blue-700' },
  { name: 'Sophie Lefebvre', date: '21 juin 2026', amount: '65,00 €', status: 'Payée', statusColor: 'bg-green-100 text-green-700' },
];

export default function MockupDashboard() {
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
          facturavis.fr/dashboard
        </div>
      </div>

      {/* Dashboard content */}
      <div className="p-4 md:p-6 space-y-5 bg-gray-50/50">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm md:text-base font-black text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              Tableau de bord
            </h3>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">Juin 2026</p>
          </div>
          <div className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
            <FileText size={12} />
            Nouvelle facture
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={14} />
                </div>
                <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <ArrowUpRight size={8} />
                  {stat.trend}
                </span>
              </div>
              <p className="text-base md:text-lg font-black text-gray-900 leading-none">{stat.value}</p>
              <p className="text-[9px] md:text-[10px] text-gray-400 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Bar chart */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <BarChart3 size={13} className="text-blue-600" />
                Chiffre d&apos;affaires
              </h4>
              <span className="text-[9px] text-gray-400 font-medium">6 derniers mois</span>
            </div>
            <div className="flex items-end gap-2" style={{ height: '120px' }}>
              {chartData.map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-[8px] text-gray-400 font-medium mb-1">{bar.amount}</span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 relative"
                    style={{ height: `${Math.round(bar.value * 0.9)}px` }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1/3 bg-white/20 rounded-t-md" />
                  </div>
                  <span className="text-[9px] text-gray-500 font-bold mt-1">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini invoice table */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <FileText size={13} className="text-purple-600" />
                Derni&egrave;res factures
              </h4>
              <span className="text-[9px] text-blue-600 font-bold cursor-pointer">Voir tout</span>
            </div>
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.name} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-600 shrink-0">
                      {inv.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-gray-800 truncate">{inv.name}</p>
                      <p className="text-[9px] text-gray-400">{inv.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-gray-700">{inv.amount}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${inv.statusColor}`}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
