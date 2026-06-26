'use client';

import { useState, useMemo } from 'react';
import { X, Send, Loader2, FileSpreadsheet, CalendarDays } from 'lucide-react';
import type { FactureRecue } from '@/lib/types';

interface ComptableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  factures: FactureRecue[];
  comptableEmail: string;
  onSend: (dateDebut: string, dateFin: string, emailComptable: string) => Promise<void>;
  sending: boolean;
}

function getDefaultDates() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    debut: firstDay.toISOString().split('T')[0],
    fin: lastDay.toISOString().split('T')[0],
  };
}

const SHORTCUTS = [
  {
    label: 'Ce mois',
    getDates: () => {
      const now = new Date();
      return {
        debut: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        fin: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Mois dernier',
    getDates: () => {
      const now = new Date();
      return {
        debut: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
        fin: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Ce trimestre',
    getDates: () => {
      const now = new Date();
      const q = Math.floor(now.getMonth() / 3);
      return {
        debut: new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0],
        fin: new Date(now.getFullYear(), q * 3 + 3, 0).toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Trimestre préc.',
    getDates: () => {
      const now = new Date();
      const q = Math.floor(now.getMonth() / 3);
      const prevQ = q === 0 ? 3 : q - 1;
      const year = q === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return {
        debut: new Date(year, prevQ * 3, 1).toISOString().split('T')[0],
        fin: new Date(year, prevQ * 3 + 3, 0).toISOString().split('T')[0],
      };
    },
  },
];

export default function ComptableReportModal({
  isOpen,
  onClose,
  factures,
  comptableEmail,
  onSend,
  sending,
}: ComptableReportModalProps) {
  const defaults = getDefaultDates();
  const [dateDebut, setDateDebut] = useState(defaults.debut);
  const [dateFin, setDateFin] = useState(defaults.fin);
  const [email, setEmail] = useState(comptableEmail);

  const facturesFiltrees = useMemo(() => {
    return factures.filter(f => {
      if (!f.date_facture) return false;
      return f.date_facture >= dateDebut && f.date_facture <= dateFin;
    });
  }, [factures, dateDebut, dateFin]);

  const total = useMemo(
    () => facturesFiltrees.reduce((sum, f) => sum + (f.montant || 0), 0),
    [facturesFiltrees]
  );

  if (!isOpen) return null;

  const handleShortcut = (getDates: () => { debut: string; fin: string }) => {
    const { debut, fin } = getDates();
    setDateDebut(debut);
    setDateFin(fin);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={sending ? undefined : onClose}
    >
      <div
        className="bg-white rounded-[28px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 text-amber-600 p-2.5 rounded-xl">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Envoyer au comptable</h3>
              <p className="text-xs text-gray-500">ZIP avec CSV + PDFs des factures fournisseurs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Période */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={15} className="text-gray-500" />
              <span className="text-sm font-bold text-gray-700">Période</span>
            </div>

            {/* Shortcuts */}
            <div className="flex flex-wrap gap-2 mb-3">
              {SHORTCUTS.map(s => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleShortcut(s.getDates)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Du</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={e => setDateDebut(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Au</label>
                <input
                  type="date"
                  value={dateFin}
                  min={dateDebut}
                  onChange={e => setDateFin(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className={`rounded-2xl p-4 flex items-center justify-between ${
            facturesFiltrees.length > 0 ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50 border border-gray-100'
          }`}>
            <div>
              <p className="text-xs text-gray-500 font-medium">Factures incluses</p>
              <p className={`text-2xl font-extrabold ${facturesFiltrees.length > 0 ? 'text-amber-700' : 'text-gray-400'}`}>
                {facturesFiltrees.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Total</p>
              <p className={`text-2xl font-extrabold ${facturesFiltrees.length > 0 ? 'text-amber-700' : 'text-gray-400'}`}>
                {total.toFixed(2).replace('.', ',')} €
              </p>
            </div>
          </div>

          {/* Email comptable */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Email du comptable
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="comptable@cabinet.fr"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            />
            <p className="text-xs text-gray-400 mt-1">
              Vous pouvez pré-enregistrer cet email dans vos paramètres.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 space-y-2">
          <button
            onClick={() => onSend(dateDebut, dateFin, email)}
            disabled={sending || facturesFiltrees.length === 0 || !email}
            className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl text-white bg-gradient-to-r from-amber-500 to-orange-500 font-bold hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 transition-all shadow-lg shadow-amber-200"
          >
            {sending ? (
              <><Loader2 className="animate-spin" size={18} /> Envoi en cours…</>
            ) : (
              <><Send size={18} /> Envoyer le rapport ({facturesFiltrees.length} facture{facturesFiltrees.length > 1 ? 's' : ''})</>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={sending}
            className="w-full py-3 text-gray-500 hover:text-gray-700 font-semibold text-sm disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
