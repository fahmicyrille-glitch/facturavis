import { Resend } from 'resend';
import { buildRdvIcs } from './ics';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'FacturAvis <facture@facturavis.fr>';

// Le SDK Resend ne lève pas d'exception : l'échec est dans la propriété `error` de la réponse.
// On centralise l'envoi pour transformer ces échecs silencieux en vraies erreurs loggées.
async function sendOrThrow(payload: Parameters<typeof resend.emails.send>[0], context: string): Promise<void> {
  const { data, error } = await resend.emails.send(payload);
  if (error) {
    console.error(`[email RDV] Échec envoi (${context}):`, JSON.stringify(error));
    throw new Error(`Envoi email échoué (${context}): ${error.message || JSON.stringify(error)}`);
  }
  console.log(`[email RDV] Envoyé (${context}): ${data?.id}`);
}

function formatDateHeure(iso: string): { date: string; heure: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    heure: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
}

function icsAttachment(params: {
  rdvId: string;
  therapeuteNom: string;
  therapeuteEmail: string;
  dateDebutIso: string;
  dateFinIso: string;
}) {
  const ics = buildRdvIcs({
    uid: params.rdvId,
    summary: `Rendez-vous avec ${params.therapeuteNom}`,
    description: `Rendez-vous confirmé via FacturAvis avec ${params.therapeuteNom}.`,
    startIso: params.dateDebutIso,
    endIso: params.dateFinIso,
    organizerEmail: params.therapeuteEmail || 'noreply@facturavis.fr',
    organizerName: params.therapeuteNom,
  });
  return [{
    filename: 'rendez-vous.ics',
    content: Buffer.from(ics).toString('base64'),
    contentType: 'text/calendar',
  }];
}

// Gabarit commun aux emails RDV : même charte que l'email de facture (fond crème, accent #a9825a).
function rdvEmailLayout(headerEmoji: string, headerTitle: string, headerColor: string, body: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f7f4f1; margin: 0; padding: 0; color: #3e2f25;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 14px; padding: 40px; border-top: 6px solid ${headerColor}; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="text-align: center; font-size: 44px; margin-bottom: 12px;">${headerEmoji}</div>
        <h1 style="color: #6b4f3f; font-size: 24px; text-align: center; font-weight: 600; margin: 0 0 30px;">${headerTitle}</h1>
        ${body}
        <div style="text-align: center; font-size: 12px; color: #7a6a5f; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          © ${new Date().getFullYear()} • Envoyé de manière sécurisée via FacturAvis
        </div>
      </div>
    </body>
    </html>
  `;
}

function rdvCard(dateIso: string, dateFinIso?: string): string {
  const { date, heure } = formatDateHeure(dateIso);
  const heureFin = dateFinIso ? formatDateHeure(dateFinIso).heure : null;
  return `
    <div style="background-color: #fdfaf8; border: 1px solid #f0e6de; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 6px; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #a9825a; font-weight: bold;">Votre rendez-vous</p>
      <p style="margin: 0; font-size: 20px; font-weight: bold; color: #3e2f25; text-transform: capitalize;">📅 ${date}</p>
      <p style="margin: 8px 0 0; font-size: 18px; font-weight: bold; color: #6b4f3f;">🕐 ${heure}${heureFin ? ` — ${heureFin}` : ''}</p>
    </div>
  `;
}

function ctaButton(url: string, label: string, color = '#a9825a'): string {
  return `
    <div style="text-align: center; margin: 30px 0 10px;">
      <a href="${url}" style="background-color: ${color}; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">${label}</a>
      <span style="font-size: 12px; color: #999; margin-top: 12px; display: block; word-break: break-all;">Si le bouton ne fonctionne pas, copiez ce lien :<br><a href="${url}" style="color:#a9825a;">${url}</a></span>
    </div>
  `;
}

function visioBlock(visioUrl?: string): string {
  if (!visioUrl) return '';
  return `
    <div style="background-color: #eef4ff; border: 1px solid #c7d8f7; border-radius: 12px; padding: 20px; margin-top: 16px; text-align: center;">
      <p style="margin: 0 0 10px; font-size: 14px; color: #2c4a7a; font-weight: bold;">💻 Consultation en visioconférence</p>
      <a href="${visioUrl}" style="color: #2c5dbb; font-weight: bold; word-break: break-all;">${visioUrl}</a>
      <p style="margin: 10px 0 0; font-size: 12px; color: #5d7bab;">Connectez-vous à ce lien à l'heure du rendez-vous.</p>
    </div>
  `;
}

// Adresse + instructions d'accès (étage, code, interphone...) : volontairement envoyées
// UNIQUEMENT dans cet email post-réservation, jamais affichées publiquement avant — un code
// d'accès ne doit pas être visible par n'importe qui avant d'avoir réellement un rendez-vous.
function accessBlock(adresse?: string, instructionsAcces?: string): string {
  if (!adresse && !instructionsAcces) return '';
  return `
    <div style="background-color: #fdfaf8; border: 1px solid #f0e6de; border-radius: 12px; padding: 20px; margin-top: 16px;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #6b4f3f; font-weight: bold;">📍 Comment venir</p>
      ${adresse ? `<p style="margin: 0 0 6px; font-size: 14px; color: #5d4a3e;">${adresse}</p>` : ''}
      ${instructionsAcces ? `<p style="margin: 6px 0 0; font-size: 13px; color: #7a6a5f; white-space: pre-line;">${instructionsAcces}</p>` : ''}
    </div>
  `;
}

// Politique d'annulation : formule générique par défaut, ou date-limite précise si le
// praticien a configuré un délai — pour que le patient la découvre AVANT d'en avoir besoin,
// pas au moment où il essaie d'annuler trop tard.
function cancellationPolicyLine(dateDebutIso: string, delaiAnnulationHeures?: number): string {
  if (!delaiAnnulationHeures) {
    return `✨ <strong style="color:#6b4f3f;">Un imprévu ?</strong> Pas de souci : vous pouvez changer la date ou annuler votre rendez-vous en ligne, en quelques secondes, jusqu'au jour J.`;
  }
  const deadline = new Date(new Date(dateDebutIso).getTime() - delaiAnnulationHeures * 3600000);
  const { date, heure } = formatDateHeure(deadline.toISOString());
  return `✨ <strong style="color:#6b4f3f;">Un imprévu ?</strong> Vous pouvez changer la date ou annuler votre rendez-vous en ligne jusqu'au <strong>${date} à ${heure}</strong> (${delaiAnnulationHeures}h avant le rendez-vous). Passé ce délai, merci de contacter directement le cabinet.`;
}

