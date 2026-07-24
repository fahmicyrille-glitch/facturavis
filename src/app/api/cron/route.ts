import { NextResponse } from 'next/server';
import { supabaseAdmin, escapeHtml, isAllowedStorageUrl } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const ilYa5Jours = new Date();
    ilYa5Jours.setDate(ilYa5Jours.getDate() - 5);
    const dateLimiteISO = ilYa5Jours.toISOString();

    const { data: facturesARelancer, error } = await supabaseAdmin
      .from('factures')
      .select('*')
      .eq('statut_email', 'Envoyé')
      .neq('statut', 'Annulée')
      .neq('statut', 'Annulee')
      .lte('created_at', dateLimiteISO);

    if (error) throw error;

    if (!facturesARelancer || facturesARelancer.length === 0) {
      return NextResponse.json({ message: 'Aucune facture à relancer aujourd\'hui.' });
    }

    let envoisReussis = 0;

    for (const facture of facturesARelancer) {

      const { data: therapeute } = await supabaseAdmin
        .from('therapeutes')
        .select('*')
        .eq('id', facture.therapeute_id)
        .single();

      if (!therapeute) continue;

      const { data: cabinet } = await supabaseAdmin
        .from('cabinets')
        .select('nom')
        .eq('id', facture.cabinet_id)
        .single();

      const nomCabinet = escapeHtml(cabinet?.nom || 'notre cabinet');
      const lienReel = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const lienFacture = `${lienReel}/facture/${facture.id}`;

      const titre = escapeHtml(therapeute.titre) || 'Thérapeute';
      const tel = therapeute.telephone ? `📞 ${escapeHtml(therapeute.telephone)}<br>` : '';
      const safeNom = escapeHtml(therapeute.nom);
      const safeEmail = escapeHtml(therapeute.email);
      const safePatientNom = escapeHtml(facture.patient_nom);

      const logoHtml = therapeute.logo_url && isAllowedStorageUrl(therapeute.logo_url)
        ? `<img src="${therapeute.logo_url}" alt="${safeNom}" width="120" style="display: block; margin: 0 auto; max-height: 90px; object-fit: contain;" />`
        : safeNom;

      const { error: sendError } = await resend.emails.send({
        from: `${safeNom} <facture@facturavis.fr>`,
        replyTo: therapeute.email || 'noreply@facturavis.fr',
        to: facture.patient_email,
        subject: `Rappel : Votre facture de consultation - ${safeNom}`,
        html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <style>
              body { font-family: "Helvetica Neue", Arial, sans-serif; background-color: #f7f4f1; margin: 0; padding: 0; color: #3e2f25; }
              .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 14px; padding: 40px; border-top: 6px solid #a9825a; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
              .logo { text-align: center; margin-bottom: 30px; color: #a9825a; font-size: 22px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
              h1 { color: #6b4f3f; font-size: 24px; text-align: center; font-weight: 600; margin-bottom: 25px; }
              p { font-size: 16px; margin-bottom: 18px; line-height: 1.6; }
              .cta-container { text-align: center; margin: 35px 0; }
              .cta-button { background-color: #a9825a; color: #ffffff !important; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block; }
              .info-box { background-color: #fdfaf8; border: 1px solid #f0e6de; border-radius: 12px; padding: 20px; margin-top: 30px; }
              .info-title { color: #6b4f3f; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; }
              .footer { text-align: center; font-size: 12px; color: #7a6a5f; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
              .highlight { color: #a9825a; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                ${logoHtml}
              </div>

              <h1>Oubli de téléchargement ?</h1>

              <p>Bonjour <span class="highlight">${safePatientNom}</span>,</p>

              <p>Sauf erreur de ma part, il semble que vous n'ayez pas encore téléchargé la facture de votre dernière consultation.</p>

              <p>N'oubliez pas de la récupérer afin de pouvoir <strong>l'envoyer à votre mutuelle</strong> et demander votre remboursement :</p>

              <div class="cta-container">
                <a href="${lienFacture}" class="cta-button">Télécharger ma facture</a>
              </div>

              <div class="info-box">
                <div class="info-title">✨ Un petit service ?</div>
                <p style="margin: 0; font-size: 14px; color: #5d4a3e;">
                  Lors du téléchargement de votre facture, vous aurez la possibilité de laisser un rapide <strong style="color:#a9825a;">avis Google</strong> pour le cabinet. Votre soutien est extrêmement précieux pour notre développement !
                </p>
              </div>

              <p style="margin-top: 30px;">
                Prenez soin de vous,<br>
                <strong style="color: #6b4f3f;">${safeNom}</strong><br>
                <span style="font-size: 14px; color: #a9825a;">${titre}</span><br><br>
                <span style="font-size: 13px; color: #7a6a5f;">
                  ${tel}
                  ✉️ ${safeEmail}
                </span>
              </p>

              <div class="footer">
                © ${new Date().getFullYear()} • ${safeNom} — ${titre} • ${nomCabinet}<br>
                Envoyé de manière sécurisée via FacturAvis
              </div>
            </div>
          </body>
          </html>
        `
      });

      if (!sendError) {
        await supabaseAdmin
          .from('factures')
          .update({ statut_email: 'Relancé' })
          .eq('id', facture.id);
        envoisReussis++;
      } else {
        console.error(`Relance échouée pour facture ${facture.id}:`, sendError);
      }
    }

    // ── 2ᵉ passe : relance « avis Google » ────────────────────────────────────
    // Patients qui ont mis 5★ mais n'ont jamais cliqué vers Google (souvent bloqués
    // par un navigateur intégré sur mobile, ou simple oubli). Un SEUL rappel, 3 jours
    // après la note. Les factures notées AVANT cette feature ont note_at = NULL et
    // sont donc automatiquement exclues (aucune relance gênante sur l'historique).
    const relancesAvis = await relancerAvisGoogle();

    return NextResponse.json({
      message: `Succès : ${envoisReussis} relance(s) facture + ${relancesAvis} relance(s) avis Google envoyée(s).`,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la relance' }, { status: 500 });
  }
}

async function relancerAvisGoogle(): Promise<number> {
  const ilYa3Jours = new Date();
  ilYa3Jours.setDate(ilYa3Jours.getDate() - 3);

  const { data: factures, error } = await supabaseAdmin
    .from('factures')
    .select('*')
    .eq('note', 5)
    .is('avis_google_click_at', null)
    .eq('relance_avis_envoye', false)
    .not('note_at', 'is', null)
    .lte('note_at', ilYa3Jours.toISOString())
    .neq('statut', 'Annulée')
    .neq('statut', 'Annulee');

  if (error) { console.error('Erreur sélection relance avis:', error); return 0; }
  if (!factures || factures.length === 0) return 0;

  let envois = 0;

  for (const facture of factures) {
    // Marque d'abord comme relancé pour garantir l'unicité même si l'envoi échoue ensuite
    await supabaseAdmin.from('factures').update({ relance_avis_envoye: true }).eq('id', facture.id);

    const { data: cabinet } = await supabaseAdmin
      .from('cabinets')
      .select('nom, lien_avis_google')
      .eq('id', facture.cabinet_id)
      .single();

    const lienAvis = cabinet?.lien_avis_google || '';
    // Sans lien Google configuré, aucune relance possible
    if (!lienAvis.startsWith('http')) continue;

    const { data: therapeute } = await supabaseAdmin
      .from('therapeutes')
      .select('nom, titre, telephone, email, logo_url')
      .eq('id', facture.therapeute_id)
      .single();
    if (!therapeute) continue;

    const safeNom = escapeHtml(therapeute.nom);
    const safeTitre = escapeHtml(therapeute.titre) || 'Thérapeute';
    const safeEmail = escapeHtml(therapeute.email);
    const safePatientNom = escapeHtml(facture.patient_nom);
    const nomCabinet = escapeHtml(cabinet?.nom || 'le cabinet');
    const tel = therapeute.telephone ? `📞 ${escapeHtml(therapeute.telephone)}<br>` : '';

    const logoHtml = therapeute.logo_url && isAllowedStorageUrl(therapeute.logo_url)
      ? `<img src="${therapeute.logo_url}" alt="${safeNom}" width="120" style="display: block; margin: 0 auto; max-height: 90px; object-fit: contain;" />`
      : `<div style="text-align:center;color:#a9825a;font-size:22px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">${safeNom}</div>`;

    const { error: sendError } = await resend.emails.send({
      from: `${safeNom} <facture@facturavis.fr>`,
      replyTo: therapeute.email || 'noreply@facturavis.fr',
      to: facture.patient_email,
      subject: `Merci pour vos 5 étoiles 🌟 - ${safeNom}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <style>
            body { font-family: "Helvetica Neue", Arial, sans-serif; background-color: #f7f4f1; margin: 0; padding: 0; color: #3e2f25; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 14px; padding: 40px; border-top: 6px solid #a9825a; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .logo { text-align: center; margin-bottom: 30px; }
            h1 { color: #6b4f3f; font-size: 24px; text-align: center; font-weight: 600; margin-bottom: 25px; }
            p { font-size: 16px; margin-bottom: 18px; line-height: 1.6; }
            .cta-container { text-align: center; margin: 35px 0; }
            .cta-button { background-color: #4285F4; color: #ffffff !important; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block; }
            .footer { text-align: center; font-size: 12px; color: #7a6a5f; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
            .highlight { color: #a9825a; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">${logoHtml}</div>

            <h1>Un immense merci pour vos 5 étoiles 🌟</h1>

            <p>Bonjour <span class="highlight">${safePatientNom}</span>,</p>

            <p>Vous avez récemment attribué la meilleure note à votre séance, et cela me touche beaucoup&nbsp;!</p>

            <p>Si vous avez un instant, <strong>partager ce ressenti en avis Google</strong> aiderait énormément le cabinet à se faire connaître et à accompagner de nouveaux patients. Il vous suffit d'un clic&nbsp;:</p>

            <div class="cta-container">
              <a href="${lienAvis}" class="cta-button">⭐ Laisser mon avis Google</a>
            </div>

            <p style="font-size: 14px; color: #7a6a5f;">Un simple mot suffit — votre soutien compte vraiment.</p>

            <p style="margin-top: 30px;">
              Avec toute ma gratitude,<br>
              <strong style="color: #6b4f3f;">${safeNom}</strong><br>
              <span style="font-size: 14px; color: #a9825a;">${safeTitre}</span><br><br>
              <span style="font-size: 13px; color: #7a6a5f;">
                ${tel}
                ✉️ ${safeEmail}
              </span>
            </p>

            <div class="footer">
              © ${new Date().getFullYear()} • ${safeNom} — ${safeTitre} • ${nomCabinet}<br>
              Envoyé de manière sécurisée via FacturAvis
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (sendError) {
      console.error(`Relance avis échouée pour facture ${facture.id}:`, sendError);
    } else {
      envois++;
    }
  }

  return envois;
}
