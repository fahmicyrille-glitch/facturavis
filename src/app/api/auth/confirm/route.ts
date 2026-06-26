import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') || 'email';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://facturavis.fr';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!tokenHash || !supabaseUrl) {
    return NextResponse.redirect(`${siteUrl}/login?error=invalid_link`);
  }

  // Redirige vers l'endpoint Supabase qui vérifie le token,
  // puis renvoie vers notre page login. Le lien dans l'email
  // pointe vers facturavis.fr (pas supabase.co) → Outlook accepte.
  const redirectTo = `${siteUrl}/login?confirmed=true`;
  const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${type}&redirect_to=${encodeURIComponent(redirectTo)}`;

  return NextResponse.redirect(verifyUrl);
}
