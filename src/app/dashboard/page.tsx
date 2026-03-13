'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle, Copy, LogOut, MapPin, Loader2 } from 'lucide-react';

// Type pour nos cabinets
interface Cabinet {
  id: string;
  nom: string;
  lien_avis_google: string;
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [patientEmail, setPatientEmail] = useState('');
  const [civilite, setCivilite] = useState('Mme');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');

  // États pour la gestion dynamique des cabinets
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [selectedCabinetId, setSelectedCabinetId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [fetchingCabinets, setFetchingCabinets] = useState(true);
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/');
        return;
      }

      const uid = session.user.id;
      setUserId(uid);

      // RÉCUPÉRATION DES CABINETS DEPUIS LA BDD
      const { data, error } = await supabase
        .from('cabinets')
        .select('*')
        .eq('therapeute_id', uid);

      if (!error && data) {
        setCabinets(data);
        if (data.length > 0) setSelectedCabinetId(data[0].id);
      }
      setFetchingCabinets(false);
    };

    initDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId || !patientEmail || !selectedCabinetId) return;

    setLoading(true);
    setSuccessLink(null);

    try {
      // 1. Upload du PDF
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('factures_pdf')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Préparation des données
      const nomComplet = `${civilite} ${nom.toUpperCase()} ${prenom}`;
      const currentCabinet = cabinets.find(c => c.id === selectedCabinetId);

      // 3. Insertion en base de données (avec la clé étrangère cabinet_id)
      const { data: dbData, error: dbError } = await supabase
        .from('factures')
        .insert([
          {
            therapeute_id: userId,
            cabinet_id: selectedCabinetId, // L'ID propre au cabinet
            patient_email: patientEmail,
            patient_nom: nomComplet,
            fichier_path: filePath,
          }
        ])
        .select('id')
        .single();

      if (dbError) throw dbError;

      const lien = `${window.location.origin}/facture/${dbData.id}`;
      setSuccessLink(lien);

      // 4. Envoi de l'e-mail via l'API Resend
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: patientEmail,
          nomPatient: nomComplet,
          lienFacture: lien,
          nomTherapeute: "Hilary Farid", // Pourra être rendu dynamique aussi
          cabinetNom: currentCabinet?.nom
        }),
      });

      // 5. Reset
      setFile(null);
      setPatientEmail('');
      setNom('');
      setPrenom('');

    } catch (error) {
      console.error('Erreur:', error);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCabinets) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-500">Chargement de vos cabinets...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Espace Praticien</h1>
          <button onClick={handleLogout} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
            <LogOut size={16} className="mr-2" /> Déconnexion
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Nouvelle facture à envoyer</h2>

          <form onSubmit={handleUpload} className="space-y-6">

            {/* SÉLECTEUR DE CABINET DYNAMIQUE */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
               <div className="flex items-center gap-3 mb-4 text-blue-800">
                 <MapPin size={20} />
                 <span className="font-bold text-sm uppercase tracking-wider">Lieu de la consultation</span>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {cabinets.map((cab) => (
                   <label
                     key={cab.id}
                     className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                       selectedCabinetId === cab.id
                       ? 'border-blue-500 bg-white shadow-sm'
                       : 'border-transparent bg-blue-100/50 hover:bg-blue-100'
                     }`}
                   >
                     <input
                       type="radio"
                       className="hidden"
                       name="cabinet"
                       checked={selectedCabinetId === cab.id}
                       onChange={() => setSelectedCabinetId(cab.id)}
                     />
                     <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${selectedCabinetId === cab.id ? 'border-blue-500' : 'border-gray-400'}`}>
                        {selectedCabinetId === cab.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                     </div>
                     <span className={`text-sm font-bold ${selectedCabinetId === cab.id ? 'text-blue-700' : 'text-gray-600'}`}>
                       {cab.nom}
                     </span>
                   </label>
                 ))}
               </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
              <input
                type="file" accept=".pdf" required id="file-upload" className="hidden"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud size={40} className={file ? "text-green-500" : "text-blue-500"} />
                <span className="mt-2 text-sm font-medium text-gray-900">
                  {file ? file.name : "Cliquez pour sélectionner le PDF"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Civilité</label>
                <select
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                  value={civilite} onChange={(e) => setCivilite(e.target.value)}
                >
                  <option value="Mme">Mme</option>
                  <option value="M.">M.</option>
                  <option value="Enfant">Enfant</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text" required placeholder="Thomas" className="w-full border border-gray-300 rounded-md py-2 px-3"
                  value={prenom} onChange={(e) => setPrenom(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de famille</label>
                <input
                  type="text" required placeholder="DUPONT" className="w-full border border-gray-300 rounded-md py-2 px-3"
                  value={nom} onChange={(e) => setNom(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email du patient *</label>
              <input
                type="email" required placeholder="thomas.dupont@email.com" className="w-full border border-gray-300 rounded-md py-2 px-3"
                value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)}
              />
            </div>

            <button
              type="submit" disabled={loading || !file || cabinets.length === 0}
              className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Générer et envoyer la facture'}
            </button>
          </form>
        </div>

        {successLink && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center text-green-800 mb-4 font-bold">
              <CheckCircle size={24} className="mr-2 text-green-500" />
              Facture envoyée avec succès !
            </div>
            <div className="flex items-center bg-white border border-green-200 rounded-lg overflow-hidden">
              <input type="text" readOnly value={successLink} className="flex-1 py-3 px-4 text-sm text-gray-600 outline-none" />
              <button
                onClick={() => navigator.clipboard.writeText(successLink)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-bold transition-colors"
              >
                Copier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
