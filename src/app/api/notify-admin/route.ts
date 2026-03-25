import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { nom, prenom, email, telephone } = await request.json();

    const { data, error } = await resend.emails.send({
      // 💡 ON UTILISE EXACTEMENT LE MÊME EXPÉDITEUR QUE LE CODE QUI MARCHE
      from: 'FacturAvis <facture@facturavis.fr>',
      to: ['fahmicyrille@gmail.com'],
      subject: `🚀 Nouveau Prospect Fondateur : ${prenom} ${nom}`,
      html: `
        <div style="font-family: sans-serif; color: #3e2f25; padding: 20px; border: 1px solid #f0e6de; border-radius: 15px; background-color: #fcfaf8;">
          <h2 style="color: #a9825a;">Bingo ! Un nouveau praticien</h2>
          <p>Un prospect vient de réserver sa place depuis la page Fondateur :</p>
          <hr style="border: none; border-top: 1px solid #f0e6de; margin: 20px 0;">
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px;"><strong>👤 Prénom :</strong> ${prenom}</li>
            <li style="margin-bottom: 10px;"><strong>👤 Nom :</strong> ${nom}</li>
            <li style="margin-bottom: 10px;"><strong>📧 Email :</strong> ${email}</li>
            <li style="margin-bottom: 10px;"><strong>📞 Téléphone :</strong> ${telephone}</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #f0e6de; margin: 20px 0;">
          <p style="font-size: 12px; color: #7a6a5f;">
            Connecte-toi à ton tableau de bord Supabase pour voir l'historique.
          </p>
        </div>
      `
    });

    if (error) {
      console.error("Erreur Resend détaillée:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Erreur API Notify Admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
