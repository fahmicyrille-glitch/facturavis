import { NextResponse } from 'next/server';
import { supabaseAdmin, checkIsAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return new NextResponse('Non autorisé', { status: 401 });
  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user || !checkIsAdmin(user.email)) {
    return new NextResponse('Accès refusé', { status: 403 });
  }

  const { data: therapeutes } = await supabaseAdmin
    .from('therapeutes')
    .select('id, nom, email, iopole_status')
    .eq('iopole_status', 'active');

  const { data: totalRecues } = await supabaseAdmin
    .from('factures_recues')
    .select('id', { count: 'exact', head: true })
    .like('notes', 'superpdp:%');

  return NextResponse.json({
    syncIntervalHours: 3,
    activePractitioners: therapeutes?.length || 0,
    totalSyncedInvoices: totalRecues || 0,
    practitioners: therapeutes || [],
  });
}
