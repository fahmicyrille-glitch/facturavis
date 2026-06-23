import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isIopoleConfigured } from '@/lib/iopole';

const IOPOLE_BASE_URL = process.env.IOPOLE_API_URL || 'https://api.ppd.iopole.fr';
const IOPOLE_TOKEN_URL = process.env.IOPOLE_TOKEN_URL || 'https://auth.ppd.iopole.fr/realms/iopole/protocol/openid-connect/token';
const IOPOLE_CLIENT_ID = process.env.IOPOLE_CLIENT_ID || '';
const IOPOLE_CLIENT_SECRET = process.env.IOPOLE_CLIENT_SECRET || '';
const IOPOLE_CUSTOMER_ID = process.env.IOPOLE_CUSTOMER_ID || '';

async function getToken(): Promise<string> {
  const res = await fetch(IOPOLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: IOPOLE_CLIENT_ID,
      client_secret: IOPOLE_CLIENT_SECRET,
    }),
  });
  const data = await res.json();
  return data.access_token;
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

  if (!isIopoleConfigured()) {
    return NextResponse.json({ error: 'Service de réception non disponible pour le moment' }, { status: 503 });
  }

  try {
    const { siret, nom, email } = await request.json();

    if (!siret || !/^\d{14}$/.test(siret)) {
      return NextResponse.json({ error: 'SIRET invalide (14 chiffres requis)' }, { status: 400 });
    }

    const iopoleToken = await getToken();

    const onboardingPayload = {
      identifierScheme: '0002',
      identifierValue: siret,
      name: nom || 'Praticien',
      contactEmail: email || user.email,
    };

    const res = await fetch(`${IOPOLE_BASE_URL}/v1/onboarding`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${iopoleToken}`,
        'customer-id': IOPOLE_CUSTOMER_ID,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(onboardingPayload),
    });

    const responseText = await res.text();

    if (!res.ok) {
      if (res.status === 409) {
        await supabaseAdmin.from('therapeutes')
          .update({ iopole_status: 'active' })
          .eq('id', user.id);
        return NextResponse.json({
          success: true,
          message: 'Ce SIRET est déjà enregistré sur la plateforme.',
          status: 'active',
        });
      }

      return NextResponse.json({
        error: `Erreur Iopole (${res.status}): ${responseText}`,
      }, { status: res.status });
    }

    await supabaseAdmin.from('therapeutes')
      .update({ iopole_status: 'pending' })
      .eq('id', user.id);

    let data;
    try { data = JSON.parse(responseText); } catch { data = { raw: responseText }; }

    return NextResponse.json({
      success: true,
      message: 'Demande d\'enregistrement envoyée. Vérifiez votre email.',
      enrollmentId: data.enrollmentId || data.id,
      status: 'pending',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur onboarding Iopole:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
