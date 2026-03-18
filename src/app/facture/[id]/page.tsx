'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, Star, Loader2, MessageSquare, CheckCircle, X, Info } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function PagePatient() {
  const params = useParams();
  const factureId = params?.id;

  const [facture, setFacture] = useState<any>(null);
  const [cabinet, setCabinet] = useState<any>(null);
  const [therapeute, setTherapeute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour la Popup et les étoiles
  const [showModal, setShowModal] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // États pour le formulaire privé
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (!factureId) return;

    const fetchData = async () => {
      try {
        const { data: dataFacture, error: errFacture } = await supabase
          .from('factures')
          .select('*')
          .eq('id', factureId)
          .single();

        if (errFacture) throw new Error("Facture introuvable.");
        setFacture(dataFacture);

        // 📡 LE RADAR EST ICI : On met à jour le statut silencieusement
        if (dataFacture.statut_email !== 'Ouvert') {
          await supabase
            .from('factures')
            .update({ statut_email: 'Ouvert' })
            .eq('id', factureId);
        }

        const { data: dataCabinet, error: errCabinet } = await supabase
          .from('cabinets')
          .select('*')
          .eq('id', dataFacture.cabinet_id)
          .single();

        if (errCabinet) throw new Error("Informations du cabinet introuvables.");
        setCabinet(dataCabinet);

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

  const handleDownloadAndShowModal = async () => {
      if (!facture) return;
      try {
        const { data, error } = await supabase.storage
          .from('factures_pdf')
          .download(facture.fichier_path);

        if (error) throw error;

        // 1. Création du Blob avec un type MIME forcé pour le téléchargement
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);

        // 2. Création d'un élément <a> invisible
        const link = document.createElement('a');
        link.href = url;

        // 3. LE POINT CRUCIAL : l'attribut download
        // C'est lui qui dit au navigateur : "Ne l'affiche pas, enregistre-le"
        link.download = `Facture_${facture.patient_nom.replace(/\s+/g, '_')}.pdf`;

        // Ajout temporaire au DOM pour que Safari accepte l'événement
        document.body.appendChild(link);
        link.click();

        // Nettoyage immédiat
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // 4. On affiche la modal. L'utilisateur est TOUJOURS sur la même page.
        setShowModal(true);

      } catch (err) {
        alert("Erreur lors du téléchargement.");
      }
    };

  const handleStarClick = async (selectedStar: number) => {
      setRating(selectedStar);

      // 1. On prépare ce qu'on va sauvegarder
      const donneesASauvegarder: any = { note: selectedStar };

      // 2. LA CORRECTION : Si c'est 4 ou 5 étoiles, on efface le commentaire !
      if (selectedStar >= 4) {
        donneesASauvegarder.commentaire = null;
        setFeedback(''); // On vide aussi la case de texte à l'écran par sécurité
      }

      // 3. 💾 SAUVEGARDE EN BASE DE DONNÉES
      await supabase
        .from('factures')
        .update(donneesASauvegarder)
        .eq('id', factureId);

      // 4. LOGIQUE DE REDIRECTION (Uniquement pour 5 étoiles !)
      if (selectedStar === 5 && cabinet?.lien_avis_google) {
        setIsRedirecting(true);
        setTimeout(() => {
          window.location.href = cabinet.lien_avis_google;
        }, 800);
      }
    };

  const handleSendFeedback = async () => {
    // 💾 SAUVEGARDE EN BASE DE DONNÉES (Le commentaire)
    await supabase
      .from('factures')
      .update({ commentaire: feedback })
      .eq('id', factureId);

    setFeedbackSent(true);
    setTimeout(() => {
      setShowModal(false);
    }, 3000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4f1] text-[#7a6a5f]">
      <Loader2 className="animate-spin mr-2" size={32} /> Chargement de votre document...
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4f1]">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center max-w-md w-full mx-4">
        <h1 className="text-xl font-bold text-red-600 mb-2">Oups !</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f4f1] flex items-center justify-center p-4">

      {/* 💳 LA CARTE CENTRÉE */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 sm:p-10 text-center relative">

        {/* LOGO PLUS GROS OU ÉTOILE VERTE */}
        <div className="flex justify-center mb-6">
          {therapeute?.logo_url ? (
            <img
              src={therapeute.logo_url}
              alt="Logo"
              className="h-28 w-28 sm:h-32 sm:w-32 object-contain rounded-full shadow-sm border border-gray-100 bg-white"
            />
          ) : (
            <div className="bg-[#e8f5e9] p-6 rounded-full">
              <Star size={48} className="text-[#4caf50] fill-[#4caf50]" />
            </div>
          )}
        </div>

        {/* TITRE & TEXTE PLUS LISIBLE */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3e2f25] mb-4">
          Bonjour {facture.patient_nom} !
        </h1>
        <p className="text-[#7a6a5f] mb-8 text-base sm:text-lg leading-relaxed">
          Voici votre facture pour votre séance avec <span className="font-bold text-[#3e2f25]">{therapeute?.nom}</span>.
        </p>

        {/* BOUTON TÉLÉCHARGEMENT */}
        <button
          onClick={handleDownloadAndShowModal}
          className="w-full flex items-center justify-center py-4 px-4 rounded-xl text-white font-bold text-lg bg-[#a9825a] hover:bg-[#8b6a48] transition-all transform hover:-translate-y-1 shadow-md hover:shadow-lg mb-6"
        >
          <Download size={24} className="mr-2" />
          Télécharger ma facture
        </button>

        {/* PETIT ENCART INFO PLUS LISIBLE */}
        <div className="bg-[#fdfaf8] border border-[#f0e6de] rounded-xl p-5 flex items-start text-left">
          <Info className="text-[#a9825a] shrink-0 mt-0.5 mr-3" size={20} />
          <p className="text-sm text-[#7a6a5f] leading-relaxed">
            En téléchargeant votre facture, vous serez invité(e) à laisser un avis sur votre séance au cabinet. Merci !
          </p>
        </div>
      </div>

      {/* 🌟 POPUP (MODAL) DES ÉTOILES */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">

            {/* 🟢 BANDEAU VERT */}
            <div className="bg-green-100 text-green-800 py-4 px-4 flex items-center justify-center font-bold border-b border-green-200">
              <CheckCircle size={22} className="mr-2 text-green-600" />
              Votre facture a bien été téléchargée !
            </div>

            {!isRedirecting && !feedbackSent && (
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-16 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-10"
              >
                <X size={20} />
              </button>
            )}

            <div className="p-8 text-center pt-10">
              {isRedirecting ? (
                // 🟢 ÉCRAN REDIRECTION (5 Étoiles uniquement)
                <div className="py-8">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Merci infiniment !</h3>
                  <p className="text-lg text-gray-600 mb-6 font-medium">Redirection vers Google en cours...</p>
                  <Loader2 className="animate-spin mx-auto text-blue-500" size={36} />
                </div>
              ) : rating === 4 ? (
                // 🟡 ÉCRAN 4 ÉTOILES (Juste merci, pas de redirection)
                <div className="py-8 animate-in zoom-in duration-300">
                  <div className="text-5xl mb-4">✨</div>
                  <h3 className="text-2xl font-bold text-[#3e2f25] mb-2">Merci pour votre retour !</h3>
                  <p className="text-[#7a6a5f] mb-6">Nous sommes ravis que la séance se soit bien passée. Votre note a bien été transmise au cabinet.</p>
                  <button onClick={() => setShowModal(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">
                    Fermer
                  </button>
                </div>
              ) : (
                // ⚪ ÉCRAN DE NOTATION DE BASE (ou formulaire 1-3 étoiles)
                <>
                  <h3 className="text-2xl font-extrabold text-[#3e2f25] mb-3">Un petit service ?</h3>
                  <p className="text-md font-medium text-[#5d4a3e] mb-8">
                    Votre avis est précieux.<br/>Comment s'est passée votre séance ?
                  </p>

                  {/* Les 5 Étoiles */}
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleStarClick(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          size={44}
                          className={`${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} transition-colors duration-200`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* 🟠 FORMULAIRE PRIVÉ (1 à 3 étoiles) */}
                  {rating > 0 && rating <= 3 && !feedbackSent && (
                    <div className="mt-8 text-left animate-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-[#fdfaf8] rounded-xl p-5 border border-[#f0e6de]">
                        <h4 className="font-bold text-[#a9825a] mb-3 flex items-center text-sm">
                          <MessageSquare size={16} className="mr-2" /> Aidez-nous à nous améliorer
                        </h4>
                        <textarea
                          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-[#a9825a] focus:border-[#a9825a] bg-white mb-3"
                          rows={3}
                          placeholder="Que pourrions-nous faire de mieux ? (Message privé)"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        ></textarea>
                        <button
                          onClick={handleSendFeedback}
                          className="w-full bg-[#3e2f25] hover:bg-black text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm shadow-sm"
                        >
                          Envoyer au praticien
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message de remerciement privé */}
                  {feedbackSent && (
                    <div className="mt-8 bg-green-50 rounded-xl p-6 border border-green-100 animate-in fade-in">
                       <CheckCircle size={36} className="mx-auto text-green-500 mb-3" />
                       <h4 className="font-bold text-gray-800 text-lg mb-1">Bien reçu !</h4>
                       <p className="text-base text-gray-600">Votre retour a été enregistré.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
