import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import JSZip from 'jszip';
import { supabaseAdmin } from '@/lib/supabase-admin';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new NextResponse('Non autorisé', { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return new NextResponse('Non autorisé', { status: 401 });

  const { dateDebut, dateFin, emailComptable } = await request.json();
  if (!dateDebut || !dateFin || !emailComptable) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from('therapeutes')
    .select('nom, siret')
    .eq('id', user.id)
    .single();

  const { data: factures, error: facturesError } = await supabaseAdmin
    .from('factures_recues')
    .select('*')
    .eq('therapeute_id', user.id)
    .gte('date_facture', dateDebut)
    .lte('date_facture', dateFin)
    .order('date_facture', { ascending: true });

  if (facturesError) {
    return NextResponse.json({ error: 'Erreur récupération factures' }, { status: 500 });
  }
  if (!factures || factures.length === 0) {
    return NextResponse.json({ error: 'Aucune facture sur cette période' }, { status: 404 });
  }

  // CSV (format français, BOM pour Excel)
  const csvHeader = 'Date;Fournisseur;Catégorie;Montant (€);Notes';
  const csvRows = factures.map(f => [
    f.date_facture || '',
    `"${(f.fournisseur_nom || '').replace(/"/g, '""')}"`,
    f.categorie || 'Autre',
    (f.montant || 0).toFixed(2).replace('.', ','),
    `"${(f.notes || '').replace(/"/g, '""')}"`,
  ].join(';'));
  const csvContent = '﻿' + [csvHeader, ...csvRows].join('\r\n');

  // ZIP
  const zip = new JSZip();
  zip.file('rapport_factures_fournisseurs.csv', csvContent);

  const pdfFolder = zip.folder('factures_pdf');
  await Promise.all(
    factures
      .filter(f => f.fichier_path)
      .map(async (f, i) => {
        try {
          const { data, error } = await supabaseAdmin.storage
            .from('factures_recues')
            .download(f.fichier_path);
          if (error || !data) return;
          const buffer = await data.arrayBuffer();
          const safeName = (f.fournisseur_nom || 'facture')
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .substring(0, 30);
          pdfFolder?.file(
            `${String(i + 1).padStart(2, '0')}_${f.date_facture || 'date'}_${safeName}.pdf`,
            buffer
          );
        } catch { /* PDF introuvable — on continue */ }
      })
  );

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  const total = factures.reduce((sum, f) => sum + (f.montant || 0), 0);
  const nomTherapeute = profile?.nom || 'Votre praticien';
  const dateDebutFr = new Date(dateDebut + 'T00:00:00').toLocaleDateString('fr-FR');
  const dateFinFr = new Date(dateFin + 'T00:00:00').toLocaleDateString('fr-FR');
  const zipFilename = `factures_fournisseurs_${dateDebut}_au_${dateFin}.zip`;

  // Tableau HTML des factures pour l'email
  const lignesTableau = factures.map(f => `
    <tr style="border-bottom:1px solid #f0e6de;">
      <td style="padding:8px 12px;font-size:13px;color:#3e2f25;">${f.date_facture || '—'}</td>
      <td style="padding:8px 12px;font-size:13px;color:#3e2f25;font-weight:600;">${f.fournisseur_nom || '—'}</td>
      <td style="padding:8px 12px;font-size:13px;color:#7a6a5f;">${f.categorie || 'Autre'}</td>
      <td style="padding:8px 12px;font-size:13px;color:#3e2f25;font-weight:700;text-align:right;">${(f.montant || 0).toFixed(2).replace('.', ',')} €</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f5f2;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#3e2f25,#a9825a);padding:32px 40px;">
      <p style="margin:0 0 4px;color:rgba(255,255,255,0.7);font-size:12px;text-transform:uppercase;letter-spacing:1px;">FacturAvis</p>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">Rapport factures fournisseurs</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
        ${nomTherapeute} · du ${dateDebutFr} au ${dateFinFr}
      </p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="margin:0 0 24px;color:#7a6a5f;font-size:14px;line-height:1.6;">
        Bonjour,<br><br>
        Vous trouverez ci-joint le rapport des <strong style="color:#3e2f25;">${factures.length} facture${factures.length > 1 ? 's' : ''} fournisseur${factures.length > 1 ? 's' : ''}</strong> de votre client
        <strong style="color:#3e2f25;">${nomTherapeute}</strong> pour la période du <strong style="color:#3e2f25;">${dateDebutFr}</strong> au <strong style="color:#3e2f25;">${dateFinFr}</strong>.
      </p>

      <!-- Résumé -->
      <div style="background:#fdf2e9;border-radius:12px;padding:20px 24px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <p style="margin:0;font-size:12px;color:#a9825a;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Total de la période</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:#3e2f25;">${total.toFixed(2).replace('.', ',')} €</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:12px;color:#a9825a;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Factures</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:#3e2f25;">${factures.length}</p>
        </div>
      </div>

      <!-- Tableau -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f9f5f2;">
            <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#7a6a5f;text-align:left;">Date</th>
            <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#7a6a5f;text-align:left;">Fournisseur</th>
            <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#7a6a5f;text-align:left;">Catégorie</th>
            <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#7a6a5f;text-align:right;">Montant</th>
          </tr>
        </thead>
        <tbody>${lignesTableau}</tbody>
      </table>

      <!-- ZIP info -->
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#0369a1;font-weight:700;">📎 Pièce jointe : ${zipFilename}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#0369a1;">Ce fichier ZIP contient le récapitulatif CSV (compatible Excel) ainsi que les PDFs de chaque facture.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9f5f2;padding:20px 40px;border-top:1px solid #f0e6de;">
      <p style="margin:0;font-size:11px;color:#a9825a;text-align:center;">
        Ce rapport a été généré automatiquement par <strong>FacturAvis</strong> · facturavis.fr
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: 'FacturAvis <noreply@facturavis.fr>',
    to: emailComptable,
    subject: `Rapport fournisseurs — ${nomTherapeute} — ${dateDebutFr} au ${dateFinFr}`,
    html,
    attachments: [{ filename: zipFilename, content: zipBuffer }],
  });

  return NextResponse.json({ success: true, count: factures.length, total });
}
