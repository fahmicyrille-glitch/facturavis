'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Facture } from '@/lib/types';

interface ChartCAProps {
  factures: Facture[];
}

export default function ChartCA({ factures }: ChartCAProps) {
  const data = useMemo(() => {
    const now = new Date();
    const months: { name: string; ca: number; count: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('fr-FR', { month: 'short' });
      const year = d.getFullYear();
      const month = d.getMonth();

      const monthFactures = factures.filter(f => {
        if (f.statut === 'Annulée' || f.statut === 'Annulee') return false;
        const fd = new Date(f.created_at);
        return fd.getFullYear() === year && fd.getMonth() === month;
      });

      months.push({
        name: monthName,
        ca: monthFactures.reduce((sum, f) => sum + (f.montant || 0), 0),
        count: monthFactures.length,
      });
    }

    return months;
  }, [factures]);

  if (factures.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm italic">
        Pas encore de donnees
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
          formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} €`, 'CA']}
        />
        <Bar dataKey="ca" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
