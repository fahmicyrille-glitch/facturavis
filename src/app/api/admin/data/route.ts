import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Helper pour vérifier si l'utilisateur est l'admin
 */
const checkIsAdmin = (userEmail?: string) => {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!userEmail || !adminEmail) return false;
  return userEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim();
};

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new NextResponse('Non autorisé', { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    // Vérification de l'utilisateur via le token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user || !checkIsAdmin(user.email)) {
      return new NextResponse('Accès refusé', { status: 403 });
    }

    // Le God Mode :
    // 1. On récupère TOUS les thérapeutes (le '*' inclut maintenant siret, adeli, adresse_cabinet, site_web)
    const { data: therapeutes, error: tError } = await supabaseAdmin
      .from('therapeutes')
      .select('*')
      .order('created_at', { ascending: false });

    // 2. On récupère TOUTES les factures pour les KPI du dashboard admin
    const { data: factures, error: fError } = await supabaseAdmin
      .from('factures')
      .select('id, therapeute_id, note, created_at, statut_email');

    if (tError || fError) throw new Error(tError?.message || fError?.message);

    return NextResponse.json({ therapeutes, factures });
  } catch (error: any) {
    console.error("Erreur Admin Data:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
