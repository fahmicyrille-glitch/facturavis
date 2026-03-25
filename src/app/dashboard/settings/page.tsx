'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Save, UploadCloud, ArrowLeft, Loader2, CheckCircle, Plus,
  Trash2, MapPin, Link as LinkIcon, Edit2, X, ListPlus,
  Building, ShieldCheck, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

interface Cabinet {
  id: string;
  nom: string;
  lien_avis_google: string;
}

interface Prestation {
  id: string;
  nom: string;
  prix: number;
}

function SettingsContent() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcedId = searchParams.get('as'); // Pour le mode God Mode (Admin)

  // États Profil de base
  const [nom, setNom] = useState('');
  const [titre, setTitre] = useState('');
  const [telephone, setTelephone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // États Profil (Légal & Facturation)
  const [adresseCabinet, setAdresseCabinet] = useState('');
  const [siret, setSiret] = useState('');
  const [codeApe, setCodeApe] = useState('');
  const [adeli, setAdeli] = useState('');
  const [siteWeb, setSiteWeb] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');

  // États Cabinets
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [newCabinetNom, setNewCabinetNom] = useState('');
  const [newCabinetLink, setNewCabinetLink] = useState('');

  // États Édition Cabinet
  const [editingCabinetId, setEditingCabinetId] = useState<string | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editLink, setEditLink] = useState('');

  // États Prestations
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [newPrestaNom, setNewPrestaNom] = useState('');
  const [newPrestaPrix, setNewPrestaPrix] = useState('');
  const [addingPresta, setAddingPresta] = useState(false);
  const [deletingPrestaId, setDeletingPrestaId] = useState<string | null>(null);

  // États Édition Prestation
  const [editingPrestaId, setEditingPrestaId] = useState<string | null>(null);
  const [editPrestaNom, setEditPrestaNom] = useState('');
  const [editPrestaPrix, setEditPrestaPrix] = useState('');
  const [updatingPresta, setUpdatingPresta] = useState(false);

  // États Chargements globaux
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingCabinet, setAddingCabinet] = useState(false);
  const [updatingCabinet, setUpdatingCabinet] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const uid = (isAdmin && forcedId) ? forcedId : session.user.id;
      setUserId(uid);

      const { data: profileData } = await supabase
        .from('therapeutes')
        .select('*')
        .eq('id', uid)
        .single();

      if (profileData) {
        setNom(profileData.nom || '');
        setTitre(profileData.titre || '');
        setTelephone(profileData.telephone || '');
        setLogoUrl(profileData.logo_url || '');
        setAdresseCabinet(profileData.adresse_cabinet || '');
        setSiret(profileData.siret || '');
        setCodeApe(profileData.code_ape || '');
        setAdeli(profileData.adeli || '');
        setSiteWeb(profileData.site_web || '');
        setSignatureUrl(profileData.signature_url || '');
      }

      const { data: cabinetsData } = await supabase
        .from('cabinets')
        .select('*')
        .eq('therapeute_id', uid)
        .order('created_at', { ascending: true });
      if (cabinetsData) setCabinets(cabinetsData);

      const { data: prestationsData } = await supabase
        .from('prestations')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true });
      if (prestationsData) setPrestations(prestationsData);

      setLoading(false);
    };
    fetchData();
  }, [router, forcedId]);

  // Sauvegarde Profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);

    const { error } = await supabase
      .from('therapeutes')
      .update({
        nom,
        titre,
        telephone,
        logo_url: logoUrl,
        adresse_cabinet: adresseCabinet,
        siret,
        code_ape: codeApe,
        adeli,
        site_web: siteWeb,
        signature_url: signatureUrl
      })
      .eq('id', userId);

    setSaving(false);
    if (!error) {
      setMessage({ text: 'Profil et informations de facturation mis à jour !', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } else {
      setMessage({ text: "Erreur lors de la sauvegarde : " + error.message, type: 'error' });
    }
  };

  // Upload Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingLogo(true);
      if (!e.target.files || e.target.files.length === 0 || !userId) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${userId}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
      setLogoUrl(publicUrl);
      await supabase.from('therapeutes').update({ logo_url: publicUrl }).eq('id', userId);

    } catch (error: any) {
      alert("Erreur lors de l'envoi : " + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Suppression Logo
  const handleDeleteLogo = async () => {
    if (!userId) return;
    setLogoUrl('');
    await supabase.from('therapeutes').update({ logo_url: '' }).eq('id', userId);
  };

  // Upload Signature
  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingSig(true);
      if (!e.target.files || e.target.files.length === 0 || !userId) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `sig-${userId}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
      setSignatureUrl(publicUrl);
      await supabase.from('therapeutes').update({ signature_url: publicUrl }).eq('id', userId);

    } catch (error: any) {
      alert("Erreur lors de l'envoi de la signature : " + error.message);
    } finally {
      setUploadingSig(false);
    }
  };

  // Suppression Signature
  const handleDeleteSignature = async () => {
    if (!userId) return;
    setSignatureUrl('');
    await supabase.from('therapeutes').update({ signature_url: '' }).eq('id', userId);
  };

  // Prestations - Ajout, Modif, Suppr
  const handleAddPrestation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrestaNom || !newPrestaPrix || !userId) return;
    setAddingPresta(true);
    const prixParsed = parseFloat(newPrestaPrix.replace(',', '.'));
    const { data, error } = await supabase.from('prestations').insert([{ user_id: userId, nom: newPrestaNom, prix: prixParsed }]).select().single();
    if (!error && data) {
      setPrestations([...prestations, data]);
      setNewPrestaNom('');
      setNewPrestaPrix('');
    }
    setAddingPresta(false);
  };

  const handleUpdatePrestation = async (id: string) => {
    if (!editPrestaNom || !editPrestaPrix) return;
    setUpdatingPresta(true);
    const prixParsed = parseFloat(editPrestaPrix.replace(',', '.'));
    const { error } = await supabase.from('prestations').update({ nom: editPrestaNom, prix: prixParsed }).eq('id', id);
    if (!error) {
      setPrestations(prestations.map(p => p.id === id ? { ...p, nom: editPrestaNom, prix: prixParsed } : p));
      setEditingPrestaId(null);
    }
    setUpdatingPresta(false);
  };

  const handleDeletePrestation = async (id: string) => {
    setDeletingPrestaId(id);
    const { error } = await supabase.from('prestations').delete().eq('id', id);
    if (!error) setPrestations(prestations.filter(p => p.id !== id));
    setDeletingPrestaId(null);
  };

  // Cabinets - Ajout, Modif, Suppr
  const handleAddCabinet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCabinetNom || !newCabinetLink || !userId) return;
    setAddingCabinet(true);
    const { data, error } = await supabase.from('cabinets').insert([{ therapeute_id: userId, nom: newCabinetNom, lien_avis_google: newCabinetLink }]).select().single();
    if (!error && data) {
      setCabinets([...cabinets, data]);
      setNewCabinetNom('');
      setNewCabinetLink('');
    }
    setAddingCabinet(false);
  };

  const handleUpdateCabinet = async (id_du_cabinet: string) => {
    setUpdatingCabinet(true);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const isAdmin = session?.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (isAdmin && forcedId) {
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({ id: userId, id_cabinet: id_du_cabinet, nom_cabinet: editNom, lien_google: editLink })
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const { error } = await supabase.from('cabinets').update({ nom: editNom, lien_avis_google: editLink }).eq('id', id_du_cabinet);
        if (error) throw error;
      }
      setCabinets(cabinets.map(c => c.id === id_du_cabinet ? { ...c, nom: editNom, lien_avis_google: editLink } : c));
      setEditingCabinetId(null);
    } catch (error: any) {
      alert("Erreur : " + (error.message || "Accès refusé"));
    } finally {
      setUpdatingCabinet(false);
    }
  };

  const handleDeleteCabinet = async (id: string) => {
    if (!window.confirm("Supprimer ce lieu de consultation ?")) return;
    setDeletingId(id);
    const { error } = await supabase.from('cabinets').delete().eq('id', id);
    if (!error) setCabinets(cabinets.filter(c => c.id !== id));
    setDeletingId(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center mb-4">
          <Link href="/dashboard" className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-gray-600" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres {forcedId && <span className="text-sm font-normal text-orange-500">(Mode Admin)</span>}</h1>
        </div>

        {/* SECTION PROFIL & FACTURATION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center mb-6 border-b pb-4">
            <Building size={22} className="text-gray-800 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Profil & Infos Légales (Facturation)</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">

            {/* GRILLE LOGO + SIGNATURE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LOGO */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">Logo du cabinet</label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                            {uploadingLogo ? <Loader2 className="animate-spin text-blue-500" /> : logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" /> : <span className="text-[10px] text-gray-400">Aucun logo</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition text-center">
                              Changer
                              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                          </label>
                          {logoUrl && (
                            <button type="button" onClick={handleDeleteLogo} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center justify-center gap-1 transition">
                              <Trash2 size={12} /> Supprimer
                            </button>
                          )}
                        </div>
                    </div>
                </div>

                {/* SIGNATURE */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">Signature / Tampon (Image)</label>
                    <div className="flex items-center gap-4">
                        <div className="w-40 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                            {uploadingSig ? <Loader2 className="animate-spin text-blue-500" /> : signatureUrl ? <img src={signatureUrl} alt="Signature" className="w-full h-full object-contain p-1" /> : <span className="text-[10px] text-gray-400 text-center px-2">Image sur fond blanc de préférence</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="cursor-pointer bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition text-center">
                              Charger
                              <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                          </label>
                          {signatureUrl && (
                            <button type="button" onClick={handleDeleteSignature} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center justify-center gap-1 transition">
                              <Trash2 size={12} /> Supprimer
                            </button>
                          )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet (apparaît sur la facture) *</label>
                <input type="text" required className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre / Profession (ex: Ostéopathe D.O.) *</label>
                <input type="text" required className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={titre} onChange={(e) => setTitre(e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Adresse de facturation (Cabinet principal) * <ShieldCheck size={14} className="ml-2 text-green-500" />
                </label>
                <input type="text" required placeholder="Ex: 104 Grande Rue, 92310 Sèvres" className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={adresseCabinet} onChange={(e) => setAdresseCabinet(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Numéro SIRET * <ShieldCheck size={14} className="ml-2 text-green-500" />
                </label>
                <input type="text" required maxLength={14} minLength={14} placeholder="14 chiffres" className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={siret} onChange={(e) => setSiret(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code APE</label>
                <input type="text" placeholder="Ex: 8690E" className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={codeApe} onChange={(e) => setCodeApe(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                <input type="text" required className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro ADELI / RPPS</label>
                <input type="text" className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={adeli} onChange={(e) => setAdeli(e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Web (Optionnel)</label>
                <input type="url" placeholder="https://..." className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={siteWeb} onChange={(e) => setSiteWeb(e.target.value)} />
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {message.type === 'success' ? <CheckCircle size={20} className="mr-2 flex-shrink-0" /> : <X size={20} className="mr-2 flex-shrink-0" />}
                <span className="font-medium">{message.text}</span>
              </div>
            )}

            <button type="submit" disabled={saving} className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-blue-600 font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all items-center shadow-md">
              {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
              Enregistrer mes informations
            </button>
          </form>
        </div>

        {/* SECTION PRESTATIONS / ACTES */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center mb-6 border-b pb-4">
            <ListPlus size={22} className="text-gray-800 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Actes & Tarifs par défaut</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Gagnez du temps en enregistrant vos actes habituels. Ils seront proposés en menu déroulant lors de la création d'une facture.
          </p>

          <div className="space-y-3 mb-6">
            {prestations.map((presta) => (
              <div key={presta.id} className="transition-all">
                {editingPrestaId === presta.id ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-center p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <input type="text" className="flex-1 w-full border rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" value={editPrestaNom} onChange={(e) => setEditPrestaNom(e.target.value)} />
                    <div className="relative w-full sm:w-28">
                      <input type="number" step="0.01" className="w-full border rounded-lg py-2 pl-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" value={editPrestaPrix} onChange={(e) => setEditPrestaPrix(e.target.value)} />
                      <span className="absolute right-3 top-2 text-gray-400 font-medium">€</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => handleUpdatePrestation(presta.id)} disabled={updatingPresta} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg font-bold flex items-center justify-center min-w-[40px]">
                        {updatingPresta ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={18} />}
                      </button>
                      <button onClick={() => setEditingPrestaId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-2 rounded-lg font-bold">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="font-medium text-gray-800">{presta.nom}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-600 bg-white px-3 py-1 rounded-md border shadow-sm mr-2">{presta.prix} €</span>
                      <button onClick={() => { setEditingPrestaId(presta.id); setEditPrestaNom(presta.nom); setEditPrestaPrix(presta.prix.toString()); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeletePrestation(presta.id)} disabled={deletingPrestaId === presta.id} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        {deletingPrestaId === presta.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddPrestation} className="flex gap-3 mt-4">
            <input type="text" required placeholder="Ex: Consultation Ostéopathie Adulte" className="flex-[3] border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" value={newPrestaNom} onChange={(e) => setNewPrestaNom(e.target.value)} />
            <div className="relative flex-[1] min-w-[100px]">
              <input type="number" step="0.01" required placeholder="Prix" className="w-full border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" value={newPrestaPrix} onChange={(e) => setNewPrestaPrix(e.target.value)} />
              <span className="absolute right-3 top-2 text-gray-400 font-medium">€</span>
            </div>
            <button type="submit" disabled={addingPresta} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center min-w-[110px]">
              {addingPresta ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} className="mr-1" /> Ajouter</>}
            </button>
          </form>
        </div>

        {/* SECTION CABINETS */}
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
                      <button onClick={() => handleUpdateCabinet(cab.id)} disabled={updatingCabinet} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 flex items-center justify-center">
                        {updatingCabinet ? <Loader2 size={14} className="animate-spin" /> : 'Valider'}
                      </button>
                      <button onClick={() => setEditingCabinetId(null)} className="flex-1 bg-gray-200 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-300">Annuler</button>
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
                      <button onClick={() => { setEditingCabinetId(cab.id); setEditNom(cab.nom); setEditLink(cab.lien_avis_google); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteCabinet(cab.id)} disabled={deletingId === cab.id} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
            <form onSubmit={handleAddCabinet} className="flex flex-col md:flex-row gap-3">
              <input type="text" required placeholder="Nom (ex: Cabinet de Sèvres)" className="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" value={newCabinetNom} onChange={(e) => setNewCabinetNom(e.target.value)} />
              <input type="url" required placeholder="Lien Google Avis" className="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" value={newCabinetLink} onChange={(e) => setNewCabinetLink(e.target.value)} />
              <button type="submit" disabled={addingCabinet} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center min-w-[100px]">
                {addingCabinet ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} className="mr-1" /> Ajouter</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>}>
      <SettingsContent />
    </Suspense>
  );
}
