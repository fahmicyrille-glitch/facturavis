'use client';

import { useState, useEffect } from 'react';
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

export default function NouvelleFacture() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  // Détermination dynamique du lien de retour
  const backLink = emailParam ? "/dashboard/patients" : "/dashboard";

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
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAdresse, setPatientAdresse] = useState('');
  const [patientSecu, setPatientSecu] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedPrestaId, setSelectedPrestaId] = useState<string>('');
  const [customPrestaNom, setCustomPrestaNom] = useState('');
  const [customPrestaPrix, setCustomPrestaPrix] = useState('');
  const [modeReglement, setModeReglement] = useState('CB');

  const filteredPatients = patientsDb.filter(p =>
    p.nom_complet.toLowerCase().includes(patientNom.toLowerCase())
  );

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

      // Charger Patients
      const { data: patients } = await supabase.from('patients').select('*').eq('therapeute_id', uid).order('nom_complet', { ascending: true });
      if (patients) {
        setPatientsDb(patients);
        // Pré-remplissage si email en URL
        if (emailParam) {
          const found = patients.find(p => p.email === emailParam);
          if (found) {
            setPatientNom(found.nom_complet);
            setPatientEmail(found.email);
            setPatientAdresse(found.adresse || '');
            setPatientSecu(found.num_secu || '');
          }
        }
      }

      const { data: prestations } = await supabase.from('prestations').select('*').eq('user_id', uid).order('created_at', { ascending: true });
      if (prestations) setPrestationsDb(prestations);

      const { data: cabs } = await supabase.from('cabinets').select('id, nom').eq('therapeute_id', uid);
      if (cabs) {
        setCabinets(cabs);
        if (cabs.length > 0) setSelectedCabinetId(cabs[0].id);
      }

      setLoading(false);
    };
    fetchData();
  }, [router, emailParam]);

  const selectPatient = (patient: Patient) => {
    setPatientNom(patient.nom_complet);
    setPatientEmail(patient.email || '');
    setPatientAdresse(patient.adresse || '');
    setPatientSecu(patient.num_secu || '');
    setShowDropdown(false);
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
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setMessage({ text: '', type: '' });

    try {
      // --- NOUVEAU BLOC : Création de fiche patient auto si inexistant ---
      const existingPatient = patientsDb.find(p =>
        p.email.toLowerCase() === patientEmail.toLowerCase() &&
        p.nom_complet.toLowerCase() === patientNom.toLowerCase()
      );

      if (!existingPatient && userId) {
        const { data: newPat, error: patError } = await supabase.from('patients').insert([{
          therapeute_id: userId,
          nom_complet: patientNom,
          email: patientEmail,
          adresse: patientAdresse,
          num_secu: patientSecu,
          notes_consultation: "" // Sécurité pour éviter le bug de colonne
        }]).select().single();

        if (patError) console.error("Erreur de création de fiche patient :", patError);
        if (newPat) setPatientsDb([...patientsDb, newPat]);
      }
      // -------------------------------------------------------------------

      // 1. Calcul numéro de facture
      const { count } = await supabase.from('factures').select('*', { count: 'exact', head: true }).eq('therapeute_id', userId);
      const nextSeq = (count || 0) + 1 + 100;
      const date = new Date();
      const numFactureSeq = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${nextSeq}`;

      // 2. Infos Profil
      const { data: profile } = await supabase.from('therapeutes').select('*').eq('id', userId).single();
      const currentCabinet = cabinets.find(c => c.id === selectedCabinetId);
      const montantFinal = parseFloat(customPrestaPrix.replace(',', '.'));

      // 3. API Génération PDF
      const payloadPdf = {
        patientNom, patientAdresse, patientSecu, email: patientEmail,
        acte: customPrestaNom, prix: montantFinal, modeReglement, numFacture: numFactureSeq,
        nomTherapeute: profile?.nom, titreTherapeute: profile?.titre, telephone: profile?.telephone, emailTherapeute: userEmail,
        adresseCabinet: profile?.adresse_cabinet, siret: profile?.siret, codeApe: profile?.code_ape, adeli: profile?.adeli, siteWeb: profile?.site_web,
        logoUrl: profile?.logo_url, signatureUrl: profile?.signature_url
      };

      const pdfResponse = await fetch('/api/factures/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadPdf),
      });
      const pdfData = await pdfResponse.json();
      if (!pdfData.success) throw new Error("Échec génération PDF");

      // 4. Stockage Supabase
      const base64Res = await fetch(pdfData.pdfDataUri);
      const blob = await base64Res.blob();
      const fileName = `${Date.now()}-${numFactureSeq}.pdf`;
      const filePath = `${userId}/${fileName}`;

      await supabase.storage.from('factures_pdf').upload(filePath, blob, { contentType: 'application/pdf' });

      // 5. Insert BDD
      const { data: dbData } = await supabase.from('factures').insert([{
        therapeute_id: userId,
        cabinet_id: selectedCabinetId,
        patient_nom: patientNom,
        patient_email: patientEmail,
        fichier_path: filePath,
        statut_email: 'Envoyé',
        montant: montantFinal,
        mode_reglement: modeReglement,
        statut: 'Payée'
      }]).select().single();

      // 6. Envoi Email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: patientEmail, nomPatient: patientNom, lienFacture: `${window.location.origin}/facture/${dbData.id}`,
          nomTherapeute: profile?.nom, titreTherapeute: profile?.titre, telephoneTherapeute: profile?.telephone,
          emailTherapeute: userEmail, logoUrlTherapeute: profile?.logo_url, cabinetNom: currentCabinet?.nom
        }),
      });

      setMessage({ text: `Facture n°${numFactureSeq} envoyée avec succès !`, type: 'success' });

      // Redirection automatique après succès
      setTimeout(() => router.push(backLink), 2000);

    } catch (error: any) {
      console.error(error);
      setMessage({ text: "Une erreur est survenue lors de l'envoi.", type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6 pb-20">

        {/* Navigation / Header */}
        <div className="flex items-center mb-8">
          <Link href={backLink} className="mr-4 p-2.5 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-all group">
            <ArrowLeft size={20} className="text-gray-600 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Nouvelle Facture</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Émission d'un reçu professionnel</p>
          </div>
        </div>

        <form onSubmit={handleGenerateInvoice} className="space-y-6">

          {/* Section Cabinet */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-sm font-black text-gray-900 mb-6 flex items-center uppercase tracking-widest">
              <Building size={18} className="mr-3 text-blue-600" /> Lieu de consultation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cabinets.map((cab) => (
                <label key={cab.id} className={`flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedCabinetId === cab.id ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-md' : 'border-gray-100 hover:border-blue-200 text-gray-500 bg-gray-50/30'}`}>
                  <input type="radio" className="hidden" name="cabinet" checked={selectedCabinetId === cab.id} onChange={() => setSelectedCabinetId(cab.id)} />
                  <span className="text-sm font-black uppercase tracking-tight">{cab.nom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section Patient */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8 relative">
            <h2 className="text-sm font-black text-gray-900 mb-6 flex items-center uppercase tracking-widest">
              <User size={18} className="mr-3 text-blue-600" /> Informations Patient
            </h2>
            <div className="space-y-5">
              <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 block">Nom complet *</label>
                <input
                  type="text" required
                  className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={patientNom}
                  onChange={(e) => {setPatientNom(e.target.value); setShowDropdown(true);}}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                {showDropdown && patientNom.length > 0 && filteredPatients.length > 0 && (
                  <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-auto py-2 animate-in fade-in zoom-in-95 duration-200">
                    {filteredPatients.map(p => (
                      <li key={p.id} onClick={() => selectPatient(p)} className="px-5 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none">
                        <p className="text-sm font-black text-gray-900">{p.nom_complet}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{p.email}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 block">Email de réception *</label>
                  <input type="email" required className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 block flex items-center"><Shield size={12} className="mr-1.5 text-gray-300" /> N° de Sécurité Sociale</label>
                  <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Optionnel" value={patientSecu} onChange={(e) => setPatientSecu(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 block">Adresse Postale</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-4 text-gray-300" />
                  <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-4 pl-12 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Rue, Code Postal, Ville" value={patientAdresse} onChange={(e) => setPatientAdresse(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Section Séance */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-sm font-black text-gray-900 mb-6 flex items-center uppercase tracking-widest">
              <FileText size={18} className="mr-3 text-blue-600" /> Détails de la séance
            </h2>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 block">Acte réalisé</label>
                <select className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-black focus:ring-2 focus:ring-blue-500/20 outline-none mb-4 appearance-none cursor-pointer" value={selectedPrestaId} onChange={handlePrestaChange}>
                  <option value="">-- Sélectionner un acte --</option>
                  {prestationsDb.map(p => <option key={p.id} value={p.id}>{p.nom} ({p.prix}€)</option>)}
                </select>
                <div className="flex gap-4">
                  <input type="text" required className="flex-[3] bg-gray-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" value={customPrestaNom} onChange={(e) => setCustomPrestaNom(e.target.value)} placeholder="Intitulé de l'acte" />
                  <div className="relative flex-[1] min-w-[120px]">
                    <Euro size={16} className="absolute right-4 top-4 text-gray-300" />
                    <input type="number" step="0.01" required className="w-full bg-gray-50 border-none rounded-xl p-4 pr-10 text-sm font-black focus:ring-2 focus:ring-blue-500/20 outline-none" value={customPrestaPrix} onChange={(e) => setCustomPrestaPrix(e.target.value)} placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-3 block">Mode de règlement</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['CB', 'Espèces', 'Chèque', 'Virement'].map((mode) => (
                    <label key={mode} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-xs font-black uppercase ${modeReglement === mode ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-gray-100 hover:border-gray-200 text-gray-500 bg-gray-50/50'}`}>
                      <input type="radio" className="hidden" name="mode_reglement" value={mode} checked={modeReglement === mode} onChange={(e) => setModeReglement(e.target.value)} />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Messages */}
          {message.text && (
            <div className={`p-5 rounded-2xl flex items-center shadow-xl animate-in slide-in-from-bottom-2 duration-300 ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
              {message.type === 'success' ? <CheckCircle size={20} className="mr-3 shrink-0" /> : <X size={20} className="mr-3 shrink-0" />}
              <span className="font-bold text-sm tracking-tight">{message.text}</span>
            </div>
          )}

          <button type="submit" disabled={generating} className="w-full py-5 px-4 rounded-[20px] text-white bg-blue-600 font-black text-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-3">
            {generating ? <Loader2 className="animate-spin" size={24} /> : <><Send size={24} /> Émettre la facture & Avis</>}
          </button>
        </form>
      </div>
    </div>
  );
}
