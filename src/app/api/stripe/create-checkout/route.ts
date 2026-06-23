import { NextResponse } from 'next/server';
import { requireStripe, PLANS } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { env } from '@/lib/env';

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

  try {
    const { plan } = await request.json();
    const planConfig = plan === 'founder' ? PLANS.FOUNDER : PLANS.STANDARD;

    const stripeClient = requireStripe();
    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: planConfig.priceId,
        quantity: 1,
      }],
      success_url: `${env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
      cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        plan: plan,
      },
      locale: 'fr',
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
