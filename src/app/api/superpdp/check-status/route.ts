import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const SUPERPDP_API_URL = process.env.SUPERPDP_API_URL || 'https://api.superpdp.tech';
const SUPERPDP_CLIENT_ID = process.env.SUPERPDP_CLIENT_ID_PUBLIC || process.env.SUPERPDP_CLIENT_ID || '';
const SUPERPDP_CLIENT_SECRET = process.env.SUPERPDP_CLIENT_SECRET_PUBLIC || '';


async function refreshToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${SUPERPDP_API_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: SUPERPDP_CLIENT_ID,
        ...(SUPERPDP_CLIENT_SECRET ? { client_secret: SUPERPDP_CLIENT_SECRET } : {}),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();

    return data.access_token || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new NextResponse('Non autorisé', { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  const { data: profile } = await supabaseAdmin
    .from('therapeutes')
    .select('iopole_status, superpdp_access_token, superpdp_refresh_token, superpdp_token_expires_at')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
  }

  // No SuperPDP tokens stored — nothing to check
  if (!profile.superpdp_access_token && !profile.superpdp_refresh_token) {
    return NextResponse.json({ status: profile.iopole_status, changed: false });
  }

  let accessToken: string = profile.superpdp_access_token || '';
  const expiresAt = profile.superpdp_token_expires_at
    ? new Date(profile.superpdp_token_expires_at).getTime()
    : 0;

  // Pre-emptive refresh if token is near expiry
  if ((!accessToken || Date.now() > expiresAt - 60_000) && profile.superpdp_refresh_token) {
    const newToken = await refreshToken(profile.superpdp_refresh_token);
    if (newToken) {
      accessToken = newToken;
      await supabaseAdmin.from('therapeutes').update({ superpdp_access_token: newToken }).eq('id', user.id);
    }
  }

  if (!accessToken) {
    return NextResponse.json({ status: profile.iopole_status, changed: false, error: 'Token indisponible' });
  }

  async function fetchSession(tkn: string): Promise<Response> {
    return fetch(`${SUPERPDP_API_URL}/v1.beta/oauth2_sessions/me`, {
      headers: { 'Authorization': `Bearer ${tkn}` },
    });
  }

  try {
    let sessionRes = await fetchSession(accessToken);

    // On 401 the token may be expired — try refresh once
    if (sessionRes.status === 401 && profile.superpdp_refresh_token) {
      console.log(`[check-status] Token expired, refreshing for user ${user.id}`);
      const newToken = await refreshToken(profile.superpdp_refresh_token);
      if (newToken) {
        accessToken = newToken;
        await supabaseAdmin.from('therapeutes').update({ superpdp_access_token: newToken }).eq('id', user.id);
        sessionRes = await fetchSession(accessToken);
      }
    }

    if (!sessionRes.ok) {
      const needsReauth = sessionRes.status === 401 || sessionRes.status === 403;
      console.warn(`[check-status] /oauth2_sessions/me returned ${sessionRes.status} for user ${user.id}`);
      return NextResponse.json({ status: profile.iopole_status, changed: false, needs_reauth: needsReauth });
    }

    const session = await sessionRes.json();
    const verificationStatus: string = session.company_verification_status || '';
    console.log(`[check-status] company_verification_status for user ${user.id}: ${verificationStatus}`);

    // verified = accès autorisé, portabilité confirmée
    // needs_review = en attente d'examen (ex: portabilité depuis un autre PDP)
    // failed = refusé
    const newStatus = verificationStatus === 'verified' ? 'active' : 'pending';

    if (newStatus !== profile.iopole_status) {
      await supabaseAdmin
        .from('therapeutes')
        .update({ iopole_status: newStatus })
        .eq('id', user.id);
      return NextResponse.json({ status: newStatus, changed: true, verificationStatus });
    }

    return NextResponse.json({ status: newStatus, changed: false, verificationStatus });
  } catch (err) {
    console.error(`[check-status] Error for user ${user.id}:`, err);
    return NextResponse.json({ status: profile.iopole_status, changed: false });
  }
}
