import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
