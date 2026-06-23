'use client';

import { RefObject } from 'react';
import { UploadCloud, MapPin, Loader2, Euro, PlusCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Cabinet } from '@/lib/types';

interface PatientMin {
  id: string;
  nom_complet: string;
  email: string;
}

interface UploadFormProps {
  cabinets: Cabinet[];
  selectedCabinetId: string;
  setSelectedCabinetId: (id: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  civilite: string;
  setCivilite: (v: string) => void;
  nom: string;
  setNom: (v: string) => void;
  prenom: string;
  setPrenom: (v: string) => void;
  patientEmail: string;
  setPatientEmail: (v: string) => void;
  montant: string;
  setMontant: (v: string) => void;
  modeReglement: string;
  setModeReglement: (v: string) => void;
  loading: boolean;
  handleUpload: (e: React.FormEvent) => void;
  filteredPatients: PatientMin[];
  selectPatient: (p: PatientMin) => void;
  showDropdown: boolean;
  setShowDropdown: (v: boolean) => void;
  showDropdownPrenom: boolean;
  setShowDropdownPrenom: (v: boolean) => void;
}

export default function UploadForm({
  cabinets,
  selectedCabinetId,
  setSelectedCabinetId,
  file,
  setFile,
  fileInputRef,
  civilite,
  setCivilite,
  nom,
  setNom,
  prenom,
  setPrenom,
  patientEmail,
  setPatientEmail,
  montant,
  setMontant,
  modeReglement,
  setModeReglement,
  loading,
  handleUpload,
  filteredPatients,
  selectPatient,
  showDropdown,
  setShowDropdown,
  showDropdownPrenom,
  setShowDropdownPrenom,
}: UploadFormProps) {
  return (
    <div className="space-y-6">
      {/* BLOC BLEU GENERER & ENVOYER */}
      <div className="bg-[#1b64f2] rounded-2xl shadow-md p-6 text-white overflow-hidden relative group">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">G&eacute;n&eacute;rer &amp; Envoyer</h2>
          <p className="text-blue-100 text-sm mb-6">Cr&eacute;ez une facture pro en 3 clics et r&eacute;coltez un avis Google automatiquement.</p>
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

      {/* FORMULAIRE UPLOAD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
        <div className="flex items-center gap-2 mb-6 text-gray-800">
          <UploadCloud size={20} className="text-gray-400" />
          <h2 className="text-lg font-semibold">Uploader une facture PDF</h2>
        </div>

        <form onSubmit={handleUpload} className="space-y-5 relative z-10">
          {/* Lieux de consultation */}
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

          {/* Zone de drop */}
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
                <label className="block text-xs font-bold text-gray-900 mb-1.5">Civilit&eacute;</label>
                <select className="w-full border border-black text-black rounded-md py-2.5 px-2 text-sm bg-white focus:outline-none focus:border-blue-500" value={civilite} onChange={(e) => setCivilite(e.target.value)}>
                  <option value="Mme">Mme</option>
                  <option value="M.">M.</option>
                </select>
              </div>
              <div className="relative col-span-8">
                <label className="block text-xs font-bold text-gray-900 mb-1.5">Pr&eacute;nom</label>
                <input
                  type="text"
                  className="w-full border border-black text-black rounded-md py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
                  value={prenom}
                  onChange={(e) => {setPrenom(e.target.value); setShowDropdownPrenom(true);}}
                  onFocus={() => setShowDropdownPrenom(true)}
                  onBlur={() => setTimeout(() => setShowDropdownPrenom(false), 200)}
                  placeholder="Ex: Jean"
                />
                {showDropdownPrenom && prenom.length > 0 && filteredPatients.length > 0 && (
                  <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                    {filteredPatients.map(p => (
                      <li key={p.id} onClick={() => selectPatient(p)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-black flex justify-between items-center border-b border-gray-50 last:border-none">
                        <span className="font-bold">{p.nom_complet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-gray-900 mb-1.5">Nom (ou Nom Pr&eacute;nom) *</label>
              <input
                type="text" required
                className="w-full border border-black text-black rounded-md py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
                value={nom}
                onChange={(e) => {setNom(e.target.value); setShowDropdown(true);}}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Ex: Dupont"
              />
              {showDropdown && nom.length > 0 && filteredPatients.length > 0 && (
                <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {filteredPatients.map(p => (
                    <li key={p.id} onClick={() => selectPatient(p)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-black flex flex-col border-b border-gray-50 last:border-none">
                      <span className="font-bold">{p.nom_complet}</span>
                      <span className="text-[10px] text-gray-600">{p.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">Email du patient *</label>
              <input
                type="email" required
                className="w-full border border-black text-black rounded-md py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
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
                <input type="number" step="0.01" min="0" required className="w-full border border-black text-black rounded-md py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500" value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="0.00" />
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-900 mb-1.5">R&egrave;glement *</label>
                <select className="w-full border border-black text-black rounded-md py-2.5 px-3 text-sm bg-white focus:outline-none focus:border-blue-500" value={modeReglement} onChange={(e) => setModeReglement(e.target.value)}>
                  <option value="CB">CB</option>
                  <option value="Espèces">Esp&egrave;ces</option>
                  <option value="Chèque">Ch&egrave;que</option>
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
  );
}
