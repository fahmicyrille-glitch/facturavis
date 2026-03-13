import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, nomPatient, lienFacture, nomTherapeute, cabinetNom } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'Hilary Farid <onboarding@resend.dev>', // Garde ça tant que tu n'as pas de domaine validé
      to: [email],
      subject: `Votre facture d'ostéopathie - ${nomTherapeute}`,
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
              <img src="https://www.hilaryfarid-osteopathe.fr/hilary-logo.png" alt="Hilary Farid" width="120" />
            </div>

            <h1>Votre facture est disponible</h1>

            <p>Bonjour <span class="highlight">${nomPatient}</span>,</p>

            <p>J'espère que vous vous portez bien depuis votre dernière séance.</p>

            <p>Vous trouverez ci-dessous le lien pour accéder à votre <span class="highlight">facture d'ostéopathie</span> pour votre consultation au cabinet de <strong>${cabinetNom}</strong>. Ce document vous sera utile pour votre remboursement mutuelle.</p>

            <div class="cta-container">
              <a href="${lienFacture}" class="cta-button">Télécharger ma facture</a>
            </div>

            <div class="info-box">
              <div class="info-title">✨ Un petit service ?</div>
              <p style="margin: 0; font-size: 14px; color: #5d4a3e;">
                Le cabinet se développe grâce à votre confiance. En téléchargeant votre facture, vous pourrez laisser un <strong style="color:#a9825a;">avis Google</strong> pour le cabinet de <strong>${cabinetNom}</strong> en un clic. Votre retour est précieux !
              </p>
            </div>

            <p style="margin-top: 30px;">
              Prenez soin de vous,<br>
              <strong style="color: #6b4f3f;">Hilary FARID</strong><br>
              <span style="font-size: 14px; color: #a9825a;">Ostéopathe D.O.</span>
            </p>

            <div class="footer">
              © 2026 • Hilary Farid — Ostéopathe D.O • Sèvres & Paris 15<br>
              <a href="https://hilaryfarid-osteopathe.fr" style="color: #a9825a; text-decoration: none;">hilaryfarid-osteopathe.fr</a>
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
