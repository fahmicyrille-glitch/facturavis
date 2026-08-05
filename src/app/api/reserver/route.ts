import { NextResponse } from 'next/server';
import { supabaseAdmin, escapeHtml, isTherapeutePro } from '@/lib/supabase-admin';
import { env } from '@/lib/env';
import { isSlotBookable, isOverlapConstraintError, resolveMotif } from '@/lib/rdv-slots';
import { sendRdvConfirmationEmail, sendRdvBookedPraticienEmail } from '@/lib/send-rdv-email';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const praticienId = searchParams.get('praticien');
  if (!praticienId) return NextResponse.json({ error: 'Praticien manquant' }, { status: 400 });

  const { data: therapeute, error } = await supabaseAdmin
    .from('therapeutes')
    .select('id, nom, titre, logo_url, duree_consultation, visio_url, adresse_cabinet, bio, delai_annulation_heures')
    .eq('id', praticienId)
    .single();
  if (error || !therapeute) return NextResponse.json({ error: 'Praticien introuvable' }, { status: 404 });

  // Un compte non-Pro n'expose pas de page de réservation en ligne : même réponse que
  // "praticien introuvable" pour ne pas révéler publiquement le statut d'abonnement.
  if (!(await isTherapeutePro(therapeute.id))) {
    return NextResponse.json({ error: 'Praticien introuvable' }, { status: 404 });
  }

  const { data: motifsData } = await supabaseAdmin
    .from('motifs_consultation')
    .select('id, nom, duree_minutes')
    .eq('therapeute_id', therapeute.id)
    .eq('actif', true)
    .order('ordre', { ascending: true });

  // Tant que le praticien n'a configuré aucun motif, on propose un motif générique implicite
  // basé sur sa durée de consultation par défaut, pour ne pas casser la réservation en ligne.
  const motifs = motifsData && motifsData.length > 0
    ? motifsData.map((m) => ({ id: m.id, nom: escapeHtml(m.nom), dureeMinutes: m.duree_minutes }))
    : [{ id: null, nom: 'Consultation', dureeMinutes: therapeute.duree_consultation || 60 }];

  return NextResponse.json({
    nom: escapeHtml(therapeute.nom),
    titre: escapeHtml(therapeute.titre || ''),
    logo_url: therapeute.logo_url || '',
    adresse: escapeHtml(therapeute.adresse_cabinet || ''),
    bio: escapeHtml(therapeute.bio || ''),
    visioDisponible: !!therapeute.visio_url,
    delaiAnnulationHeures: therapeute.delai_annulation_heures || 0,
    motifs,
  });
}

