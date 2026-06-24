'use client';

import {
  Search, Calendar, Download, X, Edit, Copy, Star, Ban, FileText, Eye,
} from 'lucide-react';
import type { Cabinet, Facture } from '@/lib/types';

interface HistoriqueTableProps {
  facturesFiltrees: Facture[];
  cabinets: Cabinet[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  dateDebut: string;
  dateFin: string;
  handleDateDebutChange: (v: string) => void;
  setDateFin: (v: string) => void;
  setFilterToday: () => void;
  setFilterMonth: () => void;
  clearFilters: () => void;
  exportCSV: () => void;
  exportFEC: () => void;
  handleEditEmail: (facture: Facture) => void;
  handleCancelClick: (facture: Facture) => void;
  handleDownloadPdf: (filePath: string, patientNom: string) => void;
  onPreviewPdf: (filePath: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function HistoriqueTable({
  facturesFiltrees,
  searchTerm,
  setSearchTerm,
  dateDebut,
  dateFin,
  handleDateDebutChange,
  setDateFin,
  setFilterToday,
  setFilterMonth,
  clearFilters,
  exportCSV,
  exportFEC,
  handleEditEmail,
  handleCancelClick,
  handleDownloadPdf,
  onPreviewPdf,
  showToast,
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  onPageChange,
}: HistoriqueTableProps) {
  return (
    <div className="lg:col-span-7 flex flex-col">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
        {/* Filters header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex-1 w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un patient..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex w-full sm:w-auto items-center gap-2">
              <select
                value={dateDebut && dateFin ? `${dateDebut}|${dateFin}` : ''}
                onChange={(e) => {
                  if (!e.target.value) { handleDateDebutChange(''); setDateFin(''); return; }
                  const [d, f] = e.target.value.split('|');
                  handleDateDebutChange(d);
                  setDateFin(f);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium bg-white focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="">Période...</option>
                {(() => {
                  const options = [];
                  const now = new Date();
                  for (let i = 0; i < 12; i++) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const first = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
                    const last = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
                    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                    options.push(<option key={i} value={`${first}|${last}`}>{label.charAt(0).toUpperCase() + label.slice(1)}</option>);
                  }
                  return options;
                })()}
              </select>
              <span className="text-gray-300 text-xs">ou</span>
              <input
                type="date"
                className="border border-gray-200 rounded-lg px-2 py-2 text-xs focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                value={dateDebut}
                onChange={(e) => handleDateDebutChange(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                title="Date de début"
              />
              <span className="text-gray-400 text-xs">→</span>
              <input
                type="date"
                className="border border-gray-200 rounded-lg px-2 py-2 text-xs focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                title="Date de fin"
              />
            </div>

            <div className="flex w-full sm:w-auto gap-2">
              <button
                onClick={exportCSV}
                disabled={facturesFiltrees.length === 0}
                className="flex flex-1 sm:flex-none justify-center items-center bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-gray-300"
              >
                <Download size={16} className="mr-2" />
                Compta
              </button>
              <button
                onClick={exportFEC}
                disabled={facturesFiltrees.length === 0}
                className="flex flex-1 sm:flex-none justify-center items-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-gray-300"
                title="Export FEC (Fichier des Ecritures Comptables)"
              >
                <FileText size={16} className="mr-2" />
                FEC
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 font-medium mr-1">Raccourcis :</span>
            <button onClick={setFilterToday} className={`text-xs px-3 py-1 rounded-full transition-colors border ${
              dateDebut === dateFin && dateDebut === new Date().toISOString().split('T')[0]
                ? 'bg-blue-600 text-white border-blue-600 font-bold'
                : 'bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300'
            }`}>
              Aujourd&apos;hui
            </button>
            <button onClick={setFilterMonth} className={`text-xs px-3 py-1 rounded-full transition-colors border ${
              dateDebut && dateFin && dateDebut !== dateFin && dateDebut.endsWith('-01')
                ? 'bg-blue-600 text-white border-blue-600 font-bold'
                : 'bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300'
            }`}>
              Ce mois-ci
            </button>

            {(searchTerm || dateDebut || dateFin) && (
              <button onClick={clearFilters} className="text-xs flex items-center bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-full transition-colors ml-auto">
                <X size={12} className="mr-1" /> Effacer les filtres
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 w-full">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap w-[100px]">Date</th>
                <th className="px-4 py-3.5 font-semibold">Patient</th>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap w-[100px]">Statut</th>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap w-[110px]">Montant</th>
                <th className="px-4 py-3.5 font-semibold w-[130px]">Avis</th>
                <th className="px-4 py-3.5 font-semibold text-right w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {facturesFiltrees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    Aucune facture trouv&eacute;e pour cette recherche.
                  </td>
                </tr>
              ) : (
                facturesFiltrees.map((facture) => {
                  const date = new Date(facture.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const lien = `${window.location.origin}/facture/${facture.id}`;
                  const isAnnulee = facture.statut === 'Annulée' || facture.statut === 'Annulee';

                  return (
                    <tr key={facture.id} className={`transition-colors ${isAnnulee ? 'bg-red-50/40' : 'hover:bg-blue-50/30'}`}>
                      <td className="px-4 py-3.5 text-gray-500 text-xs font-medium whitespace-nowrap tabular-nums">{date}</td>
                      <td className="px-4 py-3.5">
                        <div className={`font-semibold truncate max-w-[250px] ${isAnnulee ? 'text-gray-400' : 'text-gray-900'}`} title={facture.patient_nom}>
                          {facture.patient_nom}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs truncate max-w-[200px] ${isAnnulee ? 'text-gray-400' : 'text-gray-500'}`} title={facture.patient_email}>{facture.patient_email}</span>
                          {!isAnnulee && (
                            <button onClick={() => handleEditEmail(facture)} className="text-gray-300 hover:text-blue-600 transition-colors shrink-0" title="Modifier l'email et renvoyer la facture">
                              <Edit size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isAnnulee ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-100 border border-red-200 px-2.5 py-1 rounded-md">
                            <Ban size={12} />
                            Annul&eacute;e
                          </span>
                        ) : (
                          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md ${
                            facture.statut_email === 'Ouvert'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : facture.statut_email === 'Renvoyé'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : facture.statut_email === 'Relancé'
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}>
                            {facture.statut_email || 'Envoyé'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className={`font-bold tabular-nums ${isAnnulee ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {facture.montant ? `${facture.montant.toLocaleString('fr-FR')} €` : '-'}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${isAnnulee ? 'text-gray-400' : 'text-gray-500'}`}>
                          {facture.mode_reglement || 'Non précisé'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isAnnulee ? (
                          <span className="text-xs text-gray-400">&mdash;</span>
                        ) : facture.note ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex text-yellow-400">
                              {[1,2,3,4,5].map(star => (
                                <Star key={star} size={14} className={star <= facture.note! ? "fill-current" : "text-gray-200"} />
                              ))}
                            </div>
                            {facture.commentaire && (
                              <span className="text-[10px] text-gray-400 truncate max-w-[110px] italic" title={facture.commentaire}>
                                &ldquo;{facture.commentaire}&rdquo;
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">En attente</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          {!isAnnulee && (
                            <button
                              onClick={() => handleCancelClick(facture)}
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                              title="Annuler cette facture"
                            >
                              <Ban size={15} />
                            </button>
                          )}

                          <button
                            onClick={() => onPreviewPdf(facture.fichier_path)}
                            className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"
                            title="Prévisualiser"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => handleDownloadPdf(facture.fichier_path, facture.patient_nom)}
                            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                            title="Télécharger le PDF"
                          >
                            <Download size={15} />
                          </button>

                          {!isAnnulee && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(lien);
                                showToast("Lien copié !");
                              }}
                              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                              title="Copier le lien"
                            >
                              <Copy size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} sur {totalCount}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pr&eacute;c&eacute;dent
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
