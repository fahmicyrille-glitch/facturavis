'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Search, User, FileText, Save, Loader2, ArrowLeft,
  History, Mail, Phone, MapPin, Hash, Trash2,
  Download, CreditCard, UserPlus, Star, Copy, MessageSquare,
  CheckCircle, AlertCircle, CloudCheck, Info, AlertTriangle, X,
  ClipboardList, Euro // <-- LES VOICI !
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Patient {
  id: string;
  nom_complet: string;
  email: string;
  telephone?: string;
  adresse?: string;
  num_secu?: string;
  notes_consultation: string;
}

interface Facture {
  id: string;
  created_at: string;
  montant: number;
  statut: string;
  fichier_path: string;
  note: number | null;
  commentaire: string | null;
  mode_reglement: string | null;
  statut_email: string;
}

export default function PatientsAnnuaire() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [historiqueFactures, setHistoriqueFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // États pour la modale de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // --- LOGIQUE AUTO-SAVE ---
  useEffect(() => {
    if (selectedPatient) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        autoSaveNotes();
      }, 2000); // Sauvegarde après 2 sec d'inactivité
    }
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [selectedPatient?.notes_consultation]);

  const autoSaveNotes = async () => {
    if (!selectedPatient) return;
    setSaving(true);
    const { error } = await supabase
      .from('patients')
      .update({ notes_consultation: selectedPatient.notes_consultation })
      .eq('id', selectedPatient.id);

    if (!error) {
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
    const { data } = await supabase.from('patients').select('*').eq('therapeute_id', session.user.id).order('nom_complet');
    if (data) setPatients(data);
    setLoading(false);
  };

  const fetchHistorique = async (pEmail: string) => {
    const { data } = await supabase
      .from('factures')
      .select('id, created_at, montant, statut, fichier_path, note, commentaire, mode_reglement, statut_email')
      .eq('patient_email', pEmail)
      .order('created_at', { ascending: false });
    if (data) setHistoriqueFactures(data);
    else setHistoriqueFactures([]);
  };

  const handleSelectPatient = async (p: Patient) => {
    // Si une sauvegarde est en attente, on l'exécute tout de suite avant de changer
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      await autoSaveNotes();
    }
    setSelectedPatient(p);
    fetchHistorique(p.email);
  };

  const handleManualUpdate = async () => {
    if (!selectedPatient) return;
    setSaving(true);
    const { error } = await supabase
      .from('patients')
      .update({
        nom_complet: selectedPatient.nom_complet,
        email: selectedPatient.email,
        adresse: selectedPatient.adresse,
        num_secu: selectedPatient.num_secu,
        telephone: selectedPatient.telephone,
        notes_consultation: selectedPatient.notes_consultation
      })
      .eq('id', selectedPatient.id);

    if (!error) {
        fetchPatients();
        showToast("Modifications enregistrées");
    }
    setSaving(false);
  };

  const handleCreatePatient = async () => {
    if (!userId) return;
    const newPatient = {
      therapeute_id: userId,
      nom_complet: "Nouveau Patient",
      email: `patient_${Date.now()}@email.com`,
      notes_consultation: ""
    };
    const { data } = await supabase.from('patients').insert([newPatient]).select().single();
    if (data) {
      setPatients([data, ...patients]);
      setSelectedPatient(data);
      setHistoriqueFactures([]);
      showToast("Nouveau dossier créé");
    }
  };

  const confirmDeletePatient = async () => {
    if (!selectedPatient) return;
    const { error } = await supabase.from('patients').delete().eq('id', selectedPatient.id);
    if (!error) {
      setPatients(patients.filter(p => p.id !== selectedPatient.id));
      setSelectedPatient(null);
      setHistoriqueFactures([]);
      setIsDeleteModalOpen(false);
      showToast("Dossier supprimé", "error");
    }
  };

  const handleDownloadPdf = async (path: string, nom: string) => {
    const { data } = await supabase.storage.from('factures_pdf').download(path);
    if (data) {
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_${nom.replace(/\s+/g, '_')}.pdf`;
      link.click();
    }
  };

  const filtered = patients.filter(p => p.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()));

  // Fonction utilitaire pour générer des initiales
  const getInitials = (name: string) => {
      const parts = name.split(' ');
      if (parts.length >= 2 && parts[0] !== "Nouveau") {
          return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 relative overflow-hidden">

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-white border-green-500 text-gray-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle className="text-green-500" size={20}/> : <AlertCircle size={20}/>}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}

      {/* MODALE DE SUPPRESSION */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-red-50 rounded-full text-red-500">
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-gray-900">Supprimer le dossier ?</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Cette action est irréversible. Toutes les notes de <b>{selectedPatient?.nom_complet}</b> seront définitivement perdues.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={confirmDeletePatient}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-100"
              >
                Oui, supprimer
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODIFICATION ICI : Élargissement du conteneur (comme le dashboard principal) */}
      <div className="max-w-[1500px] w-[96%] mx-auto flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-100 border border-gray-200 transition group">
                <ArrowLeft size={20} className="text-gray-600 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dossiers Patients</h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Annuaire et suivi thérapeutique</p>
            </div>
          </div>
          <button onClick={handleCreatePatient} className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm font-bold">
            <UserPlus size={18}/> Nouveau Patient
          </button>
        </div>

        {/* MODIFICATION DE LA GRILLE : Passage à 4 colonnes pour la liste, 8 pour la fiche */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">

          {/* LISTE GAUCHE (LG:COL-SPAN-4) */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
            <div className="relative group">
              <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text" placeholder="Rechercher un nom..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* MODIFICATION DU DESIGN DE LA LISTE */}
            <div className="bg-transparent overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
              {filtered.map(p => (
                <button
                  key={p.id} onClick={() => handleSelectPatient(p)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    selectedPatient?.id === p.id
                    ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/20'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                      selectedPatient?.id === p.id ? 'bg-white text-blue-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                      {getInitials(p.nom_complet)}
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className={`font-bold truncate ${selectedPatient?.id === p.id ? 'text-white' : 'text-gray-900'}`}>
                        {p.nom_complet}
                    </p>
                    <p className={`text-[10px] flex items-center gap-1 mt-0.5 truncate ${selectedPatient?.id === p.id ? 'text-blue-100' : 'text-gray-400 font-medium'}`}>
                        <Mail size={10}/> {p.email}
                    </p>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                  <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 border-dashed">
                      <p className="text-gray-400 text-sm font-medium">Aucun patient trouvé.</p>
                  </div>
              )}
            </div>
          </div>

          {/* FICHE DROITE (LG:COL-SPAN-8) */}
          <div className="lg:col-span-8 overflow-y-auto pb-20 custom-scrollbar bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
            {selectedPatient ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">

                {/* Header Fiche */}
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <input
                        className="text-3xl font-black text-gray-900 bg-transparent border-b-2 border-transparent hover:border-blue-100 focus:border-blue-600 outline-none w-full transition-all tracking-tight"
                        value={selectedPatient.nom_complet}
                        onChange={(e) => setSelectedPatient({...selectedPatient, nom_complet: e.target.value})}
                      />
                      <div className="flex items-center gap-2 ml-1">
                         <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">Dossier Actif</span>
                         <span className="text-[10px] text-gray-400 font-mono font-medium">ID: {selectedPatient.id.split('-')[0]}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 h-fit">
                      <button onClick={() => setIsDeleteModalOpen(true)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100" title="Supprimer ce dossier"><Trash2 size={20}/></button>
                      <button
                        onClick={() => router.push(`/dashboard/facture/nouvelle?email=${selectedPatient.email}`)}
                        className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-100 text-sm font-bold transition-all"
                      >
                        <CreditCard size={18}/> Facturer
                      </button>
                      <button onClick={handleManualUpdate} disabled={saving} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-black disabled:opacity-50 shadow-md text-sm font-bold transition-all">
                        {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Enregistrer
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-6 border-t border-gray-100">
                    <div className="space-y-4">
                      <div className="group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1.5 block">Email du patient</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-focus-within:bg-white border border-gray-100 group-focus-within:border-blue-300 group-focus-within:ring-2 group-focus-within:ring-blue-500/10 transition-all">
                          <Mail size={16} className="text-gray-400"/>
                          <input className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800" value={selectedPatient.email} onChange={(e) => setSelectedPatient({...selectedPatient, email: e.target.value})} />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1.5 block">Téléphone</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-focus-within:bg-white border border-gray-100 group-focus-within:border-blue-300 group-focus-within:ring-2 group-focus-within:ring-blue-500/10 transition-all">
                          <Phone size={16} className="text-gray-400"/>
                          <input className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800" placeholder="Ex: 06 00 00 00 00" value={selectedPatient.telephone || ''} onChange={(e) => setSelectedPatient({...selectedPatient, telephone: e.target.value})} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1.5 block">Adresse Postale</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-focus-within:bg-white border border-gray-100 group-focus-within:border-blue-300 group-focus-within:ring-2 group-focus-within:ring-blue-500/10 transition-all">
                          <MapPin size={16} className="text-gray-400"/>
                          <input className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800" placeholder="Adresse complète" value={selectedPatient.adresse || ''} onChange={(e) => setSelectedPatient({...selectedPatient, adresse: e.target.value})} />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1.5 block">N° Sécurité Sociale</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-focus-within:bg-white border border-gray-100 group-focus-within:border-blue-300 group-focus-within:ring-2 group-focus-within:ring-blue-500/10 transition-all">
                          <Hash size={16} className="text-gray-400"/>
                          <input className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800" placeholder="15 chiffres" value={selectedPatient.num_secu || ''} onChange={(e) => setSelectedPatient({...selectedPatient, num_secu: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Médicales - AUTO-SAVE AREA */}
                <div className="bg-[#fcfaf8] p-6 rounded-2xl border border-[#f0e6de] relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><ClipboardList size={18} className="text-[#a9825a]"/> Observations Thérapeutiques</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-opacity duration-300">
                      {saving ? (
                        <span className="text-blue-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Sauvegarde...</span>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1 opacity-80"><CloudCheck size={14}/> Enregistré</span>
                      )}
                    </div>
                  </div>
                  <textarea
                    rows={12} className="w-full p-5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#a9825a]/30 focus:border-[#a9825a] text-gray-800 font-medium leading-relaxed transition-all placeholder:text-gray-300 shadow-sm"
                    placeholder="Écrivez ici le suivi médical du patient. La sauvegarde est automatique à chaque frappe..."
                    value={selectedPatient.notes_consultation || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, notes_consultation: e.target.value})}
                  />
                </div>

                {/* Historique Séances */}
                <div className="pt-4">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><History size={18} className="text-gray-400"/> Historique des factures et règlements</h3>
                  <div className="space-y-3">
                    {historiqueFactures.map(f => (
                      <div key={f.id} className={`p-4 rounded-2xl border transition-all ${f.statut === 'Annulée' ? 'bg-red-50/30 border-red-100 opacity-60' : 'bg-white border-gray-100 hover:border-blue-200 shadow-sm group'}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-6">
                            <div>
                                <span className="text-sm font-black text-gray-900 block mb-1">{new Date(f.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest ${f.statut === 'Annulée' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                  {f.statut === 'Annulée' ? 'Annulée' : 'Payée'}
                                </span>
                            </div>

                            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-bold"><Euro size={12}/> {f.montant}</span>
                              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200 text-gray-600"><CreditCard size={12}/> {f.mode_reglement || 'Autre'}</span>

                              {/* Avis Container */}
                              {f.note || f.commentaire ? (
                                  <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100">
                                      <div className="flex text-yellow-400">
                                        {[1,2,3,4,5].map(star => (
                                          <Star key={star} size={12} className={star <= (f.note || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                                        ))}
                                      </div>
                                      {f.commentaire && <span className="text-[10px] text-gray-600 italic truncate max-w-[120px] ml-1">"{f.commentaire}"</span>}
                                  </div>
                              ) : (
                                  <span className="text-[10px] px-2 py-1 uppercase tracking-widest font-bold text-gray-300 italic">Sans avis</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/facture/${f.id}`);
                                showToast("Lien copié !");
                              }}
                              className="p-2 bg-gray-50 border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all" title="Copier le lien de la facture">
                              <Copy size={16}/>
                            </button>
                            <button onClick={() => handleDownloadPdf(f.fichier_path, selectedPatient.nom_complet)} className="p-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-all" title="Télécharger le PDF">
                              <Download size={16}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {historiqueFactures.length === 0 && (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                            <p className="text-gray-400 text-sm font-medium italic">Aucune facture enregistrée pour ce patient.</p>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="p-8 bg-gray-50 border border-gray-100 rounded-full mb-6 shadow-sm"><FileText size={48} className="text-gray-300"/></div>
                <p className="font-bold text-xl text-gray-800 tracking-tight">Aucun dossier sélectionné</p>
                <p className="text-sm opacity-60 mt-2 text-center">Cliquez sur un patient à gauche pour afficher ses notes et son historique.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
