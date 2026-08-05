import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { buildAgendaIcsFeed } from '@/lib/ics';

// Flux ICS public mais protégé par un jeton opaque (calendar_feed_token) — c'est le même
// modèle de sécurité que Google Calendar utilise pour ses propres liens d'abonnement privés.
// Permet au praticien d'abonner son Google Calendar / Apple Calendar perso à son agenda
// FacturAvis (RDV patients + indisponibilités), sans authentification interactive.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token) return new NextResponse('Introuvable', { status: 404 });

  const { data: therapeute } = await supabaseAdmin
    .from('therapeutes')
    .select('id, nom, adresse_cabinet')
    .eq('calendar_feed_token', token)
    .single();
  if (!therapeute) return new NextResponse('Introuvable', { status: 404 });

  // Fenêtre raisonnable : passé récent (RDV qui viennent de se terminer) à 6 mois à l'avance —
  // évite un flux qui grossit indéfiniment avec des années d'historique.
  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - 30);
  const rangeEnd = new Date();
  rangeEnd.setDate(rangeEnd.getDate() + 180);

  const { data: rdvs, error } = await supabaseAdmin
    .from('rendez_vous')
    .select('id, patient_id, patient_nom, titre, date_debut, date_fin, mode, type, notes')
    .eq('therapeute_id', therapeute.id)
    .neq('statut', 'annule')
    .gte('date_debut', rangeStart.toISOString())
    .lte('date_debut', rangeEnd.toISOString())
    .order('date_debut', { ascending: true });
  if (error) return new NextResponse('Erreur serveur', { status: 500 });

  // Les RDV créés depuis le dashboard ne stockent pas toujours patient_nom (seulement
  // patient_id) : un lot de recherche unique évite une requête par ligne.
  const patientIds = Array.from(new Set((rdvs || []).map((r) => r.patient_id).filter((id): id is string => !!id)));
  let patientNoms: Record<string, string> = {};
  if (patientIds.length > 0) {
    const { data: patients } = await supabaseAdmin.from('patients').select('id, nom_complet').in('id', patientIds);
    patientNoms = Object.fromEntries((patients || []).map((p) => [p.id, p.nom_complet]));
  }

  const events = (rdvs || []).map((r) => {
    const isIndispo = r.type === 'indisponibilite';
    const nomPatient = isIndispo ? '' : (r.patient_nom || (r.patient_id ? patientNoms[r.patient_id] : '') || '');
    const summary = isIndispo
      ? `🚫 ${r.titre || 'Indisponible'}`
      : (nomPatient ? `${r.titre || 'Consultation'} — ${nomPatient}` : (r.titre || 'Consultation'));
    return {
      uid: r.id,
      summary,
      description: r.notes || '',
      location: !isIndispo && r.mode === 'cabinet' ? (therapeute.adresse_cabinet || '') : '',
      startIso: r.date_debut,
      endIso: r.date_fin,
    };
  });

  const ics = buildAgendaIcsFeed(`Agenda ${therapeute.nom} — FacturAvis`, events);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="agenda-facturavis.ics"',
      'Cache-Control': 'no-cache',
    },
  });
}
