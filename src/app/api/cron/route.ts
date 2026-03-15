import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  // 🔐 SÉCURITÉ : On accepte le format Vercel OU le format URL (pour tes tests)
  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const secretDansUrl = url.searchParams.get('secret');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && secretDansUrl !== process.env.CRON_SECRET) {
    return new NextResponse('Non autorisé (Mauvais mot de passe ou fichier .env.local non lu)', { status: 401 });
  }

  try {
    // 1. On calcule la date d'il y a 5 jours exactement
    const ilYa5Jours = new Date();
    ilYa5Jours.setDate(ilYa5Jours.getDate() - 5);
    const dateLimiteISO = ilYa5Jours.toISOString();

    // 2. On cherche toutes les factures "Envoyé" qui ont été créées il y a 5 jours (ou plus)
    const { data: facturesARelancer, error } = await supabase
      .from('factures')
      .select('*')
      .eq('statut_email', 'Envoyé')
      .lte('created_at', dateLimiteISO);

    if (error) throw error;

    // S'il n'y a personne à relancer, on s'arrête là
    if (!facturesARelancer || facturesARelancer.length === 0) {
      return NextResponse.json({ message: 'Aucune facture à relancer aujourd\'hui.' });
    }

    let envoisReussis = 0;

    // 3. On fait une boucle sur chaque facture trouvée pour envoyer le rappel
    for (const facture of facturesARelancer) {

      const { data: therapeute } = await supabase
        .from('therapeutes')
        .select('*')
        .eq('id', facture.therapeute_id)
        .single();

      if (!therapeute) continue;

      const { data: cabinet } = await supabase
        .from('cabinets')
        .select('nom')
        .eq('id', facture.cabinet_id)
        .single();

      const nomCabinet = cabinet?.nom || 'notre cabinet';
      const lienReel = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const lienFacture = `${lienReel}/facture/${facture.id}`;

      // Formatage des infos du thérapeute
      const titre = therapeute.titre || "Thérapeute";
      const tel = therapeute.telephone ? `📞 ${therapeute.telephone}<br>` : "";
      const logoHtml = therapeute.logo_url
        ? `<img src="${therapeute.logo_url}" alt="${therapeute.nom}" width="120" style="display: block; margin: 0 auto; max-height: 90px; object-fit: contain;" />`
        : `${therapeute.nom}`;

      // Envoi de l'e-mail de relance
      await resend.emails.send({
        from: `${therapeute.nom} <facture@facturavis.fr>`, // ⚠️ Vérifie que "facturavis.fr" est bien ton domaine validé sur Resend
        replyTo: therapeute.email || 'hilaryfarid.osteopathe@gmail.com',
        to: facture.patient_email,
        subject: `Rappel : Votre facture de consultation - ${therapeute.nom}`,
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

              <p>Bonjour <span class="highlight">${facture.patient_nom}</span>,</p>

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
                <strong style="color: #6b4f3f;">${therapeute.nom}</strong><br>
                <span style="font-size: 14px; color: #a9825a;">${titre}</span><br><br>
                <span style="font-size: 13px; color: #7a6a5f;">
                  ${tel}
                  ✉️ <a href="mailto:${therapeute.email}" style="color: #7a6a5f; text-decoration: none;">${therapeute.email}</a>
                </span>
              </p>

              <div class="footer">
                © ${new Date().getFullYear()} • ${therapeute.nom} — ${titre} • ${nomCabinet}<br>
                Envoyé de manière sécurisée via FacturAvis
              </div>
            </div>
          </body>
          </html>
        `
      });

      // 4. TRÈS IMPORTANT : On change le statut en "Relancé"
      await supabase
        .from('factures')
        .update({ statut_email: 'Relancé' })
        .eq('id', facture.id);

      envoisReussis++;
    }

    return NextResponse.json({ message: `Succès : ${envoisReussis} relance(s) automatique(s) envoyée(s).` });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la relance' }, { status: 500 });
  }
}