interface ConfirmationEmailParams {
  to: string;
  patientNom: string;
  therapeuteNom: string;
  therapeuteEmail: string;
  rdvId: string;
  dateDebutIso: string;
  dateFinIso: string;
  manageUrl: string;
  isReschedule?: boolean;
  visioUrl?: string;
  adresse?: string;
  instructionsAcces?: string;
  delaiAnnulationHeures?: number;
}

export async function sendRdvConfirmationEmail(params: ConfirmationEmailParams): Promise<void> {
  const {
    to, patientNom, therapeuteNom, therapeuteEmail, rdvId, dateDebutIso, dateFinIso, manageUrl,
    isReschedule, visioUrl, adresse, instructionsAcces, delaiAnnulationHeures,
  } = params;
  const { date, heure } = formatDateHeure(dateDebutIso);
  const body = `
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">Bonjour <span style="color: #a9825a; font-weight: 600;">${patientNom}</span>,</p>
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">
      ${isReschedule
        ? `Votre rendez-vous avec <strong>${therapeuteNom}</strong> a bien été déplacé. Voici votre nouveau créneau :`
        : `Votre rendez-vous avec <strong>${therapeuteNom}</strong> est confirmé. Nous avons hâte de vous accueillir !`}
    </p>
    ${rdvCard(dateDebutIso, dateFinIso)}
    ${visioBlock(visioUrl)}
    ${visioUrl ? '' : accessBlock(adresse, instructionsAcces)}
    <div style="background-color: #fdfaf8; border: 1px solid #f0e6de; border-radius: 12px; padding: 20px; margin-top: 16px;">
      <p style="margin: 0; font-size: 14px; color: #5d4a3e; line-height: 1.6;">
        ${cancellationPolicyLine(dateDebutIso, delaiAnnulationHeures)}
      </p>
    </div>
    ${ctaButton(manageUrl, 'Gérer mon rendez-vous')}
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 16px;">📎 Un fichier joint vous permet d'ajouter ce rendez-vous à votre calendrier.</p>
  `;
  await sendOrThrow({
    from: FROM,
    to: [to],
    subject: isReschedule
      ? `🔄 Nouveau créneau confirmé — ${date} à ${heure}`
      : `✅ Rendez-vous confirmé — ${date} à ${heure}`,
    html: rdvEmailLayout(isReschedule ? '🔄' : '✅', isReschedule ? 'Rendez-vous reprogrammé' : 'Rendez-vous confirmé', '#a9825a', body),
    attachments: icsAttachment({ rdvId, therapeuteNom, therapeuteEmail, dateDebutIso, dateFinIso }),
  }, 'confirmation patient');
}

interface ReminderEmailParams {
  to: string;
  patientNom: string;
  therapeuteNom: string;
  therapeuteEmail: string;
  rdvId: string;
  dateDebutIso: string;
  dateFinIso: string;
  manageUrl: string;
  visioUrl?: string;
  adresse?: string;
  instructionsAcces?: string;
}

