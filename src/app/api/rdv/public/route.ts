import { NextResponse } from 'next/server';
import { supabaseAdmin, escapeHtml } from '@/lib/supabase-admin';
import { env } from '@/lib/env';
import { isSlotBookable, isOverlapConstraintError } from '@/lib/rdv-slots';
import {
  sendRdvConfirmationEmail,
  sendRdvCancelledByPatientEmail,
  sendRdvRescheduledByPatientEmail,
} from '@/lib/send-rdv-email';
import { notifyWaitlist } from '@/lib/waitlist';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

interface RdvRow {
  id: string;
  therapeute_id: string;
  patient_id: string | null;
  patient_email: string;
  titre: string;
  date_debut: string;
  date_fin: string;
  statut: 'confirme' | 'en_attente' | 'annule' | 'termine';
}

async function fetchRdv(id: string): Promise<RdvRow | null> {
  const { data, error } = await supabaseAdmin
    .from('rendez_vous')
    .select('id, therapeute_id, patient_id, patient_email, titre, date_debut, date_fin, statut')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data;
}

async function fetchPatientNom(patientId: string | null): Promise<string | undefined> {
  if (!patientId) return undefined;
  const { data } = await supabaseAdmin
    .from('patients')
    .select('nom_complet')
    .eq('id', patientId)
    .single();
  return data?.nom_complet || undefined;
}

