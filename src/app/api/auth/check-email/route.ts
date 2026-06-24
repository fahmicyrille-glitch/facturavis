import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
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
