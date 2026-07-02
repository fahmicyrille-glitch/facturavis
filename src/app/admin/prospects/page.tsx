'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Users, Mail, Phone, Calendar, ArrowLeft, Stethoscope, Filter, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Prospect {
  id: string;
  created_at: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profession: string;
  statut?: string;
}

const STATUT_OPTIONS = [
  { value: 'nouveau', label: 'Nouveau', emoji: '🆕' },
  { value: 'en_cours', label: 'En cours', emoji: '📞' },
  { value: 'attente_doc', label: 'Attente doc/info', emoji: '📄' },
  { value: 'traite', label: 'Traité', emoji: '✅' },
  { value: 'sans_suite', label: 'Sans suite', emoji: '❌' },
];

export default function ProspectsAdminPage() {
  useEffect(() => { document.title = 'Prospects — Admin FacturAvis'; }, []);

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [prospectToDelete, setProspectToDelete] = useState<Prospect | null>(null);
  const [deletingProspect, setDeletingProspect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProspects = async () => {
      // 1. On vérifie que c'est bien l'admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email?.toLowerCase() !== process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()) {
        router.push('/dashboard');
        return;
      }

      // 2. On récupère les inscrits
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setProspects(data);
      setLoading(false);
    };

    fetchProspects();
  }, [router]);

  const handleStatusChange = async (prospectId: string, newStatus: string) => {
    setUpdatingId(prospectId);
    const { error } = await supabase
      .from('prospects')
      .update({ statut: newStatus })
      .eq('id', prospectId);

    if (!error) {
      setProspects(prev => prev.map(p =>
        p.id === prospectId ? { ...p, statut: newStatus } : p
      ));
    }
    setUpdatingId(null);
  };

  const handleDeleteProspect = (prospect: Prospect) => {
    setProspectToDelete(prospect);
  };

  const confirmDeleteProspect = async () => {
    if (!prospectToDelete) return;
    setDeletingProspect(true);
    const { error } = await supabase
      .from('prospects')
      .delete()
      .eq('id', prospectToDelete.id);

    if (!error) {
      setProspects(prev => prev.filter(p => p.id !== prospectToDelete.id));
    }
    setDeletingProspect(false);
    setProspectToDelete(null);
  };

  const filteredProspects = filterStatut === 'all'
    ? prospects
    : prospects.filter(p => (p.statut || 'nouveau') === filterStatut);

  const statutCounts = STATUT_OPTIONS.reduce((acc, opt) => {
    acc[opt.value] = prospects.filter(p => (p.statut || 'nouveau') === opt.value).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfaf8]">
      <Loader2 className="animate-spin text-[#a9825a]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfaf8] p-4 sm:p-8 text-[#3e2f25] font-sans selection:bg-[#a9825a] selection:text-white">
      <ConfirmDialog
        isOpen={!!prospectToDelete}
        title="Supprimer ce prospect"
        description={prospectToDelete ? `${prospectToDelete.prenom} ${prospectToDelete.nom} sera définitivement retiré de la liste des membres fondateurs.` : ''}
        confirmLabel="Oui, supprimer"
        cancelLabel="Annuler"
        loading={deletingProspect}
        onConfirm={confirmDeleteProspect}
        onClose={() => !deletingProspect && setProspectToDelete(null)}
      />
      <div className="max-w-6xl mx-auto space-y-8">

        {/* EN-TETE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#f0e6de] shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-[#3e2f25] flex items-center gap-3">
              <div className="bg-[#fdf2e9] p-2 rounded-xl text-[#a9825a]">
                <Users size={24} />
              </div>
              Membres Fondateurs ({prospects.length})
            </h1>
            <p className="text-sm text-[#7a6a5f] mt-2 font-medium ml-12">
              Liste des praticiens inscrits, classes du plus recent au plus ancien.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-bold text-[#7a6a5f] bg-white border border-[#f0e6de] hover:border-[#a9825a] px-5 py-2.5 rounded-xl hover:bg-[#fdf2e9] hover:text-[#a9825a] flex items-center transition-all shadow-sm">
            <ArrowLeft size={16} className="mr-2" /> Retour Dashboard
          </Link>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {STATUT_OPTIONS.map(opt => (
            <div key={opt.value} className="bg-white border border-[#f0e6de] rounded-xl p-3 text-center shadow-sm">
              <div className="text-lg">{opt.emoji}</div>
              <div className="text-2xl font-black text-[#3e2f25]">{statutCounts[opt.value] || 0}</div>
              <div className="text-[10px] font-bold text-[#7a6a5f] uppercase tracking-widest">{opt.label}</div>
            </div>
          ))}
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-4 rounded-[16px] border border-[#f0e6de] shadow-sm">
          <Filter size={14} className="text-[#7a6a5f]" />
          <span className="text-xs font-bold text-[#7a6a5f] mr-1">Filtrer :</span>
          <button
            onClick={() => setFilterStatut('all')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${filterStatut === 'all' ? 'bg-[#a9825a] text-white' : 'bg-[#fdf2e9] text-[#7a6a5f] hover:bg-[#f0e6de]'}`}
          >
            Tous ({prospects.length})
          </button>
          {STATUT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterStatut(opt.value)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${filterStatut === opt.value ? 'bg-[#a9825a] text-white' : 'bg-[#fdf2e9] text-[#7a6a5f] hover:bg-[#f0e6de]'}`}
            >
              {opt.emoji} {opt.label} ({statutCounts[opt.value] || 0})
            </button>
          ))}
        </div>

        {/* TABLEAU DES PROSPECTS */}
        <div className="bg-white border border-[#f0e6de] rounded-[24px] shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fcfaf8] text-[#7a6a5f] border-b border-[#f0e6de]">
                <tr>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Date d&apos;inscription</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Praticien</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Specialite</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Statut</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Contact</th>
                  <th className="px-4 py-5 font-black uppercase tracking-widest text-[10px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e6de]">
                {filteredProspects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-[#7a6a5f] font-medium">
                      <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                        <Users size={40} />
                        <p>Aucun prospect pour le moment. Lancez vos campagnes !</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProspects.map((p) => (
                    <tr key={p.id} className="hover:bg-[#fcfaf8] transition-colors group">
                      {/* DATE */}
                      <td className="px-6 py-5">
                        <div className="flex items-center text-[#7a6a5f] font-bold text-xs">
                          <Calendar size={14} className="mr-2 opacity-50" />
                          {new Date(p.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* NOM & PRENOM */}
                      <td className="px-6 py-5">
                        <div className="font-black text-[#3e2f25] text-base group-hover:text-[#a9825a] transition-colors">
                          {p.prenom} {p.nom}
                        </div>
                      </td>

                      {/* PROFESSION */}
                      <td className="px-6 py-5">
                        {p.profession ? (
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-100 font-bold text-xs">
                             <Stethoscope size={12} /> {p.profession}
                           </div>
                        ) : (
                           <span className="text-xs text-gray-400 italic">Non renseignee</span>
                        )}
                      </td>

                      {/* STATUT */}
                      <td className="px-6 py-5">
                        <select
                          value={p.statut || 'nouveau'}
                          onChange={(e) => handleStatusChange(p.id, e.target.value)}
                          disabled={updatingId === p.id}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white font-bold focus:ring-2 focus:ring-[#a9825a]/20 focus:border-[#a9825a] outline-none"
                        >
                          <option value="nouveau">🆕 Nouveau</option>
                          <option value="en_cours">📞 En cours</option>
                          <option value="attente_doc">📄 Attente doc/info</option>
                          <option value="traite">✅ Traite</option>
                          <option value="sans_suite">❌ Sans suite</option>
                        </select>
                      </td>

                      {/* CONTACT */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <a href={`mailto:${p.email}`} className="flex items-center text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 w-fit px-3 py-1.5 rounded-lg transition-colors border border-blue-100">
                            <Mail size={12} className="mr-2" /> {p.email}
                          </a>
                          <a href={`tel:${p.telephone}`} className="flex items-center text-[#3e2f25] hover:text-black font-bold text-xs bg-gray-50 w-fit px-3 py-1.5 rounded-lg transition-colors border border-gray-200">
                            <Phone size={12} className="mr-2" /> {p.telephone}
                          </a>
                        </div>
                      </td>

                      {/* SUPPRIMER */}
                      <td className="px-4 py-5">
                        <button
                          onClick={() => handleDeleteProspect(p)}
                          disabled={updatingId === p.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Supprimer ce prospect"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
