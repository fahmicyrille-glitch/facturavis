'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle, Copy, LogOut, MapPin, Loader2, Settings, Star, FileText, MessageSquare, Search, Calendar, Download, X } from 'lucide-react';
import Link from 'next/link';

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
}

interface Facture {
  id: string;
  created_at: string;
  patient_nom: string;
  patient_email: string;
  cabinet_id: string;
  fichier_path: string;
  note: number | null;
  commentaire: string | null;
  statut_email: string;
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [patientEmail, setPatientEmail] = useState('');
  const [civilite, setCivilite] = useState('Mme');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');

  // 1. Référence pour l'input file (Correction du bug de sélection identique)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [therapeuteInfo, setTherapeuteInfo] = useState<Therapeute | null>(null);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [selectedCabinetId, setSelectedCabinetId] = useState<string>('');

  const [facturesHistorique, setFacturesHistorique] = useState<Facture[]>([]);

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const formatLocalYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDateDebutChange = (val: string) => {
    setDateDebut(val);
    if (!dateFin || dateFin < val) {
      setDateFin(val);
    }
  };

  const setFilterToday = () => {
    const today = formatLocalYYYYMMDD(new Date());
    setDateDebut(today);
    setDateFin(today);
  };

  const setFilterMonth = () => {
    const today = new Date();
    const firstDay = formatLocalYYYYMMDD(new Date(today.getFullYear(), today.getMonth(), 1));
    const lastDay = formatLocalYYYYMMDD(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    setDateDebut(firstDay);
    setDateFin(lastDay);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateDebut('');
    setDateFin('');
  };

  const fetchHistorique = async (uid: string) => {
    const { data } = await supabase
      .from('factures')
      .select('*')
      .eq('therapeute_id', uid)
      .order('created_at', { ascending: false });

    if (data) setFacturesHistorique(data);
  };

  useEffect(() => {
    let channel: any;

    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      const uid = session.user.id;
      setUserId(uid);

      const { data: dataTherapeute } = await supabase.from('therapeutes').select('nom, titre, telephone, email, logo_url').eq('id', uid).single();
      if (dataTherapeute) setTherapeuteInfo(dataTherapeute);

      const { data: dataCabinets } = await supabase.from('cabinets').select('*').eq('therapeute_id', uid);
      if (dataCabinets) {
        setCabinets(dataCabinets);
        if (dataCabinets.length > 0) setSelectedCabinetId(dataCabinets[0].id);
      }

      await fetchHistorique(uid);
      setFetchingData(false);

      channel = supabase
        .channel('changements-factures')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'factures',
            filter: `therapeute_id=eq.${uid}`
          },
          () => {
            fetchHistorique(uid);
          }
        )
        .subscribe();
    };

