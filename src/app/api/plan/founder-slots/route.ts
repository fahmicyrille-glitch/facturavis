import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const FOUNDER_MAX_SLOTS = parseInt(process.env.FOUNDER_MAX_SLOTS || '50', 10);

export async function GET() {
  const { count } = await supabaseAdmin
    .from('therapeutes')
    .select('id', { count: 'exact', head: true })
    .eq('plan', 'founder')
    .in('subscription_status', ['active', 'trialing']);

  const taken = count ?? 0;
  const remaining = Math.max(0, FOUNDER_MAX_SLOTS - taken);

  return NextResponse.json({ taken, max: FOUNDER_MAX_SLOTS, remaining });
}
