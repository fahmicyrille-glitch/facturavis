'use client';

import {
  Loader2, CheckCircle, Plus, Trash2, Edit2, X, ListPlus
} from 'lucide-react';
import type { Prestation } from '@/lib/types';

interface PrestationsSectionProps {
  prestations: Prestation[];
  newPrestaNom: string;
  setNewPrestaNom: (v: string) => void;
  newPrestaPrix: string;
  setNewPrestaPrix: (v: string) => void;
  addingPresta: boolean;
  onAddPrestation: (e: React.FormEvent) => void;
  editingPrestaId: string | null;
  editPrestaNom: string;
  setEditPrestaNom: (v: string) => void;
  editPrestaPrix: string;
  setEditPrestaPrix: (v: string) => void;
  updatingPresta: boolean;
  onStartEdit: (presta: Prestation) => void;
  onCancelEdit: () => void;
  onUpdatePrestation: (id: string) => void;
  deletingPrestaId: string | null;
  onDeletePrestation: (id: string) => void;
}

export default function PrestationsSection({
  prestations,
  newPrestaNom, setNewPrestaNom,
  newPrestaPrix, setNewPrestaPrix,
  addingPresta, onAddPrestation,
  editingPrestaId,
  editPrestaNom, setEditPrestaNom,
  editPrestaPrix, setEditPrestaPrix,
  updatingPresta,
  onStartEdit, onCancelEdit, onUpdatePrestation,
  deletingPrestaId, onDeletePrestation,
}: PrestationsSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8">
      <div className="flex items-center mb-6 border-b pb-4">
        <ListPlus size={22} className="text-gray-800 mr-2 shrink-0" />
        <h2 className="text-lg font-semibold text-gray-800">Actes & Tarifs par defaut</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Gagnez du temps en enregistrant vos actes habituels. Ils seront proposes en menu deroulant lors de la creation d&apos;une facture.
      </p>

      <div className="space-y-3 mb-6">
        {prestations.map((presta) => (
          <div key={presta.id} className="transition-all">
            {editingPrestaId === presta.id ? (
              <div className="flex flex-col sm:flex-row gap-3 items-center p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <input type="text" className="flex-1 w-full border rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" value={editPrestaNom} onChange={(e) => setEditPrestaNom(e.target.value)} />
                <div className="relative w-full sm:w-28">
                  <input type="number" step="0.01" className="w-full border rounded-lg py-2 pl-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" value={editPrestaPrix} onChange={(e) => setEditPrestaPrix(e.target.value)} />
                  <span className="absolute right-3 top-2 text-gray-400 font-medium">&euro;</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => onUpdatePrestation(presta.id)} disabled={updatingPresta} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg font-bold flex items-center justify-center min-w-[40px]">
                    {updatingPresta ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={18} />}
                  </button>
                  <button onClick={onCancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-2 rounded-lg font-bold">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="font-medium text-gray-800">{presta.nom}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-600 bg-white px-3 py-1 rounded-md border shadow-sm mr-2">{presta.prix} &euro;</span>
                  <button onClick={() => onStartEdit(presta)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => onDeletePrestation(presta.id)} disabled={deletingPrestaId === presta.id} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    {deletingPrestaId === presta.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={onAddPrestation} className="flex flex-col sm:flex-row gap-3 mt-4">
        <input type="text" required placeholder="Ex: Consultation Osteopathie Adulte" className="flex-[3] min-w-0 w-full border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" value={newPrestaNom} onChange={(e) => setNewPrestaNom(e.target.value)} />
        <div className="flex gap-3">
          <div className="relative flex-1 sm:flex-none sm:w-28">
            <input type="number" step="0.01" required placeholder="Prix" className="w-full border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" value={newPrestaPrix} onChange={(e) => setNewPrestaPrix(e.target.value)} />
            <span className="absolute right-3 top-2 text-gray-400 font-medium">&euro;</span>
          </div>
          <button type="submit" disabled={addingPresta} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center min-w-[110px] whitespace-nowrap shrink-0">
            {addingPresta ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} className="mr-1" /> Ajouter</>}
          </button>
        </div>
      </form>
    </div>
  );
}