    initDashboard();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId || !patientEmail || !selectedCabinetId || !therapeuteInfo) return;

    setLoading(true);
    setSuccessLink(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('factures_pdf').upload(filePath, file);
      if (uploadError) throw uploadError;

      const nomComplet = `${civilite} ${nom.toUpperCase()} ${prenom}`;
      const currentCabinet = cabinets.find(c => c.id === selectedCabinetId);

      const { data: dbData, error: dbError } = await supabase
        .from('factures')
        .insert([{
          therapeute_id: userId,
          cabinet_id: selectedCabinetId,
          patient_email: patientEmail,
          patient_nom: nomComplet,
          fichier_path: filePath,
        }])
        .select('id')
        .single();

      if (dbError) throw dbError;

      const lien = `${window.location.origin}/facture/${dbData.id}`;
      setSuccessLink(lien);

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: patientEmail,
          nomPatient: nomComplet,
          lienFacture: lien,
          nomTherapeute: therapeuteInfo.nom,
          titreTherapeute: therapeuteInfo.titre,
          telephoneTherapeute: therapeuteInfo.telephone,
          emailTherapeute: therapeuteInfo.email,
          logoUrlTherapeute: therapeuteInfo.logo_url,
          cabinetNom: currentCabinet?.nom
        }),
      });

      // 🌟 NETTOYAGE DU FORMULAIRE ET DE L'INPUT FILE
      setFile(null);
      setPatientEmail('');
      setNom('');
      setPrenom('');
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Réinitialise physiquement l'input
      }

    } catch (error) {
      console.error('Erreur:', error);
      alert("Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  const facturesFiltrees = facturesHistorique.filter((f) => {
    const matchRecherche = f.patient_nom.toLowerCase().includes(searchTerm.toLowerCase()) || f.patient_email.toLowerCase().includes(searchTerm.toLowerCase());
    const dateFacture = new Date(f.created_at).getTime();
    const matchDebut = dateDebut ? dateFacture >= new Date(dateDebut).getTime() : true;
    const matchFin = dateFin ? dateFacture <= new Date(dateFin).getTime() + 86400000 : true;

    return matchRecherche && matchDebut && matchFin;
  });

  const exportCSV = () => {
    let csvContent = "Date;Patient;Email;Cabinet;Note (sur 5);Commentaire;Lien de la facture\n";
    facturesFiltrees.forEach(f => {
      const date = new Date(f.created_at).toLocaleDateString('fr-FR');
      const cab = cabinets.find(c => c.id === f.cabinet_id)?.nom || 'Inconnu';
      const lien = `${window.location.origin}/facture/${f.id}`;
      const note = f.note ? f.note : '';
      const commentaire = f.commentaire ? `"${f.commentaire.replace(/"/g, '""')}"` : '';
      csvContent += `${date};${f.patient_nom};${f.patient_email};${cab};${note};${commentaire};${lien}\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Factures_Compta_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFactures = facturesFiltrees.length;
  const avisRecoltes = facturesFiltrees.filter(f => f.note !== null).length;
  const notesExistantes = facturesFiltrees.filter(f => f.note !== null).map(f => f.note as number);
  const noteMoyenne = notesExistantes.length > 0 ? (notesExistantes.reduce((a, b) => a + b, 0) / notesExistantes.length).toFixed(1) : '-';

  if (fetchingData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-black font-bold">Chargement de votre espace...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 text-black">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* EN-TÊTE DU DASHBOARD - Haute Lisibilité */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
             <h1 className="text-3xl font-black text-[#0F172A]">Espace Praticien</h1>
             <p className="text-base text-gray-800 mt-1 font-bold">
               Connecté : <span className="text-blue-700 font-black">{therapeuteInfo?.nom}</span>
             </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/dashboard/settings" className="flex-1 sm:flex-none flex items-center justify-center font-black text-sm text-gray-900 bg-white border-2 border-gray-400 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
              <Settings size={16} className="mr-2" /> Paramètres
            </Link>
            <button onClick={handleLogout} className="flex-1 sm:flex-none flex items-center justify-center font-black text-sm text-red-700 bg-white border-2 border-red-300 px-4 py-2 rounded-xl shadow-sm hover:bg-red-50 transition-colors">
              <LogOut size={16} className="mr-2" /> Déconnexion
            </button>
          </div>
        </div>

        {/* STATISTIQUES - Contrastées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-gray-200 flex items-center">
            <div className="bg-blue-100 p-3 rounded-xl mr-4"><FileText className="text-blue-700" size={24} /></div>
            <div>
              <p className="text-sm font-black text-gray-600 uppercase tracking-tight">Factures affichées</p>
              <h3 className="text-3xl font-black text-gray-900">{totalFactures}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-gray-200 flex items-center">
            <div className="bg-green-100 p-3 rounded-xl mr-4"><MessageSquare className="text-green-700" size={24} /></div>
            <div>
              <p className="text-sm font-black text-gray-600 uppercase tracking-tight">Avis récoltés</p>
              <h3 className="text-3xl font-black text-gray-900">{avisRecoltes}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-gray-200 flex items-center">
            <div className="bg-yellow-100 p-3 rounded-xl mr-4"><Star className="text-yellow-700" size={24} /></div>
            <div>
              <p className="text-sm font-black text-gray-600 uppercase tracking-tight">Note moyenne</p>
              <h3 className="text-3xl font-black text-gray-900">{noteMoyenne} <span className="text-sm text-gray-500 font-bold">/ 5</span></h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* COLONNE GAUCHE : FORMULAIRE D'ENVOI */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6">
              <h2 className="text-xl font-black text-gray-900 mb-6 underline decoration-blue-500 decoration-4 underline-offset-4">Nouvelle facture</h2>

              <form onSubmit={handleUpload} className="space-y-5">
                <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-3 text-blue-900 font-black text-sm uppercase">
                    <MapPin size={18} />
                    <span>Lieu</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {cabinets.map((cab) => (
                      <label key={cab.id} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedCabinetId === cab.id ? 'border-blue-600 bg-white shadow-md' : 'border-gray-200 bg-white/50 hover:border-blue-300'}`}>
                        <input type="radio" className="hidden" name="cabinet" checked={selectedCabinetId === cab.id} onChange={() => setSelectedCabinetId(cab.id)} />
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedCabinetId === cab.id ? 'border-blue-600' : 'border-gray-400'}`}>
                            {selectedCabinetId === cab.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                        <span className={`text-base font-black ${selectedCabinetId === cab.id ? 'text-blue-900' : 'text-gray-800'}`}>{cab.nom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-400 rounded-2xl p-5 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
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
                    <UploadCloud size={32} className={file ? "text-green-600" : "text-blue-700"} />
                    <span className="mt-2 text-sm font-black text-gray-900">{file ? file.name : "SÉLECTIONNER LE PDF"}</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-black text-gray-900 mb-1">Civilité</label>
                    <select className="w-full border-2 border-gray-400 rounded-xl py-2 px-3 text-base font-bold text-gray-900 bg-white" value={civilite} onChange={(e) => setCivilite(e.target.value)}>
                      <option value="Mme">Mme</option>
                      <option value="M.">M.</option>
                      <option value="Enfant">Enfant</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-black text-gray-900 mb-1">Prénom</label>
                    <input type="text" required className="w-full border-2 border-gray-400 rounded-xl py-2 px-3 text-base font-bold text-gray-900 placeholder-gray-400" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-black text-gray-900 mb-1">Nom de famille</label>
                    <input type="text" required className="w-full border-2 border-gray-400 rounded-xl py-2 px-3 text-base font-bold text-gray-900" value={nom} onChange={(e) => setNom(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-black text-gray-900 mb-1">Email du patient *</label>
                    <input type="email" required className="w-full border-2 border-gray-400 rounded-xl py-2 px-3 text-base font-bold text-gray-900" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} />
                  </div>
                </div>

                <button type="submit" disabled={loading || !file || cabinets.length === 0} className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-lg text-lg font-black text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition-all">
                  {loading ? <Loader2 className="animate-spin" size={24} /> : 'ENVOYER LA FACTURE'}
                </button>
              </form>

              {successLink && (
                <div className="mt-4 bg-green-100 border-2 border-green-300 rounded-2xl p-4 text-center">
                  <CheckCircle size={20} className="mx-auto text-green-700 mb-1" />
                  <p className="text-sm font-black text-green-900 mb-2">Facture envoyée !</p>
                  <button onClick={() => navigator.clipboard.writeText(successLink)} className="text-sm bg-white border-2 border-green-400 text-green-800 px-4 py-2 rounded-xl font-black hover:bg-green-50 transition">
                    COPIER LE LIEN DIRECT
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE : HISTORIQUE - Contrastée */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 flex flex-col h-full overflow-hidden">

              <div className="p-4 sm:p-5 border-b-2 border-gray-100 bg-gray-50 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                  <div className="flex-1 w-full relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-900" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher un patient..."
                      className="w-full pl-10 pr-3 py-2 border-2 border-gray-400 rounded-xl text-sm font-bold text-gray-900 focus:border-blue-600"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex w-full sm:w-auto items-center gap-2">
                    <input
                      type="date"
                      className="px-2 py-2 border-2 border-gray-400 rounded-xl text-xs font-black bg-white"
                      value={dateDebut} onChange={(e) => handleDateDebutChange(e.target.value)}
                    />
                    <span className="font-black">-</span>
                    <input
                      type="date"
                      className="px-2 py-2 border-2 border-gray-400 rounded-xl text-xs font-black bg-white"
                      value={dateFin} onChange={(e) => setDateFin(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={exportCSV}
                    disabled={facturesFiltrees.length === 0}
                    className="flex w-full sm:w-auto justify-center items-center bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-black transition-colors disabled:bg-gray-300 shadow-md"
                  >
                    <Download size={18} className="mr-2" />
                    COMPTA
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={setFilterToday} className="text-xs font-black bg-white border-2 border-gray-300 text-gray-900 px-3 py-1.5 rounded-lg hover:border-blue-500">AUJOURD'HUI</button>
                  <button onClick={setFilterMonth} className="text-xs font-black bg-white border-2 border-gray-300 text-gray-900 px-3 py-1.5 rounded-lg hover:border-blue-500">CE MOIS-CI</button>
                  {(searchTerm || dateDebut || dateFin) && (
                    <button onClick={clearFilters} className="text-xs font-black flex items-center text-red-700 ml-auto uppercase underline">Effacer</button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-100 border-b-2 border-gray-200 text-gray-900 uppercase text-xs font-black">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4 text-center">Avis</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-100">
                    {facturesFiltrees.map((facture) => {
                      const date = new Date(facture.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                      const lien = `${window.location.origin}/facture/${facture.id}`;

                      return (
                        <tr key={facture.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 text-gray-900 font-bold">{date}</td>
                          <td className="px-6 py-4">
                            <div className="font-black text-gray-900 text-base">{facture.patient_nom}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-gray-700">{facture.patient_email}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-black bg-gray-200 text-gray-900 border border-gray-300">
                                {facture.statut_email}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {facture.note ? (
                              <div className="flex flex-col items-center">
                                <div className="flex text-yellow-500 font-black items-center gap-0.5">
                                  <Star size={16} className="fill-current" />
                                  <span>{facture.note}/5</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 font-black italic uppercase">En attente</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => navigator.clipboard.writeText(lien)}
                              className="text-blue-800 bg-blue-100 border border-blue-200 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl transition-all text-xs font-black shadow-sm"
                            >
                              LIEN DIRECT
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
