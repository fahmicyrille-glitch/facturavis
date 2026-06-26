import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const SUPERPDP_API_URL = process.env.SUPERPDP_API_URL || 'https://api.superpdp.tech';
const SUPERPDP_CLIENT_ID = process.env.SUPERPDP_CLIENT_ID_PUBLIC || process.env.SUPERPDP_CLIENT_ID || '';
const SUPERPDP_CLIENT_SECRET = process.env.SUPERPDP_CLIENT_SECRET_PUBLIC || '';

const STATE_MAX_AGE_MS = 10 * 60 * 1000;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://facturavis.fr';

  if (error) {
    return NextResponse.redirect(`${siteUrl}/dashboard/settings?reception=error&reason=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${siteUrl}/dashboard/settings?reception=error&reason=missing_params`);
  }

  // Find the user who initiated this flow by matching state
  const { data: therapeutes } = await supabaseAdmin
    .from('therapeutes')
    .select('id, superpdp_state')
    .like('superpdp_state', `${state}|%`);

  const match = therapeutes?.find(t => t.superpdp_state?.startsWith(`${state}|`));
  if (!match) {
    return NextResponse.redirect(`${siteUrl}/dashboard/settings?reception=error&reason=invalid_state`);
  }

  const stateParts = match.superpdp_state!.split('|');
  const userId = stateParts[1];
  const codeVerifier = stateParts[2] || '';
  const issuedAt = Number(stateParts[3] || 0);

  // Nullify le state au plus tôt : single-use, peu importe l'issue ensuite.
  await supabaseAdmin
    .from('therapeutes')
    .update({ superpdp_state: null })
    .eq('id', userId);

  if (!issuedAt || Date.now() - issuedAt > STATE_MAX_AGE_MS) {
    return NextResponse.redirect(`${siteUrl}/dashboard/settings?reception=error&reason=state_expired`);
  }

  try {
    // Exchange code for tokens
    const redirectUri = `${siteUrl}/api/superpdp/callback`;
    const tokenRes = await fetch(`${SUPERPDP_API_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: SUPERPDP_CLIENT_ID,
        ...(SUPERPDP_CLIENT_SECRET ? { client_secret: SUPERPDP_CLIENT_SECRET } : {}),
        redirect_uri: redirectUri,
        ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Super PDP token exchange failed:', errText);
      return NextResponse.redirect(`${siteUrl}/dashboard/settings?reception=error&reason=token_exchange`);
    }

    const tokens = await tokenRes.json();

    // Verify which company is linked by calling /companies/me
    let companyName = '';
    let companySiren = '';
    try {
      const meRes = await fetch(`${SUPERPDP_API_URL}/v1.beta/companies/me`, {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` },
      });
      if (meRes.ok) {
        const company = await meRes.json();
        companyName = company.formal_name || company.trade_name || '';
        companySiren = company.number || '';
      }
    } catch {
      // Non-blocking
    }

    // Store tokens and activate
    await supabaseAdmin.from('therapeutes').update({
      iopole_status: 'active',
      superpdp_access_token: tokens.access_token,
      superpdp_refresh_token: tokens.refresh_token || null,
      superpdp_token_expires_at: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      superpdp_company_name: companyName || null,
      superpdp_company_siren: companySiren || null,
    }).eq('id', userId);

    return NextResponse.redirect(`${siteUrl}/dashboard/settings?reception=success`);
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(`${siteUrl}/dashboard/settings?reception=error&reason=server_error`);
  }
}
