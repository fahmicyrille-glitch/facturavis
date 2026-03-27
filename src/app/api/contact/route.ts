import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'FacturAvis <facture@facturavis.fr>',
      to: ['fahmicyrille@gmail.com'],
      subject: `💡 Nouveau besoin spécifique de ${name}`,
      html: `
        <div style="font-family: sans-serif; color: #3e2f25; padding: 20px; border: 1px solid #f0e6de; border-radius: 15px; background-color: #fcfaf8;">
          <h2 style="color: #a9825a;">Nouveau message depuis la Landing Page</h2>
          <p>Un visiteur a une demande spécifique :</p>
          <hr style="border: none; border-top: 1px solid #f0e6de; margin: 20px 0;">
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px;"><strong>👤 Nom complet :</strong> ${name}</li>
            <li style="margin-bottom: 10px;"><strong>📧 Email :</strong> ${email}</li>
            <li style="margin-bottom: 10px;"><strong>📞 Téléphone :</strong> ${phone || '<span style="color: #9ca3af; font-style: italic;">Non renseigné</span>'}</li>
          </ul>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 10px; border: 1px solid #f0e6de; margin-top: 20px;">
            <strong>💬 Son besoin :</strong><br><br>
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `
    });

    if (error) {
      console.error("Erreur Resend détaillée:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Erreur API Contact:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
