'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CountdownBanner() {
  const [days, setDays] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const target = new Date('2026-09-01T00:00:00');
    const now = new Date();
    const diff = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    setDays(diff);
  }, []);

  if (dismissed || days === 0) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-red-600 to-orange-600 text-white text-center py-2.5 px-4 text-xs md:text-sm font-bold">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 md:gap-3">
          <AlertTriangle size={16} className="shrink-0 animate-pulse" />
          <span>
            Réception de factures fournisseurs obligatoire dans <span className="bg-white/20 px-2 py-0.5 rounded-md font-black">{days} jours</span> —
            Êtes-vous prêt ?
          </span>
          <Link href="/inscription" className="hidden sm:inline-flex bg-white text-red-600 px-3 py-1 rounded-full text-xs font-black hover:bg-red-50 transition-colors ml-2">
            Réception gratuite →
          </Link>
          <button onClick={() => setDismissed(true)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-lg">×</button>
        </div>
      </div>
      {/* Spacer to push content below the fixed banner */}
      <div className="h-[38px]" />
    </>
  );
}
