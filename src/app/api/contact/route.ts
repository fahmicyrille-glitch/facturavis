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
    if (!rateLimit(`contact:${ip}`, 5, 10 * 60_000)) {
      return NextResponse.json({ error: 'Trop de messages envoyés. Réessayez plus tard.' }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, phone, message, website } = body;

    // Honeypot : si le champ "website" est rempli, c'est un bot
    if (website && typeof website === 'string' && website.trim().length > 0) {
      // On retourne un faux succès pour ne pas alerter le bot
      return NextResponse.json({ success: true });
    }

    // Validation des champs requis
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Le champ nom est requis' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Le champ email est requis' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Le champ message est requis' }, { status: 400 });
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Format email invalide' }, { status: 400 });
    }

    // Limite de longueur du message
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Le message ne doit pas dépasser 2000 caractères' }, { status: 400 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeMessage = escapeHtml(message);

    const { data, error } = await resend.emails.send({
      from: 'FacturAvis <facture@facturavis.fr>',
      to: ['facturavispro@gmail.com'],
      subject: `💡 Nouveau besoin spécifique de ${safeName}`,
      html: `
        <div style="font-family: sans-serif; color: #3e2f25; padding: 20px; border: 1px solid #f0e6de; border-radius: 15px; background-color: #fcfaf8;">
          <h2 style="color: #a9825a;">Nouveau message depuis la Landing Page</h2>
          <p>Un visiteur a une demande spécifique :</p>
          <hr style="border: none; border-top: 1px solid #f0e6de; margin: 20px 0;">
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px;"><strong>👤 Nom complet :</strong> ${safeName}</li>
            <li style="margin-bottom: 10px;"><strong>📧 Email :</strong> ${safeEmail}</li>
            <li style="margin-bottom: 10px;"><strong>📞 Téléphone :</strong> ${safePhone || '<span style="color: #9ca3af; font-style: italic;">Non renseigné</span>'}</li>
          </ul>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 10px; border: 1px solid #f0e6de; margin-top: 20px;">
            <strong>💬 Son besoin :</strong><br><br>
            ${safeMessage.replace(/\n/g, '<br>')}
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
