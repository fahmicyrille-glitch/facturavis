'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users, FileText, Star, Send, Loader2, Activity, ArrowLeft, CheckCircle, Percent, MailOpen, Target, ThumbsUp, Edit, X } from 'lucide-react';
import Link from 'next/link';

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
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formTitre, setFormTitre] = useState('');
  const [formTelephone, setFormTelephone] = useState('');
  const [formLienGoogle, setFormLienGoogle] = useState(''); // Utilisé uniquement à la création
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
      if (!session || session.user.email !== adminEmail) { router.push('/dashboard'); return; }

      try {
        const res = await fetch('/api/admin/data', { headers: { 'Authorization': `Bearer ${session.access_token}` } });
        if (res.ok) {
          const data = await res.json();
          setTherapeutes(data.therapeutes || []);
          setFactures(data.factures || []);
          if (data.therapeutes && data.therapeutes.length > 0) setSelectedTherapeuteId(data.therapeutes[0].id);
        }
      } catch (e) { console.error("Erreur de récupération des données admin"); }

      setLoading(false);
    };
    checkAdminAndFetchData();
  }, [router, adminEmail]);

  // --- ACTIONS CRUD SUR LES UTILISATEURS ---
  const resetForm = () => {
    setEditingId(null); setFormNom(''); setFormEmail(''); setFormPassword('');
    setFormTitre(''); setFormTelephone(''); setFormLienGoogle('');
  };

  const handleEditClick = (t: Therapeute) => {
    setEditingId(t.id);
    setFormNom(t.nom || '');
    setFormEmail(t.email || '');
    setFormPassword('');
    setFormTitre(t.titre || '');
    setFormTelephone(t.telephone || '');
    setFormLienGoogle(''); // On ne gère pas le lien Google en mode édition (c'est dans ses paramètres de cabinet)
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom || !formEmail) return;

    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    try {
      if (editingId) {
        // MODIFICATION
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({ id: editingId, email: formEmail, password: formPassword || undefined, nom: formNom, titre: formTitre, telephone: formTelephone })
        });
        if (!res.ok) throw new Error(await res.text());
        alert('Praticien mis à jour avec succès !');
      } else {
        // CRÉATION
        if (!formPassword || formPassword.length < 6) { alert("Mot de passe manquant"); setIsSaving(false); return; }
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({ email: formEmail, password: formPassword, nom: formNom, titre: formTitre, telephone: formTelephone, lien_google: formLienGoogle })
        });
        if (!res.ok) throw new Error(await res.text());
        alert('Praticien créé avec succès ! Son cabinet a été généré s\'il y avait un lien Google.');
      }
      window.location.reload();
    } catch (error) { alert("Erreur : " + error); } finally { setIsSaving(false); }
  };

  const handleDeleteUser = async (id: string, nom: string) => {
    if (!confirm(`⚠️ Voulez-vous vraiment supprimer DÉFINITIVEMENT le compte de ${nom} ?`)) return;
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${session?.access_token}` } });
      if (!res.ok) throw new Error(await res.text());
      alert('Praticien supprimé !');
      window.location.reload();
    } catch (error) { alert("Erreur : " + error); }
  };

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTherapeuteId || !testEmail) return;
    setSendingTest(true); setTestSuccess(false);
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
    } catch (error) { alert("Erreur lors de l'envoi du test."); } finally { setSendingTest(false); }
  };

  // --- CALCULS KPI ---
  const totalFactures = factures.length;
  const facturesAvecAvis = factures.filter(f => f.note !== null);
  const totalAvis = facturesAvecAvis.length;
  const totalOuverts = factures.filter(f => f.statut_email === 'Ouvert' || f.statut_email === 'Relancé').length;
  const total5Etoiles = facturesAvecAvis.filter(f => f.note === 5).length;

  const globalConversion = totalFactures > 0 ? Math.round((totalAvis / totalFactures) * 100) : 0;
  const globalOuverture = totalFactures > 0 ? Math.round((totalOuverts / totalFactures) * 100) : 0;
  const globalNotes = facturesAvecAvis.map(f => f.note as number);
  const globalAvg = globalNotes.length > 0 ? (globalNotes.reduce((a, b) => a + b, 0) / globalNotes.length).toFixed(1) : '-';

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* EN-TÊTE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-900 text-white p-6 rounded-2xl shadow-lg gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30">
              <ShieldAlert className="text-purple-400" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Centre de Contrôle (God Mode)</h1>
              <p className="text-gray-400 text-sm">Analyse des performances et gestion des utilisateurs</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* LE NOUVEAU BOUTON VERS LES PROSPECTS */}
            <Link href="/admin/prospects" className="flex-1 sm:flex-none flex items-center justify-center text-sm font-bold text-blue-900 bg-blue-400 hover:bg-blue-300 px-4 py-2 rounded-lg transition shadow-sm">
              <Users size={16} className="mr-2" /> Prospects
            </Link>

            <Link href="/dashboard" className="flex-1 sm:flex-none flex items-center justify-center text-sm font-medium text-gray-300 hover:text-white bg-gray-800 px-4 py-2 rounded-lg transition">
              <ArrowLeft size={16} className="mr-2" /> Dashboard
            </Link>
          </div>
        </div>

        {/* KPI GLOBAUX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center text-gray-500 mb-2"><Users size={16} className="mr-2 text-blue-500"/> Praticiens</div>
            <div className="text-3xl font-black text-gray-900">{therapeutes.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center text-gray-500 mb-2"><FileText size={16} className="mr-2 text-indigo-500"/> Factures</div>
            <div className="text-3xl font-black text-gray-900">{totalFactures}</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center text-gray-500 mb-2"><MailOpen size={16} className="mr-2 text-orange-500"/> Taux d'Ouverture</div>
            <div className="text-3xl font-black text-gray-900 flex items-baseline">{globalOuverture}<span className="text-lg text-gray-400 ml-1">%</span></div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center border-b-4 border-b-green-500">
            <div className="flex items-center text-gray-500 mb-2"><Target size={16} className="mr-2 text-green-500"/> Conversion Globale</div>
            <div className="text-3xl font-black text-green-600 flex items-baseline">{globalConversion}<span className="text-lg text-green-400 ml-1">%</span></div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5"><Star size={100} /></div>
            <div className="flex items-center text-gray-500 mb-2"><ThumbsUp size={16} className="mr-2 text-yellow-500"/> Google 5⭐</div>
            <div className="text-3xl font-black text-yellow-500 flex items-baseline">{total5Etoiles} <span className="text-sm font-medium text-gray-400 ml-2">Avis</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* LISTE DES PRATICIENS (3/4) */}
          <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity size={20} className="text-blue-500" /> Analyse des performances par praticien
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Praticien</th>
                    <th className="px-6 py-4 text-center">Envois</th>
                    <th className="px-6 py-4 text-center">Ouvertures</th>
                    <th className="px-6 py-4 text-center">Conversion</th>
                    <th className="px-6 py-4 text-center bg-yellow-50/50 rounded-t-lg border-b-2 border-yellow-200">Avis 5⭐</th>
                    <th className="px-6 py-4 text-center">Note Moy.</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {therapeutes.map((t) => {
                    const facturesDuT = factures.filter(f => f.therapeute_id === t.id);
                    const nbEnvois = facturesDuT.length;
                    const nbOuverts = facturesDuT.filter(f => f.statut_email === 'Ouvert' || f.statut_email === 'Relancé').length;
                    const tauxOuverture = nbEnvois > 0 ? Math.round((nbOuverts / nbEnvois) * 100) : 0;
                    const notesDuT = facturesDuT.filter(f => f.note !== null);
                    const nbAvis = notesDuT.length;
                    const tauxConversion = nbEnvois > 0 ? Math.round((nbAvis / nbEnvois) * 100) : 0;
                    const nb5Etoiles = notesDuT.filter(f => f.note === 5).length;
                    const avg = nbAvis > 0 ? (notesDuT.map(f => f.note as number).reduce((a, b) => a + b, 0) / nbAvis).toFixed(1) : '-';

                    return (
                      <tr key={t.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{t.nom}</div>
                          <div className="text-xs text-gray-500">{t.email}</div>
                        </td>
                        <td className="px-6 py-4 text-center"><span className="font-black text-gray-800 text-lg">{nbEnvois}</span></td>
                        <td className="px-6 py-4 text-center">
                          <div className="font-bold text-gray-800">{tauxOuverture}%</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`font-black text-lg ${tauxConversion >= 20 ? 'text-green-600' : tauxConversion > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{tauxConversion}%</div>
                        </td>
                        <td className="px-6 py-4 text-center bg-yellow-50/30">
                          <div className="font-black text-xl text-yellow-500 flex items-center justify-center gap-1">{nb5Etoiles} <Star size={16} className="fill-current" /></div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${nbAvis > 0 ? 'bg-gray-100 text-gray-800 border border-gray-200' : 'bg-gray-50 text-gray-400'}`}>{avg}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEditClick(t)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition mr-1" title="Modifier ce praticien"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteUser(t.id, t.nom)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition" title="Supprimer ce praticien">🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* COLONNE DE DROITE (FORMULAIRES) */}
          <div className="xl:col-span-1 space-y-6">

            {/* CRUD */}
            <div className={`bg-white rounded-2xl shadow-sm border ${editingId ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100'} flex flex-col transition-all`}>
              <div className={`p-4 border-b flex justify-between items-center ${editingId ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-gray-100'}`}>
                <h2 className={`text-base font-bold flex items-center gap-2 ${editingId ? 'text-blue-900' : 'text-green-900'}`}>
                  {editingId ? <Edit size={18} className="text-blue-600" /> : <Users size={18} className="text-green-600" />}
                  {editingId ? 'Modifier Praticien' : 'Ajouter Praticien'}
                </h2>
                {editingId && <button onClick={resetForm} className="text-blue-500 hover:text-blue-700"><X size={20} /></button>}
              </div>

              <form onSubmit={handleSaveUser} className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nom complet *</label>
                  <input type="text" required placeholder="Ex: Dr. Dupont" className="w-full border rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-green-500" value={formNom} onChange={(e) => setFormNom(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail *</label>
                  <input type="email" required placeholder="contact@cabinet.fr" className="w-full border rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-green-500" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Profession</label>
                    <input type="text" placeholder="Ostéopathe..." className="w-full border rounded-md py-1.5 px-2 text-xs focus:ring-1 focus:ring-green-500" value={formTitre} onChange={(e) => setFormTitre(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
                    <input type="text" placeholder="06 12..." className="w-full border rounded-md py-1.5 px-2 text-xs focus:ring-1 focus:ring-green-500" value={formTelephone} onChange={(e) => setFormTelephone(e.target.value)} />
                  </div>
                </div>

                {!editingId && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 text-yellow-600">Lien Google Avis (Optionnel)</label>
                    <input type="url" placeholder="https://g.page/r/..." className="w-full border border-yellow-300 bg-yellow-50 rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-yellow-500" value={formLienGoogle} onChange={(e) => setFormLienGoogle(e.target.value)} />
                    <p className="text-[10px] text-gray-500 mt-1 leading-tight">Si rempli, créera automatiquement le 1er cabinet de ce praticien.</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{editingId ? 'Nouveau mot de passe' : 'Mot de passe provisoire *'}</label>
                  <input type="text" required={!editingId} placeholder={editingId ? 'Vide = inchangé' : 'Min. 6 caractères'} className="w-full border rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-green-500" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
                </div>

                <button type="submit" disabled={isSaving || !formNom || !formEmail || (!editingId && formPassword.length < 6)} className={`w-full text-white font-bold py-2 rounded-lg transition-all flex justify-center items-center text-sm disabled:bg-gray-400 mt-2 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : (editingId ? 'Enregistrer' : 'Créer le compte')}
                </button>
              </form>
            </div>

            {/* TEST SAV */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-purple-50">
                <h2 className="text-base font-bold text-purple-900 flex items-center gap-2">
                  <Send size={18} className="text-purple-600" /> Test SAV
                </h2>
              </div>
              <form onSubmit={handleTestEmail} className="p-4 space-y-3">
                <select className="w-full border rounded-md py-1.5 px-3 text-sm bg-gray-50" value={selectedTherapeuteId} onChange={(e) => setSelectedTherapeuteId(e.target.value)}>
                  {therapeutes.map(t => (<option key={t.id} value={t.id}>{t.nom}</option>))}
                </select>
                <input type="email" required placeholder="votre_adresse@gmail.com" className="w-full border rounded-md py-1.5 px-3 text-sm" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
                <button type="submit" disabled={sendingTest || !testEmail || therapeutes.length === 0} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg text-sm transition-all flex justify-center items-center disabled:bg-gray-400 shadow-md">
                  {sendingTest ? <Loader2 className="animate-spin" size={16} /> : 'Envoyer e-mail'}
                </button>
                {testSuccess && (<div className="bg-green-50 text-green-700 p-2 rounded-md flex items-center text-xs font-medium justify-center"><CheckCircle size={14} className="mr-1" /> Test envoyé !</div>)}
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
