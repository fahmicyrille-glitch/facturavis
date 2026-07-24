'use client';

import type { Facture } from '@/lib/types';
import { Send, Eye, Star, MapPin } from 'lucide-react';

interface AvisFunnelProps {
  factures: Facture[];
}

// Tunnel d'avis : rend visible la fuite entre « 5★ dans l'app » et « clic réel vers Google ».
// Le dernier segment n'était pas mesuré avant (redirection JS invisible pour l'analytics) ;
// il s'appuie désormais sur avis_google_click_at, posé au clic sur le bouton d'avis.
export default function AvisFunnel({ factures }: AvisFunnelProps) {
  const valides = factures.filter((f) => f.statut !== 'Annulée' && f.statut !== 'Annulee');

  const envoyees = valides.length;
  const ouvertes = valides.filter((f) => f.statut_email === 'Ouvert').length;
  const cinqEtoiles = valides.filter((f) => f.note === 5).length;
  const clicsGoogle = valides.filter((f) => !!f.avis_google_click_at).length;

  // Combien de 5★ enregistrés DEPUIS la mise en place du suivi (note_at rempli) :
  // seuls ceux-là peuvent avoir une donnée de clic fiable.
  const cinqEtoilesSuivis = valides.filter((f) => f.note === 5 && !!f.note_at).length;

  const steps = [
    { label: 'Factures envoyées', value: envoyees, icon: Send, color: '#94a3b8' },
    { label: 'Pages ouvertes', value: ouvertes, icon: Eye, color: '#60a5fa' },
    { label: 'Notes 5 étoiles', value: cinqEtoiles, icon: Star, color: '#fbbf24' },
    { label: 'Clics vers Google', value: clicsGoogle, icon: MapPin, color: '#34d399' },
  ];

  const max = Math.max(envoyees, 1);
  const tauxClic = cinqEtoilesSuivis > 0 ? Math.round((clicsGoogle / cinqEtoilesSuivis) * 100) : null;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-700">Tunnel d&apos;avis Google</h3>
        {tauxClic !== null && (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            {tauxClic}% des 5★ cliquent vers Google
          </span>
        )}
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const pct = Math.round((step.value / max) * 100);
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${step.color}22` }}>
                <Icon size={16} style={{ color: step.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600 truncate">{step.label}</span>
                  <span className="text-sm font-black text-gray-900 ml-2">{step.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: step.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tauxClic === null && (
        <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
          Le taux de clic vers Google apparaîtra dès les prochaines notes 5★ (le suivi ne compte
          que les avis notés après sa mise en place).
        </p>
      )}
    </div>
  );
}