export async function sendRdvReminderEmail(params: ReminderEmailParams): Promise<void> {
  const { to, patientNom, therapeuteNom, therapeuteEmail, rdvId, dateDebutIso, dateFinIso, manageUrl, visioUrl, adresse, instructionsAcces } = params;
  const { heure } = formatDateHeure(dateDebutIso);
  const body = `
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">Bonjour <span style="color: #a9825a; font-weight: 600;">${patientNom}</span>,</p>
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">
      Petit rappel amical : vous avez rendez-vous avec <strong>${therapeuteNom}</strong> demain !
    </p>
    ${rdvCard(dateDebutIso, dateFinIso)}
    ${visioBlock(visioUrl)}
    ${visioUrl ? '' : accessBlock(adresse, instructionsAcces)}
    <div style="background-color: #fdfaf8; border: 1px solid #f0e6de; border-radius: 12px; padding: 20px; margin-top: 16px;">
      <p style="margin: 0; font-size: 14px; color: #5d4a3e; line-height: 1.6;">
        ⏰ Un empêchement de dernière minute ? Vous pouvez encore changer la date ou annuler en ligne.
      </p>
    </div>
    ${ctaButton(manageUrl, 'Gérer mon rendez-vous')}
  `;
  await sendOrThrow({
    from: FROM,
    to: [to],
    subject: `⏰ Rappel — RDV demain à ${heure}`,
    html: rdvEmailLayout('⏰', 'Rappel de rendez-vous', '#a9825a', body),
    attachments: icsAttachment({ rdvId, therapeuteNom, therapeuteEmail, dateDebutIso, dateFinIso }),
  }, 'rappel patient');
}

export async function sendRdvCancelledByPatientEmail(
  therapeuteEmail: string,
  therapeuteNom: string,
  titreRdv: string,
  dateDebutIso: string,
  agendaUrl: string,
  patientNom?: string,
): Promise<void> {
  const { date, heure } = formatDateHeure(dateDebutIso);
  const body = `
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">Bonjour <span style="color: #a9825a; font-weight: 600;">${therapeuteNom}</span>,</p>
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">
      ${patientNom ? `<strong>${patientNom}</strong>` : 'Votre patient'} vient d'annuler son rendez-vous <strong>${titreRdv}</strong> :
    </p>
    <div style="background-color: #fff8f8; border: 1px solid #ffcdd2; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #c62828; text-decoration: line-through; text-transform: capitalize;">📅 ${date} à ${heure}</p>
    </div>
    <p style="font-size: 15px; color: #5d4a3e; line-height: 1.6;">💡 Ce créneau est de nouveau libre dans votre agenda. Pensez à le proposer à un autre patient.</p>
    ${ctaButton(agendaUrl, 'Voir mon agenda', '#3e2f25')}
  `;
  await sendOrThrow({
    from: FROM,
    to: [therapeuteEmail],
    subject: `❌ RDV annulé par le patient — ${date} à ${heure}`,
    html: rdvEmailLayout('❌', 'Rendez-vous annulé', '#e53935', body),
  }, 'annulation praticien');
}

export async function sendRdvRescheduledByPatientEmail(
  therapeuteEmail: string,
  therapeuteNom: string,
  titreRdv: string,
  oldDateIso: string,
  newDateIso: string,
  agendaUrl: string,
  patientNom?: string,
): Promise<void> {
  const oldD = formatDateHeure(oldDateIso);
  const newD = formatDateHeure(newDateIso);
  const body = `
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">Bonjour <span style="color: #a9825a; font-weight: 600;">${therapeuteNom}</span>,</p>
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">
      ${patientNom ? `<strong>${patientNom}</strong>` : 'Votre patient'} a déplacé son rendez-vous <strong>${titreRdv}</strong> :
    </p>
    <div style="background-color: #fdfaf8; border: 1px solid #f0e6de; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 10px; font-size: 14px; color: #999; text-decoration: line-through; text-transform: capitalize;">📅 ${oldD.date} à ${oldD.heure}</p>
      <div style="font-size: 20px; color: #a9825a; margin: 6px 0;">⬇️</div>
      <p style="margin: 0; font-size: 19px; font-weight: bold; color: #3e2f25; text-transform: capitalize;">📅 ${newD.date} à ${newD.heure}</p>
    </div>
    <p style="font-size: 15px; color: #5d4a3e; line-height: 1.6;">Le nouveau créneau a été vérifié : il ne chevauche aucun autre rendez-vous de votre agenda.</p>
    ${ctaButton(agendaUrl, 'Voir mon agenda', '#3e2f25')}
  `;
  await sendOrThrow({
    from: FROM,
    to: [therapeuteEmail],
    subject: `🔄 RDV déplacé au ${newD.date} à ${newD.heure}`,
    html: rdvEmailLayout('🔄', 'Rendez-vous reprogrammé', '#a9825a', body),
  }, 'reprogrammation praticien');
}

