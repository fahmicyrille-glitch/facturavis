import { NextResponse } from 'next/server';
import { supabaseAdmin, checkIsAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new NextResponse('Non autorisé', { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user || !checkIsAdmin(user.email)) {
    return new NextResponse('Accès refusé', { status: 403 });
  }

  const iopoleApiKey = process.env.IOPOLE_API_KEY;
  const iopoleCustomerId = process.env.IOPOLE_CUSTOMER_ID;
  const iopoleBaseUrl = process.env.IOPOLE_API_URL || 'https://api.ppd.iopole.fr/v1';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://facturavis.fr';

  if (!iopoleApiKey) {
    return NextResponse.json({ error: 'IOPOLE_API_KEY non configurée' }, { status: 503 });
  }

  try {
    const webhookPayload = {
      endpoints: [
        {
          type: 'invoice',
          callback_url: `${siteUrl}/api/iopole/webhook`,
        },
        {
          type: 'status',
          callback_url: `${siteUrl}/api/iopole/webhook`,
        },
      ],
      authentication: {
        type: 'none',
      },
    };

    const res = await fetch(`${iopoleBaseUrl}/webhooks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${iopoleApiKey}`,
        'customer-id': iopoleCustomerId || '',
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    const responseText = await res.text();

    if (!res.ok) {
      return NextResponse.json({
        error: `Iopole ${res.status}: ${responseText}`,
        hint: 'Vérifiez IOPOLE_API_KEY et IOPOLE_CUSTOMER_ID',
      }, { status: res.status });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook enregistré sur Iopole',
      webhook_url: `${siteUrl}/api/iopole/webhook`,
      iopole_response: data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
