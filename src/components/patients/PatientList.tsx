'use client';

import { Search, Mail } from 'lucide-react';
import type { Patient } from '@/lib/types';

interface PatientListProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelect: (patient: Patient) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreatePatient: () => void;
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  const startIndex = (parts[0] === 'M.' || parts[0] === 'Mme' || parts[0] === 'Enfant') ? 1 : 0;

  if (parts.length > startIndex + 1) {
    return `${parts[startIndex][0]}${parts[startIndex + 1][0]}`.toUpperCase();
  } else if (parts.length > startIndex && parts[startIndex].length > 0) {
    return parts[startIndex].substring(0, 2).toUpperCase();
  }
  return "?";
}

function extractName(nomComplet: string): string {
  if (nomComplet?.startsWith('Mme ')) return nomComplet.substring(4);
  if (nomComplet?.startsWith('M. ')) return nomComplet.substring(3);
  if (nomComplet?.startsWith('Enfant ')) return nomComplet.substring(7);
  return nomComplet || '';
}

export default function PatientList({
  patients,
  selectedPatientId,
  onSelect,
  searchTerm,
  onSearchChange,
}: PatientListProps) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
      <div className="relative group">
        <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Rechercher un nom..."
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="bg-transparent overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
        {patients.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              selectedPatientId === p.id
                ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/20'
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
            } ${p.id === 'temp-new-patient' ? 'animate-pulse bg-blue-50 border-blue-300' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
              selectedPatientId === p.id ? 'bg-white text-blue-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {getInitials(p.nom_complet)}
            </div>
            <div className="text-left overflow-hidden">
              <p className={`font-bold truncate ${selectedPatientId === p.id ? 'text-white' : 'text-gray-900'}`}>
                {p.id === 'temp-new-patient' && !extractName(p.nom_complet) ? 'Nouveau Patient...' : p.nom_complet}
              </p>
              <p className={`text-[10px] flex items-center gap-1 mt-0.5 truncate ${selectedPatientId === p.id ? 'text-blue-100' : 'text-gray-400 font-medium'}`}>
                {p.email ? <><Mail size={10} /> {p.email}</> : <span className="italic">En cours de creation</span>}
              </p>
            </div>
          </button>
        ))}
        {patients.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 border-dashed">
            <p className="text-gray-400 text-sm font-medium">Aucun patient trouve.</p>
          </div>
        )}
      </div>
    </div>
  );
}