export async function sendRdvCancelledByPraticienEmail(
  to: string,
  patientNom: string,
  therapeuteNom: string,
  dateDebutIso: string,
  bookingUrl: string,
): Promise<void> {
  const { date, heure } = formatDateHeure(dateDebutIso);
  const body = `
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">Bonjour${patientNom ? ` <span style="color: #a9825a; font-weight: 600;">${patientNom}</span>` : ''},</p>
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">
      Nous sommes désolés : <strong>${therapeuteNom}</strong> a dû annuler votre rendez-vous.
    </p>
    <div style="background-color: #fff8f8; border: 1px solid #ffcdd2; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #c62828; text-decoration: line-through; text-transform: capitalize;">📅 ${date} à ${heure}</p>
    </div>
    <p style="font-size: 15px; color: #5d4a3e; line-height: 1.6;">Vous pouvez reprendre rendez-vous en ligne dès maintenant :</p>
    ${ctaButton(bookingUrl, 'Reprendre rendez-vous')}
  `;
  await sendOrThrow({
    from: FROM,
    to: [to],
    subject: `❌ Votre rendez-vous du ${date} a été annulé`,
    html: rdvEmailLayout('❌', 'Rendez-vous annulé', '#e53935', body),
  }, 'annulation vers patient');
}

export async function sendRdvBookedPraticienEmail(
  therapeuteEmail: string,
  therapeuteNom: string,
  patientNom: string,
  patientEmail: string,
  patientTelephone: string,
  dateDebutIso: string,
  dateFinIso: string,
  mode: 'cabinet' | 'visio',
  agendaUrl: string,
  visioUrl?: string,
): Promise<void> {
  const { date, heure } = formatDateHeure(dateDebutIso);
  const body = `
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">Bonjour <span style="color: #a9825a; font-weight: 600;">${therapeuteNom}</span>,</p>
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">
      <strong>${patientNom}</strong> vient de réserver un rendez-vous en ligne :
    </p>
    ${rdvCard(dateDebutIso, dateFinIso)}
    <div style="background-color: #fdfaf8; border: 1px solid #f0e6de; border-radius: 12px; padding: 20px; margin-top: 16px;">
      <p style="margin: 0 0 6px; font-size: 14px; color: #5d4a3e;"><strong>Patient :</strong> ${patientNom}</p>
      <p style="margin: 0 0 6px; font-size: 14px; color: #5d4a3e;"><strong>Email :</strong> ${patientEmail}</p>
      ${patientTelephone ? `<p style="margin: 0 0 6px; font-size: 14px; color: #5d4a3e;"><strong>Téléphone :</strong> ${patientTelephone}</p>` : ''}
      <p style="margin: 0; font-size: 14px; color: #5d4a3e;"><strong>Mode :</strong> ${mode === 'visio' ? '💻 Visioconférence' : '🏥 Au cabinet'}</p>
    </div>
    ${mode === 'visio' && visioUrl ? visioBlock(visioUrl) : ''}
    ${ctaButton(agendaUrl, 'Voir mon agenda', '#3e2f25')}
  `;
  await sendOrThrow({
    from: FROM,
    to: [therapeuteEmail],
    subject: `🎉 Nouveau RDV en ligne — ${patientNom}, ${date} à ${heure}`,
    html: rdvEmailLayout('🎉', 'Nouvelle réservation en ligne', '#a9825a', body),
  }, 'nouvelle réservation praticien');
}

export async function sendWaitlistSlotFreedEmail(
  to: string,
  patientNom: string,
  therapeuteNom: string,
  bookingUrl: string,
): Promise<void> {
  const body = `
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">Bonjour${patientNom ? ` <span style="color: #a9825a; font-weight: 600;">${patientNom}</span>` : ''},</p>
    <p style="font-size: 16px; margin-bottom: 18px; line-height: 1.6;">
      Bonne nouvelle : un créneau vient de se libérer chez <strong>${therapeuteNom}</strong> ! Vous étiez sur la liste d'attente — les places partent vite.
    </p>
    ${ctaButton(bookingUrl, 'Réserver mon créneau')}
  `;
  await sendOrThrow({
    from: FROM,
    to: [to],
    subject: `🔔 Un créneau s'est libéré chez ${therapeuteNom} !`,
    html: rdvEmailLayout('🔔', 'Un créneau est disponible', '#a9825a', body),
  }, "liste d'attente");
}
