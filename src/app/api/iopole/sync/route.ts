import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { searchInvoices, getInvoiceDetail, downloadInvoicePdf, isIopoleConfigured } from '@/lib/iopole';

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

  if (!isIopoleConfigured()) {
    return NextResponse.json({ error: 'Iopole non configuré' }, { status: 503 });
  }

  try {
    const invoices = await searchInvoices('INBOUND');

    if (!invoices.length) {
      return NextResponse.json({ message: 'Aucune facture reçue sur Iopole', synced: 0 });
    }

    const { data: existing } = await supabaseAdmin
      .from('factures_recues')
      .select('notes')
      .eq('therapeute_id', user.id)
      .like('notes', 'iopole:%');

    const existingIds = new Set(
      (existing || []).map(f => f.notes?.replace('iopole:', '') || '')
    );

    let synced = 0;
    const errors: string[] = [];

    for (const inv of invoices) {
      if (inv.direction !== 'INBOUND') continue;
      if (existingIds.has(inv.invoiceId)) continue;

      try {
        const detail = await getInvoiceDetail(inv.invoiceId);
        const seller = detail.businessData?.seller;
        const monetary = detail.businessData?.monetary;
        const invoiceDate = detail.businessData?.invoiceDate;

        let filePath = `iopole-${inv.invoiceId}`;
        try {
          const pdfBuffer = await downloadInvoicePdf(inv.invoiceId);
          const fileName = `${user.id}/${Date.now()}-iopole-${inv.invoiceId.slice(0, 8)}.pdf`;
          const { error: uploadError } = await supabaseAdmin.storage
            .from('factures_recues')
            .upload(fileName, pdfBuffer, { contentType: 'application/pdf' });
          if (!uploadError) filePath = fileName;
        } catch {
          // PDF download failed — continue without PDF
        }

        const categorie = guessCategorie(seller?.name || '');

        await supabaseAdmin.from('factures_recues').insert([{
          therapeute_id: user.id,
          fournisseur_nom: seller?.name || `SIRET ${seller?.siren || 'inconnu'}`,
          montant: monetary?.invoiceAmount?.amount ?? monetary?.taxBasisTotalAmount?.amount ?? null,
          date_facture: invoiceDate || null,
          categorie,
          notes: `iopole:${inv.invoiceId}`,
          fichier_path: filePath,
        }]);

        synced++;
      } catch (err) {
        errors.push(`${inv.invoiceId}: ${err instanceof Error ? err.message : 'erreur'}`);
      }
    }

    if (errors.length > 0) {
      console.error('Iopole sync errors:', errors);
    }

    return NextResponse.json({
      message: synced > 0 ? `${synced} facture(s) synchronisée(s)` : (errors.length > 0 ? `Erreurs: ${errors[0]}` : 'Toutes les factures sont déjà synchronisées'),
      synced,
      total_iopole: invoices.length,
      already_synced: invoices.length - synced - errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur sync Iopole:', message);
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

  const { error } = await supabaseAdmin
    .from('factures_recues')
    .delete()
    .eq('therapeute_id', user.id)
    .like('notes', 'iopole:%');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: 'Factures Iopole purgées' });
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
