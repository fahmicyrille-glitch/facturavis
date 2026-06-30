import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { refreshUserToken } from '@/lib/superpdp';
import { sendClientSuperPDPStatusEmail, sendAdminSuperPDPStatusEmail } from '@/lib/send-notification-email';

const SUPERPDP_API_URL = process.env.SUPERPDP_API_URL || 'https://api.superpdp.tech';

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
    .select('iopole_status, nom, email, superpdp_access_token, superpdp_refresh_token, superpdp_token_expires_at')
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
      const refreshed = await refreshUserToken(profile.superpdp_refresh_token);
      if (refreshed) {
        accessToken = refreshed.access_token;
        await supabaseAdmin.from('therapeutes').update({
          superpdp_access_token: refreshed.access_token,
          superpdp_token_expires_at: new Date(refreshed.expires_at).toISOString(),
          ...(refreshed.refresh_token ? { superpdp_refresh_token: refreshed.refresh_token } : {}),
        }).eq('id', user.id);
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
    const userIdentityStatus: string = session.user_identity_verification_status || 'not_verified';
    console.log(`[check-status] user=${user.id} company=${verificationStatus} identity=${userIdentityStatus}`);

    // verified     → active  (portabilité confirmée, accès complet)
    // needs_review → pending (portabilité en attente, examen manuel)
    // failed       → failed  (refusé par SuperPDP — doit recommencer)
    const newStatus = verificationStatus === 'verified' ? 'active'
      : verificationStatus === 'failed' ? 'failed'
      : 'pending';

    if (newStatus !== profile.iopole_status) {
      await supabaseAdmin
        .from('therapeutes')
        .update({ iopole_status: newStatus })
        .eq('id', user.id);

      // Notifications email (non-bloquantes)
      const clientEmail = profile.email || user.email || '';
      const clientName = profile.nom || clientEmail;
      const emailTasks: Promise<void>[] = [
        sendAdminSuperPDPStatusEmail(clientName, clientEmail, profile.iopole_status, newStatus),
      ];
      if (newStatus === 'active' || newStatus === 'failed') {
        emailTasks.push(sendClientSuperPDPStatusEmail(clientEmail, clientName, newStatus as 'active' | 'failed'));
      }
      Promise.all(emailTasks).catch(err => console.error('[check-status] Email notification error:', err));

      return NextResponse.json({ status: newStatus, changed: true, verificationStatus, userIdentityStatus });
    }

    return NextResponse.json({ status: newStatus, changed: false, verificationStatus, userIdentityStatus });
  } catch (err) {
    console.error(`[check-status] Error for user ${user.id}:`, err);
    return NextResponse.json({ status: profile.iopole_status, changed: false });
  }
}