export async function POST(request: Request) {
  try {
    const { praticienId, action, nom, email, telephone, date, heure, mode, motifId, precisions } = await request.json();
    if (!praticienId || !action) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const ip = getClientIp(request);
    if (!rateLimit(`reserver:${ip}`, 10, 5 * 60 * 1000)) {
      return NextResponse.json({ error: 'Trop de tentatives, merci de réessayer dans quelques minutes.' }, { status: 429 });
    }

    const { data: therapeute, error: therError } = await supabaseAdmin
      .from('therapeutes')
      .select('id, nom, email, visio_url, adresse_cabinet, instructions_acces, delai_annulation_heures')
      .eq('id', praticienId)
      .single();
    if (therError || !therapeute) return NextResponse.json({ error: 'Praticien introuvable' }, { status: 404 });

    if (!(await isTherapeutePro(therapeute.id))) {
      return NextResponse.json({ error: 'Praticien introuvable' }, { status: 404 });
    }

    const cleanNom = typeof nom === 'string' ? nom.trim().slice(0, 120) : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase().slice(0, 200) : '';
    if (!cleanNom || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Merci de renseigner un nom et un email valides.' }, { status: 400 });
    }
    const cleanTel = typeof telephone === 'string' ? telephone.trim().slice(0, 30) : '';

    if (action === 'attente') {
      // Idempotent : un email déjà en attente (non notifié) n'est pas réinscrit
      const { data: existing } = await supabaseAdmin
        .from('liste_attente')
        .select('id')
        .eq('therapeute_id', therapeute.id)
        .eq('email', cleanEmail)
        .eq('notifie', false)
        .limit(1);
      if (existing && existing.length > 0) {
        return NextResponse.json({ success: true });
      }
      const { error: insError } = await supabaseAdmin.from('liste_attente').insert([{
        therapeute_id: therapeute.id,
        nom: cleanNom,
        email: cleanEmail,
        telephone: cleanTel,
      }]);
      if (insError) throw insError;
      return NextResponse.json({ success: true });
    }

    if (action === 'reserver') {
      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof heure !== 'string' || !/^\d{2}:\d{2}$/.test(heure)) {
        return NextResponse.json({ error: 'Merci de choisir un créneau.' }, { status: 400 });
      }

      // Durée résolue côté serveur à partir du motif choisi — jamais depuis une valeur cliente
      const motif = await resolveMotif(therapeute.id, typeof motifId === 'string' ? motifId : null);
      if (!motif.ok) return NextResponse.json({ error: motif.reason }, { status: 400 });

      const debut = new Date(`${date}T${heure}:00`);
      const fin = new Date(debut.getTime() + motif.dureeMinutes * 60000);

      // Refuse tout créneau hors horaires d'ouverture, passé ou en conflit —
      // même si la requête est forgée en dehors des créneaux proposés par l'UI
      const bookable = await isSlotBookable(therapeute.id, debut, fin);
      if (!bookable.ok) {
        return NextResponse.json({ error: bookable.reason }, { status: 409 });
      }

      const rdvMode = mode === 'visio' && therapeute.visio_url ? 'visio' : 'cabinet';
      const cleanPrecisions = typeof precisions === 'string' ? precisions.trim().slice(0, 500) : '';

      const { data: rdv, error: insError } = await supabaseAdmin.from('rendez_vous').insert([{
        therapeute_id: therapeute.id,
        titre: motif.motifNom,
        motif_id: motif.motifId,
        motif_nom: motif.motifNom,
        date_debut: debut.toISOString(),
        date_fin: fin.toISOString(),
        statut: 'confirme',
        notes: cleanPrecisions ? `Réservé en ligne. Précisions : ${cleanPrecisions}` : 'Réservé en ligne.',
        patient_nom: cleanNom,
        patient_email: cleanEmail,
        patient_telephone: cleanTel,
        mode: rdvMode,
      }]).select().single();
      if (insError) {
        // Filet de sécurité DB : deux réservations strictement simultanées
        if (isOverlapConstraintError(insError)) {
          return NextResponse.json({ error: 'Ce créneau vient d\'être pris, merci d\'en choisir un autre.' }, { status: 409 });
        }
        throw insError;
      }

      const manageUrl = `${env.NEXT_PUBLIC_SITE_URL}/rdv/${rdv.id}`;
      const agendaUrl = `${env.NEXT_PUBLIC_SITE_URL}/dashboard/agenda`;

      await sendRdvConfirmationEmail({
        to: cleanEmail,
        patientNom: escapeHtml(cleanNom),
        therapeuteNom: escapeHtml(therapeute.nom),
        therapeuteEmail: therapeute.email || '',
        rdvId: rdv.id,
        dateDebutIso: rdv.date_debut,
        dateFinIso: rdv.date_fin,
        manageUrl,
        visioUrl: rdvMode === 'visio' ? therapeute.visio_url : undefined,
        adresse: therapeute.adresse_cabinet || undefined,
        instructionsAcces: therapeute.instructions_acces || undefined,
        delaiAnnulationHeures: therapeute.delai_annulation_heures || 0,
      }).catch((err) => console.error("[email RDV] Erreur:", err));

      if (therapeute.email) {
        await sendRdvBookedPraticienEmail(
          therapeute.email,
          escapeHtml(therapeute.nom),
          escapeHtml(cleanNom),
          escapeHtml(cleanEmail),
          escapeHtml(cleanTel),
          rdv.date_debut,
          rdv.date_fin,
          rdvMode,
          agendaUrl,
          rdvMode === 'visio' ? therapeute.visio_url : undefined,
        ).catch((err) => console.error("[email RDV] Erreur:", err));
      }

      return NextResponse.json({ success: true, rdvId: rdv.id });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    console.error('Erreur réservation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
