// Best-effort in-memory rate limiter (par instance Vercel).
// En serverless, un attaquant peut tomber sur une instance froide ou différente,
// mais ça suffit à casser un scraping linéaire et c'est zéro infra.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  const allowed = [
    'https://facturavis.fr',
    'https://www.facturavis.fr',
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter(Boolean) as string[];
  return allowed.some(a => origin.startsWith(a)) || origin.startsWith('http://localhost');
}
