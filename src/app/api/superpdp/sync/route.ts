import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { listInvoiceIds, getInvoice, getInvoiceDocument, isSuperPDPConfigured } from '@/lib/superpdp';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new NextResponse('Non autorisé', { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  if (!isSuperPDPConfigured()) {
    return NextResponse.json({ error: 'Super PDP non configuré' }, { status: 503 });
  }

  try {
    const result = await listInvoiceIds('in');

    if (!result.ids || result.ids.length === 0) {
      return NextResponse.json({ message: 'Aucune facture reçue', synced: 0 });
    }

    const { data: existing } = await supabaseAdmin
      .from('factures_recues')
      .select('notes')
      .eq('therapeute_id', user.id)
      .like('notes', 'superpdp:%');

    const existingIds = new Set(
      (existing || []).map(f => f.notes?.replace('superpdp:', '') || '')
    );

    let synced = 0;
    const errors: string[] = [];

    for (const invId of result.ids) {
      const invIdStr = String(invId);
      if (existingIds.has(invIdStr)) continue;

      try {
        const inv = await getInvoice(invId);

        let filePath = `superpdp-${invIdStr}`;
        try {
          const pdfBuffer = await getInvoiceDocument(invId);
          const fileName = `${user.id}/${Date.now()}-superpdp-${invIdStr}.pdf`;
          const { error: uploadError } = await supabaseAdmin.storage
            .from('factures_recues')
            .upload(fileName, pdfBuffer, { contentType: 'application/pdf' });
          if (!uploadError) filePath = fileName;
        } catch {
          // PDF not available yet
        }

        const fournisseur = inv.sellerName || `SIRET ${inv.sellerSiren || 'inconnu'}`;
        const montant = inv.totalTTC || inv.totalHT || null;
        const dateFacture = inv.issueDate || null;
        const categorie = guessCategorie(fournisseur);

        await supabaseAdmin.from('factures_recues').insert([{
          therapeute_id: user.id,
          fournisseur_nom: fournisseur,
          montant,
          date_facture: dateFacture,
          categorie,
          notes: `superpdp:${invIdStr}`,
          fichier_path: filePath,
        }]);

        synced++;
      } catch (err) {
        errors.push(`${invIdStr}: ${err instanceof Error ? err.message : 'erreur'}`);
      }
    }

    return NextResponse.json({
      message: synced > 0 ? `${synced} facture(s) synchronisée(s)` : 'Toutes les factures sont déjà synchronisées',
      synced,
      total: result.count,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur sync Super PDP:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new NextResponse('Non autorisé', { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  await supabaseAdmin
    .from('factures_recues')
    .delete()
    .eq('therapeute_id', user.id)
    .like('notes', 'superpdp:%');

  return NextResponse.json({ message: 'Factures Super PDP purgées' });
}

function guessCategorie(fournisseurNom: string): string {
  const nom = fournisseurNom.toLowerCase();
  if (nom.includes('comptab') || nom.includes('expert') || nom.includes('fiduci')) return 'Comptable';
  if (nom.includes('orange') || nom.includes('sfr') || nom.includes('free') || nom.includes('bouygues') || nom.includes('telecom')) return 'Télécom / Internet';
  if (nom.includes('edf') || nom.includes('engie') || nom.includes('énergie') || nom.includes('gaz')) return 'Énergie';
  if (nom.includes('assur') || nom.includes('maif') || nom.includes('axa') || nom.includes('allianz')) return 'Assurance';
  if (nom.includes('médic') || nom.includes('medic') || nom.includes('santé') || nom.includes('materiel')) return 'Matériel médical';
  if (nom.includes('loyer') || nom.includes('immobil') || nom.includes('foncier') || nom.includes('bail')) return 'Loyer / Local';
  if (nom.includes('format') || nom.includes('école') || nom.includes('université')) return 'Formation';
  return 'Autre';
}
