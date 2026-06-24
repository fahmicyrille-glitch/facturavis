'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Loader2, ArrowLeft, UserPlus, CheckCircle, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Patient, FactureHistorique } from '@/lib/types';
import ImportCSV from '@/components/patients/ImportCSV';
import { usePlan } from '@/hooks/usePlan';
import UpgradePrompt from '@/components/UpgradePrompt';

import PatientList from '@/components/patients/PatientList';
import PatientDetail from '@/components/patients/PatientDetail';
import DeletePatientModal from '@/components/patients/DeletePatientModal';

export default function PatientsAnnuaire() {
  const router = useRouter();
  const { isPro, daysLeft, hasUsedTrial, loading: planLoading } = usePlan();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [historiqueFactures, setHistoriqueFactures] = useState<FactureHistorique[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // --- AUTO-SAVE LOGIC ---
  useEffect(() => {
    if (selectedPatient) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        autoSaveNotes();
      }, 2000);
    }
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [selectedPatient?.notes_consultation]);

  // --- AUTO-CREATE DRAFT when nom + email are filled ---
  const draftSaveRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!selectedPatient || selectedPatient.id !== 'temp-new-patient' || !userId) return;
    const justName = extractName(selectedPatient.nom_complet).trim();
    const email = selectedPatient.email.trim();
    if (!justName || !email || !/^\S+@\S+\.\S+$/.test(email)) return;

    if (draftSaveRef.current) clearTimeout(draftSaveRef.current);
    draftSaveRef.current = setTimeout(async () => {
      const cleanedNom = selectedPatient.nom_complet.trim();
      const cleanedEmail = email.toLowerCase();

      const isDuplicate = patients.some(p =>
        p.id !== 'temp-new-patient' &&
        p.email.toLowerCase() === cleanedEmail &&
        p.nom_complet.toLowerCase() === cleanedNom.toLowerCase()
      );
      if (isDuplicate) return;

      const { data, error } = await supabase.from('patients').insert([{
        therapeute_id: userId,
        nom_complet: cleanedNom,
        email: cleanedEmail,
        telephone: selectedPatient.telephone?.trim() || '',
        adresse: selectedPatient.adresse?.trim() || '',
        num_secu: selectedPatient.num_secu?.trim() || '',
        notes_consultation: selectedPatient.notes_consultation || '',
      }]).select().single();

      if (!error && data) {
        setPatients(prev => [data, ...prev.filter(p => p.id !== 'temp-new-patient')]);
        setSelectedPatient(data);
        showToast('Patient enregistré automatiquement');
      }
    }, 1500);

    return () => { if (draftSaveRef.current) clearTimeout(draftSaveRef.current); };
  }, [selectedPatient?.nom_complet, selectedPatient?.email, userId]);

  const autoSaveNotes = async () => {
    if (!selectedPatient || selectedPatient.id === 'temp-new-patient') return;

    setSaving(true);
    const { error } = await supabase
      .from('patients')
      .update({ notes_consultation: selectedPatient.notes_consultation })
      .eq('id', selectedPatient.id)
      .eq('therapeute_id', userId!);

    if (error) {
      console.error("Erreur Auto-save :", error);
      showToast("Erreur de synchronisation", "error");
    } else {
      setPatients(prev => prev.map(p =>
        p.id === selectedPatient.id ? { ...p, notes_consultation: selectedPatient.notes_consultation } : p
      ));
    }
    setSaving(false);
  };

  const fetchPatients = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUserId(session.user.id);
    const { data, error } = await supabase.from('patients').select('*').eq('therapeute_id', session.user.id).order('nom_complet');

    if (error) {
      console.error(error);
      showToast("Erreur lors du chargement des patients", "error");
    } else if (data) {
      setPatients(data);
    }
    setLoading(false);
  };

  const fetchHistorique = async (pEmail: string, pNom: string) => {
    if (!userId || !pEmail || !pNom) return;

    const nomSansPrefix = pNom.replace(/^(Mme |M\. |Enfant )/, '').trim().toLowerCase();

    const { data, error } = await supabase
      .from('factures')
      .select('id, created_at, montant, statut, fichier_path, note, commentaire, mode_reglement, statut_email, patient_nom')
      .eq('patient_email', pEmail.toLowerCase())
      .eq('therapeute_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const filtered = data.filter(f => {
        const fNom = f.patient_nom.replace(/^(Mme |M\. |Enfant )/, '').trim().toLowerCase();
        return fNom === nomSansPrefix;
      });
      setHistoriqueFactures(filtered);
      return;
    }

    if (error) {
      console.error(error);
      showToast("Erreur lors du chargement de l'historique", "error");
    }
    setHistoriqueFactures([]);
  };

  const handleSelectPatient = async (p: Patient) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      await autoSaveNotes();
    }

    if (selectedPatient?.id === 'temp-new-patient' && p.id !== 'temp-new-patient') {
      setPatients(prev => prev.filter(pat => pat.id !== 'temp-new-patient'));
    }

    setSelectedPatient(p);

    if (p.id !== 'temp-new-patient') {
      fetchHistorique(p.email, p.nom_complet);
    } else {
      setHistoriqueFactures([]);
    }
  };

  const handleGoBack = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      await autoSaveNotes();
    }
    router.push('/dashboard');
  };

  // --- CIVILITY HELPERS ---
  const extractCivility = (nomComplet: string) => {
    if (nomComplet?.startsWith('Mme ')) return 'Mme';
    if (nomComplet?.startsWith('M. ')) return 'M.';
    if (nomComplet?.startsWith('Enfant ')) return 'Enfant';
    return 'Mme';
  };

  const extractName = (nomComplet: string) => {
    if (nomComplet?.startsWith('Mme ')) return nomComplet.substring(4);
    if (nomComplet?.startsWith('M. ')) return nomComplet.substring(3);
    if (nomComplet?.startsWith('Enfant ')) return nomComplet.substring(7);
    return nomComplet || '';
  };

  // --- SAVE (CREATE OR UPDATE) ---
  const handleManualUpdate = async () => {
    if (!selectedPatient) return;
    setSaving(true);

    const cleanedEmail = selectedPatient.email.trim().toLowerCase();
    const cleanedPhone = selectedPatient.telephone?.trim();
    const cleanedNom = selectedPatient.nom_complet.trim();
    const justName = extractName(cleanedNom);

    if (!justName || !cleanedEmail) {
      showToast("Le nom et l'email sont obligatoires.", "error");
      setSaving(false);
      return;
    }

    const isDuplicate = patients.some(p =>
      p.id !== selectedPatient.id &&
      p.email.toLowerCase() === cleanedEmail &&
      p.nom_complet.toLowerCase() === cleanedNom.toLowerCase()
    );

    if (isDuplicate) {
      showToast("Ce patient existe déjà (Même nom et même email).", "error");
      setSaving(false);
      return;
    }

    if (selectedPatient.id === 'temp-new-patient') {
      const { data, error } = await supabase
        .from('patients')
        .insert([{
          therapeute_id: userId,
          nom_complet: cleanedNom,
          email: cleanedEmail,
          adresse: selectedPatient.adresse,
          num_secu: selectedPatient.num_secu,
          telephone: cleanedPhone,
          notes_consultation: selectedPatient.notes_consultation
        }])
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        showToast("Erreur lors de la création", "error");
      } else if (data) {
        setPatients(prev => [data, ...prev.filter(p => p.id !== 'temp-new-patient')]);
        setSelectedPatient(data);
        showToast("Nouveau dossier créé avec succès !");
      }
    } else {
      const { error } = await supabase
        .from('patients')
        .update({
          nom_complet: cleanedNom,
          email: cleanedEmail,
          adresse: selectedPatient.adresse,
          num_secu: selectedPatient.num_secu,
          telephone: cleanedPhone,
          notes_consultation: selectedPatient.notes_consultation
        })
        .eq('id', selectedPatient.id)
        .eq('therapeute_id', userId!);

      if (error) {
        console.error("Update error:", error);
        showToast("Erreur lors de l'enregistrement", "error");
      } else {
        setSelectedPatient({ ...selectedPatient, email: cleanedEmail, telephone: cleanedPhone, nom_complet: cleanedNom });
        fetchPatients();
        showToast("Modifications enregistrées");
      }
    }

    setSaving(false);
  };

  // --- CREATE DRAFT ---
  const handleCreatePatient = () => {
    if (selectedPatient?.id === 'temp-new-patient') return;

    const draftPatient: Patient = {
      id: 'temp-new-patient',
      nom_complet: "Mme ",
      email: "",
      telephone: "",
      adresse: "",
      num_secu: "",
      notes_consultation: ""
    };

    setPatients([draftPatient, ...patients.filter(p => p.id !== 'temp-new-patient')]);
    setSelectedPatient(draftPatient);
    setHistoriqueFactures([]);
  };

  // --- DELETE ---
  const confirmDeletePatient = async () => {
    if (!selectedPatient) return;

    if (selectedPatient.id === 'temp-new-patient') {
      setPatients(patients.filter(p => p.id !== 'temp-new-patient'));
      setSelectedPatient(null);
      setIsDeleteModalOpen(false);
      return;
    }

    const { error } = await supabase.from('patients').delete().eq('id', selectedPatient.id).eq('therapeute_id', userId!);

    if (error) {
      console.error("Delete error:", error);
      showToast("Impossible de supprimer le dossier", "error");
      return;
    }

    setPatients(patients.filter(p => p.id !== selectedPatient.id));
    setSelectedPatient(null);
    setHistoriqueFactures([]);
    setIsDeleteModalOpen(false);
    showToast("Dossier supprimé");
  };

  const handleDownloadPdf = async (path: string, nom: string) => {
    try {
      const { data, error } = await supabase.storage.from('factures_pdf').download(path);
      if (error) throw error;

      if (data) {
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Facture_${nom.replace(/\s+/g, '_')}.pdf`;
        link.click();
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur lors du téléchargement", "error");
    }
  };

  // --- FILTERED + SORTED LIST ---
  const filtered = patients
    .filter(p => p.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a.id === 'temp-new-patient') return -1;
      if (b.id === 'temp-new-patient') return 1;
      const nameA = extractName(a.nom_complet).trim().toLowerCase();
      const nameB = extractName(b.nom_complet).trim().toLowerCase();
      return nameA.localeCompare(nameB, 'fr');
    });

  if (loading || planLoading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  if (!isPro) return <UpgradePrompt feature="patients" trialDaysLeft={daysLeft} hasUsedTrial={hasUsedTrial} />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 relative overflow-hidden">

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-white border-green-500 text-gray-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle className="text-green-500" size={20}/> : <AlertCircle size={20}/>}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}

      {/* DELETE MODAL */}
      <DeletePatientModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeletePatient}
        patientName={selectedPatient?.nom_complet || ''}
        isDraft={selectedPatient?.id === 'temp-new-patient'}
      />

      <div className="max-w-[1500px] w-[96%] mx-auto flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={handleGoBack} className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-100 border border-gray-200 transition group">
              <ArrowLeft size={20} className="text-gray-600 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dossiers Patients</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Annuaire et suivi thérapeutique</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userId && (
              <ImportCSV userId={userId} onImportComplete={fetchPatients} />
            )}
            <button onClick={handleCreatePatient} className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm font-bold">
              <UserPlus size={18}/> Nouveau Patient
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
          <PatientList
            patients={filtered}
            selectedPatientId={selectedPatient?.id || null}
            onSelect={handleSelectPatient}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreatePatient={handleCreatePatient}
          />

          <PatientDetail
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
            saving={saving}
            onSave={handleManualUpdate}
            onDelete={() => setIsDeleteModalOpen(true)}
            historiqueFactures={historiqueFactures}
            onDownloadPdf={handleDownloadPdf}
            showToast={showToast}
            onRefreshHistorique={() => { if (selectedPatient) fetchHistorique(selectedPatient.email, selectedPatient.nom_complet); }}
          />
        </div>
      </div>
    </div>
  );
}
