import { NextResponse } from 'next/server';
import { supabaseAdmin, escapeHtml } from '@/lib/supabase-admin';
import { env } from '@/lib/env';
import { sendRdvCancelledByPraticienEmail } from '@/lib/send-rdv-email';
import { notifyWaitlist } from '@/lib/waitlist';

// Suppression d'un RDV par le praticien : le patient est prévenu par email
// (s'il a un email et que le RDV était à venir), puis la liste d'attente est alertée.
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { rdvId } = await request.json();
    if (!rdvId) return NextResponse.json({ error: 'Identifiant manquant' }, { status: 400 });

    const { data: rdv, error: rdvError } = await supabaseAdmin
      .from('rendez_vous')
      .select('id, therapeute_id, patient_id, patient_nom, patient_email, date_debut, statut')
      .eq('id', rdvId)
      .eq('therapeute_id', user.id)
      .single();
    if (rdvError || !rdv) return NextResponse.json({ error: 'Rendez-vous introuvable' }, { status: 404 });

    const { error: delError } = await supabaseAdmin
      .from('rendez_vous')
      .delete()
      .eq('id', rdvId)
      .eq('therapeute_id', user.id);
    if (delError) throw delError;

    const estFutur = new Date(rdv.date_debut).getTime() > Date.now();
    const etaitActif = rdv.statut !== 'annule' && rdv.statut !== 'termine';

    // Un créneau qui se libère dans le futur (RDV patient supprimé OU indisponibilité levée)
    // intéresse la liste d'attente dans les deux cas — seul l'email direct au patient
    // nécessite qu'il y en ait un.
    if (estFutur && etaitActif) {
      const { data: therapeute } = await supabaseAdmin
        .from('therapeutes')
        .select('nom')
        .eq('id', user.id)
        .single();

      if (rdv.patient_email) {
        let patientNom = rdv.patient_nom || '';
        if (!patientNom && rdv.patient_id) {
          const { data: patient } = await supabaseAdmin
            .from('patients')
            .select('nom_complet')
            .eq('id', rdv.patient_id)
            .single();
          patientNom = patient?.nom_complet || '';
        }

        await sendRdvCancelledByPraticienEmail(
          rdv.patient_email,
          escapeHtml(patientNom),
          escapeHtml(therapeute?.nom || 'votre praticien'),
          rdv.date_debut,
          `${env.NEXT_PUBLIC_SITE_URL}/reserver/${user.id}`,
        ).catch((err) => console.error('[email RDV] Erreur:', err));
      }

      notifyWaitlist(user.id, therapeute?.nom || 'votre praticien').catch((err) => console.error('[email RDV] Erreur:', err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur annulation praticien:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
