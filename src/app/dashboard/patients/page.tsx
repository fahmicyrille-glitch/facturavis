'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Search, User, FileText, Save, Loader2, ArrowLeft,
  History, Mail, Phone, MapPin, Hash, Trash2,
  Download, CreditCard, UserPlus, Star, Copy, MessageSquare,
  CheckCircle, AlertCircle, CloudCheck, Info, AlertTriangle, X
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
      // MISE À JOUR CRITIQUE : On met à jour la liste locale pour que le changement persiste au switch
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

      <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition"><ArrowLeft size={20}/></Link>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Dossiers Patients</h1>
          </div>
          <button onClick={handleCreatePatient} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm font-bold">
            <UserPlus size={18}/> Nouveau Patient
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
          {/* LISTE GAUCHE */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-4 overflow-hidden">
            <div className="relative group">
              <Search className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text" placeholder="Rechercher un nom..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl bg-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-y-auto flex-1">
              {filtered.map(p => (
                <button
                  key={p.id} onClick={() => handleSelectPatient(p)}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-blue-50 transition-all ${selectedPatient?.id === p.id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : ''}`}
                >
                  <p className="font-bold text-gray-900 truncate">{p.nom_complet}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 truncate"><Mail size={12}/> {p.email}</p>
                </button>
              ))}
            </div>
          </div>

          {/* FICHE DROITE */}
          <div className="col-span-12 md:col-span-8 overflow-y-auto pb-20 custom-scrollbar">
            {selectedPatient ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header Fiche */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <input
                        className="text-3xl font-extrabold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-blue-100 focus:border-blue-600 outline-none w-full transition-all"
                        value={selectedPatient.nom_complet}
                        onChange={(e) => setSelectedPatient({...selectedPatient, nom_complet: e.target.value})}
                      />
                      <div className="flex items-center gap-2">
                         <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Fiche Patient</span>
                         <span className="text-[10px] text-gray-300 font-mono">#{selectedPatient.id.split('-')[0]}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 h-fit">
                      <button onClick={() => setIsDeleteModalOpen(true)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Supprimer"><Trash2 size={22}/></button>
                      <button
                        onClick={() => router.push(`/dashboard/facture/nouvelle?email=${selectedPatient.email}`)}
                        className="bg-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 text-sm font-bold transition-all"
                      >
                        <CreditCard size={18}/> Facturer
                      </button>
                      <button onClick={handleManualUpdate} disabled={saving} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-black disabled:opacity-50 shadow-lg text-sm font-bold transition-all">
                        {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Enregistrer
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-6 border-t border-gray-100">
                    <div className="space-y-4">
                      <div className="group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Email</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl group-focus-within:bg-white border border-transparent group-focus-within:border-blue-200 transition-all">
                          <Mail size={16} className="text-gray-400"/>
                          <input className="flex-1 bg-transparent outline-none text-sm font-medium" value={selectedPatient.email} onChange={(e) => setSelectedPatient({...selectedPatient, email: e.target.value})} />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Téléphone</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl group-focus-within:bg-white border border-transparent group-focus-within:border-blue-200 transition-all">
                          <Phone size={16} className="text-gray-400"/>
                          <input className="flex-1 bg-transparent outline-none text-sm font-medium" placeholder="Ex: 06 00 00 00 00" value={selectedPatient.telephone || ''} onChange={(e) => setSelectedPatient({...selectedPatient, telephone: e.target.value})} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Adresse</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl group-focus-within:bg-white border border-transparent group-focus-within:border-blue-200 transition-all">
                          <MapPin size={16} className="text-gray-400"/>
                          <input className="flex-1 bg-transparent outline-none text-sm font-medium" placeholder="Adresse complète" value={selectedPatient.adresse || ''} onChange={(e) => setSelectedPatient({...selectedPatient, adresse: e.target.value})} />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">N° Sécurité Sociale</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl group-focus-within:bg-white border border-transparent group-focus-within:border-blue-200 transition-all">
                          <Hash size={16} className="text-gray-400"/>
                          <input className="flex-1 bg-transparent outline-none text-sm font-medium" placeholder="15 chiffres" value={selectedPatient.num_secu || ''} onChange={(e) => setSelectedPatient({...selectedPatient, num_secu: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Médicales - AUTO-SAVE AREA */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><FileText size={18} className="text-blue-600"/> Observations Thérapeutiques</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-opacity duration-300">
                      {saving ? (
                        <span className="text-blue-500 flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Sauvegarde...</span>
                      ) : (
                        <span className="text-green-500 flex items-center gap-1 opacity-60"><CloudCheck size={12}/> Enregistré</span>
                      )}
                    </div>
                  </div>
                  <textarea
                    rows={10} className="w-full p-5 bg-blue-50/30 border border-blue-100/50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 text-gray-700 leading-relaxed transition-all placeholder:text-gray-300"
                    placeholder="Écrivez ici le suivi médical du patient..."
                    value={selectedPatient.notes_consultation || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, notes_consultation: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-400 mt-3 italic flex items-center gap-1">
                    <Info size={12}/> Vos notes s'enregistrent automatiquement.
                  </p>
                </div>

                {/* Historique Séances */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm pb-20">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><History size={18} className="text-indigo-600"/> Historique des séances</h3>
                  <div className="space-y-4">
                    {historiqueFactures.map(f => (
                      <div key={f.id} className={`p-5 rounded-2xl border transition-all ${f.statut === 'Annulée' ? 'bg-red-50/20 border-red-50 opacity-60' : 'bg-gray-50 border-transparent hover:border-gray-200 group'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-bold text-gray-900">{new Date(f.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest ${f.statut === 'Annulée' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                {f.statut === 'Annulée' ? 'Annulée' : 'Payée'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                              <span className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-gray-100 shadow-sm text-gray-900 font-bold"><CreditCard size={12}/> {f.montant} €</span>
                              <span className="px-2 py-1 bg-gray-200/50 rounded-lg">{f.mode_reglement || 'Autre'}</span>
                              <span className={`px-2 py-1 rounded-lg ${f.statut_email === 'Ouvert' ? 'bg-green-50 text-green-700' : 'bg-gray-100'}`}>Email {f.statut_email || 'Envoyé'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/facture/${f.id}`);
                                showToast("Lien copié !");
                              }}
                              className="p-2.5 bg-white border border-gray-200 text-blue-600 rounded-xl hover:shadow-lg transition-all" title="Copier le lien">
                              <Copy size={16}/>
                            </button>
                            <button onClick={() => handleDownloadPdf(f.fichier_path, selectedPatient.nom_complet)} className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:shadow-lg transition-all" title="Télécharger">
                              <Download size={16}/>
                            </button>
                          </div>
                        </div>

                        {(f.note || f.commentaire) && (
                          <div className="mt-4 pt-4 border-t border-gray-200/50">
                            <div className="flex items-center gap-1 mb-2">
                              {[1,2,3,4,5].map(star => (
                                <Star key={star} size={14} className={star <= (f.note || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-100"} />
                              ))}
                            </div>
                            {f.commentaire && (
                              <p className="text-xs text-gray-600 italic bg-white p-3 rounded-xl border border-gray-100 flex items-start gap-2 shadow-sm">
                                <MessageSquare size={14} className="mt-0.5 shrink-0 text-gray-300"/> "{f.commentaire}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {historiqueFactures.length === 0 && <p className="text-center text-gray-400 text-sm py-12 italic bg-gray-50 rounded-3xl border border-dashed border-gray-200">Aucune séance enregistrée.</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-[40px] border-2 border-dashed border-gray-200 mx-4">
                <div className="p-8 bg-blue-50 rounded-full mb-6 animate-pulse"><User size={64} className="opacity-20 text-blue-600"/></div>
                <p className="font-extrabold text-xl text-gray-800 tracking-tight">Ouvrez un dossier patient</p>
                <p className="text-sm opacity-60 mt-2 max-w-[250px] text-center">Sélectionnez un patient à gauche pour consulter ses notes et facturer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
