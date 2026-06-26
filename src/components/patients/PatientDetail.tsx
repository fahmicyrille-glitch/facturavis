'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Save, Loader2, Mail, Phone, MapPin, Hash, Trash2,
  Download, CreditCard, Star, Copy, History,
  CloudCheck, ClipboardList, Euro, FileText,
  Eye, X, Calendar, Plus, Paperclip, Ban
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Patient, FactureHistorique, Consultation, Attachment } from '@/lib/types';

interface PatientDetailProps {
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient) => void;
  saving: boolean;
  onSave: () => void;
  onDelete: () => void;
  historiqueFactures: FactureHistorique[];
  onDownloadPdf: (path: string, nom: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onRefreshHistorique?: () => void;
}

function extractCivility(nomComplet: string): string {
  if (nomComplet?.startsWith('Mme ')) return 'Mme';
  if (nomComplet?.startsWith('M. ')) return 'M.';
  if (nomComplet?.startsWith('Enfant ')) return 'Enfant';
  return 'Mme';
}

function extractName(nomComplet: string): string {
  if (nomComplet?.startsWith('Mme ')) return nomComplet.substring(4);
  if (nomComplet?.startsWith('M. ')) return nomComplet.substring(3);
  if (nomComplet?.startsWith('Enfant ')) return nomComplet.substring(7);
  return nomComplet || '';
}

