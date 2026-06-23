'use client';

import { Mail, Loader2 } from 'lucide-react';

interface EditEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailToEdit: string;
  setEmailToEdit: (v: string) => void;
  loading: boolean;
  onConfirm: () => void;
}

export default function EditEmailModal({
  isOpen,
  onClose,
  emailToEdit,
  setEmailToEdit,
  loading,
  onConfirm,
}: EditEmailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 p-2 rounded-lg"><Mail className="text-blue-600" size={20}/></div>
          <h3 className="text-lg font-semibold text-gray-900">Corriger l&apos;email et renvoyer la facture :</h3>
        </div>

        <input
          type="email"
          value={emailToEdit}
          onChange={(e) => setEmailToEdit(e.target.value)}
          placeholder="Nouvel email du patient"
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 mb-6"
          autoFocus
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16}/> : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}
