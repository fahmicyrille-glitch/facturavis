import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const checkIsAdmin = (userEmail?: string): boolean => {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
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
    const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname
    return hostname === supabaseHostname
  } catch {
    return false
  }
}
