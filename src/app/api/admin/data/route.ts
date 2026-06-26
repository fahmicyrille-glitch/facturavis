import { NextResponse } from 'next/server';
import { supabaseAdmin, checkIsAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new NextResponse('Non autorisé', { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user || !checkIsAdmin(user.email)) {
      return new NextResponse('Accès refusé', { status: 403 });
    }

    const { data: therapeutes, error: tError } = await supabaseAdmin
      .from('therapeutes')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: factures, error: fError } = await supabaseAdmin
      .from('factures')
      .select('id, therapeute_id, note, created_at, statut_email');

    if (tError || fError) throw new Error(tError?.message || fError?.message);

    // Récupère les statuts de confirmation email depuis Supabase Auth
    const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const confirmedMap = new Map(authUsers.map(u => [u.id, !!u.email_confirmed_at]));

    const therapeutesWithConfirm = (therapeutes || []).map(t => ({
      ...t,
      email_confirmed: confirmedMap.get(t.id) ?? true,
    }));

    return NextResponse.json({ therapeutes: therapeutesWithConfirm, factures });
  } catch (error: any) {
    console.error("Erreur Admin Data:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
