import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const hookSecret = process.env.SUPABASE_HOOK_SECRET;
  if (hookSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${hookSecret}`) {
      return new NextResponse('Non autorisé', { status: 401 });
    }
  }

  try {
    const payload = await request.json();
    const email = payload?.user?.email;
    const tokenHash = payload?.email_data?.token_hash;
    const actionType = payload?.email_data?.email_action_type || 'signup';

    if (!email || !tokenHash) {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://facturavis.fr';
    const confirmUrl = `${siteUrl}/api/auth/confirm?token_hash=${tokenHash}&type=${actionType}`;

    let subject = 'Confirmez votre inscription — FacturAvis';
    let heading = 'Confirmez votre email';
    let body = "Merci de vous être inscrit sur <strong>FacturAvis</strong>. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et accéder à votre espace.";
    let btnLabel = 'Confirmer mon email';

    if (actionType === 'recovery') {
      subject = 'Réinitialisation de votre mot de passe — FacturAvis';
      heading = 'Réinitialiser votre mot de passe';
      body = 'Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le bouton ci-dessous. Ce lien expire dans 1 heure.';
      btnLabel = 'Réinitialiser mon mot de passe';
    }

    await resend.emails.send({
      from: 'FacturAvis <noreply@facturavis.fr>',
      to: [email],
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background-color:#f7f4f1;font-family:'Helvetica Neue',Arial,sans-serif;color:#3e2f25;">
          <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;padding:40px;border-top:5px solid #a9825a;box-shadow:0 4px 20px rgba(0,0,0,0.06);">

            <div style="text-align:center;margin-bottom:28px;">
              <span style="font-size:26px;font-weight:900;color:#a9825a;letter-spacing:-0.5px;">FacturAvis</span>
            </div>

            <h1 style="font-size:22px;font-weight:800;color:#3e2f25;margin:0 0 16px;">${heading}</h1>
            <p style="font-size:15px;line-height:1.6;color:#5a4a40;margin:0 0 28px;">${body}</p>

            <div style="text-align:center;margin:32px 0;">
              <a href="${confirmUrl}"
                 style="display:inline-block;background:#a9825a;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
                ${btnLabel}
              </a>
            </div>

            <p style="font-size:12px;color:#999;margin:24px 0 0;line-height:1.5;">
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
              <a href="${confirmUrl}" style="color:#a9825a;word-break:break-all;">${confirmUrl}</a>
            </p>

            <div style="margin-top:36px;padding-top:20px;border-top:1px solid #f0e6de;text-align:center;font-size:11px;color:#aaa;">
              © ${new Date().getFullYear()} FacturAvis — Envoyé à ${email}
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hook send-confirmation error:', error);
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 });
  }
}
