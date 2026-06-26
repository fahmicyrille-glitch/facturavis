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

  await supabaseAdmin.from('therapeutes').update({
    superpdp_state: `${state}|${user.id}|${verifier}|${Date.now()}`,
  }).eq('id', user.id);

  const authUrl = `${SUPERPDP_API_URL}/oauth2/authorize?` + new URLSearchParams({
    response_type: 'code',
    client_id: SUPERPDP_CLIENT_ID,
    redirect_uri: redirectUri,
    state,
    scope: '',
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }).toString();

  return NextResponse.json({ url: authUrl });
}
