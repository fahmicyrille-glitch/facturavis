'use client';

import {
  Save, Loader2, CheckCircle, Trash2, X,
  Building, ShieldCheck
} from 'lucide-react';
import Image from 'next/image';

interface ProfileFormProps {
  nom: string;
  setNom: (v: string) => void;
  titre: string;
  setTitre: (v: string) => void;
  telephone: string;
  setTelephone: (v: string) => void;
  adresseCabinet: string;
  setAdresseCabinet: (v: string) => void;
  siret: string;
  setSiret: (v: string) => void;
  codeApe: string;
  setCodeApe: (v: string) => void;
  adeli: string;
  setAdeli: (v: string) => void;
  siteWeb: string;
  setSiteWeb: (v: string) => void;
  logoUrl: string;
  signatureUrl: string;
  uploadingLogo: boolean;
  uploadingSig: boolean;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteLogo: () => void;
  onSignatureUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteSignature: () => void;
  saving: boolean;
  onSave: (e: React.FormEvent) => void;
  message: { text: string; type: string };
}

export default function ProfileForm({
  nom, setNom,
  titre, setTitre,
  telephone, setTelephone,
  adresseCabinet, setAdresseCabinet,
  siret, setSiret,
  codeApe, setCodeApe,
  adeli, setAdeli,
  siteWeb, setSiteWeb,
  logoUrl, signatureUrl,
  uploadingLogo, uploadingSig,
  onLogoUpload, onDeleteLogo,
  onSignatureUpload, onDeleteSignature,
  saving, onSave,
  message,
}: ProfileFormProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center mb-6 border-b pb-4">
        <Building size={22} className="text-gray-800 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Profil & Infos Legales (Facturation)</h2>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {/* GRILLE LOGO + SIGNATURE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LOGO */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Logo du cabinet</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                {uploadingLogo ? (
                  <Loader2 className="animate-spin text-blue-500" />
                ) : logoUrl ? (
                  <Image src={logoUrl} alt="Logo" width={96} height={96} className="w-full h-full object-contain p-2" unoptimized />
                ) : (
                  <span className="text-[10px] text-gray-400">Aucun logo</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition text-center">
                  Changer
                  <input type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
                </label>
                {logoUrl && (
                  <button type="button" onClick={onDeleteLogo} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center justify-center gap-1 transition">
                    <Trash2 size={12} /> Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SIGNATURE */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Signature / Tampon (Image)</label>
            <div className="flex items-center gap-4">
              <div className="w-40 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                {uploadingSig ? (
                  <Loader2 className="animate-spin text-blue-500" />
                ) : signatureUrl ? (
                  <Image src={signatureUrl} alt="Signature" width={160} height={96} className="w-full h-full object-contain p-1" unoptimized />
                ) : (
                  <span className="text-[10px] text-gray-400 text-center px-2">Image sur fond blanc de preference</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition text-center">
                  Charger
                  <input type="file" accept="image/*" className="hidden" onChange={onSignatureUpload} />
                </label>
                {signatureUrl && (
                  <button type="button" onClick={onDeleteSignature} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center justify-center gap-1 transition">
                    <Trash2 size={12} /> Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet (apparait sur la facture) *</label>
            <input type="text" required className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre / Profession (ex: Osteopathe D.O.) *</label>
            <input type="text" required className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={titre} onChange={(e) => setTitre(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Adresse de facturation (Cabinet principal) * <ShieldCheck size={14} className="ml-2 text-green-500" />
            </label>
            <input type="text" required placeholder="Ex: 104 Grande Rue, 92310 Sevres" className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={adresseCabinet} onChange={(e) => setAdresseCabinet(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Numero SIRET * <ShieldCheck size={14} className="ml-2 text-green-500" />
            </label>
            <input type="text" required maxLength={18} placeholder="14 chiffres" className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={siret} onChange={(e) => setSiret(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code APE</label>
            <input type="text" placeholder="Ex: 8690E" className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20 uppercase" value={codeApe} onChange={(e) => setCodeApe(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telephone *</label>
            <input type="text" required className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numero ADELI / RPPS</label>
            <input type="text" className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={adeli} onChange={(e) => setAdeli(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Web (Optionnel)</label>
            <input type="url" placeholder="https://..." className="w-full border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={siteWeb} onChange={(e) => setSiteWeb(e.target.value)} />
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle size={20} className="mr-2 flex-shrink-0" /> : <X size={20} className="mr-2 flex-shrink-0" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <button type="submit" disabled={saving} className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-blue-600 font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all items-center shadow-md">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
          Enregistrer mes informations
        </button>
      </form>
    </div>
  );
}
