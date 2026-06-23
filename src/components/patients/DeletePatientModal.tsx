'use client';

import { AlertTriangle } from 'lucide-react';

interface DeletePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patientName: string;
  isDraft: boolean;
}

export default function DeletePatientModal({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  isDraft,
}: DeletePatientModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-red-50 rounded-full text-red-500">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-gray-900">Supprimer le dossier ?</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {isDraft
                ? "Voulez-vous annuler la creation de ce patient ?"
                : `Cette action est irreversible. Toutes les notes de ${patientName} seront definitivement perdues.`
              }
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-100"
          >
            Oui, supprimer
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
