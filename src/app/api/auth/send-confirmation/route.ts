import { NextResponse } from 'next/server';

// Route désactivée — l'envoi d'emails auth est géré directement par Supabase via SMTP Resend.
export async function POST() {
  return NextResponse.json({ message: 'Hook désactivé' }, { status: 404 });
}
