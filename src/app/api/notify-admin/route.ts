import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/supabase-admin';
import { rateLimit, getClientIp, isAllowedOrigin } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 });
    }

    const ip = getClientIp(request);
    if (!rateLimit(`notify-admin:${ip}`, 3, 10 * 60_000)) {
      return NextResponse.json({ error: 'Trop de tentatives' }, { status: 429 });
    }

    const body = await request.json();
    const { nom, prenom, email, telephone, profession } = body;

    // Validation des champs requis
    if (!nom || typeof nom !== 'string' || !nom.trim()) {
      return NextResponse.json({ error: 'Le champ nom est requis' }, { status: 400 });
    }
    if (!prenom || typeof prenom !== 'string' || !prenom.trim()) {
      return NextResponse.json({ error: 'Le champ prenom est requis' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Le champ email est requis' }, { status: 400 });
    }
    if (!telephone || typeof telephone !== 'string' || !telephone.trim()) {
      return NextResponse.json({ error: 'Le champ telephone est requis' }, { status: 400 });
    }
    if (!profession || typeof profession !== 'string' || !profession.trim()) {
      return NextResponse.json({ error: 'Le champ profession est requis' }, { status: 400 });
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Format email invalide' }, { status: 400 });
    }

    const safeNom = escapeHtml(nom);
    const safePrenom = escapeHtml(prenom);
    const safeEmail = escapeHtml(email);
    const safeTelephone = escapeHtml(telephone);
    const safeProfession = escapeHtml(profession);

    const { data, error } = await resend.emails.send({
      from: 'FacturAvis <facture@facturavis.fr>',
      to: ['facturavispro@gmail.com'],
      subject: `🚀 Nouveau Prospect (${safeProfession}) : ${safePrenom} ${safeNom}`,
      html: `
        <div style="font-family: sans-serif; color: #3e2f25; padding: 20px; border: 1px solid #f0e6de; border-radius: 15px; background-color: #fcfaf8;">
          <h2 style="color: #a9825a;">Bingo ! Un nouveau praticien</h2>
          <p>Un prospect vient de réserver sa place depuis la page Fondateur :</p>
          <hr style="border: none; border-top: 1px solid #f0e6de; margin: 20px 0;">
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px;"><strong>💼 Profession :</strong> <span style="color: #a9825a; font-weight: bold;">${safeProfession}</span></li>
            <li style="margin-bottom: 10px;"><strong>👤 Prénom :</strong> ${safePrenom}</li>
            <li style="margin-bottom: 10px;"><strong>👤 Nom :</strong> ${safeNom}</li>
            <li style="margin-bottom: 10px;"><strong>📧 Email :</strong> ${safeEmail}</li>
            <li style="margin-bottom: 10px;"><strong>📞 Téléphone :</strong> ${safeTelephone}</li>
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
