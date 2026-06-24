import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

  const { data: therapeute } = await supabaseAdmin
    .from('therapeutes')
    .select('plan, trial_ends_at')
    .eq('id', user.id)
    .single();

  if (!therapeute) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
  }

  if (therapeute.plan === 'founder' || therapeute.plan === 'standard') {
    return NextResponse.json({ error: 'Vous avez déjà un abonnement actif' }, { status: 400 });
  }

  if (therapeute.trial_ends_at) {
    return NextResponse.json({ error: 'Vous avez déjà utilisé votre essai gratuit' }, { status: 400 });
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  await supabaseAdmin.from('therapeutes').update({
    plan: 'trial',
    trial_ends_at: trialEndsAt.toISOString(),
  }).eq('id', user.id);

  return NextResponse.json({
    success: true,
    plan: 'trial',
    trial_ends_at: trialEndsAt.toISOString(),
    message: 'Essai Pro activé pour 14 jours !',
  });
}
