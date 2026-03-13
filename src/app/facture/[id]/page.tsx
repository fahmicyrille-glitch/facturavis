'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, Star, Heart, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function PagePatient() {
  const params = useParams();
  const factureId = params?.id;

  const [facture, setFacture] = useState<any>(null);
  const [cabinet, setCabinet] = useState<any>(null);
  const [therapeute, setTherapeute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!factureId) return;

    const fetchData = async () => {
      try {
        // 1. On récupère la facture
        const { data: dataFacture, error: errFacture } = await supabase
          .from('factures')
          .select('*')
          .eq('id', factureId)
          .single();

        if (errFacture) throw new Error("Facture introuvable.");
        setFacture(dataFacture);

        // 2. On récupère le CABINET lié à cette facture (Version Architecte !)
        const { data: dataCabinet, error: errCabinet } = await supabase
          .from('cabinets')
          .select('*')
          .eq('id', dataFacture.cabinet_id)
          .single();

        if (errCabinet) throw new Error("Informations du cabinet introuvables.");
        setCabinet(dataCabinet);

        // 3. On récupère le thérapeute pour le nom et le logo
        const { data: dataTherapeute, error: errTherapeute } = await supabase
          .from('therapeutes')
          .select('*')
          .eq('id', dataFacture.therapeute_id)
          .single();

        if (errTherapeute) throw new Error("Thérapeute introuvable.");
        setTherapeute(dataTherapeute);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [factureId]);

  const handleDownloadAndReview = async () => {
    if (!facture || !cabinet) return;

    try {
      const { data, error } = await supabase.storage
        .from('factures_pdf')
        .download(facture.fichier_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facture_${facture.patient_nom.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // REDIRECTION DYNAMIQUE : On utilise le lien stocké dans la table cabinets
      if (cabinet.lien_avis_google) {
        setTimeout(() => {
            window.location.href = cabinet.lien_avis_google;
        }, 800);
      }
    } catch (err) {
      alert("Erreur lors du téléchargement.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">
      <Loader2 className="animate-spin mr-2" /> Chargement de votre facture...
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center">
        <h1 className="text-xl font-bold text-red-600 mb-2">Oups !</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 text-center">

          <div className="flex justify-center mb-6">
            <div className="bg-green-50 p-4 rounded-full border border-green-100">
              <Star size={48} className="text-green-500 fill-current" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            Bonjour {facture.patient_nom} !
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Voici votre facture pour votre séance à <span className="font-semibold text-gray-900">{cabinet.nom}</span> avec <span className="font-semibold text-gray-900">{therapeute.nom}</span>.
          </p>

          <button
            onClick={handleDownloadAndReview}
            className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            <Download size={24} className="mr-2" />
            Télécharger ma facture
          </button>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start">
              <Heart className="text-blue-500 mt-1 flex-shrink-0" size={20} />
              <p className="ml-3 text-sm font-semibold text-blue-800 text-left leading-relaxed">
                En téléchargeant votre facture, vous serez redirigé(e) vers Google pour laisser un avis sur le cabinet de <strong>{cabinet.nom}</strong>. Merci !
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
