'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Facture } from '@/lib/types';

interface ChartAvisProps {
  factures: Facture[];
}

export default function ChartAvis({ factures }: ChartAvisProps) {
  const data = useMemo(() => {
    const now = new Date();
    const months: { name: string; taux: number; avis: number; total: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('fr-FR', { month: 'short' });
      const year = d.getFullYear();
      const month = d.getMonth();

      const monthFactures = factures.filter(f => {
        if (f.statut === 'Annulee') return false;
        const fd = new Date(f.created_at);
        return fd.getFullYear() === year && fd.getMonth() === month;
      });

      const withReview = monthFactures.filter(f => f.note !== null).length;
      const total = monthFactures.length;

      months.push({
        name: monthName,
        taux: total > 0 ? Math.round((withReview / total) * 100) : 0,
        avis: withReview,
        total,
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
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} unit="%" />
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
          formatter={(value, name) => {
            if (name === 'taux') return [`${value}%`, 'Taux de conversion'];
            return [value, String(name)];
          }}
        />
        <Line type="monotone" dataKey="taux" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
