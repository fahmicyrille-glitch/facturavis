import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { refreshUserToken } from '@/lib/superpdp';

const SUPERPDP_API_URL = process.env.SUPERPDP_API_URL || 'https://api.superpdp.tech';

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

  const url = new URL(request.url);
  const invoiceId = url.searchParams.get('id');
  if (!invoiceId || !/^\d+$/.test(invoiceId)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from('therapeutes')
    .select('superpdp_access_token, superpdp_refresh_token, superpdp_token_expires_at')
    .eq('id', user.id)
    .single();

  if (!profile?.superpdp_access_token && !profile?.superpdp_refresh_token) {
    return NextResponse.json({ error: 'Non connecté à SuperPDP' }, { status: 403 });
  }

  let accessToken = profile.superpdp_access_token || '';
  const expiresAt = profile.superpdp_token_expires_at
    ? new Date(profile.superpdp_token_expires_at).getTime() : 0;

  if ((!accessToken || Date.now() > expiresAt - 60_000) && profile.superpdp_refresh_token) {
    const refreshed = await refreshUserToken(profile.superpdp_refresh_token);
    if (refreshed) {
      accessToken = refreshed.access_token;
      await supabaseAdmin.from('therapeutes').update({
        superpdp_access_token: refreshed.access_token,
        superpdp_token_expires_at: new Date(refreshed.expires_at).toISOString(),
        ...(refreshed.refresh_token ? { superpdp_refresh_token: refreshed.refresh_token } : {}),
      }).eq('id', user.id);
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Token indisponible' }, { status: 403 });
  }

  // Fetch the invoice with its events embedded
  const res = await fetch(`${SUPERPDP_API_URL}/v1.beta/invoices/${invoiceId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: `SuperPDP: ${res.status}` }, { status: res.status });
  }

  const invoice = await res.json();
  const events: { status_code: string; status_text: string; created_at?: string; details?: string }[] =
    invoice.events || invoice.invoice_events || [];

  return NextResponse.json({ events });
}
