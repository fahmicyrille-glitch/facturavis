'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Users, Mail, Phone, Calendar, ArrowLeft, Stethoscope } from 'lucide-react';
import Link from 'next/link';

interface Prospect {
  id: string;
  created_at: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profession: string; // <-- Ajout de la propriété
}

export default function ProspectsAdminPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProspects = async () => {
      // 1. On vérifie que c'est bien l'admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfaf8]">
      <Loader2 className="animate-spin text-[#a9825a]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfaf8] p-4 sm:p-8 text-[#3e2f25] font-sans selection:bg-[#a9825a] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* EN-TÊTE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#f0e6de] shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-[#3e2f25] flex items-center gap-3">
              <div className="bg-[#fdf2e9] p-2 rounded-xl text-[#a9825a]">
                <Users size={24} />
              </div>
              Membres Fondateurs ({prospects.length})
            </h1>
            <p className="text-sm text-[#7a6a5f] mt-2 font-medium ml-12">
              Liste des praticiens inscrits, classés du plus récent au plus ancien.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-bold text-[#7a6a5f] bg-white border border-[#f0e6de] hover:border-[#a9825a] px-5 py-2.5 rounded-xl hover:bg-[#fdf2e9] hover:text-[#a9825a] flex items-center transition-all shadow-sm">
            <ArrowLeft size={16} className="mr-2" /> Retour Dashboard
          </Link>
        </div>

        {/* TABLEAU DES PROSPECTS */}
        <div className="bg-white border border-[#f0e6de] rounded-[24px] shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fcfaf8] text-[#7a6a5f] border-b border-[#f0e6de]">
                <tr>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Date d'inscription</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Praticien</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Spécialité</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e6de]">
                {prospects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-[#7a6a5f] font-medium">
                      <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                        <Users size={40} />
                        <p>Aucun prospect pour le moment. Lancez vos campagnes !</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  prospects.map((p) => (
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

                      {/* NOM & PRÉNOM */}
                      <td className="px-6 py-5">
                        <div className="font-black text-[#3e2f25] text-base group-hover:text-[#a9825a] transition-colors">
                          {p.prenom} {p.nom}
                        </div>
                      </td>

                      {/* PROFESSION (NOUVEAU BADGE) */}
                      <td className="px-6 py-5">
                        {p.profession ? (
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-100 font-bold text-xs">
                             <Stethoscope size={12} /> {p.profession}
                           </div>
                        ) : (
                           <span className="text-xs text-gray-400 italic">Non renseignée</span>
                        )}
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
