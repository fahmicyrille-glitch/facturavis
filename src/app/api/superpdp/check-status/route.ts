import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const SUPERPDP_API_URL = process.env.SUPERPDP_API_URL || 'https://api.superpdp.tech';
const SUPERPDP_CLIENT_ID = process.env.SUPERPDP_CLIENT_ID_PUBLIC || process.env.SUPERPDP_CLIENT_ID || '';
const SUPERPDP_CLIENT_SECRET = process.env.SUPERPDP_CLIENT_SECRET_PUBLIC || '';

const ACTIVE_STATUSES = ['validated', 'active', 'approved', 'enabled'];

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

  // Only check if still pending
  if (profile.iopole_status === 'active') {
    return NextResponse.json({ status: 'active', changed: false });
  }

  if (!profile.superpdp_access_token && !profile.superpdp_refresh_token) {
    return NextResponse.json({ status: profile.iopole_status, changed: false });
  }

  // Refresh token if expired
  let accessToken: string = profile.superpdp_access_token || '';
  const expiresAt = profile.superpdp_token_expires_at
    ? new Date(profile.superpdp_token_expires_at).getTime()
    : 0;

  if ((!accessToken || Date.now() > expiresAt - 60_000) && profile.superpdp_refresh_token) {
    const newToken = await refreshToken(profile.superpdp_refresh_token);
    if (newToken) {
      accessToken = newToken;
      await supabaseAdmin
        .from('therapeutes')
        .update({ superpdp_access_token: newToken })
        .eq('id', user.id);
    }
  }

  if (!accessToken) {
    return NextResponse.json({ status: profile.iopole_status, changed: false, error: 'Token indisponible' });
  }

  // Check current status with SuperPDP
  try {
    const meRes = await fetch(`${SUPERPDP_API_URL}/v1.beta/companies/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!meRes.ok) {
      return NextResponse.json({ status: profile.iopole_status, changed: false });
    }

    const company = await meRes.json();
    const rawStatus: string = (
      company.status || company.validation_status || company.kyb_status || ''
    ).toLowerCase();

    const newStatus = ACTIVE_STATUSES.includes(rawStatus) ? 'active' : 'pending';

    if (newStatus !== profile.iopole_status) {
      await supabaseAdmin
        .from('therapeutes')
        .update({ iopole_status: newStatus })
        .eq('id', user.id);

      return NextResponse.json({ status: newStatus, changed: true });
    }

    return NextResponse.json({ status: newStatus, changed: false });
  } catch {
    return NextResponse.json({ status: profile.iopole_status, changed: false });
  }
}
