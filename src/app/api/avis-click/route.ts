import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { buildReviewHref } from '@/lib/review-link';
import { env } from '@/lib/env';

// Enregistre le clic d'un patient sur le bouton « laisser mon avis Google ».
// Appelé via navigator.sendBeacon depuis la page facture : la requête survit à la
// navigation immédiate vers Google (cas mobile), là où un fetch classique serait annulé.
// Public (aucune auth) et idempotent : ne pose l'horodatage qu'une fois, sur un 5★.
export async function POST(request: Request) {
  try {
    const { factureId } = await request.json();
    if (typeof factureId !== 'string' || !/^[0-9a-f-]{36}$/i.test(factureId)) {
      return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 });
    }

    await supabaseAdmin
      .from('factures')
      .update({ avis_google_click_at: new Date().toISOString() })
      .eq('id', factureId)
      .eq('note', 5)
      .is('avis_google_click_at', null);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Variante GET : lien de redirection tracké utilisé dans l'email de relance J+3.
// Un email statique ne peut pas exécuter navigator.sendBeacon (POST ci-dessus), donc les
// clics venant de ce mail n'étaient jamais enregistrés — d'où ce point d'entrée dédié :
// on pose l'horodatage côté serveur puis on redirige vers Google (avec le même contournement
// des navigateurs intégrés que la page facture, via le User-Agent de la requête réelle).
export async function GET(request: Request) {
  const fallback = NextResponse.redirect(env.NEXT_PUBLIC_SITE_URL, { status: 302 });

  try {
    const { searchParams } = new URL(request.url);
    const factureId = searchParams.get('facture');
    if (!factureId || !/^[0-9a-f-]{36}$/i.test(factureId)) return fallback;

    const { data: facture } = await supabaseAdmin
      .from('factures')
      .select('id, cabinet_id, note')
      .eq('id', factureId)
      .single();
    if (!facture) return fallback;

    await supabaseAdmin
      .from('factures')
      .update({ avis_google_click_at: new Date().toISOString() })
      .eq('id', factureId)
      .eq('note', 5)
      .is('avis_google_click_at', null);

    const { data: cabinet } = await supabaseAdmin
      .from('cabinets')
      .select('lien_avis_google')
      .eq('id', facture.cabinet_id)
      .single();
    const lienAvis = cabinet?.lien_avis_google || '';
    if (!lienAvis.startsWith('http')) return fallback;

    const ua = request.headers.get('user-agent') || '';
    const { href } = buildReviewHref(lienAvis, ua);
    return NextResponse.redirect(href, { status: 302 });
  } catch {
    // En cas d'erreur (réseau, Supabase…), on ne laisse jamais le patient sur une 500 :
    // on le renvoie vers le site plutôt que de perdre le clic pour une erreur serveur.
    return fallback;
  }
}
