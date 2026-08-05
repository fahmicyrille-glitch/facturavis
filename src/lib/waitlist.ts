import { supabaseAdmin, escapeHtml } from './supabase-admin';
import { env } from './env';
import { sendWaitlistSlotFreedEmail } from './send-rdv-email';

// Prévient les inscrits en liste d'attente qu'un créneau vient de se libérer (une seule fois chacun)
export async function notifyWaitlist(therapeuteId: string, therapeuteNom: string): Promise<void> {
  const { data: attente } = await supabaseAdmin
    .from('liste_attente')
    .select('id, nom, email')
    .eq('therapeute_id', therapeuteId)
    .eq('notifie', false)
    .limit(20);
  if (!attente || attente.length === 0) return;

  const bookingUrl = `${env.NEXT_PUBLIC_SITE_URL}/reserver/${therapeuteId}`;
  for (const inscrit of attente) {
    await sendWaitlistSlotFreedEmail(inscrit.email, escapeHtml(inscrit.nom), escapeHtml(therapeuteNom), bookingUrl)
      .catch((err) => console.error('[email RDV] Erreur liste d\'attente:', err));
    await supabaseAdmin.from('liste_attente').update({ notifie: true }).eq('id', inscrit.id);
  }
}
