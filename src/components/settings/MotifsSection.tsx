'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, Plus, Trash2, Edit2, X, ClipboardList, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { MotifConsultation } from '@/lib/types';

interface MotifsSectionProps {
  userId: string | null;
}

export default function MotifsSection({ userId }: MotifsSectionProps) {
  const [motifs, setMotifs] = useState<MotifConsultation[]>([]);
  const [loading, setLoading] = useState(true);

  const [newNom, setNewNom] = useState('');
  const [newDuree, setNewDuree] = useState('30');
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editDuree, setEditDuree] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('motifs_consultation')
      .select('*')
      .eq('therapeute_id', userId)
      .order('ordre', { ascending: true })
      .then(({ data }) => {
        if (data) setMotifs(data);
        setLoading(false);
      });
  }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newNom.trim()) return;
    setAdding(true);
    const duree = Math.max(5, Math.min(480, parseInt(newDuree, 10) || 30));
    const ordre = motifs.length > 0 ? Math.max(...motifs.map((m) => m.ordre)) + 1 : 0;
    const { data, error } = await supabase.from('motifs_consultation').insert([{
      therapeute_id: userId,
      nom: newNom.trim(),
      duree_minutes: duree,
      ordre,
    }]).select().single();
    if (!error && data) {
      setMotifs((prev) => [...prev, data]);
      setNewNom('');
      setNewDuree('30');
    }
    setAdding(false);
  };

  const startEdit = (motif: MotifConsultation) => {
    setEditingId(motif.id);
    setEditNom(motif.nom);
    setEditDuree(String(motif.duree_minutes));
  };

  const handleUpdate = async (id: string) => {
    if (!editNom.trim()) return;
    setUpdatingId(id);
    const duree = Math.max(5, Math.min(480, parseInt(editDuree, 10) || 30));
    const { error } = await supabase.from('motifs_consultation').update({
      nom: editNom.trim(),
      duree_minutes: duree,
    }).eq('id', id);
    if (!error) {
      setMotifs((prev) => prev.map((m) => (m.id === id ? { ...m, nom: editNom.trim(), duree_minutes: duree } : m)));
      setEditingId(null);
    }
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('motifs_consultation').delete().eq('id', id);
    if (!error) setMotifs((prev) => prev.filter((m) => m.id !== id));
    setDeletingId(null);
  };

  const handleToggleActif = async (motif: MotifConsultation) => {
    setTogglingId(motif.id);
    const { error } = await supabase.from('motifs_consultation').update({ actif: !motif.actif }).eq('id', motif.id);
    if (!error) setMotifs((prev) => prev.map((m) => (m.id === motif.id ? { ...m, actif: !m.actif } : m)));
    setTogglingId(null);
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= motifs.length) return;
    const a = motifs[index];
    const b = motifs[target];
    setReorderingId(a.id);
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from('motifs_consultation').update({ ordre: b.ordre }).eq('id', a.id),
      supabase.from('motifs_consultation').update({ ordre: a.ordre }).eq('id', b.id),
    ]);
    if (!e1 && !e2) {
      const next = [...motifs];
      next[index] = { ...b, ordre: a.ordre };
      next[target] = { ...a, ordre: b.ordre };
      next.sort((x, y) => x.ordre - y.ordre);
      setMotifs(next);
    }
    setReorderingId(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8">
      <div className="flex items-center mb-2 border-b pb-4">
        <ClipboardList size={20} className="text-gray-800 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Motifs de consultation</h2>
      </div>
      <p className="text-xs text-gray-500 mb-6">
        Vos patients choisissent un motif lors de la réservation en ligne — chaque motif a sa propre durée, qui détermine les créneaux proposés (comme sur Doctolib).
      </p>

      {motifs.length === 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-xs text-blue-700">
          Aucun motif configuré : vos patients verront un motif générique &quot;Consultation&quot; basé sur votre durée par défaut. Ajoutez vos premiers motifs ci-dessous pour une prise de rendez-vous plus précise.
        </div>
      )}

      <div className="space-y-3 mb-6">
        {motifs.map((motif, index) => (
          <div key={motif.id} className="transition-all">
            {editingId === motif.id ? (
              <div className="flex flex-col sm:flex-row gap-3 items-center p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <input
                  type="text"
                  className="flex-1 w-full border rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={editNom}
                  onChange={(e) => setEditNom(e.target.value)}
                />
                <div className="relative w-full sm:w-28">
                  <input
                    type="number"
                    min={5}
                    max={480}
                    step={5}
                    className="w-full border rounded-lg py-2 pl-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={editDuree}
                    onChange={(e) => setEditDuree(e.target.value)}
                  />
                  <span className="absolute right-3 top-2 text-gray-400 font-medium text-xs">min</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => handleUpdate(motif.id)} disabled={updatingId === motif.id} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg font-bold flex items-center justify-center min-w-[40px]">
                    {updatingId === motif.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={18} />}
                  </button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-2 rounded-lg font-bold">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`flex justify-between items-center p-4 border rounded-xl ${motif.actif ? 'bg-gray-50 border-gray-200' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col shrink-0">
                    <button onClick={() => move(index, -1)} disabled={index === 0 || reorderingId === motif.id} className="text-gray-300 hover:text-gray-600 disabled:opacity-30">
                      <ArrowUp size={14} />
                    </button>
                    <button onClick={() => move(index, 1)} disabled={index === motifs.length - 1 || reorderingId === motif.id} className="text-gray-300 hover:text-gray-600 disabled:opacity-30">
                      <ArrowDown size={14} />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-800 block truncate">{motif.nom}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={11} /> {motif.duree_minutes} min {!motif.actif && '· masqué des patients'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="flex items-center gap-1.5 mr-1 cursor-pointer" title={motif.actif ? 'Visible par les patients' : 'Masqué des patients'}>
                    <input
                      type="checkbox"
                      checked={motif.actif}
                      onChange={() => handleToggleActif(motif)}
                      disabled={togglingId === motif.id}
                      className="w-4 h-4 accent-blue-600"
                    />
                  </label>
                  <button onClick={() => startEdit(motif)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(motif.id)} disabled={deletingId === motif.id} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    {deletingId === motif.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 mt-4">
        <input
          type="text"
          required
          placeholder="Ex : Première consultation, Suivi, Bilan..."
          className="flex-[3] min-w-0 w-full border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          value={newNom}
          onChange={(e) => setNewNom(e.target.value)}
        />
        <div className="flex gap-3">
          <div className="relative flex-1 sm:flex-none sm:w-28">
            <input
              type="number"
              min={5}
              max={480}
              step={5}
              required
              className="w-full border border-gray-300 rounded-lg py-2 pl-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={newDuree}
              onChange={(e) => setNewDuree(e.target.value)}
            />
            <span className="absolute right-3 top-2 text-gray-400 font-medium text-xs">min</span>
          </div>
          <button type="submit" disabled={adding} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center min-w-[110px] whitespace-nowrap shrink-0">
            {adding ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} className="mr-1" /> Ajouter</>}
          </button>
        </div>
      </form>
    </div>
  );
}
