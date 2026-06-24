'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Search, Download, Edit, Trash2, X,
  Loader2, Upload, FileText, Calendar, Euro, Tag,
  Building, CheckCircle, Filter, RefreshCw, Eye,
} from 'lucide-react';
import type { FactureRecue } from '@/lib/types';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

const CATEGORIES = [
  'Materiel medical',
  'Loyer / Local',
  'Telecom / Internet',
  'Comptable',
  'Energie',
  'Assurance',
  'Formation',
  'Fournitures',
  'Logiciel / Abonnement',
  'Autre',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Materiel medical': 'bg-blue-100 text-blue-800',
  'Loyer / Local': 'bg-purple-100 text-purple-800',
  'Telecom / Internet': 'bg-cyan-100 text-cyan-800',
  'Comptable': 'bg-amber-100 text-amber-800',
  'Energie': 'bg-orange-100 text-orange-800',
  'Assurance': 'bg-green-100 text-green-800',
  'Formation': 'bg-indigo-100 text-indigo-800',
  'Fournitures': 'bg-pink-100 text-pink-800',
  'Logiciel / Abonnement': 'bg-violet-100 text-violet-800',
  'Autre': 'bg-gray-100 text-gray-800',
};

export default function FacturesRecuesPage() {
  const router = useRouter();
  const { toast, showToast } = useToast();

  // ── Core state ──
  const [factures, setFactures] = useState<FactureRecue[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [receptionActive, setReceptionActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // ── Confirm modal ──
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  // ── Upload modal state ──
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fournisseurNom, setFournisseurNom] = useState('');
  const [montant, setMontant] = useState('');
  const [dateFacture, setDateFacture] = useState(new Date().toISOString().split('T')[0]);
  const [categorie, setCategorie] = useState('Autre');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // ── Edit modal state ──
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingFacture, setEditingFacture] = useState<FactureRecue | null>(null);
  const [editFournisseurNom, setEditFournisseurNom] = useState('');
  const [editMontant, setEditMontant] = useState('');
  const [editDateFacture, setEditDateFacture] = useState('');
  const [editCategorie, setEditCategorie] = useState('Autre');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Search / filter state ──
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // ── Data fetching ──

  const fetchFactures = async (uid: string) => {
    const { data, error } = await supabase
      .from('factures_recues')
      .select('*')
      .eq('therapeute_id', uid)
      .order('date_facture', { ascending: false });
    if (error) {
      console.error('Erreur chargement factures recues:', error);
      showToast('Erreur lors du chargement des factures.', 'error');
    } else if (data) {
      setFactures(data);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }
      const uid = session.user.id;
      setUserId(uid);

      if (session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setIsAdmin(true);
        setReceptionActive(true);
      } else {
        const { data: profile } = await supabase.from('therapeutes').select('iopole_status').eq('id', uid).single();
        if (profile?.iopole_status === 'active' || profile?.iopole_status === 'pending') {
          setReceptionActive(true);
        }
      }

      await fetchFactures(uid);
      setLoading(false);
    };
    init();
  }, [router]);

  // ── PDF Preview ──
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePreview = async (facture: FactureRecue) => {
    const isPlatform = facture.notes?.startsWith('superpdp:');

    if (isPlatform) {
      const { data: { session } } = await supabase.auth.getSession();
      const id = facture.notes!.replace('superpdp:', '');
      const apiUrl = `/api/superpdp/preview?id=${id}`;

      const res = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        setPreviewUrl(URL.createObjectURL(blob));
      } else {
        showToast('Impossible de charger le PDF', 'error');
      }
    } else {
      const { data, error } = await supabase.storage.from('factures_recues').download(facture.fichier_path);
      if (error) { showToast('Impossible de charger le PDF', 'error'); return; }
      setPreviewUrl(URL.createObjectURL(data));
    }
  };

  // ── Plateforme Agreee sync ──
  const [syncing, setSyncing] = useState(false);

  const handlePlatformSync = async (purgeFirst = false) => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Authorization': `Bearer ${session?.access_token}` };

      if (purgeFirst) {
        await fetch('/api/superpdp/sync', { method: 'DELETE', headers });
        // Legacy sync endpoint removed
      }

      const res = await fetch('/api/superpdp/sync', { method: 'POST', headers });
      const result = await res.json();
      if (res.ok) {
        showToast(result.message || `${result.synced} facture(s) synchronisée(s)`, result.synced > 0 ? 'success' : 'info');
        if (userId) await fetchFactures(userId);
      } else {
        showToast(result.error || 'Erreur de synchronisation', 'error');
      }
    } catch {
      showToast('Impossible de contacter la plateforme', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // ── AI Parsing ──
  const [parsing, setParsing] = useState(false);

  const handleFileChange = async (selectedFile: File | null) => {
    setFile(selectedFile);
    if (!selectedFile || selectedFile.type !== 'application/pdf') return;

    setParsing(true);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/parse-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ pdfBase64: base64 }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        if (result.data.fournisseur_nom) setFournisseurNom(result.data.fournisseur_nom);
        if (result.data.montant !== null) setMontant(String(result.data.montant));
        if (result.data.date_facture) setDateFacture(result.data.date_facture);
        if (result.data.categorie) setCategorie(result.data.categorie);
        showToast('Facture analysée par IA — vérifiez les champs', 'info');
      }
    } catch {
      // Silently fail — user can fill manually
    } finally {
      setParsing(false);
    }
  };

  // ── Upload handler ──

  const todayStr = new Date().toISOString().split('T')[0];

  const resetUploadForm = () => {
    setFournisseurNom('');
    setMontant('');
    setDateFacture(todayStr);
    setCategorie('Autre');
    setNotes('');
    setFile(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId || !fournisseurNom.trim()) return;
    setUploading(true);

    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      const filePath = `${userId}/${timestamp}-${random}.pdf`;

      const { error: storageError } = await supabase.storage
        .from('factures_recues')
        .upload(filePath, file);
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('factures_recues')
        .insert([{
          therapeute_id: userId,
          fournisseur_nom: fournisseurNom.trim(),
          montant: montant ? parseFloat(montant) : null,
          date_facture: dateFacture || null,
          categorie,
          notes: notes.trim(),
          fichier_path: filePath,
        }]);
      if (dbError) throw dbError;

      await fetchFactures(userId);
      setIsUploadOpen(false);
      resetUploadForm();
      showToast('Facture ajoutee avec succes !', 'success');
    } catch (error) {
      console.error('Erreur upload:', error);
      showToast("Erreur lors de l'ajout de la facture.", 'error');
    } finally {
      setUploading(false);
    }
  };

  // ── Edit handler ──

  const openEditModal = (facture: FactureRecue) => {
    setEditingFacture(facture);
    setEditFournisseurNom(facture.fournisseur_nom);
    setEditMontant(facture.montant !== null ? String(facture.montant) : '');
    setEditDateFacture(facture.date_facture || '');
    setEditCategorie(facture.categorie);
    setEditNotes(facture.notes || '');
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacture || !userId) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('factures_recues')
        .update({
          fournisseur_nom: editFournisseurNom.trim(),
          montant: editMontant ? parseFloat(editMontant) : null,
          date_facture: editDateFacture || null,
          categorie: editCategorie,
          notes: editNotes.trim(),
        })
        .eq('id', editingFacture.id)
        .eq('therapeute_id', userId);
      if (error) throw error;

      await fetchFactures(userId);
      setIsEditOpen(false);
      setEditingFacture(null);
      showToast('Facture modifiee avec succes !', 'success');
    } catch (error) {
      console.error('Erreur modification:', error);
      showToast('Erreur lors de la modification.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete handler ──

  const handleDelete = async (facture: FactureRecue) => {
    setConfirmModal({
      title: 'Supprimer cette facture ?',
      message: `La facture de "${facture.fournisseur_nom}" sera définitivement supprimée.`,
      onConfirm: async () => { setConfirmModal(null); await doDelete(facture); },
    });
  };

  const doDelete = async (facture: FactureRecue) => {
    if (!userId) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('factures_recues')
        .remove([facture.fichier_path]);
      if (storageError) console.error('Erreur suppression fichier:', storageError);

      const { error: dbError } = await supabase
        .from('factures_recues')
        .delete()
        .eq('id', facture.id)
        .eq('therapeute_id', userId);
      if (dbError) throw dbError;

      setFactures(prev => prev.filter(f => f.id !== facture.id));
      showToast('Facture supprimee.', 'success');
    } catch (error) {
      console.error('Erreur suppression:', error);
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  // ── Download handler ──

  const handleDownload = async (facture: FactureRecue) => {
    try {
      showToast('Preparation du telechargement...', 'info');
      const { data, error } = await supabase.storage
        .from('factures_recues')
        .download(facture.fichier_path);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_${facture.fournisseur_nom.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur telechargement:', error);
      showToast('Impossible de telecharger la facture.', 'error');
    }
  };

  // ── Filtering ──

  const facturesFiltrees = factures.filter((f) => {
    const matchSearch = f.fournisseur_nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategorie = filterCategorie ? f.categorie === filterCategorie : true;
    const matchDebut = dateDebut && f.date_facture ? f.date_facture >= dateDebut : true;
    const matchFin = dateFin && f.date_facture ? f.date_facture <= dateFin : true;
    return matchSearch && matchCategorie && matchDebut && matchFin;
  });

  // ── Stats ──

  const totalFactures = facturesFiltrees.length;
  const totalMontant = facturesFiltrees.reduce((sum, f) => sum + (f.montant || 0), 0);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const facturesCeMois = facturesFiltrees.filter(f =>
    f.date_facture && f.date_facture.startsWith(currentMonth)
  ).length;

  const categorieCounts = facturesFiltrees.reduce((acc, f) => {
    acc[f.categorie] = (acc[f.categorie] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoriePlusFrequente = Object.entries(categorieCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategorie('');
    setDateDebut('');
    setDateFin('');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatMontant = (val: number | null) => {
    if (val === null) return '-';
    return val.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };

  // ── Loading screen ──

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-gray-500">Chargement des factures...</p>
      </div>
    );
  }

  // ── Render ──

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Factures Recues (Fournisseurs)</h1>
              <p className="text-sm text-gray-500 mt-0.5">Conformite reforme sept. 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!receptionActive && (
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all hover:opacity-90 text-sm font-bold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Activer la réception automatique
              </Link>
            )}
            {receptionActive && (
              <div className="flex items-center gap-0">
                <button
                  onClick={() => handlePlatformSync(false)}
                  disabled={syncing}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-l-lg shadow-sm transition-colors text-sm font-medium disabled:opacity-50"
                  title="Synchroniser les nouvelles factures"
                >
                  <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Sync...' : 'Sync PA'}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setConfirmModal({
                      title: 'Re-synchroniser la plateforme ?',
                      message: 'Toutes les factures seront supprimées et re-importées depuis la plateforme agréée.',
                      onConfirm: () => { setConfirmModal(null); handlePlatformSync(true); },
                    })}
                    disabled={syncing}
                    className="flex items-center bg-white border border-l-0 border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-600 px-2 py-2.5 rounded-r-lg shadow-sm transition-colors disabled:opacity-50"
                    title="Purger et re-synchroniser"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-colors text-sm font-medium"
            >
              <Plus size={18} />
              Ajouter une facture
            </button>
          </div>
        </div>

        {/* ── Stats cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText size={18} className="text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total factures</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalFactures}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Euro size={18} className="text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total montant</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatMontant(totalMontant)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Calendar size={18} className="text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ce mois-ci</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{facturesCeMois}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <Tag size={18} className="text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Top categorie</span>
            </div>
            <p className="text-lg font-bold text-gray-900 truncate">{categoriePlusFrequente}</p>
          </div>
        </div>

        {/* ── Filters bar ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Rechercher</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom du fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Categorie</label>
              <select
                value={filterCategorie}
                onChange={(e) => setFilterCategorie(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Toutes</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-40">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Date debut</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Date fin</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              />
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Filter size={14} />
              Effacer
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fournisseur</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categorie</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {facturesFiltrees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={40} className="text-gray-300" />
                        <p className="text-gray-500 font-medium">Aucune facture trouvee</p>
                        <p className="text-gray-400 text-xs mb-3">
                          {factures.length > 0
                            ? 'Modifiez vos filtres pour voir des resultats.'
                            : 'Cliquez sur "Ajouter une facture" ou activez la réception automatique.'}
                        </p>
                        {!receptionActive && factures.length === 0 && (
                          <Link
                            href="/dashboard/settings"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            Activer la réception automatique — Gratuit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  facturesFiltrees.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(f.date_facture)}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-gray-900">{f.fournisseur_nom}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={f.categorie}
                          onChange={async (e) => {
                            const newCat = e.target.value;
                            const { error } = await supabase
                              .from('factures_recues')
                              .update({ categorie: newCat })
                              .eq('id', f.id)
                              .eq('therapeute_id', userId!);
                            if (!error) {
                              setFactures(prev => prev.map(fac => fac.id === f.id ? { ...fac, categorie: newCat } : fac));
                            }
                          }}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer outline-none ${CATEGORY_COLORS[f.categorie] || CATEGORY_COLORS['Autre']}`}
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-gray-900 whitespace-nowrap">
                        {formatMontant(f.montant)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 max-w-[200px]">
                        <span className="block truncate" title={f.notes || ''}>
                          {f.notes || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handlePreview(f)}
                            title="Prévisualiser"
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownload(f)}
                            title="Telecharger le PDF"
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(f)}
                            title="Modifier"
                            className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(f)}
                            title="Supprimer"
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Upload Modal ── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { if (!uploading) { setIsUploadOpen(false); resetUploadForm(); } }} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Upload size={20} className="text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Ajouter une facture</h2>
              </div>
              <button
                onClick={() => { if (!uploading) { setIsUploadOpen(false); resetUploadForm(); } }}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {/* Fournisseur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building size={14} className="inline mr-1.5 -mt-0.5" />
                  Nom du fournisseur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fournisseurNom}
                  onChange={(e) => setFournisseurNom(e.target.value)}
                  placeholder="Ex: SFR, EDF, Ordre des kines..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Euro size={14} className="inline mr-1.5 -mt-0.5" />
                  Montant TTC
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="Ex: 150.00"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
                  Date de la facture <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dateFacture}
                  onChange={(e) => setDateFacture(e.target.value)}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                />
              </div>
              {/* Categorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag size={14} className="inline mr-1.5 -mt-0.5" />
                  Categorie
                </label>
                <select
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Notes optionnelles..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              {/* File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText size={14} className="inline mr-1.5 -mt-0.5" />
                  Fichier PDF <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {parsing && (
                    <p className="mt-2 text-xs text-blue-600 flex items-center justify-center gap-1">
                      <Loader2 size={14} className="animate-spin" /> Analyse IA en cours...
                    </p>
                  )}
                  {file && !parsing && (
                    <p className="mt-2 text-xs text-green-600 flex items-center justify-center gap-1">
                      <CheckCircle size={14} /> {file.name}
                    </p>
                  )}
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsUploadOpen(false); resetUploadForm(); }}
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file || !fournisseurNom.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                  ) : (
                    <><Upload size={16} /> Enregistrer</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {isEditOpen && editingFacture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { if (!saving) setIsEditOpen(false); }} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Edit size={20} className="text-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Modifier la facture</h2>
              </div>
              <button
                onClick={() => { if (!saving) setIsEditOpen(false); }}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {/* Fournisseur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building size={14} className="inline mr-1.5 -mt-0.5" />
                  Nom du fournisseur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFournisseurNom}
                  onChange={(e) => setEditFournisseurNom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Euro size={14} className="inline mr-1.5 -mt-0.5" />
                  Montant TTC
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editMontant}
                  onChange={(e) => setEditMontant(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
                  Date de la facture <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={editDateFacture}
                  onChange={(e) => setEditDateFacture(e.target.value)}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                />
              </div>
              {/* Categorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag size={14} className="inline mr-1.5 -mt-0.5" />
                  Categorie
                </label>
                <select
                  value={editCategorie}
                  onChange={(e) => setEditCategorie(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Notes optionnelles..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || !editFournisseurNom.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" /> Enregistrement...</>
                  ) : (
                    <><CheckCircle size={16} /> Enregistrer</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Modal ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">{confirmModal.title}</h3>
            <p className="text-sm text-gray-600">{confirmModal.message}</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PDF Preview overlay ── */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">Prévisualisation de la facture</h3>
              <button onClick={() => { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <iframe src={previewUrl} className="flex-1 w-full" title="Prévisualisation facture" />
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
