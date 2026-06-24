'use client';

import { useMemo } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import type { Facture, Cabinet } from '@/lib/types';

interface QuickInvoiceProps {
  factures: Facture[];
  cabinets: Cabinet[];
}

export default function QuickInvoice({ factures, cabinets }: QuickInvoiceProps) {
  const topPatterns = useMemo(() => {
    const counts: Record<string, { nom: string; email: string; montant: number; count: number; cabinetId: string }> = {};

    const validFactures = factures.filter(f => f.statut !== 'Annulée' && f.statut !== 'Annulee').slice(0, 50);

    for (const f of validFactures) {
      const key = `${f.patient_email}|${f.montant}`;
      if (!counts[key]) {
        counts[key] = {
          nom: f.patient_nom,
          email: f.patient_email,
          montant: f.montant,
          count: 0,
          cabinetId: f.cabinet_id,
        };
      }
      counts[key].count++;
    }

    return Object.values(counts)
      .filter(p => p.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [factures]);

  if (topPatterns.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <Zap size={16} className="text-yellow-500" /> Factures rapides
      </h3>
      <div className="space-y-2">
        {topPatterns.map((pattern, i) => {
          const cab = cabinets.find(c => c.id === pattern.cabinetId);
          return (
            <a
              key={i}
              href={`/dashboard/facture/nouvelle?email=${encodeURIComponent(pattern.email)}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{pattern.nom}</p>
                <p className="text-[10px] text-gray-500">{pattern.montant}&euro; &middot; {cab?.nom || 'Cabinet'} &middot; {pattern.count}x</p>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-500 shrink-0 group-hover:translate-x-1 transition-all" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
