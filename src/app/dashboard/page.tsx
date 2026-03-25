'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  UploadCloud, CheckCircle, Copy, LogOut, MapPin, Loader2, Settings,
  Star, FileText, MessageSquare, Search, Calendar, Download, X,
  Edit, Mail, PlusCircle, ArrowRight, Euro, CreditCard, Ban, Users
} from 'lucide-react';
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

// NOUVEAU : Interface pour charger les patients
interface Patient {
  id: string;
  nom_complet: string;
  email: string;
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
  montant: number;
  mode_reglement: string | null;
  statut: string | null; // NOUVEAU : Statut de la facture (Valide ou Annulée)
}

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
  const [montant, setMontant] = useState('');
  const [modeReglement, setModeReglement] = useState('CB');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [therapeuteInfo, setTherapeuteInfo] = useState<Therapeute | null>(null);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [selectedCabinetId, setSelectedCabinetId] = useState<string>('');

  // NOUVEAU : État pour stocker la liste des patients et gérer l'affichage
  const [patientsDb, setPatientsDb] = useState<Patient[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdownPrenom, setShowDropdownPrenom] = useState(false); // Ajout état dropdown Prénom

  const [facturesHistorique, setFacturesHistorique] = useState<Facture[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [isEditEmailModalOpen, setIsEditEmailModalOpen] = useState(false);
  const [factureToEdit, setFactureToEdit] = useState<Facture | null>(null);
  const [emailToEdit, setEmailToEdit] = useState('');

  // NOUVEAU : États pour la modale d'annulation
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [factureToCancel, setFactureToCancel] = useState<Facture | null>(null);

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

  // NOUVEAU : Fonction pour charger les patients
  const fetchPatients = async (uid: string) => {
    const { data } = await supabase
      .from('patients')
      .select('id, nom_complet, email')
      .eq('therapeute_id', uid)
      .order('nom_complet', { ascending: true });
    if (data) setPatientsDb(data);
  };

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let channel: any;

    const initDashboard = async () => {
    // 1. On récupère la session UNE SEULE FOIS
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/');
        return;
      }

      // 2. On définit l'ID utilisateur
      const uid = session.user.id;
      setUserId(uid);

      // 3. On vérifie si l'utilisateur est admin
      if (session.user.email === 'fahmicyrille@gmail.com') {
        setIsAdmin(true);
      }

      // 4. On récupère le reste des données
      const { data: dataTherapeute } = await supabase.from('therapeutes').select('nom, titre, telephone, email, logo_url').eq('id', uid).single();
      if (dataTherapeute) setTherapeuteInfo(dataTherapeute);

      const { data: dataCabinets } = await supabase.from('cabinets').select('*').eq('therapeute_id', uid);
      if (dataCabinets) {
        setCabinets(dataCabinets);
        if (dataCabinets.length > 0) setSelectedCabinetId(dataCabinets[0].id);
      }

      await fetchHistorique(uid);
      await fetchPatients(uid); // NOUVEAU : On charge aussi les patients
      setFetchingData(false);

      // CORRECTION DU REALTIME : On écoute TOUS les événements sur 'factures'
      // et on force le rafraîchissement.
      channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Écoute les INSERT, UPDATE et DELETE
            schema: 'public',
            table: 'factures'
          },
          (payload) => {
            console.log("Changement détecté dans Supabase :", payload);
            // On refetch tout pour être sûr d'avoir la dernière version (y compris les notes)
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

  // NOUVEAU : Fonction quand on clique sur un patient dans la liste
  const selectPatient = (p: Patient) => {
    setNom(p.nom_complet);
    setPatientEmail(p.email);
    setPrenom('');
    setShowDropdown(false);
    setShowDropdownPrenom(false); // Cache aussi le menu du prénom
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId || !patientEmail || !selectedCabinetId || !therapeuteInfo) return;

    setLoading(true);
    setSuccessLink(null);

    try {
      const prenomFormatte = prenom ? ` ${prenom}` : '';
      const nomComplet = `${civilite} ${nom.toUpperCase()}${prenomFormatte}`.trim();

      // --- NOUVEAU BLOC : Création de fiche patient auto si inexistant ---
      // MODIFICATION ICI : On vérifie que l'email ET le nom complet correspondent
      const existingPatient = patientsDb.find(p =>
        p.email.toLowerCase() === patientEmail.toLowerCase() &&
        p.nom_complet.toLowerCase() === nomComplet.toLowerCase()
      );

      if (!existingPatient) {
        // CORRECTION : Sécurisation de l'insert en cas d'erreur
        const { data: newPat, error: patError } = await supabase.from('patients').insert([{
          therapeute_id: userId,
          nom_complet: nomComplet,
          email: patientEmail,
          notes_consultation: "" // Ajout pour éviter le bug de colonne manquante
        }]).select().single();

        if (patError) console.error("Erreur de création de fiche patient :", patError);
        if (newPat) setPatientsDb([...patientsDb, newPat]);
      }
      // -------------------------------------------------------------------

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('factures_pdf').upload(filePath, file);
      if (uploadError) throw uploadError;

      const currentCabinet = cabinets.find(c => c.id === selectedCabinetId);

      const { data: dbData, error: dbError } = await supabase
        .from('factures')
        .insert([{
          therapeute_id: userId,
          cabinet_id: selectedCabinetId,
          patient_email: patientEmail,
          patient_nom: nomComplet,
          fichier_path: filePath,
          statut_email: 'Envoyé',
          montant: parseFloat(montant) || 0,
          mode_reglement: modeReglement,
          statut: 'Valide' // On précise Valide à l'upload
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
      setMontant('');
      setModeReglement('CB');

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

  const handleEditEmail = (facture: Facture) => {
    setFactureToEdit(facture);
    setEmailToEdit(facture.patient_email);
    setIsEditEmailModalOpen(true);
  };

  const handleConfirmEditEmail = async () => {
    if (!factureToEdit || !emailToEdit || emailToEdit === factureToEdit.patient_email) {
      setIsEditEmailModalOpen(false);
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('factures')
        .update({ patient_email: emailToEdit, statut_email: 'Renvoyé' })
        .eq('id', factureToEdit.id);

      if (updateError) throw updateError;

      setFacturesHistorique(prev => prev.map(f => f.id === factureToEdit.id ? { ...f, patient_email: emailToEdit, statut_email: 'Renvoyé' } : f));

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

      showToast("L'email a été mis à jour et la facture renvoyée !", "success");
      setIsEditEmailModalOpen(false);

    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'email :", error);
      showToast("Une erreur est survenue lors de la modification.", "error");
    } finally {
      setLoading(false);
    }
  };

  // NOUVEAU : Gérer l'annulation
  const handleCancelClick = (facture: Facture) => {
    setFactureToCancel(facture);
    setIsCancelModalOpen(true);
  };

  const confirmCancelInvoice = async () => {
    if (!factureToCancel) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('factures')
        .update({ statut: 'Annulée' })
        .eq('id', factureToCancel.id);

      if (error) throw error;

      setFacturesHistorique(prev => prev.map(f => f.id === factureToCancel.id ? { ...f, statut: 'Annulée' } : f));
      showToast("La facture a bien été annulée.", "success");
      setIsCancelModalOpen(false);

    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      showToast("Erreur lors de l'annulation de la facture.", "error");
    } finally {
      setLoading(false);
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

  // NOUVEAU : Filtrage pour le menu déroulant d'auto-complétion (Nom et Prénom)
  const filteredPatients = patientsDb.filter(p => {
    if (!nom && !prenom) return false;
    const matchNom = nom ? p.nom_complet.toLowerCase().includes(nom.toLowerCase()) : true;
    const matchPrenom = prenom ? p.nom_complet.toLowerCase().includes(prenom.toLowerCase()) : true;
    return matchNom && matchPrenom;
  });

  const exportCSV = () => {
    let csvContent = "Date;Patient;Email;Cabinet;Statut;Montant (€);Mode Règlement;Note (sur 5);Commentaire;Lien de la facture\n";
    facturesFiltrees.forEach(f => {
      const date = new Date(f.created_at).toLocaleDateString('fr-FR');
      const cab = cabinets.find(c => c.id === f.cabinet_id)?.nom || 'Inconnu';
      const lien = `${window.location.origin}/facture/${f.id}`;
      const statut = f.statut || 'Valide';
      const note = f.note ? f.note : '';
      const montantVal = f.montant || 0;
      const mode = f.mode_reglement || 'Non précisé';
      const commentaire = f.commentaire ? `"${f.commentaire.replace(/"/g, '""')}"` : '';
      csvContent += `${date};${f.patient_nom};${f.patient_email};${cab};${statut};${montantVal};${mode};${note};${commentaire};${lien}\n`;
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

  // NOUVEAU : On isole les factures valides pour le calcul des statistiques de CA
  const facturesValides = facturesFiltrees.filter(f => f.statut !== 'Annulée');

  const totalFactures = facturesValides.length;
  const avisRecoltes = facturesValides.filter(f => f.note !== null).length;
  const notesExistantes = facturesValides.filter(f => f.note !== null).map(f => f.note as number);
  const noteMoyenne = notesExistantes.length > 0 ? (notesExistantes.reduce((a, b) => a + b, 0) / notesExistantes.length).toFixed(1) : '-';

  const chiffreAffaires = facturesValides.reduce((acc, curr) => acc + (curr.montant || 0), 0);

  const caParMode = facturesValides.reduce((acc, curr) => {
    const mode = curr.mode_reglement || 'Autre';
    if (!acc[mode]) acc[mode] = 0;
    acc[mode] += (curr.montant || 0);
    return acc;
  }, {} as Record<string, number>);

  if (fetchingData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-500">Chargement de votre espace...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 relative">
      {/* MODIFICATION ICI : Élargissement du conteneur max-w-[1500px] w-[95%] */}
      <div className="max-w-[1500px] w-[96%] mx-auto space-y-6">

        {/* EN-TÊTE DU DASHBOARD */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
             <h1 className="text-2xl font-bold text-gray-900">Espace Praticien</h1>
             <p className="text-sm text-gray-500 mt-1">
               Connecté en tant que <span className="font-semibold">{therapeuteInfo?.nom}</span>
             </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {/* NOUVEAU : Bouton Admin conditionnel */}
            {isAdmin && (
              <Link href="/admin" className="flex-1 sm:flex-none flex items-center justify-center text-sm text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg shadow-sm transition-colors">
                <Settings size={16} className="mr-2" /> Admin
              </Link>
            )}
            {/* NOUVEAU BOUTON : Fiches Patients */}
            <Link href="/dashboard/patients" className="flex-1 sm:flex-none flex items-center justify-center text-sm text-gray-700 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-colors">
              <Users size={16} className="mr-2" /> Fiches Patients
            </Link>
            <Link href="/dashboard/settings" className="flex-1 sm:flex-none flex items-center justify-center text-sm text-gray-700 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-colors">
              <Settings size={16} className="mr-2" /> Paramètres
            </Link>
            <button onClick={handleLogout} className="flex-1 sm:flex-none flex items-center justify-center text-sm text-gray-500 hover:text-red-600 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-colors">
              <LogOut size={16} className="mr-2" /> Déconnexion
            </button>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center">
              <div className="bg-indigo-50 p-3 rounded-lg mr-4"><Euro className="text-indigo-600" size={24} /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Chiffre d'affaires</p>
                <h3 className="text-2xl font-bold text-gray-900">{chiffreAffaires.toLocaleString('fr-FR')} €</h3>
              </div>
            </div>
            {chiffreAffaires > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(caParMode).map(([mode, total]) => total > 0 && (
                  <div key={mode} className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">{mode}</span>
                    <span className="font-semibold text-gray-800">{total.toLocaleString('fr-FR')} €</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-blue-50 p-3 rounded-lg mr-4"><FileText className="text-blue-600" size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Factures valides</p>
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

        {/* MODIFICATION DE LA GRILLE : LG:COL-SPAN-5 (gauche) et LG:COL-SPAN-7 (droite) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* COLONNE GAUCHE (FORMULAIRES) : LG:COL-SPAN-5 */}
          <div className="lg:col-span-5 space-y-6">

            {/* BLOC BLEU GÉNÉRER & ENVOYER */}
            <div className="bg-[#1b64f2] rounded-2xl shadow-md p-6 text-white overflow-hidden relative group">
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-2">Générer & Envoyer</h2>
                <p className="text-blue-100 text-sm mb-6">Créez une facture pro en 3 clics et récoltez un avis Google automatiquement.</p>
                <Link
                  href="/dashboard/facture/nouvelle"
                  className="w-full bg-white text-[#1b64f2] py-3 px-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <PlusCircle size={20} />
                  Nouvelle Facture
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
              <PlusCircle className="absolute -bottom-6 -right-6 text-white/10 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </div>

            {/* FORMULAIRE UPLOAD "MIXTE" : Fond clair, Inputs noirs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
              <div className="flex items-center gap-2 mb-6 text-gray-800">
                <UploadCloud size={20} className="text-gray-400" />
                <h2 className="text-lg font-semibold">Uploader une facture PDF</h2>
              </div>

              <form onSubmit={handleUpload} className="space-y-5 relative z-10">
                {/* Lieux de consultation clairs */}
                <div className="bg-[#f2f7ff] p-4 rounded-xl border border-blue-50">
                  <div className="flex items-center gap-2 mb-3 text-blue-700">
                    <MapPin size={16} />
                    <span className="font-bold text-xs uppercase tracking-wider">Lieu</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {cabinets.map((cab) => (
                      <label key={cab.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedCabinetId === cab.id ? 'border-blue-500 bg-white shadow-sm' : 'border-transparent text-gray-600 hover:bg-white/50'}`}>
                        <input type="radio" className="hidden" name="cabinet" checked={selectedCabinetId === cab.id} onChange={() => setSelectedCabinetId(cab.id)} />
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${selectedCabinetId === cab.id ? 'border-blue-500' : 'border-gray-400'}`}>
                            {selectedCabinetId === cab.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                        </div>
                        <span className={`text-sm font-bold ${selectedCabinetId === cab.id ? 'text-blue-700' : 'text-gray-600'}`}>{cab.nom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Zone de drop claire */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors group cursor-pointer">
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
                    <UploadCloud size={24} className={file ? "text-green-500" : "text-blue-500 group-hover:scale-110 transition-transform"} />
                    <span className="mt-2 text-xs font-medium text-gray-800">{file ? file.name : "Sélectionner le PDF"}</span>
                  </label>
                </div>

                {/* Champs de saisie */}
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4">
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">Civilité</label>
                      <select className="w-full border border-gray-400 rounded-md py-2.5 px-2 text-sm bg-white focus:outline-none focus:border-blue-500" value={civilite} onChange={(e) => setCivilite(e.target.value)}>
                        <option value="Mme">Mme</option>
                        <option value="M.">M.</option>
                        <option value="Enfant">Enf.</option>
                      </select>
                    </div>
                    <div className="relative col-span-8">
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">Prénom</label>
                      <input
                        type="text"
                        className="w-full border border-gray-400 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                        value={prenom}
                        onChange={(e) => {setPrenom(e.target.value); setShowDropdownPrenom(true);}}
                        onFocus={() => setShowDropdownPrenom(true)}
                        onBlur={() => setTimeout(() => setShowDropdownPrenom(false), 200)}
                        placeholder="Ex: Jean"
                      />
                      {showDropdownPrenom && prenom.length > 0 && filteredPatients.length > 0 && (
                        <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                          {filteredPatients.map(p => (
                            <li key={p.id} onClick={() => selectPatient(p)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 flex justify-between items-center border-b border-gray-50 last:border-none">
                              <span className="font-bold">{p.nom_complet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">Nom (ou Nom Prénom) *</label>
                    <input
                      type="text" required
                      className="w-full border border-gray-400 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                      value={nom}
                      onChange={(e) => {setNom(e.target.value); setShowDropdown(true);}}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      placeholder="Ex: Dupont"
                    />
                    {showDropdown && nom.length > 0 && filteredPatients.length > 0 && (
                      <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                        {filteredPatients.map(p => (
                          <li key={p.id} onClick={() => selectPatient(p)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 flex flex-col border-b border-gray-50 last:border-none">
                            <span className="font-bold">{p.nom_complet}</span>
                            <span className="text-[10px] text-gray-400">{p.email}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">Email du patient *</label>
                    <input
                      type="email" required
                      className="w-full border border-gray-400 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="patient@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">Montant *</label>
                      <div className="absolute inset-y-0 left-0 pl-3 pt-6 flex items-center pointer-events-none">
                        <Euro size={14} className="text-gray-500" />
                      </div>
                      <input type="number" step="0.01" min="0" required className="w-full border border-gray-400 rounded-md py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-400" value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="0.00" />
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">Règlement *</label>
                      <select className="w-full border border-gray-400 rounded-md py-2.5 px-3 text-sm bg-white focus:outline-none focus:border-blue-500" value={modeReglement} onChange={(e) => setModeReglement(e.target.value)}>
                        <option value="CB">CB</option>
                        <option value="Espèces">Espèces</option>
                        <option value="Chèque">Chèque</option>
                        <option value="Virement">Virement</option>
                      </select>
                    </div>
                  </div>

                </div>

                <button type="submit" disabled={loading || !file || cabinets.length === 0} className="w-full flex justify-center py-3.5 rounded-lg shadow-sm text-sm font-bold text-white bg-[#7ab4f5] hover:bg-blue-400 disabled:bg-gray-300 transition-all mt-4">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Envoyer la facture'}
                </button>
              </form>
            </div>
          </div>

          {/* COLONNE DROITE : HISTORIQUE (LG:COL-SPAN-7) */}
          <div className="lg:col-span-7 flex flex-col">
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

              <div className="overflow-x-auto flex-1 w-full">
                {/* MODIFICATION ICI : On force un min-width pour que le tableau ne s'écrase jamais */}
                <table className="w-full text-left text-sm min-w-[650px]">
                  <thead className="bg-white border-b border-gray-100 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">Date</th>
                      <th className="px-3 py-3 font-medium">Patient</th>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">Montant</th>
                      <th className="px-3 py-3 font-medium">Avis</th>
                      <th className="px-3 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {facturesFiltrees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500 italic">
                          Aucune facture trouvée pour cette recherche.
                        </td>
                      </tr>
                    ) : (
                      facturesFiltrees.map((facture) => {
                        const date = new Date(facture.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        const lien = `${window.location.origin}/facture/${facture.id}`;
                        const isAnnulee = facture.statut === 'Annulée';

                        return (
                          <tr key={facture.id} className={`hover:bg-blue-50/30 transition-colors ${isAnnulee ? 'bg-gray-50 opacity-60' : ''}`}>
                            <td className="px-3 py-3 text-gray-500 font-medium whitespace-nowrap">{date}</td>
                            <td className="px-3 py-3">
                              <div className="font-bold text-gray-900 truncate max-w-[150px]" title={facture.patient_nom}>
                                {facture.patient_nom}
                                {isAnnulee && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Annulée</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500 truncate max-w-[150px]" title={facture.patient_email}>{facture.patient_email}</span>

                                {!isAnnulee && (
                                  <button onClick={() => handleEditEmail(facture)} className="text-gray-400 hover:text-blue-600 transition-colors shrink-0" title="Modifier l'email et renvoyer la facture">
                                    <Edit size={12} />
                                  </button>
                                )}

                                {!isAnnulee && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
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
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className={`font-bold ${isAnnulee ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                {facture.montant ? `${facture.montant.toLocaleString('fr-FR')} €` : '-'}
                              </div>
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                {facture.mode_reglement || 'Non précisé'}
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap min-w-[120px]">
                              {facture.note ? (
                                <div className="flex flex-col gap-1">
                                  <div className="flex text-yellow-400">
                                    {[1,2,3,4,5].map(star => (
                                      <Star key={star} size={14} className={star <= facture.note! ? "fill-current" : "text-gray-100"} />
                                    ))}
                                  </div>
                                  {facture.commentaire && (
                                    <span className="text-[10px] text-gray-400 truncate max-w-[100px] italic" title={facture.commentaire}>
                                      "{facture.commentaire}"
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">En attente</span>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-right">
                              <div className="flex justify-end items-center gap-2">
                                {!isAnnulee && (
                                  <button
                                    onClick={() => handleCancelClick(facture)}
                                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors flex items-center justify-center"
                                    title="Annuler cette facture"
                                  >
                                    <Ban size={16} />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDownloadPdf(facture.fichier_path, facture.patient_nom)}
                                  className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors flex items-center justify-center"
                                  title="Télécharger la facture PDF"
                                >
                                  <Download size={16} />
                                </button>

                                {!isAnnulee && (
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(lien);
                                      showToast("Lien copié avec succès !");
                                    }}
                                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center justify-center"
                                    title="Copier le lien"
                                  >
                                    <Copy size={16} />
                                  </button>
                                )}
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

      {/* MODALE EMAIL */}
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
              autoFocus
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
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16}/> : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE D'ANNULATION */}
      {isCancelModalOpen && factureToCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-50 p-2 rounded-lg"><Ban className="text-red-600" size={24}/></div>
              <h3 className="text-lg font-bold text-gray-900">Annuler la facture ?</h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Voulez-vous vraiment annuler la facture de <strong>{factureToCancel.patient_nom}</strong> d'un montant de <strong>{factureToCancel.montant} €</strong> ? <br/><br/>
              Cette action retirera le montant du Chiffre d'Affaires total. Elle ne supprimera pas le fichier PDF, mais cette facture sera marquée comme annulée.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition"
              >
                Retour
              </button>
              <button
                onClick={confirmCancelInvoice}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16}/> : 'Confirmer l\'annulation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
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