// Au-delà de la limite fixée par le praticien (delaiAnnulationHeures), le patient ne peut
// plus agir en ligne — au-delà des cas déjà exclus (statut final, créneau déjà passé).
function editableReason(rdv: RdvRow, delaiAnnulationHeures: number): string | null {
  if (rdv.statut === 'annule' || rdv.statut === 'termine') return 'Ce rendez-vous ne peut plus être modifié en ligne.';
  const msRestants = new Date(rdv.date_debut).getTime() - Date.now();
  if (msRestants <= 0) return 'Ce rendez-vous ne peut plus être modifié en ligne.';
  if (delaiAnnulationHeures > 0 && msRestants < delaiAnnulationHeures * 3600000) {
    return `Ce rendez-vous est trop proche (moins de ${delaiAnnulationHeures}h) pour être modifié en ligne — merci de contacter directement le cabinet.`;
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Identifiant manquant' }, { status: 400 });

  const rdv = await fetchRdv(id);
  if (!rdv) return NextResponse.json({ error: 'Rendez-vous introuvable' }, { status: 404 });

  const { data: therapeute } = await supabaseAdmin
    .from('therapeutes')
    .select('nom, delai_annulation_heures')
    .eq('id', rdv.therapeute_id)
    .single();

  const delaiAnnulationHeures = therapeute?.delai_annulation_heures || 0;
  const reason = editableReason(rdv, delaiAnnulationHeures);
  // Date-limite exacte pour agir en ligne, affichée proactivement au patient (pas seulement
  // découverte quand il est déjà trop tard).
  const deadline = !reason && delaiAnnulationHeures > 0
    ? new Date(new Date(rdv.date_debut).getTime() - delaiAnnulationHeures * 3600000).toISOString()
    : null;

  return NextResponse.json({
    titre: escapeHtml(rdv.titre),
    date_debut: rdv.date_debut,
    date_fin: rdv.date_fin,
    deadline,
    statut: rdv.statut,
    editable: !reason,
    editableReason: reason,
    therapeute_nom: escapeHtml(therapeute?.nom || ''),
  });
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`rdv-public:${ip}`, 15, 5 * 60 * 1000)) {
      return NextResponse.json({ error: 'Trop de tentatives, merci de réessayer dans quelques minutes.' }, { status: 429 });
    }

    const { id, action, date, heureDebut } = await request.json();
    if (!id || !action) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const rdv = await fetchRdv(id);
    if (!rdv) return NextResponse.json({ error: 'Rendez-vous introuvable' }, { status: 404 });

    const { data: therapeute } = await supabaseAdmin
      .from('therapeutes')
      .select('nom, email, delai_annulation_heures, adresse_cabinet, instructions_acces')
      .eq('id', rdv.therapeute_id)
      .single();

    const blockedReason = editableReason(rdv, therapeute?.delai_annulation_heures || 0);
    if (blockedReason) {
      return NextResponse.json({ error: blockedReason }, { status: 409 });
    }

    const agendaUrl = `${env.NEXT_PUBLIC_SITE_URL}/dashboard/agenda`;

    if (action === 'annuler') {
      const { error: updError } = await supabaseAdmin.from('rendez_vous').update({ statut: 'annule' }).eq('id', id);
      if (updError) throw updError;
      await supabaseAdmin.from('consultations').delete().eq('rendez_vous_id', id);

      if (therapeute?.email) {
        const patientNom = await fetchPatientNom(rdv.patient_id);
        await sendRdvCancelledByPatientEmail(
          therapeute.email, escapeHtml(therapeute.nom), escapeHtml(rdv.titre), rdv.date_debut,
          agendaUrl, patientNom ? escapeHtml(patientNom) : undefined,
        ).catch((err) => console.error("[email RDV] Erreur:", err));
      }

      // Le créneau libéré peut intéresser la liste d'attente
      notifyWaitlist(rdv.therapeute_id, therapeute?.nom || 'votre praticien').catch((err) => console.error("[email RDV] Erreur:", err));

      return NextResponse.json({ success: true });
    }

    if (action === 'reprogrammer') {
      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof heureDebut !== 'string' || !/^\d{2}:\d{2}$/.test(heureDebut)) {
        return NextResponse.json({ error: 'Merci de renseigner la date et l\'heure.' }, { status: 400 });
      }
      // La durée du nouveau créneau reprend systématiquement celle du rendez-vous d'origine
      const dureeMs = new Date(rdv.date_fin).getTime() - new Date(rdv.date_debut).getTime();
      const newDebut = new Date(`${date}T${heureDebut}:00`);
      const newFin = new Date(newDebut.getTime() + dureeMs);

      // Refuse tout créneau hors horaires d'ouverture, passé ou en conflit
      const bookable = await isSlotBookable(rdv.therapeute_id, newDebut, newFin, id);
      if (!bookable.ok) {
        return NextResponse.json({ error: bookable.reason }, { status: 409 });
      }

      const oldDateDebut = rdv.date_debut;
      const { error: updError } = await supabaseAdmin
        .from('rendez_vous')
        .update({ date_debut: newDebut.toISOString(), date_fin: newFin.toISOString(), rappel_envoye: false })
        .eq('id', id);
      if (updError) {
        if (isOverlapConstraintError(updError)) {
          return NextResponse.json({ error: 'Ce créneau vient d\'être pris, merci d\'en choisir un autre.' }, { status: 409 });
        }
        throw updError;
      }

      await supabaseAdmin.from('consultations').update({ date_consultation: date }).eq('rendez_vous_id', id);

      const patientNom = await fetchPatientNom(rdv.patient_id);

      if (therapeute?.email) {
        await sendRdvRescheduledByPatientEmail(
          therapeute.email, escapeHtml(therapeute.nom), escapeHtml(rdv.titre), oldDateDebut, newDebut.toISOString(),
          agendaUrl, patientNom ? escapeHtml(patientNom) : undefined,
        ).catch((err) => console.error("[email RDV] Erreur:", err));
      }

      // Le patient reçoit une nouvelle confirmation avec le même lien de gestion
      if (rdv.patient_email) {
        const manageUrl = `${env.NEXT_PUBLIC_SITE_URL}/rdv/${rdv.id}`;
        await sendRdvConfirmationEmail({
          to: rdv.patient_email,
          patientNom: patientNom ? escapeHtml(patientNom) : 'à vous',
          therapeuteNom: escapeHtml(therapeute?.nom || 'votre praticien'),
          therapeuteEmail: therapeute?.email || '',
          rdvId: rdv.id,
          dateDebutIso: newDebut.toISOString(),
          dateFinIso: newFin.toISOString(),
          manageUrl,
          isReschedule: true,
          adresse: therapeute?.adresse_cabinet || undefined,
          instructionsAcces: therapeute?.instructions_acces || undefined,
          delaiAnnulationHeures: therapeute?.delai_annulation_heures || 0,
        }).catch((err) => console.error("[email RDV] Erreur:", err));
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    console.error('Erreur rdv/public:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
