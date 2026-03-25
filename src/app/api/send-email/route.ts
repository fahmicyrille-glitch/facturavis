import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const {
      email,
      nomPatient,
      lienFacture,
      nomTherapeute,
      cabinetNom,
      emailTherapeute,
      telephoneTherapeute,
      titreTherapeute,
      logoUrlTherapeute
    } = await request.json();

    const titre = titreTherapeute || "Thérapeute";
    const tel = telephoneTherapeute ? `📞 ${telephoneTherapeute}<br>` : "";

    const logoHtml = logoUrlTherapeute
      ? `<img src="${logoUrlTherapeute}" alt="${nomTherapeute}" width="120" style="display: block; margin: 0 auto; max-height: 90px; object-fit: contain;" />`
      : `<div style="text-align: center; color: #a9825a; font-size: 22px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">${nomTherapeute}</div>`;

    const { data, error } = await resend.emails.send({
      from: `${nomTherapeute} <facture@facturavis.fr>`,
      reply_to: emailTherapeute || 'hilaryfarid.osteopathe@gmail.com', // On garde reply_to !
      to: [email],
      subject: `Votre facture de consultation - ${nomTherapeute}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: "Helvetica Neue", Arial, sans-serif; background-color: #f7f4f1; margin: 0; padding: 0; color: #3e2f25; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 14px; padding: 40px; border-top: 6px solid #a9825a; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .logo-container { margin-bottom: 30px; }
            h1 { color: #6b4f3f; font-size: 24px; text-align: center; font-weight: 600; margin-bottom: 25px; }
            p { font-size: 16px; margin-bottom: 18px; line-height: 1.6; }
            .cta-container { text-align: center; margin: 35px 0; }
            .cta-button { background-color: #a9825a; color: #ffffff !important; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block; }
            .fallback-link { font-size: 12px; color: #999; margin-top: 10px; display: block; word-break: break-all; }
            .info-box { background-color: #fdfaf8; border: 1px solid #f0e6de; border-radius: 12px; padding: 20px; margin-top: 30px; }
            .info-title { color: #6b4f3f; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; }
            .footer { text-align: center; font-size: 12px; color: #7a6a5f; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
            .highlight { color: #a9825a; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo-container">
              ${logoHtml}
            </div>

            <h1>Votre facture est disponible</h1>

            <p>Bonjour <span class="highlight">${nomPatient}</span>,</p>

            <p>J'espère que vous vous portez bien depuis votre dernière séance.</p>

            <p>Vous trouverez ci-dessous le lien pour accéder à votre <span class="highlight">facture</span> pour votre consultation. Ce document vous sera utile pour votre remboursement mutuelle.</p>

            <div class="cta-container">
              <a href="${lienFacture}" class="cta-button">Télécharger ma facture</a>
              <span class="fallback-link">Si le bouton ne fonctionne pas, copiez ce lien : <br> <a href="${lienFacture}" style="color:#a9825a;">${lienFacture}</a></span>
            </div>

            <div class="info-box">
              <div class="info-title">✨ Un petit service ?</div>
              <p style="margin: 0; font-size: 14px; color: #5d4a3e;">
                Le cabinet se développe grâce à votre confiance. En téléchargeant votre facture, vous pourrez laisser un <strong style="color:#a9825a;">avis Google</strong> en un clic. Votre retour est précieux !
              </p>
            </div>

            <p style="margin-top: 30px;">
              Prenez soin de vous,<br>
              <strong style="color: #6b4f3f;">${nomTherapeute}</strong><br>
              <span style="font-size: 14px; color: #a9825a;">${titre}</span><br><br>
              <span style="font-size: 13px; color: #7a6a5f;">
                ${tel}
                ✉️ <a href="mailto:${emailTherapeute}" style="color: #7a6a5f; text-decoration: none;">${emailTherapeute}</a>
              </span>
            </p>

            <div class="footer">
              © ${new Date().getFullYear()} • ${nomTherapeute} — ${titre} • ${cabinetNom}<br>
              Envoyé de manière sécurisée via FacturAvis
            </div>
          </div>
        </body>
        </html>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erreur API :", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
