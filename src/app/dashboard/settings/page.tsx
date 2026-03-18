'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, UploadCloud, ArrowLeft, Loader2, CheckCircle, Plus, Trash2, MapPin, Link as LinkIcon, Edit2, X } from 'lucide-react';
import Link from 'next/link';

interface Cabinet {
  id: string;
  nom: string;
  lien_avis_google: string;
}

function SettingsContent() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcedId = searchParams.get('as'); // Pour le mode God Mode (Admin)

  // États Profil
  const [nom, setNom] = useState('');
  const [titre, setTitre] = useState('');
  const [telephone, setTelephone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // États Cabinets
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [newCabinetNom, setNewCabinetNom] = useState('');
  const [newCabinetLink, setNewCabinetLink] = useState('');

  // États Édition Cabinet
  const [editingCabinetId, setEditingCabinetId] = useState<string | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editLink, setEditLink] = useState('');

  // États Chargements
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingCabinet, setAddingCabinet] = useState(false);
  const [updatingCabinet, setUpdatingCabinet] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      // Logic God Mode : Si admin spécifie un ID via ?as=ID
      const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const uid = (isAdmin && forcedId) ? forcedId : session.user.id;
      setUserId(uid);

      // Récupérer le profil du therapeute
      const { data: profileData } = await supabase
        .from('therapeutes')
        .select('nom, titre, telephone, logo_url')
        .eq('id', uid)
        .single();

      if (profileData) {
        setNom(profileData.nom || '');
        setTitre(profileData.titre || '');
        setTelephone(profileData.telephone || '');
        setLogoUrl(profileData.logo_url || '');
      }

      // Récupérer les cabinets
      const { data: cabinetsData } = await supabase
        .from('cabinets')
        .select('*')
        .eq('therapeute_id', uid)
        .order('created_at', { ascending: true });

      if (cabinetsData) setCabinets(cabinetsData);
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
      .update({ nom, titre, telephone, logo_url: logoUrl })
      .eq('id', userId);

    setSaving(false);
    if (!error) {
      setMessage({ text: 'Profil mis à jour !', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Upload Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingLogo(true);
      if (!e.target.files || e.target.files.length === 0 || !userId) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(7)}.${fileExt}`;

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

  // Ajouter Cabinet
  const handleAddCabinet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCabinetNom || !newCabinetLink || !userId) return;
    setAddingCabinet(true);
    const { data, error } = await supabase
      .from('cabinets')
      .insert([{ therapeute_id: userId, nom: newCabinetNom, lien_avis_google: newCabinetLink }])
      .select().single();

    if (!error && data) {
      setCabinets([...cabinets, data]);
      setNewCabinetNom('');
      setNewCabinetLink('');
    }
    setAddingCabinet(false);
  };

  // Modifier Cabinet (Ciblage précis par ID)
  const handleUpdateCabinet = async (id_du_cabinet: string) => {
    setUpdatingCabinet(true);
    const { data: { session } } = await supabase.auth.getSession();

    try {
      const isAdmin = session?.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      if (isAdmin && forcedId) {
        // MODE ADMIN : Appel API Route avec id_cabinet spécifique
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            id: userId,
            id_cabinet: id_du_cabinet, // 🎯 Crucial pour ne pas modifier tous les cabinets
            nom_cabinet: editNom,
            lien_google: editLink
          })
        });

        if (!res.ok) throw new Error(await res.text());
      } else {
        // MODE USER : Justine/Kiro modifie son cabinet directement
        const { error } = await supabase
          .from('cabinets')
          .update({
            nom: editNom,
            lien_avis_google: editLink
          })
          .eq('id', id_du_cabinet);

        if (error) throw error;
      }

      // Mise à jour visuelle commune
      setCabinets(cabinets.map(c => c.id === id_du_cabinet ? { ...c, nom: editNom, lien_avis_google: editLink } : c));
      setEditingCabinetId(null);
      setMessage({ text: 'Cabinet mis à jour !', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);

    } catch (error: any) {
      alert("Erreur : " + (error.message || "Accès refusé"));
    } finally {
      setUpdatingCabinet(false);
    }
  };

  // Supprimer Cabinet
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

        {/* SECTION PROFIL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">Profil Public</h2>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                {uploadingLogo ? (
                  <Loader2 className="animate-spin text-blue-500" />
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-xs text-gray-400">Pas de logo</span>
                )}
              </div>
              <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition flex items-center">
                <UploadCloud size={18} className="mr-2" /> Modifier le logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input type="text" required className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                <input type="text" className="w-full border rounded-md py-2 px-3 outline-none" value={titre} onChange={(e) => setTitre(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="text" className="w-full border rounded-md py-2 px-3 outline-none" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <X size={20} className="mr-2" />}
                {message.text}
              </div>
            )}

            <button type="submit" disabled={saving} className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-blue-600 font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all items-center">
              {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
              Enregistrer le profil
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
                      <button
                        onClick={() => {
                          setEditingCabinetId(cab.id);
                          setEditNom(cab.nom);
                          setEditLink(cab.lien_avis_google);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
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

// Composant exporté avec Suspense pour gérer useSearchParams()
export default function Settings() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>}>
      <SettingsContent />
    </Suspense>
  );
}
