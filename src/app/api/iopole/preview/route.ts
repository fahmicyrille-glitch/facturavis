import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { downloadInvoicePdf, isIopoleConfigured } from '@/lib/iopole';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new NextResponse('Non autorisé', { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  if (!isIopoleConfigured()) {
    return new NextResponse('Iopole non configuré', { status: 503 });
  }

  const url = new URL(request.url);
  const invoiceId = url.searchParams.get('id');
  if (!invoiceId) {
    return new NextResponse('ID manquant', { status: 400 });
  }

  try {
    const pdfBuffer = await downloadInvoicePdf(invoiceId);
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="facture-${invoiceId.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
