import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { computeAvailableSlots } from '@/lib/rdv-slots';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Identifiant manquant' }, { status: 400 });

  const { data: rdv, error } = await supabaseAdmin
    .from('rendez_vous')
    .select('id, therapeute_id, date_debut, date_fin, statut')
    .eq('id', id)
    .single();
  if (error || !rdv) return NextResponse.json({ error: 'Rendez-vous introuvable' }, { status: 404 });

  if (rdv.statut === 'annule' || rdv.statut === 'termine') {
    return NextResponse.json({ error: 'Ce rendez-vous ne peut plus être modifié.' }, { status: 409 });
  }

  const dureeMs = new Date(rdv.date_fin).getTime() - new Date(rdv.date_debut).getTime();
  const dureeMinutes = Math.round(dureeMs / 60000);

  try {
    const jours = await computeAvailableSlots(rdv.therapeute_id, dureeMinutes, rdv.id);
    return NextResponse.json({ dureeMinutes, jours });
  } catch (err) {
    console.error('Erreur calcul créneaux:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
