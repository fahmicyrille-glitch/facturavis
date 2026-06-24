'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles, Star, FileText, Users, BarChart3, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UpgradePromptProps {
  feature: string;
  trialDaysLeft?: number | null;
  hasUsedTrial?: boolean;
}

export default function UpgradePrompt({ feature, trialDaysLeft, hasUsedTrial }: UpgradePromptProps) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [trialStarted, setTrialStarted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const featureNames: Record<string, { title: string; desc: string; icon: typeof Lock }> = {
    facturation: {
      title: 'Facturation Patients',
      desc: 'Générez des factures Factur-X en 10 secondes et envoyez-les par email automatiquement.',
      icon: FileText,
    },
    patients: {
      title: 'Dossiers Patients',
      desc: 'Gérez vos fiches patients, observations thérapeutiques et historique complet.',
      icon: Users,
    },
    dashboard_stats: {
      title: 'Dashboard & Analytics',
      desc: 'Suivez votre CA, vos avis Google et vos performances en temps réel.',
      icon: BarChart3,
    },
    avis_google: {
      title: 'Avis Google Automatiques',
      desc: 'Récoltez 3x plus d\'avis Google automatiquement après chaque séance.',
      icon: Star,
    },
  };

  const info = featureNames[feature] || {
    title: 'Fonctionnalité Pro',
    desc: 'Cette fonctionnalité est disponible avec le plan Pro.',
    icon: Sparkles,
  };

  const Icon = info.icon;

  const handleStartTrial = async () => {
    setStarting(true);
    setErrorMsg('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/plan/start-trial', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTrialStarted(true);
        setTimeout(() => router.refresh(), 1500);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setErrorMsg(data.error || 'Erreur lors de l\'activation');
      }
    } catch {
      setErrorMsg('Impossible de contacter le serveur');
    } finally {
      setStarting(false);
    }
  };

  if (trialStarted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-[#3e2f25] mb-3">Essai Pro activé !</h2>
          <p className="text-[#7a6a5f] font-medium">14 jours gratuits pour tester toutes les fonctionnalités. Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-[#fdf2e9] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon size={36} className="text-[#a9825a]" />
        </div>

        <div className="bg-white rounded-[32px] border border-[#f0e6de] p-8 shadow-xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock size={16} className="text-[#a9825a]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#a9825a]">Plan Pro</span>
          </div>

          <h2 className="text-2xl font-black text-[#3e2f25] mb-3">{info.title}</h2>
          <p className="text-[#7a6a5f] font-medium mb-6">{info.desc}</p>

          {trialDaysLeft !== null && trialDaysLeft !== undefined && trialDaysLeft > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-blue-700 font-bold">
                Il vous reste {trialDaysLeft} jour{trialDaysLeft > 1 ? 's' : ''} d&apos;essai gratuit
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-red-700 font-bold">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-3">
            {!hasUsedTrial && (
              <button
                onClick={handleStartTrial}
                disabled={starting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-lg shadow-green-200 disabled:opacity-50"
              >
                {starting ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {starting ? 'Activation...' : 'Essai gratuit 14 jours'}
              </button>
            )}
            <Link
              href="/dashboard/settings"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#d4b494] to-[#a9825a] text-white py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-lg shadow-[#a9825a]/20"
            >
              S&apos;abonner — 19€/mois
            </Link>
            <Link
              href="/dashboard/factures-recues"
              className="w-full flex items-center justify-center text-sm text-[#7a6a5f] font-bold hover:text-[#3e2f25] transition-colors py-2"
            >
              Continuer avec le plan gratuit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
