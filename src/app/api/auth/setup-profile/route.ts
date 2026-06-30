import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendAdminNewSignupEmail } from '@/lib/send-notification-email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, nom, titre, telephone, siret, adresseCabinet, nomCabinet, lienGoogle } = body;

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId et email requis' }, { status: 400 });
    }

    // Vérifier que le userId correspond à un vrai utilisateur Auth avec cet email
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !user || user.email?.toLowerCase() !== email.toLowerCase().trim()) {
      return NextResponse.json({ error: 'Utilisateur invalide' }, { status: 403 });
    }

    // Check if profile already exists
    const { data: existing } = await supabaseAdmin
      .from('therapeutes')
      .select('id')
      .eq('id', userId)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Profil déjà existant' });
    }

    // Create therapeute profile with admin client (bypasses RLS)
    const { error: profileError } = await supabaseAdmin.from('therapeutes').insert([{
      id: userId,
      email,
      nom: nom?.trim() || '',
      titre: titre?.trim() || '',
      telephone: telephone?.trim() || '',
      siret: siret?.replace(/\s/g, '') || '',
      adresse_cabinet: adresseCabinet?.trim() || '',
      plan: 'free',
    }]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Notification admin
    sendAdminNewSignupEmail(nom?.trim() || email, email, 'free')
      .catch(err => console.error('[setup-profile] Admin email error:', err));

    // Create cabinet if provided
    if (nomCabinet?.trim()) {
      await supabaseAdmin.from('cabinets').insert([{
        therapeute_id: userId,
        nom: nomCabinet.trim(),
        lien_avis_google: lienGoogle?.trim() || '',
      }]);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
