'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, UploadCloud, ArrowLeft, Loader2, CheckCircle, AlertCircle, Plus, Trash2, MapPin, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

interface Cabinet {
  id: string;
  nom: string;
  lien_avis_google: string;
}

export default function Settings() {
  const [userId, setUserId] = useState<string | null>(null);

  // États Profil
  const [nom, setNom] = useState('');
  const [titre, setTitre] = useState('');
  const [telephone, setTelephone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // États Cabinets
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [newCabinetNom, setNewCabinetNom] = useState('');
  const [newCabinetLink, setNewCabinetLink] = useState('');

  // États Chargements
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingCabinet, setAddingCabinet] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      const uid = session.user.id;
      setUserId(uid);

      // 1. Récupérer le profil
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

      // 2. Récupérer les cabinets
      const { data: cabinetsData } = await supabase
        .from('cabinets')
        .select('*')
        .eq('therapeute_id', uid)
        .order('created_at', { ascending: true });

      if (cabinetsData) {
        setCabinets(cabinetsData);
      }

      setLoading(false);
    };
    fetchData();
  }, [router]);

  // Sauvegarde du Profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    const { error } = await supabase
      .from('therapeutes')
      .update({ nom, titre, telephone, logo_url: logoUrl })
      .eq('id', userId);

    setSaving(false);
    if (error) {
      setMessage({ text: 'Erreur lors de la sauvegarde.', type: 'error' });
    } else {
      setMessage({ text: 'Profil mis à jour avec succès !', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Upload du Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingLogo(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
    } catch (error) {
      alert("Erreur lors de l'envoi de l'image.");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Ajouter un Cabinet
  const handleAddCabinet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCabinetNom || !newCabinetLink || !userId) return;

    setAddingCabinet(true);

    const { data, error } = await supabase
      .from('cabinets')
      .insert([{ therapeute_id: userId, nom: newCabinetNom, lien_avis_google: newCabinetLink }])
      .select()
      .single();

    if (!error && data) {
      setCabinets([...cabinets, data]);
      setNewCabinetNom('');
      setNewCabinetLink('');
    } else {
      alert("Erreur lors de l'ajout du cabinet.");
    }
    setAddingCabinet(false);
  };

  // Supprimer un Cabinet
  const handleDeleteCabinet = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce lieu de consultation ?")) return;

    setDeletingId(id);
    const { error } = await supabase.from('cabinets').delete().eq('id', id);

    if (!error) {
      setCabinets(cabinets.filter(c => c.id !== id));
    } else {
      alert("Erreur lors de la suppression. Ce cabinet est peut-être lié à des factures existantes.");
    }
    setDeletingId(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex items-center mb-4">
          <Link href="/dashboard" className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres de l'espace</h1>
        </div>

        {/* SECTION 1 : PROFIL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">Profil Public</h2>
          <form onSubmit={handleSaveProfile} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Logo du cabinet</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {uploadingLogo ? (
                    <Loader2 className="animate-spin text-blue-500" />
                  ) : logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-xs text-gray-400 text-center px-2">Aucun logo</span>
                  )}
                </div>

                <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition flex items-center">
                  <UploadCloud size={18} className="mr-2" />
                  Modifier le logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom affiché sur les factures</label>
                <input
                  type="text" required
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={nom} onChange={(e) => setNom(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre / Profession</label>
                <input
                  type="text" placeholder="ex: Ostéopathe D.O."
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={titre} onChange={(e) => setTitre(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone de contact</label>
                <input
                  type="text" placeholder="ex: 06 12 34 56 78"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={telephone} onChange={(e) => setTelephone(e.target.value)}
                />
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                {message.text}
              </div>
            )}

            <button
              type="submit" disabled={saving}
              className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 font-bold transition-all items-center"
            >
              {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
              {saving ? 'Sauvegarde...' : 'Enregistrer le profil'}
            </button>
          </form>
        </div>

        {/* SECTION 2 : CABINETS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">Lieux de consultation</h2>

          {/* Liste des cabinets existants */}
          <div className="space-y-3 mb-8">
            {cabinets.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucun cabinet enregistré pour le moment.</p>
            ) : (
              cabinets.map((cab) => (
                <div key={cab.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-bold text-gray-800 flex items-center">
                      <MapPin size={16} className="mr-2 text-blue-500" /> {cab.nom}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <LinkIcon size={14} className="mr-2" />
                      <a href={cab.lien_avis_google} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate max-w-xs md:max-w-sm inline-block">
                        Lien Google Avis
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCabinet(cab.id)}
                    disabled={deletingId === cab.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer ce cabinet"
                  >
                    {deletingId === cab.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Formulaire d'ajout */}
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wider">Ajouter un nouveau lieu</h3>
            <form onSubmit={handleAddCabinet} className="flex flex-col md:flex-row gap-3">
              <input
                type="text" required placeholder="Nom (ex: Cabinet de Sèvres)"
                className="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={newCabinetNom} onChange={(e) => setNewCabinetNom(e.target.value)}
              />
              <input
                type="url" required placeholder="Lien vers la page Google Avis"
                className="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={newCabinetLink} onChange={(e) => setNewCabinetLink(e.target.value)}
              />
              <button
                type="submit" disabled={addingCabinet}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition flex items-center justify-center disabled:bg-blue-300"
              >
                {addingCabinet ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} className="mr-1" /> Ajouter</>}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
