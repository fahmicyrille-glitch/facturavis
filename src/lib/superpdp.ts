const SUPERPDP_API_URL = process.env.SUPERPDP_API_URL || 'https://api.superpdp.tech';
const SUPERPDP_TOKEN_URL = `${SUPERPDP_API_URL}/oauth2/token`;
const SUPERPDP_CLIENT_ID = process.env.SUPERPDP_CLIENT_ID || '';
const SUPERPDP_CLIENT_SECRET = process.env.SUPERPDP_CLIENT_SECRET || '';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const res = await fetch(SUPERPDP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SUPERPDP_CLIENT_ID,
      client_secret: SUPERPDP_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`Super PDP auth failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in * 1000);
  return cachedToken!;
}

async function apiGet(path: string, accept = 'application/json'): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${SUPERPDP_API_URL}${path}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': accept },
  });
}

export interface SuperPDPInvoiceRaw {
  id: number;
  direction: string;
  created_at: string;
  en_invoice: {
    number: string;
    issue_date: string;
    currency_code: string;
    seller: {
      name: string;
      legal_registration_identifier?: { value: string; scheme: string };
      vat_identifier?: string;
    };
    buyer: {
      name: string;
      legal_registration_identifier?: { value: string; scheme: string };
    };
    totals: {
      total_with_vat: string;
      total_without_vat: string;
      total_vat_amount: { value: string };
    };
    lines: { item_information: { name: string }; net_amount: string }[];
  };
  events: { status_code: string; status_text: string }[];
}

export interface SuperPDPInvoiceParsed {
  id: number;
  sellerName: string;
  sellerSiren: string;
  buyerName: string;
  buyerSiren: string;
  totalTTC: number;
  totalHT: number;
  tva: number;
  currency: string;
  issueDate: string;
  invoiceNumber: string;
  direction: string;
  status: string;
}

function parseInvoice(raw: SuperPDPInvoiceRaw): SuperPDPInvoiceParsed {
  const inv = raw.en_invoice;
  return {
    id: raw.id,
    sellerName: inv.seller?.name || '',
    sellerSiren: inv.seller?.legal_registration_identifier?.value || '',
    buyerName: inv.buyer?.name || '',
    buyerSiren: inv.buyer?.legal_registration_identifier?.value || '',
    totalTTC: parseFloat(inv.totals?.total_with_vat || '0'),
    totalHT: parseFloat(inv.totals?.total_without_vat || '0'),
    tva: parseFloat(inv.totals?.total_vat_amount?.value || '0'),
    currency: inv.currency_code || 'EUR',
    issueDate: inv.issue_date || '',
    invoiceNumber: inv.number || '',
    direction: raw.direction,
    status: raw.events?.[raw.events.length - 1]?.status_text || '',
  };
}

export async function getCompanyInfo(): Promise<unknown> {
  const res = await apiGet('/v1.beta/companies/me');
  if (!res.ok) throw new Error(`Super PDP company error ${res.status}`);
  return res.json();
}

export async function listInvoiceIds(direction: 'in' | 'out' = 'in'): Promise<{ ids: number[]; count: number }> {
  const res = await apiGet(`/v1.beta/invoices?direction=${direction}`);
  if (!res.ok) throw new Error(`Super PDP invoices error ${res.status}`);
  const result = await res.json();
  const ids = (result.data || []).map((r: { id: number }) => r.id);
  return { ids, count: result.count || 0 };
}

export async function getInvoice(id: number): Promise<SuperPDPInvoiceParsed> {
  const res = await apiGet(`/v1.beta/invoices/${id}`);
  if (!res.ok) throw new Error(`Super PDP invoice ${id} error ${res.status}`);
  const raw = await res.json();
  return parseInvoice(raw);
}

export async function getInvoiceDocument(id: number): Promise<ArrayBuffer> {
  const token = await getAccessToken();
  const res = await fetch(`${SUPERPDP_API_URL}/v1.beta/invoices/${id}/download`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Super PDP document ${id} error ${res.status}`);
  return res.arrayBuffer();
}

export function isSuperPDPConfigured(): boolean {
  return Boolean(SUPERPDP_CLIENT_ID && SUPERPDP_CLIENT_SECRET);
}
