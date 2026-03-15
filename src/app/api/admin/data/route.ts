import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new NextResponse('Non autorisé', { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return new NextResponse('Accès refusé', { status: 403 });
    }

    // Le God Mode : On prend tout sans restriction
    const { data: therapeutes } = await supabaseAdmin.from('therapeutes').select('*').order('created_at', { ascending: false });
    const { data: factures } = await supabaseAdmin.from('factures').select('id, therapeute_id, note, created_at, statut_email');

    return NextResponse.json({ therapeutes, factures });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
