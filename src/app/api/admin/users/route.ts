import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new NextResponse('Non autorisé', { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return new NextResponse('Accès refusé. Vous n\'êtes pas le Super Admin.', { status: 403 });
    }

    const body = await request.json();
    // 🌟 On récupère les nouveaux champs optionnels
    const { email, password, nom, titre, telephone, lien_google } = body;

    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email, password: password, email_confirm: true
    });
    if (createError) throw createError;

    // 🌟 Insertion des infos dans le profil praticien
    const { error: dbError } = await supabaseAdmin.from('therapeutes').insert([{
      id: authData.user.id,
      email: email,
      nom: nom,
      titre: titre || null,
      telephone: telephone || null
    }]);
    if (dbError) throw dbError;

    // 🌟 MAGIE : S'il y a un lien Google, on crée automatiquement le 1er cabinet !
    if (lien_google) {
      const { error: cabError } = await supabaseAdmin.from('cabinets').insert([{
        therapeute_id: authData.user.id,
        nom: 'Cabinet Principal', // Nom par défaut
        lien_avis_google: lien_google
      }]);
      if (cabError) throw cabError;
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
    if (authError || !user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) return new NextResponse('Accès refusé', { status: 403 });

    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('id');
    if (!targetUserId) return new NextResponse('ID manquant', { status: 400 });

    await supabaseAdmin.from('therapeutes').delete().eq('id', targetUserId);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ message: 'Praticien supprimé définitivement' });
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
    if (authError || !user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) return new NextResponse('Accès refusé', { status: 403 });

    const body = await request.json();
    const { id, email, nom, password, titre, telephone } = body;

    const updateAuthData: any = {};
    if (email) { updateAuthData.email = email; updateAuthData.email_confirm = true; }
    if (password) { updateAuthData.password = password; }

    if (Object.keys(updateAuthData).length > 0) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, updateAuthData);
      if (authUpdateError) throw authUpdateError;
    }

    // 🌟 Mise à jour de tous les champs du profil praticien
    const updateDbData: any = {};
    if (nom !== undefined) updateDbData.nom = nom;
    if (email !== undefined) updateDbData.email = email;
    if (titre !== undefined) updateDbData.titre = titre;
    if (telephone !== undefined) updateDbData.telephone = telephone;

    if (Object.keys(updateDbData).length > 0) {
      const { error: dbError } = await supabaseAdmin.from('therapeutes').update(updateDbData).eq('id', id);
      if (dbError) throw dbError;
    }

    return NextResponse.json({ message: 'Praticien mis à jour avec succès' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
