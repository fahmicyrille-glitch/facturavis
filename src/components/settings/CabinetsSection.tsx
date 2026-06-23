'use client';

import {
  Loader2, Plus, Trash2, Edit2,
  MapPin, Link as LinkIcon
} from 'lucide-react';
import type { Cabinet } from '@/lib/types';

interface CabinetsSectionProps {
  cabinets: Cabinet[];
  newCabinetNom: string;
  setNewCabinetNom: (v: string) => void;
  newCabinetLink: string;
  setNewCabinetLink: (v: string) => void;
  addingCabinet: boolean;
  onAddCabinet: (e: React.FormEvent) => void;
  editingCabinetId: string | null;
  editNom: string;
  setEditNom: (v: string) => void;
  editLink: string;
  setEditLink: (v: string) => void;
  updatingCabinet: boolean;
  onStartEdit: (cab: Cabinet) => void;
  onCancelEdit: () => void;
  onUpdateCabinet: (id: string) => void;
  deletingId: string | null;
  onDeleteCabinet: (id: string) => void;
}

export default function CabinetsSection({
  cabinets,
  newCabinetNom, setNewCabinetNom,
  newCabinetLink, setNewCabinetLink,
  addingCabinet, onAddCabinet,
  editingCabinetId,
  editNom, setEditNom,
  editLink, setEditLink,
  updatingCabinet,
  onStartEdit, onCancelEdit, onUpdateCabinet,
  deletingId, onDeleteCabinet,
}: CabinetsSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">Lieux de consultation</h2>
      <div className="space-y-4 mb-8">
        {cabinets.map((cab) => (
          <div key={cab.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl transition-all">
            {editingCabinetId === cab.id ? (
              <div className="space-y-3">
                <input type="text" className="w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" value={editNom} onChange={(e) => setEditNom(e.target.value)} placeholder="Nom du cabinet" />
                <input type="url" className="w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" value={editLink} onChange={(e) => setEditLink(e.target.value)} placeholder="Lien Google Avis" />
                <div className="flex gap-2">
                  <button onClick={() => onUpdateCabinet(cab.id)} disabled={updatingCabinet} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 flex items-center justify-center">
                    {updatingCabinet ? <Loader2 size={14} className="animate-spin" /> : 'Valider'}
                  </button>
                  <button onClick={onCancelEdit} className="flex-1 bg-gray-200 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-300">Annuler</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800 flex items-center"><MapPin size={16} className="mr-2 text-blue-500" /> {cab.nom}</div>
                  <div className="text-xs text-blue-500 flex items-center mt-1 truncate max-w-[200px] sm:max-w-md">
                    <LinkIcon size={12} className="mr-1" /> {cab.lien_avis_google}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onStartEdit(cab)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => onDeleteCabinet(cab.id)} disabled={deletingId === cab.id} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    {deletingId === cab.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wider">Ajouter un nouveau lieu</h3>
        <form onSubmit={onAddCabinet} className="flex flex-col md:flex-row gap-3">
          <input type="text" required placeholder="Nom (ex: Cabinet de Sevres)" className="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" value={newCabinetNom} onChange={(e) => setNewCabinetNom(e.target.value)} />
          <input type="url" required placeholder="Lien Google Avis" className="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" value={newCabinetLink} onChange={(e) => setNewCabinetLink(e.target.value)} />
          <button type="submit" disabled={addingCabinet} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center min-w-[100px]">
            {addingCabinet ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} className="mr-1" /> Ajouter</>}
          </button>
        </form>
      </div>
    </div>
  );
}
