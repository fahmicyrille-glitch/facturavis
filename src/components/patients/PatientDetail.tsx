'use client';

import {
  Save, Loader2, Mail, Phone, MapPin, Hash, Trash2,
  Download, CreditCard, Star, Copy, History,
  CloudCheck, ClipboardList, Euro, FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Patient, FactureHistorique } from '@/lib/types';

interface PatientDetailProps {
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient) => void;
  saving: boolean;
  onSave: () => void;
  onDelete: () => void;
  historiqueFactures: FactureHistorique[];
  onDownloadPdf: (path: string, nom: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
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
}: PatientDetailProps) {
  const router = useRouter();

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
    <div className="lg:col-span-8 overflow-y-auto pb-20 custom-scrollbar bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
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
        </div>

        <div className="pt-4">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><History size={18} className="text-gray-400" /> Historique des factures et reglements</h3>
          <div className="space-y-3">
            {historiqueFactures.map(f => (
              <div key={f.id} className={`p-4 rounded-2xl border transition-all ${f.statut === 'Annulee' ? 'bg-red-50/30 border-red-100 opacity-60' : 'bg-white border-gray-100 hover:border-blue-200 shadow-sm group'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-sm font-black text-gray-900 block mb-1">{new Date(f.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest ${f.statut === 'Annulee' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {f.statut === 'Annulee' ? 'Annulee' : 'Payee'}
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
      </div>
    </div>
  );
}
