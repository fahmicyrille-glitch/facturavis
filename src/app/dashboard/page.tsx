'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle, Copy, LogOut, MapPin, Loader2, Settings, Star, FileText, MessageSquare, Search, Calendar, Download, X, Edit, Mail } from 'lucide-react'; // 🌟 Ajouté Mail
import Link from 'next/link';

interface Cabinet {
  id: string;
  nom: string;
  lien_avis_google: string;
}

interface Therapeute {
  nom: string;
  titre: string;
  telephone: string;
  email: string;
  logo_url: string;
}

interface Facture {
  id: string;
  created_at: string;
  patient_nom: string;
  patient_email: string;
  cabinet_id: string;
  fichier_path: string;
  note: number | null;
  commentaire: string | null;
  statut_email: string;
}

// Type pour notre jolie notification toast
interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [patientEmail, setPatientEmail] = useState('');
  const [civilite, setCivilite] = useState('Mme');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [therapeuteInfo, setTherapeuteInfo] = useState<Therapeute | null>(null);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [selectedCabinetId, setSelectedCabinetId] = useState<string>('');

  const [facturesHistorique, setFacturesHistorique] = useState<Facture[]>([]);

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // État pour la notification Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // 🌟 NOUVEAU : États pour contrôler la modale personnalisée de modification d'e-mail
  const [isEditEmailModalOpen, setIsEditEmailModalOpen] = useState(false);
  const [factureToEdit, setFactureToEdit] = useState<Facture | null>(null);
  const [emailToEdit, setEmailToEdit] = useState('');

  // Fonction pour afficher la notification pendant 3 secondes
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const formatLocalYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDateDebutChange = (val: string) => {
    setDateDebut(val);
    if (!dateFin || dateFin < val) {
      setDateFin(val);
    }
  };

  const setFilterToday = () => {
    const today = formatLocalYYYYMMDD(new Date());
    setDateDebut(today);
    setDateFin(today);
  };

  const setFilterMonth = () => {
    const today = new Date();
    const firstDay = formatLocalYYYYMMDD(new Date(today.getFullYear(), today.getMonth(), 1));
    const lastDay = formatLocalYYYYMMDD(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    setDateDebut(firstDay);
    setDateFin(lastDay);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateDebut('');
    setDateFin('');
  };

  const fetchHistorique = async (uid: string) => {
    const { data } = await supabase
      .from('factures')
      .select('*')
      .eq('therapeute_id', uid)
      .order('created_at', { ascending: false });

    if (data) setFacturesHistorique(data);
  };

  useEffect(() => {
    let channel: any;

    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      const uid = session.user.id;
      setUserId(uid);

      const { data: dataTherapeute } = await supabase.from('therapeutes').select('nom, titre, telephone, email, logo_url').eq('id', uid).single();
      if (dataTherapeute) setTherapeuteInfo(dataTherapeute);

      const { data: dataCabinets } = await supabase.from('cabinets').select('*').eq('therapeute_id', uid);
      if (dataCabinets) {
        setCabinets(dataCabinets);
        if (dataCabinets.length > 0) setSelectedCabinetId(dataCabinets[0].id);
      }

      await fetchHistorique(uid);
      setFetchingData(false);

      channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'factures',
            filter: `therapeute_id=eq.${uid}`
          },
          (payload) => {
            fetchHistorique(uid);
          }
        )
        .subscribe();
    };

    initDashboard();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId || !patientEmail || !selectedCabinetId || !therapeuteInfo) return;

    setLoading(true);
    setSuccessLink(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('factures_pdf').upload(filePath, file);
      if (uploadError) throw uploadError;

      const prenomFormatte = prenom ? ` ${prenom}` : '';
      const nomComplet = `${civilite} ${nom.toUpperCase()}${prenomFormatte}`.trim();
      const currentCabinet = cabinets.find(c => c.id === selectedCabinetId);

      const { data: dbData, error: dbError } = await supabase
        .from('factures')
        .insert([{
          therapeute_id: userId,
          cabinet_id: selectedCabinetId,
          patient_email: patientEmail,
          patient_nom: nomComplet,
          fichier_path: filePath,
          statut_email: 'Envoyé'
        }])
        .select('*')
        .single();

      if (dbError) throw dbError;

      if (dbData) {
        setFacturesHistorique(prev => [dbData, ...prev]);
      }

      const lien = `${window.location.origin}/facture/${dbData.id}`;
      setSuccessLink(lien);

      showToast("Facture créée et prête à être envoyée !", "success");

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: patientEmail,
          nomPatient: nomComplet,
          lienFacture: lien,
          nomTherapeute: therapeuteInfo.nom,
          titreTherapeute: therapeuteInfo.titre,
          telephoneTherapeute: therapeuteInfo.telephone,
          emailTherapeute: therapeuteInfo.email,
          logoUrlTherapeute: therapeuteInfo.logo_url,
          cabinetNom: currentCabinet?.nom
        }),
      });

      setFile(null);
      setPatientEmail('');
      setNom('');
      setPrenom('');

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      console.error('Erreur:', error);
      showToast("Une erreur est survenue lors de l'envoi.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🌟 CORRECTION 4 : Fonction pour OUVRIR la modale personnalisée au lieu de window.prompt()
  const handleEditEmail = (facture: Facture) => {
    setFactureToEdit(facture);
    setEmailToEdit(facture.patient_email);
    setIsEditEmailModalOpen(true);
  };

  // 🌟 CORRECTION 5 : Fonction pour CONFIRMER la modification dans la modale personnalisée
  const handleConfirmEditEmail = async () => {
    if (!factureToEdit || !emailToEdit || emailToEdit === factureToEdit.patient_email) {
      setIsEditEmailModalOpen(false); // Pas de changement, on ferme
      return;
    }

    setLoading(true); // Afficher le spinner pendant l'envoi

    try {
      // Met à jour la BDD
      const { error: updateError } = await supabase
        .from('factures')
        .update({ patient_email: emailToEdit, statut_email: 'Renvoyé' })
        .eq('id', factureToEdit.id);

      if (updateError) throw updateError;

      // Met à jour l'UI localement immédiatement
      setFacturesHistorique(prev => prev.map(f => f.id === factureToEdit.id ? { ...f, patient_email: emailToEdit, statut_email: 'Renvoyé' } : f));

      // Renvoi de l'email
      const lien = `${window.location.origin}/facture/${factureToEdit.id}`;
      const currentCabinet = cabinets.find(c => c.id === factureToEdit.cabinet_id);

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToEdit,
          nomPatient: factureToEdit.patient_nom,
          lienFacture: lien,
          nomTherapeute: therapeuteInfo?.nom,
          titreTherapeute: therapeuteInfo?.titre,
          telephoneTherapeute: therapeuteInfo?.telephone,
          emailTherapeute: therapeuteInfo?.email,
          logoUrlTherapeute: therapeuteInfo?.logo_url,
          cabinetNom: currentCabinet?.nom
        }),
      });

      // On remplace l'alert par une belle notif toast
      showToast("L'email a été mis à jour et la facture renvoyée !", "success");

      setIsEditEmailModalOpen(false); // Fermer la modale en cas de succès

    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'email :", error);
      // On remplace l'alert d'erreur
      showToast("Une erreur est survenue lors de la modification.", "error");
    } finally {
      setLoading(false); // Masquer le spinner
    }
  };

  const handleDownloadPdf = async (filePath: string, patientNom: string) => {
    try {
      showToast("Préparation du téléchargement...", "info");
      const { data, error } = await supabase.storage.from('factures_pdf').download(filePath);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_${patientNom.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur de téléchargement :", error);
      showToast("Impossible de télécharger la facture.", "error");
    }
  };

  const facturesFiltrees = facturesHistorique.filter((f) => {
    const matchRecherche = f.patient_nom.toLowerCase().includes(searchTerm.toLowerCase()) || f.patient_email.toLowerCase().includes(searchTerm.toLowerCase());
    const dateFacture = new Date(f.created_at).getTime();
    const matchDebut = dateDebut ? dateFacture >= new Date(dateDebut).getTime() : true;
    const matchFin = dateFin ? dateFacture <= new Date(dateFin).getTime() + 86400000 : true;

    return matchRecherche && matchDebut && matchFin;
  });

  const exportCSV = () => {
    let csvContent = "Date;Patient;Email;Cabinet;Note (sur 5);Commentaire;Lien de la facture\n";
    facturesFiltrees.forEach(f => {
      const date = new Date(f.created_at).toLocaleDateString('fr-FR');
      const cab = cabinets.find(c => c.id === f.cabinet_id)?.nom || 'Inconnu';
      const lien = `${window.location.origin}/facture/${f.id}`;
      const note = f.note ? f.note : '';
      const commentaire = f.commentaire ? `"${f.commentaire.replace(/"/g, '""')}"` : '';
      csvContent += `${date};${f.patient_nom};${f.patient_email};${cab};${note};${commentaire};${lien}\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Compta_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFactures = facturesFiltrees.length;
  const avisRecoltes = facturesFiltrees.filter(f => f.note !== null).length;
  const notesExistantes = facturesFiltrees.filter(f => f.note !== null).map(f => f.note as number);
  const noteMoyenne = notesExistantes.length > 0 ? (notesExistantes.reduce((a, b) => a + b, 0) / notesExistantes.length).toFixed(1) : '-';

  if (fetchingData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-500">Chargement de votre espace...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 relative">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* EN-TÊTE DU DASHBOARD */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
             <h1 className="text-2xl font-bold text-gray-900">Espace Praticien</h1>
             <p className="text-sm text-gray-500 mt-1">
               Connecté en tant que <span className="font-semibold">{therapeuteInfo?.nom}</span>
             </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/dashboard/settings" className="flex-1 sm:flex-none flex items-center justify-center text-sm text-gray-700 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-colors">
              <Settings size={16} className="mr-2" /> Paramètres
            </Link>
            <button onClick={handleLogout} className="flex-1 sm:flex-none flex items-center justify-center text-sm text-gray-500 hover:text-red-600 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-colors">
              <LogOut size={16} className="mr-2" /> Déconnexion
            </button>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-blue-50 p-3 rounded-lg mr-4"><FileText className="text-blue-600" size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Factures affichées</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalFactures}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-green-50 p-3 rounded-lg mr-4"><MessageSquare className="text-green-600" size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Avis récoltés</p>
              <h3 className="text-2xl font-bold text-gray-900">{avisRecoltes}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-yellow-50 p-3 rounded-lg mr-4"><Star className="text-yellow-600" size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Note moyenne</p>
              <h3 className="text-2xl font-bold text-gray-900">{noteMoyenne} <span className="text-sm text-gray-400 font-normal">/ 5</span></h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* COLONNE GAUCHE : FORMULAIRE D'ENVOI */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Nouvelle facture</h2>

              <form onSubmit={handleUpload} className="space-y-5">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3 text-blue-800">
                    <MapPin size={18} />
                    <span className="font-bold text-sm uppercase tracking-wider">Lieu</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {cabinets.map((cab) => (
                      <label key={cab.id} className={`flex items-center p-2 rounded-lg border-2 cursor-pointer transition-all ${selectedCabinetId === cab.id ? 'border-blue-500 bg-white shadow-sm' : 'border-transparent hover:bg-blue-100/50'}`}>
                        <input type="radio" className="hidden" name="cabinet" checked={selectedCabinetId === cab.id} onChange={() => setSelectedCabinetId(cab.id)} />
                        <div className={`w-3 h-3 rounded-full border-2 mr-3 flex items-center justify-center ${selectedCabinetId === cab.id ? 'border-blue-500' : 'border-gray-400'}`}>
                            {selectedCabinetId === cab.id && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                        </div>
                        <span className={`text-sm font-bold ${selectedCabinetId === cab.id ? 'text-blue-700' : 'text-gray-600'}`}>{cab.nom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    id="file-upload"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud size={28} className={file ? "text-green-500" : "text-blue-500"} />
                    <span className="mt-2 text-xs font-medium text-gray-900">{file ? file.name : "Sélectionner le PDF"}</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Civilité</label>
                    <select className="w-full border border-gray-300 rounded-md py-1.5 px-2 text-sm" value={civilite} onChange={(e) => setCivilite(e.target.value)}>
                      <option value="Mme">Mme</option>
                      <option value="M.">M.</option>
                      <option value="Enfant">Enfant</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
                    <input type="text" className="w-full border border-gray-300 rounded-md py-1.5 px-2 text-sm" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nom (ou Nom Prénom) *</label>
                    <input type="text" required className="w-full border border-gray-300 rounded-md py-1.5 px-2 text-sm" value={nom} onChange={(e) => setNom(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email du patient *</label>
                    <input type="email" required className="w-full border border-gray-300 rounded-md py-1.5 px-2 text-sm" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} />
                  </div>
                </div>

                <button type="submit" disabled={loading || !file || cabinets.length === 0} className="w-full flex justify-center py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-all">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Envoyer la facture'}
                </button>
              </form>

              {successLink && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <CheckCircle size={16} className="mx-auto text-green-500 mb-1" />
                  <p className="text-xs font-bold text-green-800 mb-2">Facture envoyée !</p>
                  <button onClick={() => {
                      navigator.clipboard.writeText(successLink);
                      showToast("Lien copié avec succès !");
                    }}
                    className="text-xs bg-white border border-green-200 text-green-700 px-3 py-1 rounded hover:bg-green-100 transition">
                    Copier le lien direct
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE : HISTORIQUE, RECHERCHE ET EXPORT */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">

              <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                  <div className="flex-1 w-full relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher un patient..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Calendar size={14} className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        className="pl-8 pr-2 py-2 border border-gray-300 rounded-lg text-xs focus:ring-blue-500 focus:border-blue-500"
                        value={dateDebut} onChange={(e) => handleDateDebutChange(e.target.value)} title="Date de début"
                      />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Calendar size={14} className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        className="pl-8 pr-2 py-2 border border-gray-300 rounded-lg text-xs focus:ring-blue-500 focus:border-blue-500"
                        value={dateFin} onChange={(e) => setDateFin(e.target.value)} title="Date de fin"
                      />
                    </div>
                  </div>

                  <button
                    onClick={exportCSV}
                    disabled={facturesFiltrees.length === 0}
                    className="flex w-full sm:w-auto justify-center items-center bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-gray-300"
                  >
                    <Download size={16} className="mr-2" />
                    Compta
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 font-medium mr-1">Raccourcis :</span>
                  <button onClick={setFilterToday} className="text-xs bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 px-3 py-1 rounded-full transition-colors">
                    Aujourd'hui
                  </button>
                  <button onClick={setFilterMonth} className="text-xs bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 px-3 py-1 rounded-full transition-colors">
                    Ce mois-ci
                  </button>

                  {(searchTerm || dateDebut || dateFin) && (
                    <button onClick={clearFilters} className="text-xs flex items-center bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-full transition-colors ml-auto">
                      <X size={12} className="mr-1" /> Effacer les filtres
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white border-b border-gray-100 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Patient</th>
                      <th className="px-6 py-3 font-medium">Avis</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {facturesFiltrees.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                          Aucune facture trouvée pour cette recherche.
                        </td>
                      </tr>
                    ) : (
                      facturesFiltrees.map((facture) => {
                        const date = new Date(facture.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        const lien = `${window.location.origin}/facture/${facture.id}`;

                        return (
                          <tr key={facture.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-6 py-4 text-gray-500 font-medium">{date}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900">{facture.patient_nom}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">{facture.patient_email}</span>

                                <button onClick={() => handleEditEmail(facture)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Modifier l'email et renvoyer la facture">
                                  <Edit size={12} />
                                </button>

                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  facture.statut_email === 'Ouvert'
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : facture.statut_email === 'Renvoyé'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : facture.statut_email === 'Relancé'
                                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}>
                                  {facture.statut_email || 'Envoyé'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {facture.note ? (
                                <div className="flex flex-col gap-1">
                                  <div className="flex text-yellow-400">
                                    {[1,2,3,4,5].map(star => (
                                      <Star key={star} size={14} className={star <= facture.note! ? "fill-current" : "text-gray-100"} />
                                    ))}
                                  </div>
                                  {facture.commentaire && (
                                    <span className="text-[10px] text-gray-400 truncate max-w-[150px] italic" title={facture.commentaire}>
                                      "{facture.commentaire}"
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">En attente</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end items-center gap-2">
                                <button
                                  onClick={() => handleDownloadPdf(facture.fichier_path, facture.patient_nom)}
                                  className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold inline-flex items-center"
                                  title="Télécharger la facture PDF"
                                >
                                  <Download size={14} className="mr-1" /> PDF
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(lien);
                                    showToast("Lien copié avec succès !");
                                  }}
                                  className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold"
                                >
                                  Copier le lien
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 NOUVEAU : Modale personnalisée pour modifier l'e-mail */}
      {isEditEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 p-2 rounded-lg"><Mail className="text-blue-600" size={20}/></div>
              <h3 className="text-lg font-semibold text-gray-900">Corriger l'email et renvoyer la facture :</h3>
            </div>

            <input
              type="email"
              value={emailToEdit}
              onChange={(e) => setEmailToEdit(e.target.value)}
              placeholder="Nouvel email du patient"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 mb-6"
              autoFocus // Met le focus automatiquement sur le champ
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditEmailModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmEditEmail}
                disabled={loading} // Désactivé pendant l'envoi
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16}/> : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Composant Toast d'affichage en bas à droite */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-3 z-50 transition-all transform duration-300 ease-out translate-y-0 opacity-100 ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle size={18} className="text-green-500" />}
          {toast.type === 'error' && <X size={18} className="text-red-500" />}
          {toast.type === 'info' && <Loader2 size={18} className="text-blue-500 animate-spin" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