export default function PatientDetail({
  selectedPatient,
  setSelectedPatient,
  saving,
  onSave,
  onDelete,
  historiqueFactures,
  onDownloadPdf,
  showToast,
  onRefreshHistorique,
}: PatientDetailProps) {
  const router = useRouter();

  // PDF preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{ factureId: string; montant: number } | null>(null);

  // Consultations & Attachments state
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [openConsultationId, setOpenConsultationId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [generalAttachments, setGeneralAttachments] = useState<Attachment[]>([]);

  // Debounced auto-save for consultation notes
  const consultationSaveRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Scroll container : remonte en haut quand on change de patient
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedPatient?.id]);

  // Fetch consultations and attachments when patient changes
  useEffect(() => {
    if (!selectedPatient || selectedPatient.id === 'temp-new-patient') {
      setConsultations([]);
      setAttachments([]);
      setGeneralAttachments([]);
      return;
    }

    const fetchConsultations = async () => {
      const { data } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', selectedPatient.id)
        .order('date_consultation', { ascending: false });
      if (data) setConsultations(data);
    };

    const fetchAttachments = async () => {
      // Session attachments (linked to a consultation)
      const { data: consAttach } = await supabase
        .from('attachments')
        .select('*')
        .not('consultation_id', 'is', null)
        .eq('patient_id', selectedPatient.id);
      if (consAttach) setAttachments(consAttach);

      // General attachments (no consultation_id)
      const { data: genAttach } = await supabase
        .from('attachments')
        .select('*')
        .is('consultation_id', null)
        .eq('patient_id', selectedPatient.id);
      if (genAttach) setGeneralAttachments(genAttach);
    };

    fetchConsultations();
    fetchAttachments();
  }, [selectedPatient?.id]);

  // Cleanup preview URL on unmount or change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Cleanup consultation save timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(consultationSaveRef.current).forEach(clearTimeout);
    };
  }, []);

  // --- PDF Preview handler ---
  const handlePreviewPdf = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage.from('factures_pdf').download(filePath);
      if (error) throw error;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(data));
    } catch {
      showToast('Impossible de charger le PDF', 'error');
    }
  };

  // --- Consultation handlers ---
  const handleAddConsultation = async () => {
    if (!selectedPatient || selectedPatient.id === 'temp-new-patient') return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase.from('consultations').insert([{
      patient_id: selectedPatient.id,
      therapeute_id: session.user.id,
      date_consultation: new Date().toISOString().split('T')[0],
      notes: '',
    }]).select().single();

    if (error) {
      showToast('Erreur lors de la creation de la seance', 'error');
      return;
    }
    if (data) setConsultations(prev => [data, ...prev]);
  };

  const handleUpdateConsultationNotes = (consultationId: string, notes: string) => {
    setConsultations(prev => prev.map(c => c.id === consultationId ? { ...c, notes } : c));

    if (consultationSaveRef.current[consultationId]) {
      clearTimeout(consultationSaveRef.current[consultationId]);
    }
    consultationSaveRef.current[consultationId] = setTimeout(async () => {
      const { error } = await supabase.from('consultations').update({ notes }).eq('id', consultationId);
      if (error) showToast('Erreur de sauvegarde des notes', 'error');
    }, 1500);
  };

  const handleDeleteConsultation = async (id: string) => {
    const { error } = await supabase.from('consultations').delete().eq('id', id);
    if (error) {
      showToast('Erreur lors de la suppression', 'error');
      return;
    }
    setConsultations(prev => prev.filter(c => c.id !== id));
    setAttachments(prev => prev.filter(a => a.consultation_id !== id));
  };

  const getLinkedFactureIds = (c: Consultation): string[] => {
    if (!c.facture_id) return [];
    return c.facture_id.split(',').filter(Boolean);
  };

  const getAllLinkedFactureIds = (): Set<string> => {
    const ids = new Set<string>();
    consultations.forEach(c => getLinkedFactureIds(c).forEach(id => ids.add(id)));
    return ids;
  };

  const handleLinkFacture = async (consultationId: string, factureId: string) => {
    if (!factureId) return;
    const consultation = consultations.find(c => c.id === consultationId);
    const existingIds = consultation ? getLinkedFactureIds(consultation) : [];
    if (existingIds.includes(factureId)) return;
    const newIds = [...existingIds, factureId].join(',');
    const { error } = await supabase.from('consultations').update({ facture_id: newIds }).eq('id', consultationId);
    if (error) {
      showToast('Erreur lors de la liaison', 'error');
      return;
    }
    setConsultations(prev => prev.map(c => c.id === consultationId ? { ...c, facture_id: newIds } : c));
  };

  const handleUnlinkFacture = async (consultationId: string, factureId: string) => {
    const consultation = consultations.find(c => c.id === consultationId);
    if (!consultation) return;
    const remaining = getLinkedFactureIds(consultation).filter(id => id !== factureId);
    const newVal = remaining.length > 0 ? remaining.join(',') : null;
    const { error } = await supabase.from('consultations').update({ facture_id: newVal }).eq('id', consultationId);
    if (error) {
      showToast('Erreur', 'error');
      return;
    }
    setConsultations(prev => prev.map(c => c.id === consultationId ? { ...c, facture_id: newVal } : c));
  };

  // --- Attachment handlers ---
  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>, consultationId: string | null, patientId: string | null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const fileName = `${session.user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('attachments').upload(fileName, file);
    if (uploadError) {
      showToast('Erreur upload', 'error');
      return;
    }

    const { data } = await supabase.from('attachments').insert([{
      therapeute_id: session.user.id,
      consultation_id: consultationId,
      patient_id: patientId || selectedPatient?.id,
      file_path: fileName,
      file_name: file.name,
      file_size: file.size,
    }]).select().single();

    if (data) {
      if (consultationId) {
        setAttachments(prev => [...prev, data]);
      } else {
        setGeneralAttachments(prev => [...prev, data]);
      }
    }

    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handlePreviewAttachment = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage.from('attachments').download(attachment.file_path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      setPreviewUrl(url);
    } catch {
      showToast('Impossible de prévisualiser ce fichier', 'error');
    }
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    const { data, error } = await supabase.storage.from('attachments').download(attachment.file_path);
    if (error) {
      showToast('Erreur telechargement', 'error');
      return;
    }
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.file_name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAttachment = async (id: string) => {
    const attachment = [...attachments, ...generalAttachments].find(a => a.id === id);
    const { error } = await supabase.from('attachments').delete().eq('id', id);
    if (error) {
      showToast('Erreur lors de la suppression', 'error');
      return;
    }
    if (attachment) {
      await supabase.storage.from('attachments').remove([attachment.file_path]);
    }
    setAttachments(prev => prev.filter(a => a.id !== id));
    setGeneralAttachments(prev => prev.filter(a => a.id !== id));
  };

  // --- Civility handlers ---
  const handleCivilityChange = (newCivility: string) => {
    if (!selectedPatient) return;
    const currentName = extractName(selectedPatient.nom_complet);
    setSelectedPatient({ ...selectedPatient, nom_complet: `${newCivility} ${currentName}` });
  };

  const handleNameChange = (newName: string) => {
    if (!selectedPatient) return;
    const currentCivility = extractCivility(selectedPatient.nom_complet);
    setSelectedPatient({ ...selectedPatient, nom_complet: `${currentCivility} ${newName}` });
  };

  if (!selectedPatient) {
    return (
      <div className="lg:col-span-8 overflow-y-auto pb-20 custom-scrollbar bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <div className="p-8 bg-gray-50 border border-gray-100 rounded-full mb-6 shadow-sm">
            <FileText size={48} className="text-gray-300" />
          </div>
          <p className="font-bold text-xl text-gray-800 tracking-tight">Aucun dossier selectionne</p>
          <p className="text-sm opacity-60 mt-2 text-center">Cliquez sur un patient a gauche pour afficher ses notes et son historique.</p>
        </div>
      </div>
    );
  }

  const isDraft = selectedPatient.id === 'temp-new-patient';

  return (
    <div ref={scrollRef} className="lg:col-span-8 overflow-y-auto pb-20 custom-scrollbar bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-baseline gap-2 w-full">
                <select
                  className="text-2xl md:text-3xl font-black text-gray-500 bg-transparent border-b-2 border-transparent hover:border-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
                  value={extractCivility(selectedPatient.nom_complet)}
                  onChange={(e) => handleCivilityChange(e.target.value)}
                >
                  <option value="Mme">Mme</option>
                  <option value="M.">M.</option>
                  <option value="Enfant">Enfant</option>
                </select>
                <input
                  className="text-2xl md:text-3xl font-black text-gray-900 bg-transparent border-b-2 border-transparent hover:border-blue-100 focus:border-blue-600 outline-none w-full transition-all tracking-tight"
                  value={extractName(selectedPatient.nom_complet)}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nom et Prenom"
                  autoFocus={isDraft}
                />
              </div>

              <div className="flex items-center gap-2 ml-1">
                <span className={`${isDraft ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'} border text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest`}>
                  {isDraft ? 'Brouillon' : 'Dossier Actif'}
                </span>
                {!isDraft && (
                  <span className="text-[10px] text-gray-400 font-mono font-medium">ID: {selectedPatient.id.split('-')[0]}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 h-fit">
              <button onClick={onDelete} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100" title="Supprimer ce dossier">
                <Trash2 size={20} />
              </button>

              <button
                onClick={() => router.push(`/dashboard/facture/nouvelle?id=${selectedPatient.id}`)}
                disabled={isDraft}
                className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-100 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={isDraft ? "Enregistrez le patient d'abord" : "Facturer ce patient"}
              >
                <CreditCard size={18} /> Facturer
              </button>

              <button onClick={onSave} disabled={saving} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-black disabled:opacity-50 shadow-md text-sm font-bold transition-all">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isDraft ? 'Creer le patient' : 'Enregistrer'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-6 border-t border-gray-100">
            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1.5 block">Email du patient *</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-focus-within:bg-white border border-gray-100 group-focus-within:border-blue-300 group-focus-within:ring-2 group-focus-within:ring-blue-500/10 transition-all">
                  <Mail size={16} className="text-gray-400" />
                  <input type="email" required className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800" placeholder="Obligatoire pour l'envoi" value={selectedPatient.email} onChange={(e) => setSelectedPatient({ ...selectedPatient, email: e.target.value })} />
                </div>
              </div>
              <div className="group">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1.5 block">Telephone</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-focus-within:bg-white border border-gray-100 group-focus-within:border-blue-300 group-focus-within:ring-2 group-focus-within:ring-blue-500/10 transition-all">
                  <Phone size={16} className="text-gray-400" />
                  <input className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800" placeholder="Ex: 06 00 00 00 00" value={selectedPatient.telephone || ''} onChange={(e) => setSelectedPatient({ ...selectedPatient, telephone: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1.5 block">Adresse Postale</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-focus-within:bg-white border border-gray-100 group-focus-within:border-blue-300 group-focus-within:ring-2 group-focus-within:ring-blue-500/10 transition-all">
                  <MapPin size={16} className="text-gray-400" />
                  <input className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800" placeholder="Adresse complete" value={selectedPatient.adresse || ''} onChange={(e) => setSelectedPatient({ ...selectedPatient, adresse: e.target.value })} />
                </div>
              </div>
              <div className="group">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1.5 block">N. Securite Sociale</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-focus-within:bg-white border border-gray-100 group-focus-within:border-blue-300 group-focus-within:ring-2 group-focus-within:ring-blue-500/10 transition-all">
                  <Hash size={16} className="text-gray-400" />
                  <input className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800" placeholder="15 chiffres" value={selectedPatient.num_secu || ''} onChange={(e) => setSelectedPatient({ ...selectedPatient, num_secu: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OBSERVATIONS THERAPEUTIQUES */}
        <div className="bg-[#fcfaf8] p-6 rounded-2xl border border-[#f0e6de] relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><ClipboardList size={18} className="text-[#a9825a]" /> Observations Therapeutiques</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-opacity duration-300">
              {saving ? (
                <span className="text-blue-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Sauvegarde...</span>
              ) : (
                <span className="text-green-600 flex items-center gap-1 opacity-80"><CloudCheck size={14} /> {isDraft ? 'Non enregistre' : 'Enregistre'}</span>
              )}
            </div>
          </div>
          <textarea
            rows={12}
            className="w-full p-5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#a9825a]/30 focus:border-[#a9825a] text-gray-800 font-medium leading-relaxed transition-all placeholder:text-gray-300 shadow-sm"
            placeholder="Ecrivez ici le suivi medical du patient. La sauvegarde est automatique a chaque frappe..."
            value={selectedPatient.notes_consultation || ''}
            onChange={(e) => setSelectedPatient({ ...selectedPatient, notes_consultation: e.target.value })}
          />

          {/* General attachments (not linked to a consultation) */}
          {!isDraft && (
            <div className="mt-3 flex flex-wrap gap-2">
              {generalAttachments.map(a => (
                <div key={a.id} className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg text-xs">
                  <Paperclip size={12} className="text-gray-500" />
                  <button onClick={() => handlePreviewAttachment(a)} className="text-gray-700 font-medium truncate max-w-[120px] hover:text-blue-600 hover:underline cursor-pointer">{a.file_name}</button>
                  <button onClick={() => handleDownloadAttachment(a)} className="text-blue-500 hover:text-blue-700">
                    <Download size={12} />
                  </button>
                  <button onClick={() => handleDeleteAttachment(a.id)} className="text-red-400 hover:text-red-600">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-medium cursor-pointer hover:bg-blue-100 transition-colors">
                <Paperclip size={12} /> Joindre un fichier
                <input type="file" className="hidden" onChange={(e) => handleUploadAttachment(e, null, selectedPatient?.id || null)} />
              </label>
            </div>
          )}
        </div>

        {/* SEANCES (CONSULTATIONS) */}
        {!isDraft && (
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" /> Seances
              </h3>
              <button
                onClick={handleAddConsultation}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Nouvelle seance
              </button>
            </div>

            {consultations.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                <p className="text-gray-400 text-sm">Aucune seance enregistree.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {consultations.map(c => {
                  const isOpen = openConsultationId === c.id;
                  const consAttachments = attachments.filter(a => a.consultation_id === c.id);
                  const preview = c.notes ? c.notes.substring(0, 60) + (c.notes.length > 60 ? '...' : '') : 'Aucune note';

                  return (
                  <div key={c.id} className={`bg-white border rounded-2xl shadow-sm transition-all ${isOpen ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'}`}>
                    {/* Header — always visible, clickable */}
                    <button
                      onClick={() => setOpenConsultationId(isOpen ? null : c.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-wrap">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOpen ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <span className="text-base font-black text-gray-900">
                          {new Date(c.date_consultation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                        {c.facture_id && getLinkedFactureIds(c).map(fId => {
                          const f = historiqueFactures.find(fac => fac.id === fId);
                          return f ? (
                            <span key={fId} className="inline-flex items-center shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePreviewPdf(f.fichier_path); }}
                                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-l-full font-bold hover:bg-green-200 transition-colors cursor-pointer"
                                title="Prévisualiser"
                              >
                                {f.montant}€
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUnlinkFacture(c.id, fId); }}
                                className="text-xs bg-red-100 text-red-500 px-1.5 py-1 rounded-r-full hover:bg-red-200 transition-colors cursor-pointer"
                                title="Délier cette facture"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                        {consAttachments.length > 0 && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold shrink-0">{consAttachments.length} fichier{consAttachments.length > 1 ? 's' : ''}</span>
                        )}
                        {!isOpen && <span className="text-sm text-gray-400 truncate ml-2">{preview}</span>}
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 shrink-0 transition-transform ml-2 ${isOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
                    </button>

                    {/* Content — collapsible */}
                    {isOpen && (
                      <div className="px-4 pb-4 space-y-3">
                        {/* Editable date */}
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={c.date_consultation}
                            onChange={async (e) => {
                              const newDate = e.target.value;
                              setConsultations(prev => prev.map(con => con.id === c.id ? { ...con, date_consultation: newDate } : con));
                              const { error } = await supabase.from('consultations').update({ date_consultation: newDate }).eq('id', c.id);
                              if (error) showToast('Erreur de sauvegarde de la date', 'error');
                            }}
                            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer focus:border-blue-400 outline-none"
                          />
                          {historiqueFactures.length > 0 && (() => {
                            const allLinked = getAllLinkedFactureIds();
                            const available = historiqueFactures.filter(f => !allLinked.has(f.id));
                            if (available.length === 0) return null;
                            return (
                            <select
                              className="text-[10px] border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600"
                              value=""
                              onChange={(e) => handleLinkFacture(c.id, e.target.value)}
                            >
                              <option value="">+ Lier une facture</option>
                              {available.map(f => (
                                <option key={f.id} value={f.id}>
                                  {new Date(f.created_at).toLocaleDateString('fr-FR')} — {f.montant}€
                                </option>
                              ))}
                            </select>
                            );
                          })()}
                          <div className="flex-1" />
                          <button onClick={() => handleDeleteConsultation(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Notes */}
                        <textarea
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-none"
                          rows={4}
                          value={c.notes}
                          onChange={(e) => handleUpdateConsultationNotes(c.id, e.target.value)}
                          placeholder="Notes de la séance..."
                          autoFocus
                        />

                        {/* Attachments */}
                        <div className="flex flex-wrap gap-2">
                          {consAttachments.map(a => (
                            <div key={a.id} className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg text-xs">
                              <Paperclip size={12} className="text-gray-500" />
                              <button onClick={() => handlePreviewAttachment(a)} className="text-gray-700 font-medium truncate max-w-[120px] hover:text-blue-600 hover:underline cursor-pointer">{a.file_name}</button>
                              <button onClick={() => handleDownloadAttachment(a)} className="text-blue-500 hover:text-blue-700"><Download size={12} /></button>
                              <button onClick={() => handleDeleteAttachment(a.id)} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                            </div>
                          ))}
                          <label className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-medium cursor-pointer hover:bg-blue-100 transition-colors">
                            <Paperclip size={12} />
                        Ajouter
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleUploadAttachment(e, c.id, null)}
                        />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* HISTORIQUE DES FACTURES */}
        <div className="pt-4">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><History size={18} className="text-gray-400" /> Historique des factures et reglements</h3>
          <div className="space-y-3">
            {historiqueFactures.map(f => (
              <div key={f.id} className={`p-4 rounded-2xl border transition-all ${f.statut === 'Annulée' || f.statut === 'Annulee' ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-100 hover:border-blue-200 shadow-sm group'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-sm font-black text-gray-900 block mb-1">{new Date(f.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest ${f.statut === 'Annulée' || f.statut === 'Annulee' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {f.statut === 'Annulée' || f.statut === 'Annulee' ? 'Annulée' : 'Payée'}
                      </span>
                    </div>

                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-bold"><Euro size={12} /> {f.montant}</span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200 text-gray-600"><CreditCard size={12} /> {f.mode_reglement || 'Autre'}</span>

                      {f.note || f.commentaire ? (
                        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100">
                          <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} size={12} className={star <= (f.note || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                            ))}
                          </div>
                          {f.commentaire && <span className="text-[10px] text-gray-600 italic truncate max-w-[120px] ml-1">&quot;{f.commentaire}&quot;</span>}
                        </div>
                      ) : (
                        <span className="text-[10px] px-2 py-1 uppercase tracking-widest font-bold text-gray-300 italic">Sans avis</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {f.statut !== 'Annulée' && f.statut !== 'Annulee' && (
                      <button
                        onClick={() => setCancelModal({ factureId: f.id, montant: f.montant })}
                        className="p-2 bg-gray-50 border border-gray-200 text-red-500 rounded-lg hover:bg-red-50 transition-all"
                        title="Annuler cette facture"
                      >
                        <Ban size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handlePreviewPdf(f.fichier_path)}
                      className="p-2 bg-gray-50 border border-gray-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-all"
                      title="Apercu du PDF"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/facture/${f.id}`);
                        showToast("Lien copie !");
                      }}
                      className="p-2 bg-gray-50 border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                      title="Copier le lien de la facture"
                    >
                      <Copy size={16} />
                    </button>
                    <button onClick={() => onDownloadPdf(f.fichier_path, selectedPatient.nom_complet)} className="p-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-all" title="Telecharger le PDF">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {historiqueFactures.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                <p className="text-gray-400 text-sm font-medium italic">Aucune facture enregistree pour ce patient.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-24" />
      </div>

      {/* CANCEL INVOICE MODAL */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 p-2 rounded-lg"><Ban className="text-red-600" size={24} /></div>
              <h3 className="text-lg font-bold text-gray-900">Annuler la facture ?</h3>
            </div>
            <p className="text-sm text-gray-600">
              Voulez-vous vraiment annuler la facture de <strong>{cancelModal.montant}€</strong> ? Cette action retirera le montant du chiffre d&apos;affaires.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCancelModal(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Retour
              </button>
              <button
                onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  const { error } = await supabase.from('factures').update({ statut: 'Annulée' }).eq('id', cancelModal.factureId).eq('therapeute_id', session?.user?.id);
                  if (!error) {
                    showToast('Facture annulée');
                    onRefreshHistorique?.();
                  } else {
                    showToast('Erreur lors de l\'annulation', 'error');
                  }
                  setCancelModal(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF PREVIEW OVERLAY */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Apercu de la facture</h3>
              <button
                onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-2">
              <iframe src={previewUrl} className="w-full h-full rounded-lg" title="Apercu PDF" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
