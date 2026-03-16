'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Users, Mail, Phone, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Prospect {
  id: string;
  created_at: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

export default function ProspectsAdminPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProspects = async () => {
      // 1. On vérifie que c'est bien toi (l'admin) qui es connecté
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      // 2. On récupère les inscrits du plus récent au plus ancien
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
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 sm:p-6 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* EN-TÊTE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-blue-600" />
              Membres Fondateurs
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Liste des ostéopathes en attente d'ouverture de compte.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-bold text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center transition-colors shadow-sm">
            <ArrowLeft size={16} className="mr-2" /> Retour Admin
          </Link>
        </div>

        {/* TABLEAU DES PROSPECTS */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase text-[10px]">Date d'inscription</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px]">Praticien</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px]">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prospects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 italic font-medium">
                      Aucun prospect pour le moment. Partagez votre lien !
                    </td>
                  </tr>
                ) : (
                  prospects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center text-slate-500 font-semibold text-xs">
                          <Calendar size={14} className="mr-2 text-slate-400" />
                          {new Date(p.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-base">{p.prenom} {p.nom}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <a href={`mailto:${p.email}`} className="flex items-center text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 w-fit px-2 py-1 rounded-md transition-colors">
                            <Mail size={12} className="mr-2" /> {p.email}
                          </a>
                          <a href={`tel:${p.telephone}`} className="flex items-center text-slate-600 hover:text-slate-900 font-bold text-xs bg-slate-100 w-fit px-2 py-1 rounded-md transition-colors">
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
