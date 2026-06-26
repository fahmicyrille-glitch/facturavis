import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

const SUPERPDP_API_URL = process.env.SUPERPDP_API_URL || 'https://api.superpdp.tech';
const SUPERPDP_CLIENT_ID = process.env.SUPERPDP_CLIENT_ID_PUBLIC || process.env.SUPERPDP_CLIENT_ID || '';

function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new NextResponse('Non autorisé', { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  const state = crypto.randomBytes(16).toString('base64url');
  const { verifier, challenge } = generatePKCE();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://facturavis.fr';
  const redirectUri = `${siteUrl}/api/superpdp/callback`;

  const { data: profile } = await supabaseAdmin
    .from('therapeutes')
    .select('siret')
    .eq('id', user.id)
    .single();

  // SIREN = 9 premiers chiffres du SIRET (14 chiffres)
  const rawSiret = (profile?.siret || '').replace(/\s/g, '');
  const siren = rawSiret.length >= 9 ? rawSiret.slice(0, 9) : '';

  await supabaseAdmin.from('therapeutes').update({
    superpdp_state: `${state}|${user.id}|${verifier}|${Date.now()}`,
  }).eq('id', user.id);

  const authParams: Record<string, string> = {
    response_type: 'code',
    client_id: SUPERPDP_CLIENT_ID,
    redirect_uri: redirectUri,
    state,
    scope: '',
    code_challenge: challenge,
    code_challenge_method: 'S256',
  };
  if (user.email) authParams.login_hint = user.email;
  if (siren) {
    authParams.superpdp_company_number = siren;
    authParams.superpdp_company_number_scheme = 'fr_siren';
  }

  const authUrl = `${SUPERPDP_API_URL}/oauth2/authorize?` + new URLSearchParams(authParams).toString();

  return NextResponse.json({ url: authUrl });
}
