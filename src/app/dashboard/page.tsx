'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Loader2, LogOut, Settings, Users, CheckCircle, X, Inbox, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePlan } from '@/hooks/usePlan';
import type { Facture } from '@/lib/types';
import { generateFEC, downloadFEC } from '@/lib/export-fec';

interface PatientMin {
  id: string;
  nom_complet: string;
  email: string;
}

import StatsCards from '@/components/dashboard/StatsCards';
import ChartCA from '@/components/dashboard/ChartCA';
import ChartAvis from '@/components/dashboard/ChartAvis';
import UploadForm from '@/components/dashboard/UploadForm';
import HistoriqueTable from '@/components/dashboard/HistoriqueTable';
import EditEmailModal from '@/components/dashboard/EditEmailModal';
import CancelModal from '@/components/dashboard/CancelModal';
import QuickInvoice from '@/components/dashboard/QuickInvoice';

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
  siret?: string;
}

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Dashboard() {
  // ── Upload form state ──
  const [file, setFile] = useState<File | null>(null);
  const [patientEmail, setPatientEmail] = useState('');
  const [civilite, setCivilite] = useState('Mme');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [montant, setMontant] = useState('');
  const [modeReglement, setModeReglement] = useState('CB');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Core data state ──
  const [therapeuteInfo, setTherapeuteInfo] = useState<Therapeute | null>(null);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [selectedCabinetId, setSelectedCabinetId] = useState<string>('');
  const [patientsDb, setPatientsDb] = useState<PatientMin[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdownPrenom, setShowDropdownPrenom] = useState(false);
  const [facturesHistorique, setFacturesHistorique] = useState<Facture[]>([]);

  // ── Filter state ──
  const [filterCabinetId, setFilterCabinetId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // ── Pagination state ──
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // ── UI state ──
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const router = useRouter();

  // ── Modal state ──
  const [isEditEmailModalOpen, setIsEditEmailModalOpen] = useState(false);
  const [factureToEdit, setFactureToEdit] = useState<Facture | null>(null);
  const [emailToEdit, setEmailToEdit] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [factureToCancel, setFactureToCancel] = useState<Facture | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  // ── Plan ──
  const { isPro, plan, daysLeft, loading: planLoading } = usePlan();

  // ── Helpers ──

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatLocalYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDateDebutChange = (val: string) => {
    setDateDebut(val);
    setCurrentPage(1);
    if (!dateFin || dateFin < val) setDateFin(val);
  };

  const setFilterToday = () => {
    const today = formatLocalYYYYMMDD(new Date());
    setDateDebut(today);
    setDateFin(today);
    setCurrentPage(1);
  };

  const setFilterMonth = () => {
    const today = new Date();
    setDateDebut(formatLocalYYYYMMDD(new Date(today.getFullYear(), today.getMonth(), 1)));
    setDateFin(formatLocalYYYYMMDD(new Date(today.getFullYear(), today.getMonth() + 1, 0)));
    setCurrentPage(1);
  };

  const clearFilters = () => { setSearchTerm(''); setDateDebut(''); setDateFin(''); setCurrentPage(1); };

  const handleSearchTermChange = (val: string) => { setSearchTerm(val); setCurrentPage(1); };
  const handleDateFinChange = (val: string) => { setDateFin(val); setCurrentPage(1); };

  // ── Data fetching ──

  const fetchHistorique = async (uid: string) => {
    const { data, error } = await supabase
      .from('factures').select('*').eq('therapeute_id', uid)
      .order('created_at', { ascending: false });
    if (error) { console.error("Erreur Historique:", error); showToast("Erreur lors du chargement de l'historique", "error"); }
    else if (data) setFacturesHistorique(data);
  };

  const fetchPatients = async (uid: string) => {
    const { data, error } = await supabase
      .from('patients').select('id, nom_complet, email').eq('therapeute_id', uid)
      .order('nom_complet', { ascending: true });
    if (error) console.error("Erreur Patients:", error);
    else if (data) setPatientsDb(data);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined;

    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }

      const uid = session.user.id;
      setUserId(uid);
      if (session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) setIsAdmin(true);

      const { data: dataTherapeute } = await supabase.from('therapeutes').select('nom, titre, telephone, email, logo_url, siret').eq('id', uid).single();
      if (dataTherapeute) setTherapeuteInfo(dataTherapeute);

      const { data: dataCabinets } = await supabase.from('cabinets').select('*').eq('therapeute_id', uid);
      if (dataCabinets) { setCabinets(dataCabinets); if (dataCabinets.length > 0) setSelectedCabinetId(dataCabinets[0].id); }

      await fetchHistorique(uid);
      await fetchPatients(uid);
      setFetchingData(false);

      channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'factures', filter: `therapeute_id=eq.${uid}` },
          () => fetchHistorique(uid))
        .subscribe();
    };

    initDashboard();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [router]);

  // ── Actions ──

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); };

  const selectPatient = (p: PatientMin) => {
    // Extract civilité and set it
    if (p.nom_complet.startsWith('Mme ')) {
      setCivilite('Mme');
      setNom(p.nom_complet.substring(4));
    } else if (p.nom_complet.startsWith('M. ')) {
      setCivilite('M.');
      setNom(p.nom_complet.substring(3));
    } else {
      setNom(p.nom_complet);
    }
    setPatientEmail(p.email);
    setPrenom('');
    setShowDropdown(false);
    setShowDropdownPrenom(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId || !patientEmail || !selectedCabinetId || !therapeuteInfo) return;
    setLoading(true);
    setSuccessLink(null);

    try {
      const cleanEmail = patientEmail.trim().toLowerCase();
      const prenomFormatte = prenom ? ` ${prenom.trim()}` : '';
      const nomComplet = `${civilite} ${nom.trim().toUpperCase()}${prenomFormatte}`.trim();

      const existingPatient = patientsDb.find(p =>
        p.email.toLowerCase() === cleanEmail && p.nom_complet.toLowerCase() === nomComplet.toLowerCase()
      );

      if (!existingPatient) {
        const { data: newPat, error: patError } = await supabase.from('patients').insert([{
          therapeute_id: userId, nom_complet: nomComplet, email: cleanEmail, notes_consultation: ""
        }]).select().single();
        if (patError) console.error("Erreur de création de fiche patient :", patError);
        else if (newPat) setPatientsDb([...patientsDb, newPat]);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('factures_pdf').upload(filePath, file);
      if (uploadError) throw uploadError;

      const currentCabinet = cabinets.find(c => c.id === selectedCabinetId);

      const { data: dbData, error: dbError } = await supabase
        .from('factures')
        .insert([{
          therapeute_id: userId, cabinet_id: selectedCabinetId, patient_email: cleanEmail,
          patient_nom: nomComplet, fichier_path: filePath, statut_email: 'Envoyé',
          montant: parseFloat(montant) || 0, mode_reglement: modeReglement, statut: 'Valide'
        }])
        .select('*').single();
      if (dbError) throw dbError;

      if (!dbData) throw new Error('Erreur lors de la création de la facture');
      setFacturesHistorique(prev => [dbData, ...prev]);

      const lien = `${window.location.origin}/facture/${dbData.id}`;
      setSuccessLink(lien);
      showToast("Facture créée et prête à être envoyée !", "success");

      const { data: { session: emailSession } } = await supabase.auth.getSession();
      const emailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${emailSession?.access_token}` },
        body: JSON.stringify({
          email: cleanEmail, nomPatient: nomComplet, lienFacture: lien,
          nomTherapeute: therapeuteInfo.nom, titreTherapeute: therapeuteInfo.titre,
          telephoneTherapeute: therapeuteInfo.telephone, emailTherapeute: therapeuteInfo.email,
          logoUrlTherapeute: therapeuteInfo.logo_url, cabinetNom: currentCabinet?.nom
        }),
      });
      if (!emailRes.ok) {
        showToast("Facture créée, mais l'envoi de l'email a échoué. Réessayez depuis l'historique.", "error");
      }

      setFile(null); setPatientEmail(''); setNom(''); setPrenom(''); setMontant(''); setModeReglement('CB');
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error('Erreur:', error);
      showToast("Une erreur est survenue lors de l'envoi.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = (facture: Facture) => {
    setFactureToEdit(facture); setEmailToEdit(facture.patient_email); setIsEditEmailModalOpen(true);
  };

  const handleConfirmEditEmail = async () => {
    const cleanNewEmail = emailToEdit.trim().toLowerCase();
    if (!factureToEdit || !cleanNewEmail || cleanNewEmail === factureToEdit.patient_email.toLowerCase()) {
      setIsEditEmailModalOpen(false); return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('factures').update({ patient_email: cleanNewEmail, statut_email: 'Renvoyé' })
        .eq('id', factureToEdit.id).eq('therapeute_id', userId!);
      if (updateError) throw updateError;

      setFacturesHistorique(prev => prev.map(f => f.id === factureToEdit.id ? { ...f, patient_email: cleanNewEmail, statut_email: 'Renvoyé' } : f));

      const lien = `${window.location.origin}/facture/${factureToEdit.id}`;
      const currentCabinet = cabinets.find(c => c.id === factureToEdit.cabinet_id);

      const { data: { session: resendSession } } = await supabase.auth.getSession();
      const resendRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendSession?.access_token}` },
        body: JSON.stringify({
          email: cleanNewEmail, nomPatient: factureToEdit.patient_nom, lienFacture: lien,
          nomTherapeute: therapeuteInfo?.nom, titreTherapeute: therapeuteInfo?.titre,
          telephoneTherapeute: therapeuteInfo?.telephone, emailTherapeute: therapeuteInfo?.email,
          logoUrlTherapeute: therapeuteInfo?.logo_url, cabinetNom: currentCabinet?.nom
        }),
      });
      if (resendRes.ok) {
        showToast("L'email a été mis à jour et la facture renvoyée !", "success");
      } else {
        showToast("Email mis à jour, mais l'envoi a échoué. Réessayez.", "error");
      }
      setIsEditEmailModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'email :", error);
      showToast("Une erreur est survenue lors de la modification.", "error");
    } finally { setLoading(false); }
  };

  const handleCancelClick = (facture: Facture) => { setFactureToCancel(facture); setIsCancelModalOpen(true); };

  const confirmCancelInvoice = async () => {
    if (!factureToCancel) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('factures').update({ statut: 'Annulée' })
        .eq('id', factureToCancel.id).eq('therapeute_id', userId!);
      if (error) throw error;
      setFacturesHistorique(prev => prev.map(f => f.id === factureToCancel.id ? { ...f, statut: 'Annulée' } : f));
      showToast("La facture a bien été annulée.", "success");
      setIsCancelModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      showToast("Erreur lors de l'annulation de la facture.", "error");
    } finally { setLoading(false); }
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

  const handlePreviewPdf = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage.from('factures_pdf').download(filePath);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      setPreviewPdfUrl(url);
    } catch {
      showToast('Impossible de charger la previsualisation', 'error');
    }
  };

  // ── Derived data ──

  const facturesFiltered = filterCabinetId === 'all'
    ? facturesHistorique
    : facturesHistorique.filter(f => f.cabinet_id === filterCabinetId);

  const facturesFiltrees = facturesFiltered.filter((f) => {
    const matchRecherche = f.patient_nom.toLowerCase().includes(searchTerm.toLowerCase()) || f.patient_email.toLowerCase().includes(searchTerm.toLowerCase());
    const dateFacture = new Date(f.created_at).getTime();
    const matchDebut = dateDebut ? dateFacture >= new Date(dateDebut).getTime() : true;
    const matchFin = dateFin ? dateFacture <= new Date(dateFin).getTime() + 86400000 : true;
    return matchRecherche && matchDebut && matchFin;
  });

  const totalPages = Math.ceil(facturesFiltrees.length / ITEMS_PER_PAGE);
  const paginatedFactures = facturesFiltrees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const filteredPatients = patientsDb.filter(p => {
    if (!nom && !prenom) return false;
    const matchNom = nom ? p.nom_complet.toLowerCase().includes(nom.toLowerCase()) : true;
    const matchPrenom = prenom ? p.nom_complet.toLowerCase().includes(prenom.toLowerCase()) : true;
    return matchNom && matchPrenom;
  });

  const facturesValides = facturesFiltrees.filter(f => f.statut !== 'Annulée' && f.statut !== 'Annulee');
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

  const exportCSV = () => {
    let csvContent = "Date;Patient;Email;Cabinet;Statut;Montant (€);Mode Règlement;Note (sur 5);Commentaire;Lien de la facture\n";
    facturesFiltrees.forEach(f => {
      const date = new Date(f.created_at).toLocaleDateString('fr-FR');
      const cab = cabinets.find(c => c.id === f.cabinet_id)?.nom || 'Inconnu';
      const lien = `${window.location.origin}/facture/${f.id}`;
      const statut = f.statut || 'Valide';
      const note = f.note !== null && f.note !== undefined ? f.note : '';
      const montantVal = f.montant || 0;
      const mode = f.mode_reglement || 'Non précisé';
      const commentaire = f.commentaire ? `"${f.commentaire.replace(/"/g, '""')}"` : '';
      csvContent += `${date};${f.patient_nom};${f.patient_email};${cab};${statut};${montantVal};${mode};${note};${commentaire};${lien}\n`;
    });
    const blob = new Blob(["﻿" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Compta_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFEC = () => {
    const siret = therapeuteInfo?.siret || '';
    if (!siret) {
      showToast("Veuillez renseigner votre SIRET dans les paramètres avant d'exporter le FEC.", "error");
      return;
    }
    const content = generateFEC({
      factures: facturesFiltrees,
      cabinets,
      siret,
      nomTherapeute: therapeuteInfo?.nom || '',
    });
    downloadFEC(content, siret);
    showToast("Export FEC téléchargé avec succès !", "success");
  };

  // ── Render ──

  if (fetchingData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-500">Chargement de votre espace...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 relative">
      <div className="max-w-[1500px] w-[96%] mx-auto space-y-6">

        {/* EN-TETE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Espace Praticien</h1>
              {plan === 'free' && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Plan Gratuit</span>
              )}
              {plan === 'trial' && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  Essai Pro — {daysLeft}j restants
                </span>
              )}
              {(plan === 'founder' || plan === 'standard') && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#fdf2e9] text-[#a9825a] px-2 py-1 rounded-full">Plan Pro</span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Connecté en tant que <span className="font-semibold">{therapeuteInfo?.nom}</span>
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {isAdmin && (
              <Link href="/admin" className="flex-1 sm:flex-none flex items-center justify-center text-sm text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg shadow-sm transition-colors">
                <Settings size={16} className="mr-2" /> Admin
              </Link>
            )}
            <Link href="/dashboard/factures-recues" className="flex-1 sm:flex-none flex items-center justify-center text-sm text-gray-700 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-colors">
              <Inbox size={16} className="mr-2" /> Factures Reçues
            </Link>
            <Link href="/dashboard/patients" className="flex-1 sm:flex-none flex items-center justify-center text-sm text-gray-700 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-colors">
              <Users size={16} className="mr-2" /> Fiches Patients
            </Link>
            <Link href="/dashboard/settings" className="flex-1 sm:flex-none flex items-center justify-center text-sm text-gray-700 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-colors">
              <Settings size={16} className="mr-2" /> Paramètres
            </Link>
            <button onClick={handleLogout} className="flex-1 sm:flex-none flex items-center justify-center text-sm text-gray-500 hover:text-red-600 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-colors">
              <LogOut size={16} className="mr-2" /> Deconnexion
            </button>
          </div>
          {cabinets.length > 1 && (
            <select
              value={filterCabinetId}
              onChange={(e) => setFilterCabinetId(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            >
              <option value="all">Tous les cabinets</option>
              {cabinets.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          )}
        </div>

        {!isPro && (
          <div className="space-y-6">
            {/* Welcome + quick access to factures recues */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <h2 className="text-xl font-black text-gray-900 mb-2">Bienvenue sur FacturAvis</h2>
              <p className="text-gray-500 mb-6">Votre plan gratuit vous donne accès à la réception de factures fournisseurs.</p>
              <Link href="/dashboard/factures-recues" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                <Inbox size={20} /> Mes factures fournisseurs
              </Link>
            </div>

            {/* Upgrade prompt */}
            <div className="bg-gradient-to-r from-[#fdf2e9] to-white rounded-2xl border border-[#f0e6de] p-8">
              <div className="flex items-start gap-4">
                <div className="bg-[#a9825a] text-white p-3 rounded-xl shrink-0">
                  <Sparkles size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-lg text-[#3e2f25] mb-1">Passez au plan Pro</h3>
                  <p className="text-sm text-[#7a6a5f] mb-4">Facturez vos patients, récoltez des avis Google et gérez vos dossiers — tout en un.</p>
                  <div className="flex gap-3">
                    <Link href="/dashboard/settings" className="bg-[#a9825a] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#8b6a48] transition-colors">
                      19€/mois — Essai gratuit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isPro && (
          <>
            {/* STATISTIQUES */}
            <StatsCards
              chiffreAffaires={chiffreAffaires}
              caParMode={caParMode}
              totalFactures={totalFactures}
              avisRecoltes={avisRecoltes}
              noteMoyenne={noteMoyenne}
            />

            {/* GRAPHIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Chiffre d&apos;Affaires (6 derniers mois)</h3>
                <ChartCA factures={facturesFiltered} />
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Taux de collecte d&apos;avis (6 derniers mois)</h3>
                <ChartAvis factures={facturesFiltered} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* COLONNE GAUCHE */}
              <div className="lg:col-span-5 space-y-6">
                <UploadForm
                  cabinets={cabinets}
                  selectedCabinetId={selectedCabinetId}
                  setSelectedCabinetId={setSelectedCabinetId}
                  file={file}
                  setFile={setFile}
                  fileInputRef={fileInputRef}
                  civilite={civilite}
                  setCivilite={setCivilite}
                  nom={nom}
                  setNom={setNom}
                  prenom={prenom}
                  setPrenom={setPrenom}
                  patientEmail={patientEmail}
                  setPatientEmail={setPatientEmail}
                  montant={montant}
                  setMontant={setMontant}
                  modeReglement={modeReglement}
                  setModeReglement={setModeReglement}
                  loading={loading}
                  handleUpload={handleUpload}
                  filteredPatients={filteredPatients}
                  selectPatient={selectPatient}
                  showDropdown={showDropdown}
                  setShowDropdown={setShowDropdown}
                  showDropdownPrenom={showDropdownPrenom}
                  setShowDropdownPrenom={setShowDropdownPrenom}
                />
                <QuickInvoice factures={facturesFiltered} cabinets={cabinets} />
              </div>

              {/* COLONNE DROITE */}
              <HistoriqueTable
                facturesFiltrees={paginatedFactures}
                cabinets={cabinets}
                searchTerm={searchTerm}
                setSearchTerm={handleSearchTermChange}
                dateDebut={dateDebut}
                dateFin={dateFin}
                handleDateDebutChange={handleDateDebutChange}
                setDateFin={handleDateFinChange}
                setFilterToday={setFilterToday}
                setFilterMonth={setFilterMonth}
                clearFilters={clearFilters}
                exportCSV={exportCSV}
                exportFEC={exportFEC}
                handleEditEmail={handleEditEmail}
                handleCancelClick={handleCancelClick}
                handleDownloadPdf={handleDownloadPdf}
                onPreviewPdf={handlePreviewPdf}
                showToast={showToast}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={facturesFiltrees.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* MODALS */}
      <EditEmailModal
        isOpen={isEditEmailModalOpen}
        onClose={() => setIsEditEmailModalOpen(false)}
        emailToEdit={emailToEdit}
        setEmailToEdit={setEmailToEdit}
        loading={loading}
        onConfirm={handleConfirmEditEmail}
      />

      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        facture={factureToCancel}
        loading={loading}
        onConfirm={confirmCancelInvoice}
      />

      {/* PDF PREVIEW OVERLAY */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">Previsualisation de la facture</h3>
              <button onClick={() => { if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl); setPreviewPdfUrl(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <iframe src={previewPdfUrl} className="flex-1 w-full" title="Previsualisation facture" />
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
