import { NextResponse } from 'next/server';
import { supabaseAdmin, escapeHtml } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { factureId, note, commentaire } = await request.json();

    if (!factureId || !note || note < 1 || note > 3) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const { data: facture, error: factureError } = await supabaseAdmin
      .from('factures')
      .select('therapeute_id, patient_nom, created_at, note')
      .eq('id', factureId)
      .single();

    if (factureError || !facture) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
    }

    // Protection anti-spam : vérifier que la facture n'a pas déjà été notée
    if (facture.note !== null && facture.note !== undefined) {
      return NextResponse.json({ error: 'Cette facture a déjà été évaluée' }, { status: 409 });
    }

    const { data: therapeute, error: therError } = await supabaseAdmin
      .from('therapeutes')
      .select('nom, email, titre')
      .eq('id', facture.therapeute_id)
      .single();

    if (therError || !therapeute?.email) {
      return NextResponse.json({ error: 'Thérapeute introuvable' }, { status: 404 });
    }

    const stars = '⭐'.repeat(note) + '☆'.repeat(5 - note);
    const safeNom = escapeHtml(therapeute.nom);
    const safeTitre = escapeHtml(therapeute.titre);
    const safePatient = escapeHtml(facture.patient_nom);
    const safeComment = commentaire ? escapeHtml(commentaire) : null;
    const dateConsultation = new Date(facture.created_at).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    await resend.emails.send({
      from: 'FacturAvis <notifications@facturavis.fr>',
      replyTo: 'noreply@facturavis.fr',
      to: therapeute.email,
      subject: `⚠️ Avis ${note}/5 — Patient : ${facture.patient_nom}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <style>
            body { font-family: "Helvetica Neue", Arial, sans-serif; background-color: #f7f4f1; margin: 0; padding: 0; color: #3e2f25; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 14px; padding: 40px; border-top: 6px solid #e53935; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            h1 { color: #c62828; font-size: 22px; margin-bottom: 10px; }
            .stars { font-size: 28px; margin: 16px 0; }
            .comment-box { background-color: #fff8f8; border: 1px solid #ffcdd2; border-radius: 10px; padding: 18px; margin: 20px 0; }
            .meta { color: #7a6a5f; font-size: 14px; margin-top: 6px; }
            .footer { text-align: center; font-size: 12px; color: #7a6a5f; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
            .tip { background-color: #e8f5e9; border-radius: 10px; padding: 16px; margin-top: 24px; font-size: 14px; color: #2e7d32; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Nouveau retour patient</h1>
            <p>Bonjour <strong>${safeNom}</strong>,</p>
            <p>Un de vos patients a laissé un avis suite à sa consultation du <strong>${dateConsultation}</strong>.</p>

            <p><strong>Patient :</strong> ${safePatient}</p>
            <p class="stars">${stars}</p>
            <p><strong>Note :</strong> ${note}/5</p>

            ${safeComment ? `
            <div class="comment-box">
              <p style="margin: 0; font-size: 15px;"><strong>Message du patient :</strong></p>
              <p style="margin-top: 10px; font-style: italic; color: #5d4a3e;">"${safeComment}"</p>
            </div>
            ` : '<p style="color:#7a6a5f; font-style:italic;">Le patient n\'a pas laissé de commentaire.</p>'}

            <div class="tip">
              💡 <strong>Conseil :</strong> Profitez de cette opportunité pour améliorer votre pratique. Un retour négatif traité rapidement peut transformer un patient insatisfait en ambassadeur de votre cabinet.
            </div>

            <div class="footer">
              Envoyé via FacturAvis • ${safeNom} — ${safeTitre}
            </div>
          </div>
        </body>
        </html>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur notify-bad-review:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
