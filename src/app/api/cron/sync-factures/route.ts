import { NextResponse } from 'next/server';
import { supabaseAdmin, escapeHtml } from '@/lib/supabase-admin';
import { listInvoiceIds, getInvoice, getInvoiceDocument, isSuperPDPConfigured } from '@/lib/superpdp';
import { guessCategorie } from '@/lib/categorize';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  if (!isSuperPDPConfigured()) {
    return NextResponse.json({ message: 'Super PDP non configuré', synced: 0 });
  }

  try {
    const { data: therapeutes } = await supabaseAdmin
      .from('therapeutes')
      .select('id, nom, email, iopole_status')
      .eq('iopole_status', 'active');

    if (!therapeutes || therapeutes.length === 0) {
      return NextResponse.json({ message: 'Aucun praticien avec réception active', synced: 0 });
    }

    let totalSynced = 0;
    const results: { therapeuteId: string; nom: string; synced: number; newInvoices: string[] }[] = [];

    const invoiceResult = await listInvoiceIds('in');
    if (!invoiceResult.ids || invoiceResult.ids.length === 0) {
      return NextResponse.json({ message: 'Aucune facture sur la plateforme', synced: 0 });
    }

    for (const therapeute of therapeutes) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('factures_recues')
          .select('notes')
          .eq('therapeute_id', therapeute.id)
          .like('notes', 'superpdp:%');

        const existingIds = new Set(
          (existing || []).map(f => f.notes?.replace('superpdp:', '') || '')
        );

        let synced = 0;
        const newInvoices: string[] = [];

        for (const invId of invoiceResult.ids) {
          const invIdStr = String(invId);
          if (existingIds.has(invIdStr)) continue;

          try {
            const inv = await getInvoice(invId);

            let filePath = `superpdp-${invIdStr}`;
            try {
              const pdfBuffer = await getInvoiceDocument(invId);
              const fileName = `${therapeute.id}/${Date.now()}-superpdp-${invIdStr}.pdf`;
              const { error: uploadError } = await supabaseAdmin.storage
                .from('factures_recues')
                .upload(fileName, pdfBuffer, { contentType: 'application/pdf' });
              if (!uploadError) filePath = fileName;
            } catch {
              // PDF not available
            }

            const fournisseur = inv.sellerName || `SIRET ${inv.sellerSiren || 'inconnu'}`;
            const montant = inv.totalTTC || inv.totalHT || null;
            const dateFacture = inv.issueDate || null;
            const categorie = guessCategorie(fournisseur);

            await supabaseAdmin.from('factures_recues').insert([{
              therapeute_id: therapeute.id,
              fournisseur_nom: fournisseur,
              montant,
              date_facture: dateFacture,
              categorie,
              notes: `superpdp:${invIdStr}`,
              fichier_path: filePath,
            }]);

            synced++;
            newInvoices.push(`${fournisseur} (${montant ? montant.toFixed(2) + '€' : 'montant inconnu'})`);
          } catch {
            // Skip individual invoice errors
          }
        }

        if (synced > 0) {
          totalSynced += synced;
          results.push({ therapeuteId: therapeute.id, nom: therapeute.nom, synced, newInvoices });

          // Feature 2: Email notification
          if (therapeute.email) {
            const safeNom = escapeHtml(therapeute.nom);
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://facturavis.fr';
            const invoiceListHtml = newInvoices.map(inv => `<li style="padding: 6px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(inv)}</li>`).join('');

            try {
              await resend.emails.send({
                from: 'FacturAvis <notifications@facturavis.fr>',
                to: therapeute.email,
                subject: `📬 ${synced} nouvelle${synced > 1 ? 's' : ''} facture${synced > 1 ? 's' : ''} reçue${synced > 1 ? 's' : ''}`,
                html: `
                  <!DOCTYPE html>
                  <html lang="fr">
                  <head>
                    <style>
                      body { font-family: "Helvetica Neue", Arial, sans-serif; background-color: #f7f4f1; margin: 0; padding: 0; color: #3e2f25; }
                      .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 14px; padding: 40px; border-top: 6px solid #2563eb; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                      h1 { color: #1e40af; font-size: 22px; margin-bottom: 10px; }
                      .badge { display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 4px 14px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
                      .invoice-list { list-style: none; padding: 0; margin: 20px 0; background: #f8fafc; border-radius: 10px; padding: 15px 20px; }
                      .cta-button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: bold; margin-top: 20px; }
                      .footer { text-align: center; font-size: 12px; color: #7a6a5f; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
                      .archive-badge { display: inline-flex; align-items: center; gap: 6px; background-color: #ecfdf5; color: #065f46; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 500; margin-top: 16px; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <span class="badge">📬 Nouvelles factures</span>
                      <h1>Bonjour ${safeNom},</h1>
                      <p>Votre espace FacturAvis a reçu <strong>${synced} nouvelle${synced > 1 ? 's' : ''} facture${synced > 1 ? 's' : ''}</strong> fournisseur :</p>

                      <ul class="invoice-list">
                        ${invoiceListHtml}
                      </ul>

                      <div style="text-align: center;">
                        <a href="${siteUrl}/dashboard/factures-recues" class="cta-button">Voir mes factures reçues</a>
                      </div>

                      <div class="archive-badge">
                        🔒 Vos factures sont archivées en toute sécurité pendant 10 ans
                      </div>

                      <div class="footer">
                        Synchronisation automatique via FacturAvis<br>
                        Conforme à la réforme de la facturation électronique (sept. 2026)
                      </div>
                    </div>
                  </body>
                  </html>
                `,
              });
            } catch {
              // Email send failed - non-blocking
            }
          }
        }
      } catch {
        // Skip individual therapeute errors
      }
    }

    return NextResponse.json({
      message: totalSynced > 0
        ? `${totalSynced} facture(s) synchronisée(s) pour ${results.length} praticien(s)`
        : 'Toutes les factures sont déjà synchronisées',
      synced: totalSynced,
      details: results,
    });
  } catch (error) {
    console.error('Erreur cron sync-factures:', error);
    return NextResponse.json({ error: 'Erreur lors de la synchronisation' }, { status: 500 });
  }
}
