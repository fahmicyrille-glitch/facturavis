function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  RESEND_API_KEY: requireEnv('RESEND_API_KEY'),
  CRON_SECRET: requireEnv('CRON_SECRET'),
  NEXT_PUBLIC_ADMIN_EMAIL: requireEnv('NEXT_PUBLIC_ADMIN_EMAIL'),
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://facturavis.fr',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_FOUNDER_PRICE_ID: process.env.STRIPE_FOUNDER_PRICE_ID || '',
  STRIPE_STANDARD_PRICE_ID: process.env.STRIPE_STANDARD_PRICE_ID || '',
} as const
