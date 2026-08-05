import { NextResponse } from 'next/server';
import { supabaseAdmin, escapeHtml } from '@/lib/supabase-admin';
import { env } from '@/lib/env';
import { sendRdvReminderEmail } from '@/lib/send-rdv-email';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const now = new Date();

    // Hygiène : les RDV passés encore "confirmé" basculent en "terminé"
    await supabaseAdmin
      .from('rendez_vous')
      .update({ statut: 'termine' })
      .eq('statut', 'confirme')
      .lt('date_fin', now.toISOString());

    // Bornes "demain" en heure de Paris (process.env.TZ forcé dans instrumentation.ts),
    // pas en UTC : sinon un RDV tôt le matin ou tard le soir tombe dans le mauvais jour
    // selon la saison (décalage hiver/été avec UTC).
    const tomorrowStart = new Date(now);
    tomorrowStart.setHours(0, 0, 0, 0);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    const { data: rdvs, error } = await supabaseAdmin
      .from('rendez_vous')
      .select('id, therapeute_id, patient_id, patient_email, patient_nom, date_debut, date_fin, mode')
      .gte('date_debut', tomorrowStart.toISOString())
      .lt('date_debut', tomorrowEnd.toISOString())
      .in('statut', ['confirme', 'en_attente'])
      .neq('patient_email', '')
      .eq('rappel_envoye', false);

    if (error) throw error;

    if (!rdvs || rdvs.length === 0) {
      return NextResponse.json({ message: 'Aucun rappel à envoyer aujourd\'hui.' });
    }

    let envoisReussis = 0;

    for (const rdv of rdvs) {
      const { data: therapeute } = await supabaseAdmin
        .from('therapeutes')
        .select('nom, email, visio_url, adresse_cabinet, instructions_acces')
        .eq('id', rdv.therapeute_id)
        .single();

      if (!therapeute) continue;

      let patientNom = rdv.patient_nom || 'à vous';
      if (rdv.patient_id) {
        const { data: patient } = await supabaseAdmin
          .from('patients')
          .select('nom_complet')
          .eq('id', rdv.patient_id)
          .single();
        if (patient?.nom_complet) patientNom = patient.nom_complet;
      }

      try {
        await sendRdvReminderEmail({
          to: rdv.patient_email,
          patientNom: escapeHtml(patientNom),
          therapeuteNom: escapeHtml(therapeute.nom),
          therapeuteEmail: therapeute.email || '',
          rdvId: rdv.id,
          dateDebutIso: rdv.date_debut,
          dateFinIso: rdv.date_fin,
          manageUrl: `${env.NEXT_PUBLIC_SITE_URL}/rdv/${rdv.id}`,
          visioUrl: rdv.mode === 'visio' ? therapeute.visio_url : undefined,
          adresse: therapeute.adresse_cabinet || undefined,
          instructionsAcces: therapeute.instructions_acces || undefined,
        });
        await supabaseAdmin.from('rendez_vous').update({ rappel_envoye: true }).eq('id', rdv.id);
        envoisReussis++;
      } catch (sendError) {
        console.error(`Rappel échoué pour RDV ${rdv.id}:`, sendError);
      }
    }

    return NextResponse.json({ message: `Succès : ${envoisReussis} rappel(s) de rendez-vous envoyé(s).` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi des rappels' }, { status: 500 });
  }
}
