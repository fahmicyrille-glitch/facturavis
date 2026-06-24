import { NextResponse } from 'next/server';
import { supabaseAdmin, escapeHtml } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const nomMois = firstDayLastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const nomMoisCapitalized = nomMois.charAt(0).toUpperCase() + nomMois.slice(1);

    // Récupérer toutes les factures du mois écoulé (non annulées) en une seule requête
    const { data: factures, error: facturesError } = await supabaseAdmin
      .from('factures')
      .select('therapeute_id, montant, note, patient_email')
      .neq('statut', 'Annulée')
      .neq('statut', 'Annulee')
      .gte('created_at', firstDayLastMonth.toISOString())
      .lt('created_at', firstDayThisMonth.toISOString());

    if (facturesError) throw facturesError;

    if (!factures || factures.length === 0) {
      return NextResponse.json({ message: 'Aucune facture ce mois — aucun rapport envoyé.' });
    }

    // Grouper les stats par therapeute_id
    const statsByTherapeute: Record<string, {
      ca: number;
      nbFactures: number;
      notes: number[];
      patientsUniques: Set<string>;
    }> = {};

    for (const f of factures) {
      if (!statsByTherapeute[f.therapeute_id]) {
        statsByTherapeute[f.therapeute_id] = { ca: 0, nbFactures: 0, notes: [], patientsUniques: new Set() };
      }
      const s = statsByTherapeute[f.therapeute_id];
      s.ca += f.montant || 0;
      s.nbFactures++;
      if (f.note !== null && f.note !== undefined) s.notes.push(f.note);
      if (f.patient_email) s.patientsUniques.add(f.patient_email.toLowerCase());
    }

    const therapeuteIds = Object.keys(statsByTherapeute);

    const { data: therapeutes, error: therError } = await supabaseAdmin
      .from('therapeutes')
      .select('id, nom, email, titre')
      .in('id', therapeuteIds);

    if (therError) throw therError;
    if (!therapeutes || therapeutes.length === 0) {
      return NextResponse.json({ message: 'Aucun thérapeute trouvé.' });
    }

    let envoisReussis = 0;

    for (const therapeute of therapeutes) {
      if (!therapeute.email) continue;

      const s = statsByTherapeute[therapeute.id];
      if (!s || s.nbFactures === 0) continue;

      const caFormate = s.ca.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const noteMoyenne = s.notes.length > 0
        ? (s.notes.reduce((a, b) => a + b, 0) / s.notes.length).toFixed(1)
        : null;
      const tauxAvis = s.nbFactures > 0
        ? Math.round((s.notes.length / s.nbFactures) * 100)
        : 0;
      const nbPatientsUniques = s.patientsUniques.size;

      const safeNom = escapeHtml(therapeute.nom);
      const safeTitre = escapeHtml(therapeute.titre);

      const noteHtml = noteMoyenne
        ? `<div class="stat-card"><div class="stat-value">${noteMoyenne}<span class="stat-unit">/5</span></div><div class="stat-label">Note moyenne</div><div class="stat-sub">${s.notes.length} avis collecté${s.notes.length > 1 ? 's' : ''}</div></div>`
        : `<div class="stat-card"><div class="stat-value" style="font-size:20px;color:#bbb;">—</div><div class="stat-label">Note moyenne</div><div class="stat-sub">Aucun avis ce mois</div></div>`;

      const starsDisplay = noteMoyenne
        ? `${'★'.repeat(Math.round(parseFloat(noteMoyenne)))}${'☆'.repeat(5 - Math.round(parseFloat(noteMoyenne)))}`
        : '';

      const messageMotivation = s.nbFactures >= 20
        ? `Excellent mois ! Votre activité est très soutenue.`
        : s.nbFactures >= 10
        ? `Bon mois de travail. Continuez sur cette lancée !`
        : `Voici le bilan de votre activité du mois.`;

      await resend.emails.send({
        from: 'FacturAvis <rapport@facturavis.fr>',
        replyTo: 'support@facturavis.fr',
        to: therapeute.email,
        subject: `📊 Votre bilan ${nomMoisCapitalized} — FacturAvis`,
        html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8" />
            <style>
              * { box-sizing: border-box; }
              body { font-family: "Helvetica Neue", Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 0; color: #1a202c; }
              .wrapper { padding: 32px 16px; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }

              /* HEADER */
              .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%); padding: 36px 40px; text-align: center; }
              .header-badge { display: inline-block; background: rgba(255,255,255,0.15); color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; margin-bottom: 14px; }
              .header h1 { color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 6px; }
              .header p { color: rgba(255,255,255,0.75); font-size: 15px; margin: 0; }

              /* BODY */
              .body { padding: 36px 40px; }
              .greeting { font-size: 17px; color: #2d3748; margin-bottom: 6px; }
              .motivation { font-size: 15px; color: #718096; margin-bottom: 32px; }

              /* STATS GRID */
              .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
              .stat-card { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 16px; text-align: center; }
              .stat-card.highlight { background: linear-gradient(135deg, #ebf8ff, #e6fffa); border-color: #90cdf4; }
              .stat-value { font-size: 32px; font-weight: 800; color: #1e3a5f; line-height: 1; margin-bottom: 4px; }
              .stat-unit { font-size: 16px; font-weight: 600; color: #4a7fa5; }
              .stat-label { font-size: 12px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
              .stat-sub { font-size: 12px; color: #a0aec0; }

              /* STARS */
              .stars-display { color: #f6ad55; font-size: 22px; letter-spacing: 3px; }

              /* TAUX AVIS */
              .taux-bar-wrapper { margin-bottom: 32px; }
              .taux-bar-label { display: flex; justify-content: space-between; font-size: 13px; color: #4a5568; margin-bottom: 8px; font-weight: 600; }
              .taux-bar-bg { background: #e2e8f0; border-radius: 99px; height: 10px; overflow: hidden; }
              .taux-bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #48bb78, #38a169); transition: width 0.3s; }

              /* CTA */
              .cta-block { background: #f7fafc; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; }
              .cta-block p { font-size: 14px; color: #4a5568; margin: 0 0 14px; }
              .cta-button { display: inline-block; background: #1e3a5f; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 700; }

              /* FOOTER */
              .footer { background: #f7fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center; }
              .footer p { font-size: 12px; color: #a0aec0; margin: 4px 0; }

              @media (max-width: 480px) {
                .body { padding: 24px 20px; }
                .header { padding: 28px 20px; }
                .stat-value { font-size: 26px; }
              }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="container">

                <div class="header">
                  <div class="header-badge">Rapport mensuel</div>
                  <h1>${nomMoisCapitalized}</h1>
                  <p>Bilan de votre activité sur FacturAvis</p>
                </div>

                <div class="body">
                  <p class="greeting">Bonjour <strong>${safeNom}</strong>,</p>
                  <p class="motivation">${messageMotivation} Voici votre récapitulatif pour <strong>${nomMoisCapitalized}</strong>.</p>

                  <div class="stats-grid">
                    <div class="stat-card highlight">
                      <div class="stat-label">Chiffre d'affaires</div>
                      <div class="stat-value">${caFormate}<span class="stat-unit"> €</span></div>
                      <div class="stat-sub">toutes consultations</div>
                    </div>

                    <div class="stat-card">
                      <div class="stat-label">Factures émises</div>
                      <div class="stat-value">${s.nbFactures}</div>
                      <div class="stat-sub">${nbPatientsUniques} patient${nbPatientsUniques > 1 ? 's' : ''} différent${nbPatientsUniques > 1 ? 's' : ''}</div>
                    </div>

                    ${noteHtml}

                    <div class="stat-card">
                      <div class="stat-label">Taux d'avis</div>
                      <div class="stat-value">${tauxAvis}<span class="stat-unit">%</span></div>
                      <div class="stat-sub">${s.notes.length} / ${s.nbFactures} ont voté</div>
                    </div>
                  </div>

                  ${starsDisplay ? `
                  <div style="text-align:center; margin-bottom: 32px;">
                    <div class="stars-display">${starsDisplay}</div>
                    <p style="font-size:13px; color:#718096; margin-top:6px;">Note moyenne : <strong>${noteMoyenne}/5</strong></p>
                  </div>
                  ` : ''}

                  <div class="taux-bar-wrapper">
                    <div class="taux-bar-label">
                      <span>Taux de collecte d'avis</span>
                      <span>${tauxAvis}%</span>
                    </div>
                    <div class="taux-bar-bg">
                      <div class="taux-bar-fill" style="width: ${tauxAvis}%;"></div>
                    </div>
                  </div>

                  <div class="cta-block">
                    <p>Retrouvez le détail de vos factures et exportez votre comptabilité depuis votre tableau de bord.</p>
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://facturavis.fr'}/dashboard" class="cta-button">
                      Accéder à mon tableau de bord
                    </a>
                  </div>
                </div>

                <div class="footer">
                  <p><strong>FacturAvis</strong> — Facturation & avis pour professionnels de santé</p>
                  <p>${safeNom} — ${safeTitre}</p>
                  <p style="margin-top:12px; font-size:11px;">Vous recevez ce rapport le 1er de chaque mois.</p>
                </div>

              </div>
            </div>
          </body>
          </html>
        `
      });

      envoisReussis++;
    }

    return NextResponse.json({
      message: `Rapport mensuel ${nomMoisCapitalized} envoyé à ${envoisReussis} praticien(s).`,
      total_therapeutes: therapeuteIds.length,
      envoyes: envoisReussis,
    });

  } catch (error) {
    console.error('Erreur rapport mensuel:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du rapport' }, { status: 500 });
  }
}
