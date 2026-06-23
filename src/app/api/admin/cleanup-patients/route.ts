import { NextResponse } from 'next/server';
import { supabaseAdmin, checkIsAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new NextResponse('Non autorisé', { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user || !checkIsAdmin(user.email)) {
    return new NextResponse('Accès refusé', { status: 403 });
  }

  try {
    // Find patients with double civilité prefix
    const { data: allPatients, error } = await supabaseAdmin
      .from('patients')
      .select('*');

    if (error) throw error;

    let merged = 0;

    for (const patient of allPatients || []) {
      let correctedName: string | null = null;

      if (patient.nom_complet.startsWith('Mme Mme ')) {
        correctedName = patient.nom_complet.replace('Mme Mme ', 'Mme ');
      } else if (patient.nom_complet.startsWith('M. M. ')) {
        correctedName = patient.nom_complet.replace('M. M. ', 'M. ');
      }

      if (!correctedName) continue;

      // Find the correct patient
      const correctPatient = allPatients?.find(p =>
        p.id !== patient.id &&
        p.nom_complet === correctedName &&
        p.email.toLowerCase() === patient.email.toLowerCase() &&
        p.therapeute_id === patient.therapeute_id
      );

      if (correctPatient) {
        // Move all factures from duplicate to correct
        await supabaseAdmin
          .from('factures')
          .update({ patient_nom: correctedName })
          .eq('patient_nom', patient.nom_complet)
          .eq('therapeute_id', patient.therapeute_id);

        // Merge notes
        if (patient.notes_consultation && patient.notes_consultation.trim()) {
          const mergedNotes = [correctPatient.notes_consultation, patient.notes_consultation]
            .filter(Boolean)
            .join('\n\n--- Notes fusionnées ---\n\n');

          await supabaseAdmin
            .from('patients')
            .update({ notes_consultation: mergedNotes })
            .eq('id', correctPatient.id);
        }

        // Merge phone/address if missing on correct
        const updates: Record<string, string> = {};
        if (!correctPatient.telephone && patient.telephone) updates.telephone = patient.telephone;
        if (!correctPatient.adresse && patient.adresse) updates.adresse = patient.adresse;
        if (!correctPatient.num_secu && patient.num_secu) updates.num_secu = patient.num_secu;
        if (Object.keys(updates).length > 0) {
          await supabaseAdmin.from('patients').update(updates).eq('id', correctPatient.id);
        }

        // Delete duplicate
        await supabaseAdmin.from('patients').delete().eq('id', patient.id);
        merged++;
      } else {
        // No correct version exists — just fix the name
        await supabaseAdmin
          .from('patients')
          .update({ nom_complet: correctedName })
          .eq('id', patient.id);

        // Also fix factures
        await supabaseAdmin
          .from('factures')
          .update({ patient_nom: correctedName })
          .eq('patient_nom', patient.nom_complet)
          .eq('therapeute_id', patient.therapeute_id);

        merged++;
      }
    }

    return NextResponse.json({ message: `${merged} patient(s) corrigé(s)`, merged });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
