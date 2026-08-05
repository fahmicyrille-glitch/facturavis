import { createClient } from '@supabase/supabase-js'
import { env } from './env'
import { getPlanInfo, resolveEffectivePlan } from './plans'

export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

// Vérification serveur du plan Pro, utilisée par les routes publiques (réservation en ligne)
// pour empêcher un compte gratuit/essai expiré d'utiliser la fonctionnalité sans jamais
// passer par le dashboard (où le blocage n'est qu'un affichage conditionnel côté client).
export const isTherapeutePro = async (therapeuteId: string): Promise<boolean> => {
  const { data } = await supabaseAdmin
    .from('therapeutes')
    .select('plan, trial_ends_at, subscription_status')
    .eq('id', therapeuteId)
    .single()
  if (!data) return false
  const effectivePlan = resolveEffectivePlan(data.plan, data.subscription_status)
  return getPlanInfo(effectivePlan, data.trial_ends_at).isPro
}

export const checkIsAdmin = (userEmail?: string): boolean => {
  const adminEmail = env.NEXT_PUBLIC_ADMIN_EMAIL
  if (!userEmail || !adminEmail) return false
  return userEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim()
}

export const escapeHtml = (str: string | undefined | null): string => {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export const isAllowedStorageUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url)
    const supabaseHostname = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname
    return hostname === supabaseHostname
  } catch {
    return false
  }
}
