'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import type { Cabinet, Prestation } from '@/lib/types';

import ProfileForm from '@/components/settings/ProfileForm';
import PrestationsSection from '@/components/settings/PrestationsSection';
import CabinetsSection from '@/components/settings/CabinetsSection';

function SettingsContent() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcedId = searchParams.get('as');
  const receptionResult = searchParams.get('reception');

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

  // Global loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingCabinet, setAddingCabinet] = useState(false);
  const [updatingCabinet, setUpdatingCabinet] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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
        setReceptionStatus(profileData.iopole_status || null);
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
    if (receptionResult === 'success') {
      setReceptionStatus('active');
      setReceptionMessage({ text: 'Réception de factures activée avec succès ! Vos fournisseurs peuvent maintenant vous envoyer des factures électroniques.', type: 'success' });
    } else if (receptionResult === 'error') {
      setReceptionMessage({ text: "L'activation n'a pas pu être finalisée. Réessayez ou contactez le support.", type: 'error' });
    }
  }, [receptionResult]);

  // --- SUBSCRIPTION ---
  const [receptionMessage, setReceptionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleActivateReception = async () => {
    setActivatingReception(true);
    setReceptionMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/superpdp/authorize', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setReceptionMessage({ text: 'Impossible de lancer l\'activation. Réessayez.', type: 'error' });
      }
    } catch {
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
    if (!siretRegex.test(cleanSiret)) {
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
      alert("Erreur lors de l'envoi : " + (error.message || "Fichier invalide"));
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
      alert("Erreur lors de l'envoi de la signature : " + (error.message || "Fichier invalide"));
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
    } else if (error) { alert("Erreur lors de l'ajout : " + error.message); }
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
    } else { alert("Erreur lors de la modification : " + error.message); }
    setUpdatingPresta(false);
  };

  const handleDeletePrestation = async (id: string) => {
    setDeletingPrestaId(id);
    const { error } = await supabase.from('prestations').delete().eq('id', id).eq('user_id', userId!);
    if (!error) { setPrestations(prestations.filter(p => p.id !== id)); }
    else { alert("Impossible de supprimer cette prestation."); }
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
    } else if (error) { alert("Erreur lors de l'ajout : " + error.message); }
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
      alert("Erreur : " + (error.message || "Accès refusé"));
    } finally { setUpdatingCabinet(false); }
  };

  const handleDeleteCabinet = async (id: string) => {
    if (!window.confirm("Supprimer ce lieu de consultation ?")) return;
    setDeletingId(id);
    const { error } = await supabase.from('cabinets').delete().eq('id', id).eq('therapeute_id', userId!);
    if (!error) { setCabinets(cabinets.filter(c => c.id !== id)); }
    else { alert("Impossible de supprimer ce lieu."); }
    setDeletingId(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
            <div>
              <p className="font-bold text-gray-900">{subscriptionPlan || 'Essai gratuit'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {subscriptionStatus === 'active' ? 'Abonnement actif' :
                 subscriptionStatus === 'past_due' ? 'Paiement en retard' :
                 subscriptionStatus === 'cancelled' ? 'Abonnement annulé' :
                 'Période d\'essai'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' :
              subscriptionStatus === 'past_due' ? 'bg-orange-100 text-orange-700' :
              subscriptionStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {subscriptionStatus === 'active' ? 'Actif' :
               subscriptionStatus === 'past_due' ? 'En retard' :
               subscriptionStatus === 'cancelled' ? 'Annulé' :
               'Essai'}
            </div>
          </div>
          {subscriptionStatus === 'active' ? (
            <button onClick={handleManageSubscription} disabled={managingSubscription}
              className="w-full flex justify-center py-3 px-4 rounded-xl text-gray-700 bg-gray-100 font-bold hover:bg-gray-200 transition-all items-center">
              {managingSubscription ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              G&eacute;rer mon abonnement
            </button>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button onClick={() => handleSubscribe('founder')} disabled={subscribing}
                className="flex flex-col items-center py-4 px-4 rounded-xl bg-gradient-to-r from-[#d4b494] to-[#a9825a] text-white font-bold hover:opacity-90 transition-all">
                <span className="text-lg font-black">19&euro;/mois</span>
                <span className="text-xs opacity-80">Tarif Fondateur</span>
              </button>
              <button onClick={() => handleSubscribe('standard')} disabled={subscribing}
                className="flex flex-col items-center py-4 px-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all">
                <span className="text-lg font-black">29&euro;/mois</span>
                <span className="text-xs opacity-80">Tarif Standard</span>
              </button>
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
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div>
                <p className="font-bold text-green-800">Réception activée</p>
                <p className="text-xs text-green-600">Votre cabinet est conforme. Les factures de vos fournisseurs arrivent automatiquement dans votre espace.</p>
              </div>
            </div>
          ) : receptionStatus === 'pending' ? (
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Loader2 size={20} className="text-amber-600 animate-spin" />
              </div>
              <div>
                <p className="font-bold text-amber-800">Vérification en cours</p>
                <p className="text-xs text-amber-600">Consultez votre email pour valider votre identité et signer le mandat. Une fois validé, la réception sera activée automatiquement.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800 font-medium mb-2">En activant ce service, vous :</p>
                <ul className="text-xs text-blue-700 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-500">✓</span>
                    Désignez votre plateforme agréée auprès de la DGFiP (aucune démarche sur impots.gouv.fr)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-500">✓</span>
                    Recevez automatiquement les factures de vos fournisseurs dans FacturAvis
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-500">✓</span>
                    Êtes 100% conforme à la réforme du 1er septembre 2026
                  </li>
                </ul>
              </div>
              <button
                onClick={handleActivateReception}
                disabled={activatingReception || !siret}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 font-bold hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 transition-all shadow-md"
              >
                {activatingReception ? (
                  <><Loader2 className="animate-spin mr-2" size={18} /> Activation en cours...</>
                ) : (
                  'Activer la réception de factures électroniques'
                )}
              </button>
              {!siret && (
                <p className="text-xs text-red-500 text-center">Renseignez votre SIRET dans le profil ci-dessous pour activer ce service.</p>
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
