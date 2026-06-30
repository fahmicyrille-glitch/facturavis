import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { listInvoiceIds, getInvoice, getInvoiceDocument, isSuperPDPConfigured, refreshUserToken } from '@/lib/superpdp';
import { guessCategorie } from '@/lib/categorize';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new NextResponse('Non autorisé', { status: 401 });
  }
  const supabaseToken = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(supabaseToken);
  if (authError || !user) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  if (!isSuperPDPConfigured()) {
    return NextResponse.json({ error: 'Super PDP non configuré' }, { status: 503 });
  }

  const { data: profile } = await supabaseAdmin
    .from('therapeutes')
    .select('iopole_status, superpdp_access_token, superpdp_refresh_token, superpdp_token_expires_at')
    .eq('id', user.id)
    .single();

  if (profile?.iopole_status === 'pending') {
    return NextResponse.json({
      error: 'Votre compte est en cours de validation par la plateforme agréée. La synchronisation sera disponible une fois votre dossier validé.',
      status: 'pending',
    }, { status: 422 });
  }

  if (profile?.iopole_status !== 'active') {
    return NextResponse.json({ error: 'Réception non activée' }, { status: 403 });
  }

  // Résoudre le token du client (OAuth stocké après activation)
  let userToken: string | undefined = profile.superpdp_access_token || undefined;

  if (userToken) {
    const expiresAt = profile.superpdp_token_expires_at
      ? new Date(profile.superpdp_token_expires_at).getTime()
      : 0;

    // Rafraîchir si proche de l'expiration
    if (Date.now() > expiresAt - 60_000 && profile.superpdp_refresh_token) {
      const refreshed = await refreshUserToken(profile.superpdp_refresh_token);
      if (refreshed) {
        userToken = refreshed.access_token;
        await supabaseAdmin
          .from('therapeutes')
          .update({
            superpdp_access_token: refreshed.access_token,
            superpdp_token_expires_at: new Date(refreshed.expires_at).toISOString(),
            ...(refreshed.refresh_token ? { superpdp_refresh_token: refreshed.refresh_token } : {}),
          })
          .eq('id', user.id);
      } else {
        // Refresh échoué — le token client est mort, on continue sans (fallback master)
        userToken = undefined;
      }
    }
  }

  // userToken = token du client → ses factures uniquement
  // undefined → fallback master token (toutes les factures du compte Cyrille — à éviter en prod)
  if (!userToken) {
    console.warn(`[sync] Pas de token client pour user ${user.id} — fallback master token`);
  }

  try {
    const result = await listInvoiceIds('in', userToken);

    if (!result.ids || result.ids.length === 0) {
      return NextResponse.json({ message: 'Aucune facture reçue', synced: 0 });
    }

    const { data: existing } = await supabaseAdmin
      .from('factures_recues')
      .select('notes')
      .eq('therapeute_id', user.id)
      .like('notes', 'superpdp:%');

    const existingIds = new Set(
      (existing || []).map(f => f.notes?.replace('superpdp:', '') || '')
    );

    let synced = 0;
    const errors: string[] = [];

    for (const invId of result.ids) {
      const invIdStr = String(invId);
      if (existingIds.has(invIdStr)) continue;

      try {
        const inv = await getInvoice(invId, userToken);

        let filePath = `superpdp-${invIdStr}`;
        try {
          const pdfBuffer = await getInvoiceDocument(invId, userToken);
          const fileName = `${user.id}/${Date.now()}-superpdp-${invIdStr}.pdf`;
          const { error: uploadError } = await supabaseAdmin.storage
            .from('factures_recues')
            .upload(fileName, pdfBuffer, { contentType: 'application/pdf' });
          if (!uploadError) filePath = fileName;
        } catch {
          // PDF pas encore disponible
        }

        const fournisseur = inv.sellerName || `SIRET ${inv.sellerSiren || 'inconnu'}`;
        const montant = inv.totalTTC || inv.totalHT || null;
        const dateFacture = inv.issueDate || null;
        const categorie = guessCategorie(fournisseur);

        await supabaseAdmin.from('factures_recues').insert([{
          therapeute_id: user.id,
          fournisseur_nom: fournisseur,
          montant,
          date_facture: dateFacture,
          categorie,
          notes: `superpdp:${invIdStr}`,
          fichier_path: filePath,
        }]);

        synced++;
      } catch (err) {
        errors.push(`${invIdStr}: ${err instanceof Error ? err.message : 'erreur'}`);
      }
    }

    return NextResponse.json({
      message: synced > 0 ? `${synced} facture(s) synchronisée(s)` : 'Toutes les factures sont déjà synchronisées',
      synced,
      total: result.count,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur sync Super PDP:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new NextResponse('Non autorisé', { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  await supabaseAdmin
    .from('factures_recues')
    .delete()
    .eq('therapeute_id', user.id)
    .like('notes', 'superpdp:%');

  return NextResponse.json({ message: 'Factures Super PDP purgées' });
}
