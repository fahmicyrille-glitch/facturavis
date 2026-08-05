import { NextResponse } from 'next/server';
import { isTherapeutePro } from '@/lib/supabase-admin';
import { computeAvailableSlots, resolveMotif } from '@/lib/rdv-slots';

// Créneaux disponibles pour un motif de consultation donné (durée résolue côté serveur).
// Séparé de GET /api/reserver pour ne calculer les créneaux qu'une fois le motif choisi —
// deux motifs de durées différentes chez le même praticien n'ont pas les mêmes disponibilités.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const praticienId = searchParams.get('praticien');
  const motifId = searchParams.get('motifId');
  if (!praticienId) return NextResponse.json({ error: 'Praticien manquant' }, { status: 400 });

  if (!(await isTherapeutePro(praticienId))) {
    return NextResponse.json({ error: 'Praticien introuvable' }, { status: 404 });
  }

  const motif = await resolveMotif(praticienId, motifId || null);
  if (!motif.ok) return NextResponse.json({ error: motif.reason }, { status: 400 });

  try {
    const jours = await computeAvailableSlots(praticienId, motif.dureeMinutes);
    return NextResponse.json({ dureeMinutes: motif.dureeMinutes, motifNom: motif.motifNom, jours });
  } catch (err) {
    console.error('Erreur créneaux réservation:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
