'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Cabinet, Prestation } from '@/lib/types';

import ProfileForm from '@/components/settings/ProfileForm';
import PrestationsSection from '@/components/settings/PrestationsSection';
import CabinetsSection from '@/components/settings/CabinetsSection';
import ConfirmDialog from '@/components/ConfirmDialog';
import ReceptionActivationModal from '@/components/settings/ReceptionActivationModal';

function SettingsContent() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcedId = searchParams.get('as');
  const receptionResult = searchParams.get('reception');
  const receptionReason = searchParams.get('reason');

  // Profile state
  const [nom, setNom] = useState('');
  const [titre, setTitre] = useState('');
  const [telephone, setTelephone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [adresseCabinet, setAdresseCabinet] = useState('');
  const [siret, setSiret] = useState('');
  const [codeApe, setCodeApe] = useState('');
  const [adeli, setAdeli] = useState('');
  const [siteWeb, setSiteWeb] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');

  // Cabinets state
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [newCabinetNom, setNewCabinetNom] = useState('');
  const [newCabinetLink, setNewCabinetLink] = useState('');
  const [editingCabinetId, setEditingCabinetId] = useState<string | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editLink, setEditLink] = useState('');

  // Prestations state
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [newPrestaNom, setNewPrestaNom] = useState('');
  const [newPrestaPrix, setNewPrestaPrix] = useState('');
  const [addingPresta, setAddingPresta] = useState(false);
  const [deletingPrestaId, setDeletingPrestaId] = useState<string | null>(null);
  const [editingPrestaId, setEditingPrestaId] = useState<string | null>(null);
  const [editPrestaNom, setEditPrestaNom] = useState('');
  const [editPrestaPrix, setEditPrestaPrix] = useState('');
  const [updatingPresta, setUpdatingPresta] = useState(false);

  // Subscription state
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [receptionStatus, setReceptionStatus] = useState<string | null>(null);
  const [activatingReception, setActivatingReception] = useState(false);
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [receptionNeedsReauth, setReceptionNeedsReauth] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);

  // Global loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingCabinet, setAddingCabinet] = useState(false);
  const [updatingCabinet, setUpdatingCabinet] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [cabinetToDelete, setCabinetToDelete] = useState<Cabinet | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }

      const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const uid = (isAdmin && forcedId) ? forcedId : session.user.id;
      setUserId(uid);

      const { data: profileData, error: profileError } = await supabase
        .from('therapeutes').select('*').eq('id', uid).single();
      if (profileError) console.error("Erreur chargement profil:", profileError);
      if (profileData) {
        setNom(profileData.nom || '');
        setTitre(profileData.titre || '');
        setTelephone(profileData.telephone || '');
        setLogoUrl(profileData.logo_url || '');
        setAdresseCabinet(profileData.adresse_cabinet || '');
        setSiret(profileData.siret || '');
        setCodeApe(profileData.code_ape || '');
        setAdeli(profileData.adeli || '');
        setSiteWeb(profileData.site_web || '');
        setSignatureUrl(profileData.signature_url || '');
        setSubscriptionPlan(profileData.plan || null);
        setSubscriptionStatus(profileData.subscription_status || null);
        const currentIopoleStatus = profileData.iopole_status || null;
        setReceptionStatus(currentIopoleStatus);
        setTrialEndsAt(profileData.trial_ends_at || null);

        // Always check SuperPDP status to catch activations and deactivations
        if (currentIopoleStatus === 'pending' || currentIopoleStatus === 'active') {
          fetch('/api/superpdp/check-status', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.access_token}` },
          })
            .then(r => r.json())
            .then(data => {
              if (data.needs_reauth) {
                setReceptionNeedsReauth(true);
                setReceptionMessage({ text: 'Votre connexion à SuperPDP a expiré. Reconnectez-vous pour mettre à jour votre statut.', type: 'error' });
                return;
              }
              if (!data.changed) return;
              setReceptionStatus(data.status);
              if (data.status === 'active') {
                setReceptionMessage({ text: 'Votre compte vient d\'être validé ! La réception de factures est maintenant active.', type: 'success' });
              } else if (data.status === 'pending') {
                setReceptionMessage({ text: 'Votre accès à la plateforme agréée est en cours de validation ou a été suspendu. Contactez le support SuperPDP si le problème persiste.', type: 'error' });
              }
            })
            .catch(() => { /* silencieux — on ne bloque pas le chargement */ });
        }
      }

      const { data: cabinetsData, error: cabError } = await supabase
        .from('cabinets').select('*').eq('therapeute_id', uid).order('created_at', { ascending: true });
      if (cabError) console.error("Erreur chargement cabinets:", cabError);
      if (cabinetsData) setCabinets(cabinetsData);

      const { data: prestationsData, error: prestError } = await supabase
        .from('prestations').select('*').eq('user_id', uid).order('created_at', { ascending: true });
      if (prestError) console.error("Erreur chargement prestations:", prestError);
      if (prestationsData) setPrestations(prestationsData);

      setLoading(false);
    };
    fetchData();
  }, [router, forcedId]);

  useEffect(() => {
    if (!receptionResult) return;
    // Si la page se charge à l'intérieur de la fenêtre popup ouverte par FacturAvis,
    // on prévient la fenêtre parente du résultat puis on ferme automatiquement le popup.
    if (typeof window !== 'undefined' && window.opener && window.opener !== window) {
      try {
        window.opener.postMessage({ source: 'facturavis-reception', result: receptionResult }, window.location.origin);
      } catch { /* cross-origin: ignoré */ }
      window.close();
      return;
    }
    if (receptionResult === 'success') {
      setReceptionStatus('active');
      setReceptionNeedsReauth(false);
      setReceptionMessage({ text: 'Réception de factures activée avec succès ! Vos fournisseurs peuvent maintenant vous envoyer des factures électroniques.', type: 'success' });
    } else if (receptionResult === 'pending') {
      setReceptionStatus('pending');
      setReceptionNeedsReauth(false);
      setReceptionMessage({ text: 'Dossier soumis ! La plateforme agréée vérifie votre identité et votre SIRET. Vous recevrez un email de confirmation dès la validation — aucune action supplémentaire n\'est requise de votre part.', type: 'info' });
    } else if (receptionResult === 'error') {
      if (receptionReason === 'state_expired') {
        setReceptionMessage({ text: 'La session a expiré pendant le processus (plus de 30 min). Cliquez à nouveau sur « Vérifier ma validation SuperPDP » pour recommencer.', type: 'error' });
      } else {
        setReceptionMessage({ text: "L'activation n'a pas pu être finalisée. Réessayez ou contactez le support.", type: 'error' });
      }
    }
  }, [receptionResult, receptionReason]);

  // Écoute le message envoyé par la fenêtre popup lorsqu'elle se termine.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.source !== 'facturavis-reception') return;
      setShowReceptionModal(false);
      if (event.data.result === 'success') {
        setReceptionStatus('active');
        setReceptionNeedsReauth(false);
        setReceptionMessage({ text: 'Réception de factures activée avec succès ! Vos fournisseurs peuvent maintenant vous envoyer des factures électroniques.', type: 'success' });
      } else if (event.data.result === 'pending') {
        setReceptionStatus('pending');
        setReceptionNeedsReauth(false);
        setReceptionMessage({ text: "Connexion renouvelée. Votre dossier est toujours en cours de validation — SuperPDP vous enverra un email dès la confirmation.", type: 'info' });
      } else {
        setReceptionMessage({ text: "L'activation n'a pas pu être finalisée. Réessayez ou contactez le support.", type: 'error' });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // --- SUBSCRIPTION ---
  const [receptionMessage, setReceptionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleActivateReception = async () => {
    setActivatingReception(true);
    setReceptionMessage(null);

    // Ouvre un nouvel onglet avant l'await pour éviter le blocage navigateur.
    const popup = window.open('about:blank', '_blank');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/superpdp/authorize', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      if (data.url) {
        if (popup && !popup.closed) {
          popup.location.href = data.url;
          popup.focus();
          // Surveille la fermeture de la fenêtre popup pour rafraîchir le statut.
          const timer = setInterval(() => {
            if (popup.closed) {
              clearInterval(timer);
              setShowReceptionModal(false);
            }
          }, 700);
        } else {
          // Popup bloqué par le navigateur : on bascule sur un nouvel onglet.
          window.open(data.url, '_blank', 'noopener,noreferrer');
          setShowReceptionModal(false);
        }
      } else {
        if (popup && !popup.closed) popup.close();
        setReceptionMessage({ text: 'Impossible de lancer l\'activation. Réessayez.', type: 'error' });
      }
    } catch {
      if (popup && !popup.closed) popup.close();
      setReceptionMessage({ text: 'Impossible de joindre le service. Réessayez.', type: 'error' });
    } finally {
      setActivatingReception(false);
    }
  };

  const handleSubscribe = async (plan: string) => {
    setSubscribing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (error) { console.error(error); }
    finally { setSubscribing(false); }
  };

  const handleManageSubscription = async () => {
    setManagingSubscription(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (error) { console.error(error); }
    finally { setManagingSubscription(false); }
  };

  // --- PROFILE SAVE ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const cleanSiret = siret.replace(/\s/g, '');
    const cleanAdeli = adeli.replace(/\s/g, '');

    const siretRegex = /^[0-9]{14}$/;
    if (cleanSiret && !siretRegex.test(cleanSiret)) {
      setMessage({ text: "Le numéro SIRET doit contenir exactement 14 chiffres sans lettres.", type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('therapeutes')
      .update({
        nom: nom.trim(), titre: titre.trim(), telephone: telephone.trim(),
        logo_url: logoUrl, adresse_cabinet: adresseCabinet.trim(),
        siret: cleanSiret, code_ape: codeApe.trim().toUpperCase(),
        adeli: cleanAdeli, site_web: siteWeb.trim(), signature_url: signatureUrl
      })
      .eq('id', userId);
    setSaving(false);

    if (!error) {
      setSiret(cleanSiret); setAdeli(cleanAdeli); setCodeApe(codeApe.trim().toUpperCase());
      setMessage({ text: 'Profil et informations mis à jour !', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } else {
      setMessage({ text: "Erreur lors de la sauvegarde : " + error.message, type: 'error' });
    }
  };

  // --- LOGO / SIGNATURE UPLOADS ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingLogo(true);
      if (!e.target.files || e.target.files.length === 0 || !userId) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${userId}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, file, { upsert: true, cacheControl: 'public, max-age=31536000' });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
      setLogoUrl(data.publicUrl);
      await supabase.from('therapeutes').update({ logo_url: data.publicUrl }).eq('id', userId);
    } catch (error: any) {
      showMessage("Erreur lors de l'envoi : " + (error.message || "Fichier invalide"), 'error');
    } finally { setUploadingLogo(false); }
  };

  const handleDeleteLogo = async () => {
    if (!userId) return;
    setLogoUrl('');
    await supabase.from('therapeutes').update({ logo_url: '' }).eq('id', userId);
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingSig(true);
      if (!e.target.files || e.target.files.length === 0 || !userId) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `sig-${userId}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, file, { upsert: true, cacheControl: 'public, max-age=31536000' });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
      setSignatureUrl(data.publicUrl);
      await supabase.from('therapeutes').update({ signature_url: data.publicUrl }).eq('id', userId);
    } catch (error: any) {
      showMessage("Erreur lors de l'envoi de la signature : " + (error.message || "Fichier invalide"), 'error');
    } finally { setUploadingSig(false); }
  };

  const handleDeleteSignature = async () => {
    if (!userId) return;
    setSignatureUrl('');
    await supabase.from('therapeutes').update({ signature_url: '' }).eq('id', userId);
  };

  // --- PRESTATIONS ---
  const handleAddPrestation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrestaNom.trim() || !newPrestaPrix || !userId) return;
    setAddingPresta(true);
    const prixParsed = parseFloat(newPrestaPrix.replace(',', '.')) || 0;
    const { data, error } = await supabase.from('prestations')
      .insert([{ user_id: userId, nom: newPrestaNom.trim(), prix: prixParsed }])
      .select().single();
    if (!error && data) {
      setPrestations([...prestations, data]);
      setNewPrestaNom(''); setNewPrestaPrix('');
    } else if (error) { showMessage("Erreur lors de l'ajout : " + error.message, 'error'); }
    setAddingPresta(false);
  };

  const handleUpdatePrestation = async (id: string) => {
    if (!editPrestaNom.trim() || !editPrestaPrix) return;
    setUpdatingPresta(true);
    const prixParsed = parseFloat(editPrestaPrix.replace(',', '.')) || 0;
    const { error } = await supabase.from('prestations')
      .update({ nom: editPrestaNom.trim(), prix: prixParsed })
      .eq('id', id).eq('user_id', userId!);
    if (!error) {
      setPrestations(prestations.map(p => p.id === id ? { ...p, nom: editPrestaNom.trim(), prix: prixParsed } : p));
      setEditingPrestaId(null);
    } else { showMessage("Erreur lors de la modification : " + error.message, 'error'); }
    setUpdatingPresta(false);
  };

  const handleDeletePrestation = async (id: string) => {
    setDeletingPrestaId(id);
    const { error } = await supabase.from('prestations').delete().eq('id', id).eq('user_id', userId!);
    if (!error) { setPrestations(prestations.filter(p => p.id !== id)); }
    else { showMessage("Impossible de supprimer cette prestation.", 'error'); }
    setDeletingPrestaId(null);
  };

  // --- CABINETS ---
  const handleAddCabinet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCabinetNom.trim() || !newCabinetLink.trim() || !userId) return;
    setAddingCabinet(true);
    const { data, error } = await supabase.from('cabinets')
      .insert([{ therapeute_id: userId, nom: newCabinetNom.trim(), lien_avis_google: newCabinetLink.trim() }])
      .select().single();
    if (!error && data) {
      setCabinets([...cabinets, data]);
      setNewCabinetNom(''); setNewCabinetLink('');
    } else if (error) { showMessage("Erreur lors de l'ajout : " + error.message, 'error'); }
    setAddingCabinet(false);
  };

  const handleUpdateCabinet = async (id_du_cabinet: string) => {
    setUpdatingCabinet(true);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const isAdmin = session?.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const cleanNom = editNom.trim();
      const cleanLink = editLink.trim();
      if (isAdmin && forcedId) {
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({ id: userId, id_cabinet: id_du_cabinet, nom_cabinet: cleanNom, lien_google: cleanLink })
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const { error } = await supabase.from('cabinets').update({ nom: cleanNom, lien_avis_google: cleanLink }).eq('id', id_du_cabinet).eq('therapeute_id', userId!);
        if (error) throw error;
      }
      setCabinets(cabinets.map(c => c.id === id_du_cabinet ? { ...c, nom: cleanNom, lien_avis_google: cleanLink } : c));
      setEditingCabinetId(null);
    } catch (error: any) {
      showMessage("Erreur : " + (error.message || "Accès refusé"), 'error');
    } finally { setUpdatingCabinet(false); }
  };

  const handleDeleteCabinet = (id: string) => {
    const cabinet = cabinets.find(c => c.id === id);
    if (cabinet) setCabinetToDelete(cabinet);
  };

  const confirmDeleteCabinet = async () => {
    if (!cabinetToDelete) return;
    const id = cabinetToDelete.id;
    setDeletingId(id);
    const { error } = await supabase.from('cabinets').delete().eq('id', id).eq('therapeute_id', userId!);
    if (!error) { setCabinets(cabinets.filter(c => c.id !== id)); }
    else { showMessage("Impossible de supprimer ce lieu.", 'error'); }
    setDeletingId(null);
    setCabinetToDelete(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ConfirmDialog
        isOpen={!!cabinetToDelete}
        title="Supprimer ce lieu"
        description={cabinetToDelete ? `Le lieu de consultation « ${cabinetToDelete.nom} » sera retiré de votre profil.` : ''}
        confirmLabel="Oui, supprimer"
        cancelLabel="Annuler"
        loading={!!deletingId && deletingId === cabinetToDelete?.id}
        onConfirm={confirmDeleteCabinet}
        onClose={() => deletingId !== cabinetToDelete?.id && setCabinetToDelete(null)}
      />
      <ReceptionActivationModal
        isOpen={showReceptionModal}
        onClose={() => !activatingReception && setShowReceptionModal(false)}
        onLaunch={handleActivateReception}
        launching={activatingReception}
        siret={siret}
      />
      <div className="max-w-3xl mx-auto space-y-6 pb-20">
        <div className="flex items-center mb-4">
          <Link href="/dashboard" className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-gray-600" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres {forcedId && <span className="text-sm font-normal text-orange-500">(Mode Admin)</span>}</h1>
        </div>

        {/* SUBSCRIPTION SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center mb-6 border-b pb-4">
            <CreditCard size={22} className="text-gray-800 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Mon Abonnement</h2>
          </div>

          {/* Current plan display */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
            <div>
              <p className="font-bold text-gray-900">
                {subscriptionPlan === 'founder' ? 'Plan Fondateur' :
                 subscriptionPlan === 'standard' ? 'Plan Standard' :
                 subscriptionPlan === 'trial' ? 'Essai Pro' :
                 'Plan Gratuit'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {subscriptionStatus === 'active' ? 'Abonnement actif' :
                 subscriptionStatus === 'past_due' ? 'Paiement en retard' :
                 subscriptionStatus === 'cancelled' ? 'Abonnement annulé' :
                 subscriptionPlan === 'trial' && trialEndsAt ? (
                   `Du ${new Date(new Date(trialEndsAt).getTime() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')} au ${new Date(trialEndsAt).toLocaleDateString('fr-FR')} (${Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}j restants)`
                 ) :
                 subscriptionPlan === 'trial' ? 'Essai en cours' :
                 'Réception factures fournisseurs incluse'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' :
              subscriptionStatus === 'past_due' ? 'bg-orange-100 text-orange-700' :
              subscriptionStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
              subscriptionPlan === 'trial' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {subscriptionStatus === 'active' ? 'Actif' :
               subscriptionStatus === 'past_due' ? 'En retard' :
               subscriptionStatus === 'cancelled' ? 'Annulé' :
               subscriptionPlan === 'trial' ? 'Essai' :
               'Gratuit'}
            </div>
          </div>

          {/* Actions based on plan */}
          {subscriptionStatus === 'active' ? (
            <button onClick={handleManageSubscription} disabled={managingSubscription}
              className="w-full flex justify-center py-3 px-4 rounded-xl text-gray-700 bg-gray-100 font-bold hover:bg-gray-200 transition-all items-center">
              {managingSubscription ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Gérer mon abonnement
            </button>
          ) : (
            <div className="space-y-3">
              {/* Trial CTA — only if never used trial */}
              {subscriptionPlan !== 'trial' && subscriptionPlan !== 'founder' && subscriptionPlan !== 'standard' && (
                <button
                  onClick={async () => {
                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      const res = await fetch('/api/plan/start-trial', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${session?.access_token}` },
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setSubscriptionPlan('trial');
                        setMessage({ text: 'Essai Pro activé pour 14 jours ! Rechargez la page.', type: 'success' });
                        setTimeout(() => window.location.reload(), 1500);
                      } else {
                        setMessage({ text: data.error || 'Impossible d\'activer l\'essai', type: 'error' });
                      }
                    } catch {
                      setMessage({ text: 'Erreur réseau', type: 'error' });
                    }
                  }}
                  className="w-full flex flex-col items-center py-4 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-green-200"
                >
                  <span className="text-lg font-black">Essai gratuit 14 jours</span>
                  <span className="text-xs opacity-80">Facturation + Avis Google + Dossiers patients</span>
                </button>
              )}
              {/* Paid plans */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button onClick={() => handleSubscribe('founder')} disabled={subscribing}
                  className="flex flex-col items-center py-4 px-4 rounded-xl bg-gradient-to-r from-[#d4b494] to-[#a9825a] text-white font-bold hover:opacity-90 transition-all">
                  <span className="text-lg font-black">19€/mois</span>
                  <span className="text-xs opacity-80">Tarif Fondateur</span>
                </button>
                <button onClick={() => handleSubscribe('standard')} disabled={subscribing}
                  className="flex flex-col items-center py-4 px-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all">
                  <span className="text-lg font-black">29€/mois</span>
                  <span className="text-xs opacity-80">Tarif Standard</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RÉCEPTION FACTURES ÉLECTRONIQUES */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center mb-6 border-b pb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800 mr-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <h2 className="text-lg font-semibold text-gray-800">Réception Factures Électroniques</h2>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Obligatoire sept. 2026</span>
          </div>

          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            La réforme de la facturation électronique oblige tous les professionnels à pouvoir <strong>recevoir</strong> les factures de leurs fournisseurs au format électronique à partir du 1er septembre 2026, via une Plateforme Agréée par la DGFiP.
          </p>

          {receptionStatus === 'active' ? (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-green-800">Réception activée</p>
                    <p className="text-xs text-green-600">Votre cabinet est conforme. Les factures de vos fournisseurs arrivent automatiquement dans votre espace.</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/factures-recues"
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-sm"
                >
                  Voir mes factures reçues
                  <ArrowRight size={16} />
                </Link>
              </div>
              {receptionNeedsReauth && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-3">
                  <p className="text-sm font-bold text-red-800">Connexion SuperPDP expirée</p>
                  <p className="text-xs text-red-600">Votre session a expiré. Reconnectez-vous pour vérifier votre statut et continuer à recevoir des factures.</p>
                  <button
                    onClick={() => setShowReceptionModal(true)}
                    className="w-full flex justify-center items-center gap-2 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-sm transition-all"
                  >
                    Reconnecter SuperPDP
                  </button>
                </div>
              )}
            </div>
          ) : receptionStatus === 'pending' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="bg-amber-100 p-2 rounded-lg shrink-0">
                  <Loader2 size={20} className="text-amber-600 animate-spin" />
                </div>
                <div>
                  <p className="font-bold text-amber-800">Validation en cours côté SuperPDP</p>
                  <p className="text-xs text-amber-600">Votre dossier est en cours d&apos;examen par la plateforme agréée.</p>
                </div>
              </div>
              {receptionNeedsReauth ? (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                  <p className="text-sm font-bold text-blue-800">Une fois votre dossier validé par SuperPDP</p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    SuperPDP vous enverra un <strong>email de confirmation</strong> quand votre dossier sera validé.
                    Revenez ensuite sur cette page et cliquez sur le bouton ci-dessous pour activer votre réception.
                  </p>
                  <button
                    onClick={() => setShowReceptionModal(true)}
                    className="w-full flex justify-center items-center gap-2 py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold text-sm transition-all"
                  >
                    Vérifier ma validation SuperPDP
                  </button>
                </div>
              ) : (
                <p className="text-xs text-amber-600 text-center">SuperPDP vous enverra un email de confirmation — cette page se mettra à jour automatiquement.</p>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Wizard 3 étapes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`relative p-4 rounded-xl border-2 transition-all ${siret ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mb-2 ${siret ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {siret ? '✓' : '1'}
                  </div>
                  <h4 className={`font-bold text-sm ${siret ? 'text-green-800' : 'text-blue-800'}`}>Renseigner votre SIRET</h4>
                  <p className="text-xs text-gray-600 mt-1">Ajoutez votre SIRET dans votre profil ci-dessous</p>
                </div>
                <div className={`relative p-4 rounded-xl border-2 transition-all ${siret ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mb-2 ${siret ? 'bg-blue-500 text-white' : 'bg-gray-300 text-white'}`}>2</div>
                  <h4 className={`font-bold text-sm ${siret ? 'text-blue-800' : 'text-gray-400'}`}>Activer la réception</h4>
                  <p className="text-xs text-gray-600 mt-1">Un clic suffit pour vous connecter à la plateforme agréée</p>
                </div>
                <div className="relative p-4 rounded-xl border-2 border-gray-200 bg-gray-50">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mb-2 bg-gray-300 text-white">3</div>
                  <h4 className="font-bold text-sm text-gray-400">C&apos;est tout !</h4>
                  <p className="text-xs text-gray-600 mt-1">Vos factures arrivent automatiquement chaque jour</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                <span className="text-xl mt-0.5">⏰</span>
                <div>
                  <p className="text-sm font-bold text-amber-800">Obligatoire dès le 1er septembre 2026</p>
                  <p className="text-xs text-amber-700 mt-0.5">Tous les professionnels doivent pouvoir recevoir des factures électroniques. Activez maintenant en 30 secondes.</p>
                </div>
              </div>

              <button
                onClick={() => setShowReceptionModal(true)}
                disabled={!siret}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 font-bold text-base hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 transition-all shadow-lg shadow-green-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Activer la réception — Gratuit, 30 secondes
              </button>
              <button
                onClick={() => setShowReceptionModal(true)}
                className="w-full flex justify-center items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Besoin d&apos;aide pour valider votre profil ?
              </button>
              {!siret && (
                <p className="text-xs text-red-500 text-center font-medium">Complétez l&apos;étape 1 : renseignez votre SIRET dans le profil ci-dessous.</p>
              )}
              {receptionMessage && (
                <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
                  receptionMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                  receptionMessage.type === 'info' ? 'bg-blue-50 border border-blue-200 text-blue-800' :
                  'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {receptionMessage.type === 'success' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                  {receptionMessage.type === 'info' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
                  {receptionMessage.type === 'error' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
                  <p className="text-sm font-medium">{receptionMessage.text}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PROFILE FORM */}
        <ProfileForm
          nom={nom} setNom={setNom}
          titre={titre} setTitre={setTitre}
          telephone={telephone} setTelephone={setTelephone}
          adresseCabinet={adresseCabinet} setAdresseCabinet={setAdresseCabinet}
          siret={siret} setSiret={setSiret}
          codeApe={codeApe} setCodeApe={setCodeApe}
          adeli={adeli} setAdeli={setAdeli}
          siteWeb={siteWeb} setSiteWeb={setSiteWeb}
          logoUrl={logoUrl} signatureUrl={signatureUrl}
          uploadingLogo={uploadingLogo} uploadingSig={uploadingSig}
          onLogoUpload={handleLogoUpload} onDeleteLogo={handleDeleteLogo}
          onSignatureUpload={handleSignatureUpload} onDeleteSignature={handleDeleteSignature}
          saving={saving} onSave={handleSaveProfile} message={message}
        />

        {/* PRESTATIONS */}
        <PrestationsSection
          prestations={prestations}
          newPrestaNom={newPrestaNom} setNewPrestaNom={setNewPrestaNom}
          newPrestaPrix={newPrestaPrix} setNewPrestaPrix={setNewPrestaPrix}
          addingPresta={addingPresta} onAddPrestation={handleAddPrestation}
          editingPrestaId={editingPrestaId}
          editPrestaNom={editPrestaNom} setEditPrestaNom={setEditPrestaNom}
          editPrestaPrix={editPrestaPrix} setEditPrestaPrix={setEditPrestaPrix}
          updatingPresta={updatingPresta}
          onStartEdit={(presta) => { setEditingPrestaId(presta.id); setEditPrestaNom(presta.nom); setEditPrestaPrix(presta.prix.toString()); }}
          onCancelEdit={() => setEditingPrestaId(null)}
          onUpdatePrestation={handleUpdatePrestation}
          deletingPrestaId={deletingPrestaId} onDeletePrestation={handleDeletePrestation}
        />

        {/* CABINETS */}
        <CabinetsSection
          cabinets={cabinets}
          newCabinetNom={newCabinetNom} setNewCabinetNom={setNewCabinetNom}
          newCabinetLink={newCabinetLink} setNewCabinetLink={setNewCabinetLink}
          addingCabinet={addingCabinet} onAddCabinet={handleAddCabinet}
          editingCabinetId={editingCabinetId}
          editNom={editNom} setEditNom={setEditNom}
          editLink={editLink} setEditLink={setEditLink}
          updatingCabinet={updatingCabinet}
          onStartEdit={(cab) => { setEditingCabinetId(cab.id); setEditNom(cab.nom); setEditLink(cab.lien_avis_google); }}
          onCancelEdit={() => setEditingCabinetId(null)}
          onUpdateCabinet={handleUpdateCabinet}
          deletingId={deletingId} onDeleteCabinet={handleDeleteCabinet}
        />
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>}>
      <SettingsContent />
    </Suspense>
  );
}
