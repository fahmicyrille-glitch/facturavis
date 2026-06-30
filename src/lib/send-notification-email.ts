import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'FacturAvis <facture@facturavis.fr>';
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'facturavispro@gmail.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://facturavis.fr';

export async function sendClientSuperPDPStatusEmail(
  to: string,
  name: string,
  newStatus: 'active' | 'failed',
): Promise<void> {
  const isActive = newStatus === 'active';
  await resend.emails.send({
    from: FROM,
    to: [to],
    subject: isActive
      ? '✅ Votre réception de factures électroniques est activée !'
      : '⚠️ Activation SuperPDP — action requise',
    html: isActive
      ? `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#1a1a1a;">
          <h2 style="color:#16a34a;">Bonne nouvelle, ${name} !</h2>
          <p>Votre dossier a été validé par la plateforme agréée SuperPDP.<br>
          Vous pouvez maintenant <strong>recevoir vos factures fournisseurs</strong> directement dans FacturAvis, en conformité avec la réforme de septembre 2026.</p>
          <a href="${SITE_URL}/dashboard/factures-recues"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#16a34a;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
            Voir mes factures reçues
          </a>
          <p style="margin-top:24px;font-size:12px;color:#6b7280;">
            Une question ? Répondez à cet email ou contactez-nous sur WhatsApp.
          </p>
        </div>
      `
      : `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#1a1a1a;">
          <h2 style="color:#dc2626;">Activation SuperPDP non aboutie</h2>
          <p>Bonjour ${name},</p>
          <p>Votre demande d'activation de la réception de factures électroniques n'a pas pu être validée par SuperPDP.<br>
          Cela peut arriver si la pièce d'identité fournie ne correspond pas aux informations enregistrées à l'INPI.</p>
          <p><strong>Que faire ?</strong> Rendez-vous dans vos paramètres et cliquez sur <em>« Recommencer l'activation »</em>. Assurez-vous d'utiliser une pièce d'identité au nom du représentant légal de votre entreprise.</p>
          <a href="${SITE_URL}/dashboard/settings"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
            Recommencer l'activation
          </a>
          <p style="margin-top:24px;font-size:12px;color:#6b7280;">
            Besoin d'aide ? Répondez à cet email, nous vous guidons.
          </p>
        </div>
      `,
  });
}

export async function sendAdminSuperPDPStatusEmail(
  clientName: string,
  clientEmail: string,
  oldStatus: string | null,
  newStatus: string,
): Promise<void> {
  const emoji = newStatus === 'active' ? '✅' : newStatus === 'failed' ? '❌' : '⏳';
  await resend.emails.send({
    from: FROM,
    to: [ADMIN_EMAIL],
    subject: `${emoji} SuperPDP — ${clientName} : ${oldStatus ?? 'null'} → ${newStatus}`,
    html: `
      <div style="font-family:sans-serif;color:#1a1a1a;padding:20px;">
        <h3>Changement de statut SuperPDP</h3>
        <ul>
          <li><strong>Client :</strong> ${clientName}</li>
          <li><strong>Email :</strong> ${clientEmail}</li>
          <li><strong>Ancien statut :</strong> ${oldStatus ?? 'aucun'}</li>
          <li><strong>Nouveau statut :</strong> ${newStatus}</li>
        </ul>
      </div>
    `,
  });
}

export async function sendAdminNewSignupEmail(
  clientName: string,
  clientEmail: string,
  plan: string,
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: [ADMIN_EMAIL],
    subject: `🎉 Nouvelle inscription — ${clientName}`,
    html: `
      <div style="font-family:sans-serif;color:#1a1a1a;padding:20px;">
        <h3>Nouveau client inscrit sur FacturAvis</h3>
        <ul>
          <li><strong>Nom :</strong> ${clientName}</li>
          <li><strong>Email :</strong> ${clientEmail}</li>
          <li><strong>Plan :</strong> ${plan}</li>
        </ul>
      </div>
    `,
  });
}
