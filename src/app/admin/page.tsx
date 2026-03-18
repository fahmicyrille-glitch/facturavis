'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users, FileText, Star, Send, Loader2, Activity, ArrowLeft, CheckCircle, Edit, X, ThumbsUp, MailOpen, Target, Settings } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Therapeute {
  id: string;
  nom: string;
  email: string;
  titre: string;
  telephone: string;
  logo_url: string;
  created_at: string;
}

interface Facture {
  id: string;
  therapeute_id: string;
  note: number | null;
  created_at: string;
  statut_email: string;
}

export default function SuperAdmin() {
  const [loading, setLoading] = useState(true);
  const [therapeutes, setTherapeutes] = useState<Therapeute[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);

  // États du formulaire CRUD
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNom, setFormNom] = useState('');
  const [formNomCabinet, setFormNomCabinet] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formTitre, setFormTitre] = useState('');
  const [formTelephone, setFormTelephone] = useState('');
  const [formLienGoogle, setFormLienGoogle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // États Test SAV
  const [selectedTherapeuteId, setSelectedTherapeuteId] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const router = useRouter();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || session.user.email?.toLowerCase() !== adminEmail?.toLowerCase()) {
        router.push('/dashboard');
        return;
      }

      try {
        const res = await fetch('/api/admin/data', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTherapeutes(data.therapeutes || []);
          setFactures(data.factures || []);
          if (data.therapeutes?.length > 0) setSelectedTherapeuteId(data.therapeutes[0].id);
        }
      } catch (e) { console.error("Erreur data admin"); }
      setLoading(false);
    };
    checkAdminAndFetchData();
  }, [router, adminEmail]);

  const resetForm = () => {
    setEditingId(null); setFormNom(''); setFormNomCabinet(''); setFormEmail('');
    setFormPassword(''); setFormTitre(''); setFormTelephone(''); setFormLienGoogle('');
  };

  const handleEditClick = (t: Therapeute) => {
    setEditingId(t.id);
    setFormNom(t.nom || '');
    setFormEmail(t.email || '');
    setFormPassword('');
    setFormTitre(t.titre || '');
    setFormTelephone(t.telephone || '');
    setFormLienGoogle('');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom || !formEmail) return;
    if (!editingId && (!formLienGoogle || !formNomCabinet)) {
      toast.error("Le nom du cabinet et le lien Google sont obligatoires");
      return;
    }

    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    try {
      if (editingId) {
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({ id: editingId, email: formEmail, password: formPassword || undefined, nom: formNom, titre: formTitre, telephone: formTelephone })
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success('Praticien mis à jour !');
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({
            email: formEmail,
            password: formPassword,
            nom: formNom,
            nom_cabinet: formNomCabinet,
            titre: formTitre,
            telephone: formTelephone,
            lien_google: formLienGoogle
          })
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success('Praticien et Cabinet créés !');
      }
      resetForm();
      window.location.reload();
    } catch (error: any) {
      toast.error("Erreur : " + error.message);
    } finally { setIsSaving(false); }
  };

  const handleDeleteUser = async (id: string, nom: string) => {
    if (!confirm(`⚠️ Supprimer DÉFINITIVEMENT le compte de ${nom} ?`)) return;
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      setTherapeutes(therapeutes.filter(t => t.id !== id));
      toast.success('Supprimé avec succès');
    } catch (error: any) { toast.error(error.message); }
  };

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTherapeuteId || !testEmail) return;
    setSendingTest(true);
    const therapeute = therapeutes.find(t => t.id === selectedTherapeuteId);
    if (!therapeute) return;

    try {
      await fetch('/api/send-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail, nomPatient: "TEST PATIENT (SAV)", lienFacture: `${window.location.origin}`,
          nomTherapeute: therapeute.nom, titreTherapeute: therapeute.titre, telephoneTherapeute: therapeute.telephone,
          emailTherapeute: therapeute.email, logoUrlTherapeute: therapeute.logo_url, cabinetNom: "Cabinet de Test SAV"
        }),
      });
      setTestSuccess(true); setTimeout(() => setTestSuccess(false), 3000); setTestEmail('');
    } catch (error) { toast.error("Erreur d'envoi test"); } finally { setSendingTest(false); }
  };

  // KPI
  const totalFactures = factures.length;
  const facturesAvecAvis = factures.filter(f => f.note !== null);
  const total5Etoiles = facturesAvecAvis.filter(f => f.note === 5).length;
  const globalConv = totalFactures > 0 ? Math.round((facturesAvecAvis.length / totalFactures) * 100) : 0;
  const globalOuverture = totalFactures > 0 ? Math.round((factures.filter(f => f.statut_email === 'Ouvert' || f.statut_email === 'Relancé').length / totalFactures) * 100) : 0;

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* HEADER - BOUTONS PROSPECTS ET DASHBOARD ICI */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-900 text-white p-6 rounded-2xl shadow-lg gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30">
              <ShieldAlert className="text-purple-400" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Centre de Contrôle (God Mode)</h1>
              <p className="text-gray-400 text-sm font-medium">Gestion Admin BoostAvis</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* 🌟 LE BOUTON PROSPECTS REVIENT ICI */}
            <Link href="/admin/prospects" className="flex-1 sm:flex-none flex items-center justify-center text-sm font-bold text-blue-900 bg-blue-400 hover:bg-blue-300 px-4 py-2 rounded-lg transition shadow-sm">
              <Users size={16} className="mr-2" /> Prospects
            </Link>
            <Link href="/dashboard" className="flex-1 sm:flex-none flex items-center justify-center text-sm font-medium text-gray-300 hover:text-white bg-gray-800 px-4 py-2 rounded-lg transition">
              <ArrowLeft size={16} className="mr-2" /> Dashboard
            </Link>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center text-gray-400 mb-2 font-bold text-[10px] uppercase tracking-widest"><Users size={14} className="mr-2 text-blue-500"/> Praticiens</div>
            <div className="text-3xl font-black text-gray-900">{therapeutes.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center text-gray-400 mb-2 font-bold text-[10px] uppercase tracking-widest"><FileText size={14} className="mr-2 text-indigo-500"/> Factures</div>
            <div className="text-3xl font-black text-gray-900">{totalFactures}</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center text-gray-400 mb-2 font-bold text-[10px] uppercase tracking-widest"><MailOpen size={14} className="mr-2 text-orange-500"/> Ouverture</div>
            <div className="text-3xl font-black text-gray-900">{globalOuverture}%</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border-b-4 border-b-green-500">
            <div className="flex items-center text-gray-400 mb-2 font-bold text-[10px] uppercase tracking-widest"><Target size={14} className="mr-2 text-green-500"/> Conversion</div>
            <div className="text-3xl font-black text-green-600">{globalConv}%</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm relative overflow-hidden">
            <div className="flex items-center text-gray-400 mb-2 font-bold text-[10px] uppercase tracking-widest"><ThumbsUp size={14} className="mr-2 text-yellow-500"/> Google 5⭐</div>
            <div className="text-3xl font-black text-yellow-500">{total5Etoiles} <span className="text-sm font-medium text-gray-300">Avis</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border overflow-hidden h-fit">
            <div className="p-6 border-b bg-gray-50/50 flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              <h2 className="font-bold text-gray-900">Suivi des performances</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Praticien</th>
                    <th className="px-6 py-4 text-center">Envois</th>
                    <th className="px-6 py-4 text-center">Conversion</th>
                    <th className="px-6 py-4 text-center">Note Google</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {therapeutes.map((t) => {
                    const fT = factures.filter(f => f.therapeute_id === t.id);
                    return (
                      <tr key={t.id} className="hover:bg-blue-50/20 transition-all">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{t.nom}</div>
                          <div className="text-[10px] text-gray-400">{t.email}</div>
                        </td>
                        <td className="px-6 py-4 text-center font-bold">{fT.length}</td>
                        <td className="px-6 py-4 text-center font-black text-blue-600">{fT.length > 0 ? Math.round((fT.filter(f => f.note).length / fT.length) * 100) : 0}%</td>
                        <td className="px-6 py-4 text-center text-lg font-black text-yellow-500">{fT.filter(f => f.note === 5).length} ⭐</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-1">
                          <button onClick={() => window.open(`/dashboard/settings?as=${t.id}`, '_blank')} className="text-gray-400 p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Gérer les cabinets/logo"><Settings size={16} /></button>
                          <button onClick={() => handleEditClick(t)} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteUser(t.id, t.nom)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg">🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="xl:col-span-1 space-y-6">
            <div className={`bg-white rounded-2xl shadow-sm border transition-all ${editingId ? 'ring-2 ring-blue-500' : 'border-gray-100'}`}>
              <div className={`p-4 border-b flex justify-between items-center rounded-t-2xl ${editingId ? 'bg-blue-50' : 'bg-green-50'}`}>
                <h2 className={`font-bold text-xs uppercase tracking-widest ${editingId ? 'text-blue-700' : 'text-green-700'}`}>{editingId ? 'Modifier Profil' : 'Nouveau Compte'}</h2>
                {editingId && <button onClick={resetForm}><X size={18} className="text-blue-400" /></button>}
              </div>

              <form onSubmit={handleSaveUser} className="p-4 space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-tight">Nom du Praticien *</label>
                  <input type="text" required placeholder="Dr. Jane Doe" className="w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all" value={formNom} onChange={(e) => setFormNom(e.target.value)} />
                </div>
                {!editingId && (
                  <div className="p-3 bg-blue-50 rounded-xl space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-blue-600 mb-1 tracking-tight">Nom du Cabinet *</label>
                      <input type="text" required placeholder="Cabinet de Sèvres" className="w-full border border-blue-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formNomCabinet} onChange={(e) => setFormNomCabinet(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-blue-600 mb-1 tracking-tight">Lien Google Avis *</label>
                      <input type="url" required placeholder="https://g.page/..." className="w-full border border-blue-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formLienGoogle} onChange={(e) => setFormLienGoogle(e.target.value)} />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-tight">E-mail *</label>
                  <input type="email" required placeholder="contact@cabinet.fr" className="w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Profession" className="border rounded-lg py-2 px-3 text-sm outline-none" value={formTitre} onChange={(e) => setFormTitre(e.target.value)} />
                  <input type="text" placeholder="Tél" className="border rounded-lg py-2 px-3 text-sm outline-none" value={formTelephone} onChange={(e) => setFormTelephone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-tight">{editingId ? 'Nouveau MDP' : 'Mot de passe *'}</label>
                  <input type="text" required={!editingId} placeholder="6+ char" className="w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 outline-none" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
                </div>
                <button type="submit" disabled={isSaving} className={`w-full py-3 rounded-xl font-black text-white text-[10px] tracking-widest uppercase transition-all shadow-lg ${editingId ? 'bg-blue-600 shadow-blue-100' : 'bg-green-600 shadow-green-100'}`}>
                  {isSaving ? <Loader2 className="animate-spin mx-auto" /> : (editingId ? 'METTRE À JOUR' : 'CRÉER LE COMPTE')}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-purple-50 border-b border-purple-100">
                <h2 className="font-bold text-purple-700 text-xs uppercase tracking-widest flex items-center gap-2"><Send size={16}/> Test SAV</h2>
              </div>
              <form onSubmit={handleTestEmail} className="p-4 space-y-3">
                <select className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 outline-none font-medium" value={selectedTherapeuteId} onChange={(e) => setSelectedTherapeuteId(e.target.value)}>
                  {therapeutes.map(t => (<option key={t.id} value={t.id}>{t.nom}</option>))}
                </select>
                <input type="email" required placeholder="Email de test" className="w-full border rounded-lg py-2 px-3 text-sm outline-none" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
                <button type="submit" disabled={sendingTest || !testEmail} className="w-full bg-purple-600 py-2 rounded-lg text-white font-bold text-[10px] tracking-widest hover:bg-purple-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-purple-50">
                  {sendingTest ? <Loader2 className="animate-spin" size={14} /> : 'TESTER L\'ENVOI'}
                </button>
                {testSuccess && <div className="text-center text-[10px] text-green-600 font-bold uppercase mt-2">Mail envoyé !</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
