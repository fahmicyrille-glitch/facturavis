export type PlanType = 'free' | 'trial' | 'founder' | 'standard';

export interface PlanInfo {
  plan: PlanType;
  trialEndsAt: string | null;
  isTrialExpired: boolean;
  isPro: boolean;
}

const PRO_FEATURES = [
  'facturation',
  'patients',
  'avis_google',
  'dashboard_stats',
  'multi_cabinets',
  'export_csv',
  'upload_facture',
  'agenda',
] as const;

const FREE_FEATURES = [
  'factures_recues',
  'export_fec',
  'preview_pdf',
  'sync_pa',
  'settings',
] as const;

export type Feature = typeof PRO_FEATURES[number] | typeof FREE_FEATURES[number];

export function getPlanInfo(plan: string | null | undefined, trialEndsAt: string | null | undefined): PlanInfo {
  const effectivePlan = (plan || 'free') as PlanType;

  let isTrialExpired = false;
  if (effectivePlan === 'trial' && trialEndsAt) {
    isTrialExpired = new Date(trialEndsAt) < new Date();
  }

  const isPro = (effectivePlan === 'founder' || effectivePlan === 'standard') ||
    (effectivePlan === 'trial' && !isTrialExpired);

  return {
    plan: isTrialExpired ? 'free' : effectivePlan,
    trialEndsAt: trialEndsAt || null,
    isTrialExpired,
    isPro,
  };
}

export function canAccess(planInfo: PlanInfo, feature: Feature): boolean {
  if ((FREE_FEATURES as readonly string[]).includes(feature)) return true;
  return planInfo.isPro;
}

// Reproduit la logique de dégradation d'un plan payant résilié/impayé en 'free', partagée
// entre le hook client (usePlan) et les vérifications serveur (routes API publiques).
export function resolveEffectivePlan(
  plan: string | null | undefined,
  subscriptionStatus: string | null | undefined,
): PlanType {
  const raw = (plan || 'free') as PlanType;
  if (raw === 'trial') return 'trial';
  const activeStatuses = ['active', 'past_due', 'trialing'];
  if ((raw === 'founder' || raw === 'standard') && activeStatuses.includes(subscriptionStatus || '')) {
    return raw;
  }
  return 'free';
}

export function getDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
