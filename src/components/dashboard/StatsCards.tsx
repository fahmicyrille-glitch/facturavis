'use client';

import { Euro, FileText, MessageSquare, Star } from 'lucide-react';

interface StatsCardsProps {
  chiffreAffaires: number;
  caParMode: Record<string, number>;
  totalFactures: number;
  avisRecoltes: number;
  noteMoyenne: string;
}

export default function StatsCards({
  chiffreAffaires,
  caParMode,
  totalFactures,
  avisRecoltes,
  noteMoyenne,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
        <div className="flex items-center">
          <div className="bg-indigo-50 p-3 rounded-lg mr-4"><Euro className="text-indigo-600" size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Chiffre d&apos;affaires</p>
            <h3 className="text-2xl font-bold text-gray-900">{chiffreAffaires.toLocaleString('fr-FR')} &euro;</h3>
          </div>
        </div>
        {chiffreAffaires > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(caParMode).map(([mode, total]) => total > 0 && (
              <div key={mode} className="flex justify-between items-center text-xs">
                <span className="text-gray-500">{mode}</span>
                <span className="font-semibold text-gray-800">{total.toLocaleString('fr-FR')} &euro;</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="bg-blue-50 p-3 rounded-lg mr-4"><FileText className="text-blue-600" size={24} /></div>
        <div>
          <p className="text-sm font-medium text-gray-500">Factures valides</p>
          <h3 className="text-2xl font-bold text-gray-900">{totalFactures}</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="bg-green-50 p-3 rounded-lg mr-4"><MessageSquare className="text-green-600" size={24} /></div>
        <div>
          <p className="text-sm font-medium text-gray-500">Avis r&eacute;colt&eacute;s</p>
          <h3 className="text-2xl font-bold text-gray-900">{avisRecoltes}</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="bg-yellow-50 p-3 rounded-lg mr-4"><Star className="text-yellow-600" size={24} /></div>
        <div>
          <p className="text-sm font-medium text-gray-500">Note moyenne</p>
          <h3 className="text-2xl font-bold text-gray-900">{noteMoyenne} <span className="text-sm text-gray-400 font-normal">/ 5</span></h3>
        </div>
      </div>
    </div>
  );
}
