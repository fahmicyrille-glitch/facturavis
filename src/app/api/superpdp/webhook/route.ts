import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

const SUPERPDP_WEBHOOK_SECRET = process.env.SUPERPDP_WEBHOOK_SECRET || '';

// Status values SuperPDP considers as fully validated
const ACTIVE_STATUSES = ['validated', 'active', 'approved', 'enabled'];
// Status values that mean the company is suspended/rejected
const INACTIVE_STATUSES = ['suspended', 'rejected', 'revoked', 'disabled'];

function verifySignature(body: string, header: string | null): boolean {
  if (!SUPERPDP_WEBHOOK_SECRET) return true; // Skip if not configured (dev/test)
  if (!header) return false;

  // Support "sha256=<hex>" format (like Stripe/GitHub) or raw hex
  const received = header.startsWith('sha256=') ? header.slice(7) : header;
  const expected = crypto
    .createHmac('sha256', SUPERPDP_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(received, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

function extractSiren(payload: Record<string, unknown>): string {
  // Try common locations where SuperPDP might put the SIREN/company number
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const company = (data.company ?? data) as Record<string, unknown>;

  return (
    (company.number as string) ||
    (company.siren as string) ||
    (company.siret as string)?.slice(0, 9) ||
    (data.siren as string) ||
    (data.company_number as string) ||
    ''
  );
}

function extractStatus(payload: Record<string, unknown>): string {
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const company = (data.company ?? data) as Record<string, unknown>;

  return (
    (company.status as string) ||
    (company.validation_status as string) ||
    (data.status as string) ||
    (payload.status as string) ||
    ''
  ).toLowerCase();
}

function resolveNewStatus(
  eventType: string,
  rawStatus: string
): 'active' | 'pending' | null {
  const type = eventType.toLowerCase();

  // Explicit activation events
  if (
    type.includes('validated') ||
    type.includes('approved') ||
    type.includes('activated') ||
    type.includes('onboarded')
  ) {
    return 'active';
  }

  // Explicit suspension/rejection events
  if (
    type.includes('suspended') ||
    type.includes('rejected') ||
    type.includes('revoked') ||
    type.includes('disabled')
  ) {
    return 'pending';
  }

  // Generic status_changed — derive from the status field value
  if (ACTIVE_STATUSES.includes(rawStatus)) return 'active';
  if (INACTIVE_STATUSES.includes(rawStatus)) return 'pending';

  return null; // Unknown event — ignore
}

export async function POST(request: Request) {
  const body = await request.text();

  // Verify webhook signature
  const sigHeader =
    request.headers.get('x-superpdp-signature') ||
    request.headers.get('x-webhook-signature') ||
    request.headers.get('x-signature');

  if (!verifySignature(body, sigHeader)) {
    return new NextResponse('Signature invalide', { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return new NextResponse('Payload invalide', { status: 400 });
  }

  const eventType = String(payload.event || payload.type || payload.event_type || '');
  const rawStatus = extractStatus(payload);
  const newStatus = resolveNewStatus(eventType, rawStatus);

  // Nothing to do for unrecognised events — acknowledge anyway
  if (!newStatus) {
    return NextResponse.json({ received: true, action: 'ignored', event: eventType });
  }

  const siren = extractSiren(payload);
  if (!siren) {
    console.error('[SuperPDP webhook] No SIREN found in payload', JSON.stringify(payload));
    return NextResponse.json({ received: true, action: 'no_siren' });
  }

  // Find the user by stored SIREN (first 9 chars to handle SIRET vs SIREN)
  const { data: therapeutes, error } = await supabaseAdmin
    .from('therapeutes')
    .select('id, iopole_status')
    .or(`superpdp_company_siren.eq.${siren},siret.like.${siren}%`);

  if (error) {
    console.error('[SuperPDP webhook] DB lookup error:', error.message);
    return new NextResponse('Erreur serveur', { status: 500 });
  }

  if (!therapeutes || therapeutes.length === 0) {
    console.warn('[SuperPDP webhook] No user found for SIREN:', siren);
    return NextResponse.json({ received: true, action: 'user_not_found', siren });
  }

  // Update all matching users (should normally be just one)
  const updates = therapeutes
    .filter(t => t.iopole_status !== newStatus)
    .map(t =>
      supabaseAdmin
        .from('therapeutes')
        .update({ iopole_status: newStatus })
        .eq('id', t.id)
    );

  await Promise.all(updates);

  return NextResponse.json({
    received: true,
    action: 'updated',
    siren,
    status: newStatus,
    updated: updates.length,
  });
}
