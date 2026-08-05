import { NextResponse } from 'next/server';
import { supabaseAdmin, escapeHtml } from '@/lib/supabase-admin';
import { env } from '@/lib/env';
import { sendRdvConfirmationEmail } from '@/lib/send-rdv-email';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { rdvId } = await request.json();
    if (!rdvId) {
      return NextResponse.json({ error: 'Identifiant manquant' }, { status: 400 });
    }

    const { data: rdv, error: rdvError } = await supabaseAdmin
      .from('rendez_vous')
      .select('id, therapeute_id, patient_email, patient_id, date_debut, date_fin, mode')
      .eq('id', rdvId)
      .eq('therapeute_id', user.id)
      .single();

    if (rdvError || !rdv || !rdv.patient_email) {
      return NextResponse.json({ error: 'Rendez-vous introuvable ou sans email' }, { status: 404 });
    }

    const { data: therapeute } = await supabaseAdmin
      .from('therapeutes')
      .select('nom, email, visio_url, adresse_cabinet, instructions_acces, delai_annulation_heures')
      .eq('id', user.id)
      .single();

    let patientNom = 'à vous';
    if (rdv.patient_id) {
      const { data: patient } = await supabaseAdmin
        .from('patients')
        .select('nom_complet')
        .eq('id', rdv.patient_id)
        .single();
      if (patient?.nom_complet) patientNom = patient.nom_complet;
    }

    const manageUrl = `${env.NEXT_PUBLIC_SITE_URL}/rdv/${rdv.id}`;

    await sendRdvConfirmationEmail({
      to: rdv.patient_email,
      patientNom: escapeHtml(patientNom),
      therapeuteNom: escapeHtml(therapeute?.nom || 'votre praticien'),
      therapeuteEmail: therapeute?.email || '',
      rdvId: rdv.id,
      dateDebutIso: rdv.date_debut,
      dateFinIso: rdv.date_fin,
      manageUrl,
      visioUrl: rdv.mode === 'visio' ? therapeute?.visio_url : undefined,
      adresse: therapeute?.adresse_cabinet || undefined,
      instructionsAcces: therapeute?.instructions_acces || undefined,
      delaiAnnulationHeures: therapeute?.delai_annulation_heures || 0,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur send-confirmation RDV:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
