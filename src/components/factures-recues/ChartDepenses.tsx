'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { FactureRecue } from '@/lib/types';

const COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#f97316',
  '#22c55e', '#6366f1', '#ec4899', '#a855f7', '#6b7280',
];

interface ChartDepensesProps {
  factures: FactureRecue[];
}

export default function ChartDepenses({ factures }: ChartDepensesProps) {
  const categorieData = factures.reduce((acc, f) => {
    const cat = f.categorie || 'Autre';
    acc[cat] = (acc[cat] || 0) + (f.montant || 0);
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categorieData)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Aucune donnée de dépense
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <div className="w-[180px] h-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${Number(value).toLocaleString('fr-FR')} €`}
              contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '13px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        {data.map((item, i) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="truncate text-gray-700 flex-1">{item.name}</span>
              <span className="text-gray-500 text-xs shrink-0">{pct}%</span>
              <span className="font-semibold text-gray-900 shrink-0 tabular-nums">{item.value.toLocaleString('fr-FR')} €</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
