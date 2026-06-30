import { NextResponse } from 'next/server';
import { requireStripe, PLANS } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { env } from '@/lib/env';
import { sendAdminNewSignupEmail } from '@/lib/send-notification-email';

export async function POST(request: Request) {
  try {
    const { email, password, nom, prenom, telephone, profession } = await request.json();

    if (!email || !password || !nom) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
    }

    // Créer le compte Supabase via admin (email_confirm: true = pas de vérification email requise)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    });

    if (userError) {
      if (userError.message.toLowerCase().includes('already') || userError.message.toLowerCase().includes('registered')) {
        return NextResponse.json({ error: 'Un compte existe déjà avec cet email. Connectez-vous.' }, { status: 409 });
      }
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    if (!userData.user) {
      return NextResponse.json({ error: 'Erreur lors de la création du compte.' }, { status: 500 });
    }

    const userId = userData.user.id;
    const fullName = `${prenom?.trim() || ''} ${nom?.trim() || ''}`.trim();

    // Créer le profil thérapeute
    await supabaseAdmin.from('therapeutes').insert([{
      id: userId,
      email: email.trim().toLowerCase(),
      nom: fullName,
      titre: profession?.trim() || '',
      telephone: telephone?.trim() || '',
      plan: 'free', // mis à jour par le webhook Stripe après paiement
    }]);

    // Notification admin
    sendAdminNewSignupEmail(fullName || email, email.trim().toLowerCase(), 'fondateur (en attente paiement)')
      .catch(err => console.error('[fondateur/checkout] Admin email error:', err));

    // Créer la session Stripe Checkout pour le plan Fondateur
    const stripeClient = requireStripe();
    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: PLANS.FOUNDER.priceId,
        quantity: 1,
      }],
      success_url: `${env.NEXT_PUBLIC_SITE_URL}/merci`,
      cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/fondateur`,
      customer_email: email.trim().toLowerCase(),
      metadata: {
        userId,
        plan: 'founder',
      },
      locale: 'fr',
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
