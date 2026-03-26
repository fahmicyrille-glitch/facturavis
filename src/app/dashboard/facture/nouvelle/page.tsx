'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Loader2, FileText, User, Euro, Send,
  MapPin, CheckCircle, X, Shield, Building, CreditCard
} from 'lucide-react';
import Link from 'next/link';

interface Patient {
  id: string;
  nom_complet: string;
  email: string;
  adresse?: string;
  num_secu?: string;
}

interface Prestation {
  id: string;
  nom: string;
  prix: number;
}

interface Cabinet {
  id: string;
  nom: string;
}

function NouvelleFactureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const idParam = searchParams.get('id'); // NOUVEAU : On récupère l'ID

  // Détermination dynamique du lien de retour
  const backLink = (idParam || emailParam) ? "/dashboard/patients" : "/dashboard";

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [patientsDb, setPatientsDb] = useState<Patient[]>([]);
  const [prestationsDb, setPrestationsDb] = useState<Prestation[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [selectedCabinetId, setSelectedCabinetId] = useState<string>('');

  const [patientNom, setPatientNom] = useState('');
  const [patientPrenom, setPatientPrenom] = useState('');
  const [patientCivilite, setPatientCivilite] = useState('Mme');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAdresse, setPatientAdresse] = useState('');
  const [patientSecu, setPatientSecu] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdownPrenom, setShowDropdownPrenom] = useState(false);

  const [selectedPrestaId, setSelectedPrestaId] = useState<string>('');
  const [customPrestaNom, setCustomPrestaNom] = useState('');
  const [customPrestaPrix, setCustomPrestaPrix] = useState('');
  const [modeReglement, setModeReglement] = useState('CB');

  const filteredPatients = patientsDb.filter(p => {
    if (!patientNom && !patientPrenom) return false;
    const matchNom = patientNom ? p.nom_complet.toLowerCase().includes(patientNom.toLowerCase()) : true;
    const matchPrenom = patientPrenom ? p.nom_complet.toLowerCase().includes(patientPrenom.toLowerCase()) : true;
    return matchNom && matchPrenom;
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      const uid = session.user.id;
      setUserId(uid);
      setUserEmail(session.user.email ?? null);

      // Charger Patients avec gestion d'erreur
      const { data: patients, error: patError } = await supabase.from('patients').select('*').eq('therapeute_id', uid).order('nom_complet', { ascending: true });
      if (patError) console.error("Erreur chargement patients:", patError);

      if (patients) {
        setPatientsDb(patients);

        // MODIFICATION ICI : On cherche d'abord par ID, sinon par email (pour la rétrocompatibilité)
        let found = null;
        if (idParam) {
          found = patients.find(p => p.id === idParam);
        } else if (emailParam) {
          found = patients.find(p => p.email === emailParam);
        }

        if (found) {
          setPatientNom(found.nom_complet);
          setPatientEmail(found.email);
          setPatientAdresse(found.adresse || '');
          setPatientSecu(found.num_secu || '');
        }
      }

      // Charger Prestations
      const { data: prestations, error: prestError } = await supabase.from('prestations').select('*').eq('user_id', uid).order('created_at', { ascending: true });
      if (prestError) console.error("Erreur chargement prestations:", prestError);
      if (prestations) setPrestationsDb(prestations);

      // Charger Cabinets
      const { data: cabs, error: cabError } = await supabase.from('cabinets').select('id, nom').eq('therapeute_id', uid);
      if (cabError) console.error("Erreur chargement cabinets:", cabError);
      if (cabs) {
        setCabinets(cabs);
        if (cabs.length > 0) setSelectedCabinetId(cabs[0].id);
      }

      setLoading(false);
    };
    fetchData();
  }, [router, emailParam, idParam]);

  const selectPatient = (patient: Patient) => {
    setPatientNom(patient.nom_complet);
    setPatientEmail(patient.email || '');
    setPatientAdresse(patient.adresse || '');
    setPatientSecu(patient.num_secu || '');
    setPatientPrenom('');
    setShowDropdown(false);
    setShowDropdownPrenom(false);
  };

  const handlePrestaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPrestaId(val);
    if (val !== '') {
      const presta = prestationsDb.find(p => p.id === val);
      if (presta) {
        setCustomPrestaNom(presta.nom);
        setCustomPrestaPrix(presta.prix.toString());
      }
    } else {
      setCustomPrestaNom('');
      setCustomPrestaPrix('');
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setMessage({ text: '', type: '' });

    try {
      const cleanEmail = patientEmail.trim().toLowerCase();
      const cleanNom = patientNom.trim();
      const cleanPrenom = patientPrenom.trim();

      const prenomFormatte = cleanPrenom ? ` ${cleanPrenom}` : '';

      const nomCompletFinal = cleanNom.includes(cleanPrenom) && cleanPrenom !== ''
        ? cleanNom
        : `${patientCivilite} ${cleanNom.toUpperCase()}${prenomFormatte}`.trim();

      const existingPatient = patientsDb.find(p =>
        p.email.toLowerCase() === cleanEmail &&
        p.nom_complet.toLowerCase() === nomCompletFinal.toLowerCase()
      );

      if (!existingPatient && userId) {
        const { data: newPat, error: patError } = await supabase.from('patients').insert([{
          therapeute_id: userId,
          nom_complet: nomCompletFinal,
          email: cleanEmail,
          adresse: patientAdresse.trim(),
          num_secu: patientSecu.trim(),
          notes_consultation: ""
        }]).select().single();

        if (patError) console.error("Erreur de création de fiche patient :", patError);
        if (newPat) setPatientsDb([...patientsDb, newPat]);
      }

      const { count } = await supabase.from('factures').select('*', { count: 'exact', head: true }).eq('therapeute_id', userId);
      const nextSeq = (count || 0) + 1 + 100;
      const date = new Date();
      const numFactureSeq = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${nextSeq}`;

      const { data: profile } = await supabase.from('therapeutes').select('*').eq('id', userId).single();
      const currentCabinet = cabinets.find(c => c.id === selectedCabinetId);

      const montantFinal = parseFloat(customPrestaPrix.replace(',', '.')) || 0;

      const payloadPdf = {
        patientNom: nomCompletFinal,
        patientAdresse: patientAdresse.trim(),
        patientSecu: patientSecu.trim(),
        email: cleanEmail,
        acte: customPrestaNom.trim(),
        prix: montantFinal,
        modeReglement,
        numFacture: numFactureSeq,
        nomTherapeute: profile?.nom,
        titreTherapeute: profile?.titre,
        telephone: profile?.telephone,
        emailTherapeute: userEmail,
        adresseCabinet: profile?.adresse_cabinet,
        siret: profile?.siret,
        codeApe: profile?.code_ape,
        adeli: profile?.adeli,
        siteWeb: profile?.site_web,
        logoUrl: profile?.logo_url,
        signatureUrl: profile?.signature_url
      };

      const pdfResponse = await fetch('/api/factures/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadPdf),
      });

      const pdfData = await pdfResponse.json();
      if (!pdfData.success) throw new Error("Échec génération PDF");

      const base64Res = await fetch(pdfData.pdfDataUri);
      const blob = await base64Res.blob();
      const fileName = `${Date.now()}-${numFactureSeq}.pdf`;
      const filePath = `${userId}/${fileName}`;

      await supabase.storage.from('factures_pdf').upload(filePath, blob, { contentType: 'application/pdf' });

      const { data: dbData } = await supabase.from('factures').insert([{
        therapeute_id: userId,
        cabinet_id: selectedCabinetId,
        patient_nom: nomCompletFinal,
        patient_email: cleanEmail,
        fichier_path: filePath,
        statut_email: 'Envoyé',
        montant: montantFinal,
        mode_reglement: modeReglement,
        statut: 'Payée'
      }]).select().single();

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          nomPatient: nomCompletFinal,
          lienFacture: `${window.location.origin}/facture/${dbData.id}`,
          nomTherapeute: profile?.nom,
          titreTherapeute: profile?.titre,
          telephoneTherapeute: profile?.telephone,
          emailTherapeute: userEmail,
          logoUrlTherapeute: profile?.logo_url,
          cabinetNom: currentCabinet?.nom
        }),
      });

      setMessage({ text: `Facture n°${numFactureSeq} envoyée avec succès !`, type: 'success' });

      setTimeout(() => router.push(backLink), 2000);

    } catch (error: any) {
      console.error(error);
      setMessage({ text: "Une erreur est survenue lors de l'envoi.", type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const isFormValid = patientNom.trim() !== '' &&
                      patientEmail.trim() !== '' &&
                      customPrestaNom.trim() !== '' &&
                      customPrestaPrix.trim() !== '' &&
                      cabinets.length > 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6 pb-20">

        <div className="flex items-center mb-8">
          <Link href={backLink} className="mr-4 p-2.5 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-all group">
            <ArrowLeft size={20} className="text-gray-600 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Nouvelle Facture</h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Émission d'un reçu d'honoraires</p>
          </div>
        </div>

        <form onSubmit={handleGenerateInvoice} className="space-y-6">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-sm font-bold text-gray-800 mb-5 flex items-center uppercase tracking-wider">
              <Building size={16} className="mr-2 text-blue-500" /> Lieu de consultation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cabinets.map((cab) => (
                <label key={cab.id} className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition-all ${selectedCabinetId === cab.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" className="hidden" name="cabinet" checked={selectedCabinetId === cab.id} onChange={() => setSelectedCabinetId(cab.id)} />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${selectedCabinetId === cab.id ? 'border-blue-500' : 'border-gray-300'}`}>
                      {selectedCabinetId === cab.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <span className={`text-sm font-bold ${selectedCabinetId === cab.id ? 'text-blue-700' : 'text-gray-700'}`}>{cab.nom}</span>
                </label>
              ))}
              {cabinets.length === 0 && (
                <p className="text-sm text-red-500 font-medium col-span-full">Veuillez configurer un cabinet dans vos paramètres pour facturer.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 relative">
            <h2 className="text-sm font-bold text-gray-800 mb-5 flex items-center uppercase tracking-wider">
              <User size={16} className="mr-2 text-blue-500" /> Informations Patient
            </h2>
            <div className="space-y-5">

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Civilité</label>
                  <select className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={patientCivilite} onChange={(e) => setPatientCivilite(e.target.value)}>
                    <option value="Mme">Mme</option>
                    <option value="M.">M.</option>
                  </select>
                </div>

                <div className="col-span-8 relative">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Prénom</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    value={patientPrenom}
                    onChange={(e) => {setPatientPrenom(e.target.value); setShowDropdownPrenom(true);}}
                    onFocus={() => setShowDropdownPrenom(true)}
                    onBlur={() => setTimeout(() => setShowDropdownPrenom(false), 200)}
                    placeholder="Ex: Jean"
                  />
                  {showDropdownPrenom && patientPrenom.length > 0 && filteredPatients.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                      {filteredPatients.map(p => (
                        <li key={p.id} onClick={() => selectPatient(p)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 flex justify-between items-center border-b border-gray-50 last:border-none">
                          <span className="font-bold">{p.nom_complet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Nom (ou Nom Prénom) *</label>
                <input
                  type="text" required
                  className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  value={patientNom}
                  onChange={(e) => {setPatientNom(e.target.value); setShowDropdown(true);}}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Ex: Dupont"
                />
                {showDropdown && patientNom.length > 0 && filteredPatients.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto py-1">
                    {filteredPatients.map(p => (
                      <li key={p.id} onClick={() => selectPatient(p)} className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none">
                        <p className="text-sm font-bold text-gray-900">{p.nom_complet}</p>
                        <p className="text-[10px] text-gray-500">{p.email}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Email de réception *</label>
                  <input type="email" required className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="patient@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 flex items-center"><Shield size={12} className="mr-1.5 text-gray-400" /> N° Sécurité Sociale</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" placeholder="Optionnel" value={patientSecu} onChange={(e) => setPatientSecu(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Adresse Postale</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" placeholder="Rue, Code Postal, Ville" value={patientAdresse} onChange={(e) => setPatientAdresse(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-sm font-bold text-gray-800 mb-5 flex items-center uppercase tracking-wider">
              <FileText size={16} className="mr-2 text-blue-500" /> Détails de la séance
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Acte réalisé *</label>
                <select className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all mb-3 appearance-none cursor-pointer bg-white" value={selectedPrestaId} onChange={handlePrestaChange}>
                  <option value="">-- Sélectionner un acte --</option>
                  {prestationsDb.map(p => <option key={p.id} value={p.id}>{p.nom} ({p.prix}€)</option>)}
                </select>
                <div className="flex gap-3">
                  <input type="text" required className="flex-[3] border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" value={customPrestaNom} onChange={(e) => setCustomPrestaNom(e.target.value)} placeholder="Intitulé de l'acte" />
                  <div className="relative flex-[1] min-w-[120px]">
                    <Euro size={14} className="absolute left-3 top-3 text-gray-500" />
                    <input type="number" step="0.01" required className="w-full border border-gray-300 rounded-lg py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" value={customPrestaPrix} onChange={(e) => setCustomPrestaPrix(e.target.value)} placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Mode de règlement</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['CB', 'Espèces', 'Chèque', 'Virement'].map((mode) => (
                    <label key={mode} className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer transition-all text-xs font-bold ${modeReglement === mode ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                      <input type="radio" className="hidden" name="mode_reglement" value={mode} checked={modeReglement === mode} onChange={(e) => setModeReglement(e.target.value)} />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl flex items-center shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.type === 'success' ? <CheckCircle size={18} className="mr-2 shrink-0" /> : <X size={18} className="mr-2 shrink-0" />}
              <span className="font-semibold text-sm">{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={generating || !isFormValid}
            className="w-full py-4 rounded-xl shadow-sm text-sm font-bold text-white bg-[#7ab4f5] hover:bg-blue-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all mt-4 flex items-center justify-center gap-2"
          >
            {generating ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Émettre la facture & Avis</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NouvelleFacture() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    }>
      <NouvelleFactureContent />
    </Suspense>
  );
}
