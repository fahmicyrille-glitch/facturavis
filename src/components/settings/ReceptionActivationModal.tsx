'use client';

import { X, ShieldCheck, FileText, IdCard, Landmark, Loader2, ExternalLink, HelpCircle, CheckCircle2 } from 'lucide-react';

interface ReceptionActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: () => void;
  launching: boolean;
  siret?: string;
}

export default function ReceptionActivationModal({
  isOpen,
  onClose,
  onLaunch,
  launching,
  siret,
}: ReceptionActivationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={launching ? undefined : onClose}
    >
      <div
        className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-[28px]">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-600 p-2.5 rounded-xl">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Activer votre réception</h3>
              <p className="text-xs text-gray-500">Connexion sécurisée à la Plateforme Agréée</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={launching}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
            <HelpCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Une fenêtre sécurisée va s&apos;ouvrir pour vous inscrire auprès de notre Plateforme Agréée par la DGFiP.
              <strong> FacturAvis reste ouvert ici</strong> — revenez sur cette page une fois la validation terminée.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-800 mb-3">Préparez ces éléments avant de commencer :</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <div className={`p-1.5 rounded-lg shrink-0 ${siret ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                  {siret ? <CheckCircle2 size={16} /> : <FileText size={16} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Votre SIRET</p>
                  <p className="text-xs text-gray-500">{siret ? 'Déjà renseigné dans votre profil ✓' : 'À renseigner dans votre profil ci-dessous'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                  <Landmark size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Votre avis de situation INSEE</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Document gratuit, à télécharger sur{' '}
                    <a href="https://avis-situation-sirene.insee.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">avis-situation-sirene.insee.fr</a>.
                    Si votre entreprise est en « droit d&apos;opposition », identifiez-vous via <strong>FranceConnect</strong> pour l&apos;obtenir.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600 shrink-0">
                  <IdCard size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Votre pièce d&apos;identité</p>
                  <p className="text-xs text-gray-500">Carte d&apos;identité ou passeport (au nom du dirigeant).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <p className="text-xs text-green-800 leading-relaxed">
              💡 <strong>Astuce :</strong> à l&apos;étape « Vérification d&apos;identité », si vous vous identifiez avec
              <strong> FranceConnect</strong>, la validation est souvent automatique et vous n&apos;avez aucun document à téléverser.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 space-y-2 sticky bottom-0 bg-white rounded-b-[28px]">
          <button
            onClick={onLaunch}
            disabled={launching || !siret}
            className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl text-white bg-gradient-to-r from-green-600 to-emerald-600 font-bold hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 transition-all shadow-lg shadow-green-200"
          >
            {launching ? (
              <><Loader2 className="animate-spin" size={18} /> Ouverture de la plateforme…</>
            ) : (
              <><ExternalLink size={18} /> Ouvrir la plateforme sécurisée</>
            )}
          </button>
          {!siret && (
            <p className="text-xs text-red-500 text-center font-medium">Renseignez d&apos;abord votre SIRET dans le profil ci-dessous.</p>
          )}
          <button
            onClick={onClose}
            disabled={launching}
            className="w-full py-3 text-gray-500 hover:text-gray-700 font-semibold text-sm disabled:opacity-50"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
