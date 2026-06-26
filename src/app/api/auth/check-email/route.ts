import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { rateLimit, getClientIp, isAllowedOrigin } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 });
    }

    const ip = getClientIp(request);
    if (!rateLimit(`check-email:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
    }

    const { email } = await request.json();
    if (!email) return NextResponse.json({ exists: false });

    const { data } = await supabaseAdmin
      .from('therapeutes')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    return NextResponse.json({ exists: data && data.length > 0 });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
