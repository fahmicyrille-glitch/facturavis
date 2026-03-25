import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Vérifie si l'utilisateur est l'admin configuré
 */
const checkIsAdmin = (userEmail?: string) => {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!userEmail || !adminEmail) return false;
  return userEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim();
};

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new NextResponse('Non autorisé', { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user || !checkIsAdmin(user.email)) {
      return new NextResponse('Accès refusé', { status: 403 });
    }

    const body = await request.json();
    const {
      email, password, nom, titre, telephone, lien_google, nom_cabinet,
      adresse_cabinet, siret, adeli, site_web, code_ape // 🌟 Ajouté code_ape
    } = body;

    if (!lien_google || lien_google.trim() === '') {
      return NextResponse.json({ error: 'Le lien Google Avis est obligatoire.' }, { status: 400 });
    }

    // 1. Création Auth
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });
    if (createError) throw createError;

    const userId = authData.user.id;

    try {
      // 2. Insertion Profil Thérapeute
      const { error: dbError } = await supabaseAdmin.from('therapeutes').insert([{
        id: userId,
        email: email,
        nom: nom,
        titre: titre || null,
        telephone: telephone || null,
        adresse_cabinet: adresse_cabinet || null,
        siret: siret || null,
        code_ape: code_ape || null, // 🌟 Ajouté code_ape
        adeli: adeli || null,
        site_web: site_web || null
      }]);
      if (dbError) throw dbError;

      // 3. Création du Cabinet initial
      const { error: cabError } = await supabaseAdmin.from('cabinets').insert([{
        therapeute_id: userId,
        nom: nom_cabinet || `Cabinet de ${nom}`,
        lien_avis_google: lien_google
      }]);
      if (cabError) throw cabError;

    } catch (dbErr: any) {
      // Nettoyage si erreur database
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw dbErr;
    }

    return NextResponse.json({ message: 'Praticien créé avec succès' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new NextResponse('Non autorisé', { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user || !checkIsAdmin(user.email)) {
      return new NextResponse('Accès refusé', { status: 403 });
    }

    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('id');
    if (!targetUserId) return new NextResponse('ID manquant', { status: 400 });

    // Nettoyage des dépendances
    await supabaseAdmin.from('cabinets').delete().eq('therapeute_id', targetUserId);
    await supabaseAdmin.from('factures').delete().eq('therapeute_id', targetUserId);
    await supabaseAdmin.from('patients').delete().eq('therapeute_id', targetUserId);

    // Suppression Profil
    const { error: dbError } = await supabaseAdmin.from('therapeutes').delete().eq('id', targetUserId);
    if (dbError) throw dbError;

    // Suppression Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ message: 'Praticien supprimé avec succès' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new NextResponse('Non autorisé', { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user || !checkIsAdmin(user.email)) {
      return new NextResponse('Accès refusé', { status: 403 });
    }

    const body = await request.json();
    const {
      id, email, nom, password, titre, telephone,
      nom_cabinet, lien_google, id_cabinet,
      adresse_cabinet, siret, adeli, site_web, code_ape // 🌟 Ajouté code_ape
    } = body;

    // 1. Mise à jour Auth (si email ou password changent)
    const updateAuthData: any = {};
    if (email) { updateAuthData.email = email; updateAuthData.email_confirm = true; }
    if (password) { updateAuthData.password = password; }

    if (Object.keys(updateAuthData).length > 0) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, updateAuthData);
      if (authUpdateError) throw authUpdateError;
    }

    // 2. Mise à jour Profil Thérapeute
    const updateDbData: any = {};
    if (nom !== undefined) updateDbData.nom = nom;
    if (email !== undefined) updateDbData.email = email;
    if (titre !== undefined) updateDbData.titre = titre;
    if (telephone !== undefined) updateDbData.telephone = telephone;
    if (adresse_cabinet !== undefined) updateDbData.adresse_cabinet = adresse_cabinet;
    if (siret !== undefined) updateDbData.siret = siret;
    if (code_ape !== undefined) updateDbData.code_ape = code_ape; // 🌟 Ajouté code_ape
    if (adeli !== undefined) updateDbData.adeli = adeli;
    if (site_web !== undefined) updateDbData.site_web = site_web;

    if (Object.keys(updateDbData).length > 0) {
      const { error: dbError } = await supabaseAdmin.from('therapeutes').update(updateDbData).eq('id', id);
      if (dbError) throw dbError;
    }

    // 3. Mise à jour Cabinet
    if (id_cabinet && (nom_cabinet !== undefined || lien_google !== undefined)) {
      const updateCabData: any = {};
      if (nom_cabinet) updateCabData.nom = nom_cabinet;
      if (lien_google) updateCabData.lien_avis_google = lien_google;

      const { error: cabError } = await supabaseAdmin
        .from('cabinets')
        .update(updateCabData)
        .eq('id', id_cabinet);

      if (cabError) throw cabError;
    }
    else if (!id_cabinet && (nom_cabinet !== undefined || lien_google !== undefined)) {
        const updateCabData: any = {};
        if (nom_cabinet) updateCabData.nom = nom_cabinet;
        if (lien_google) updateCabData.lien_avis_google = lien_google;

        const { error: cabError } = await supabaseAdmin
          .from('cabinets')
          .update(updateCabData)
          .eq('therapeute_id', id);

        if (cabError) throw cabError;
    }

    return NextResponse.json({ message: 'Données mises à jour avec succès' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
