'use client';

import { Ban, Loader2 } from 'lucide-react';
import type { Facture } from '@/lib/types';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  facture: Facture | null;
  loading: boolean;
  onConfirm: () => void;
}

export default function CancelModal({
  isOpen,
  onClose,
  facture,
  loading,
  onConfirm,
}: CancelModalProps) {
  if (!isOpen || !facture) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-50 p-2 rounded-lg"><Ban className="text-red-600" size={24}/></div>
          <h3 className="text-lg font-bold text-gray-900">Annuler la facture ?</h3>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Voulez-vous vraiment annuler la facture de <strong>{facture.patient_nom}</strong> d&apos;un montant de <strong>{facture.montant} &euro;</strong> ? <br/><br/>
          Cette action retirera le montant du Chiffre d&apos;Affaires total. Elle ne supprimera pas le fichier PDF, mais cette facture sera marqu&eacute;e comme annul&eacute;e.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            Retour
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16}/> : 'Confirmer l\'annulation'}
          </button>
        </div>
      </div>
    </div>
  );
}
