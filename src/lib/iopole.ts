const IOPOLE_BASE_URL = process.env.IOPOLE_API_URL || 'https://api.ppd.iopole.fr';
const IOPOLE_TOKEN_URL = process.env.IOPOLE_TOKEN_URL || 'https://auth.ppd.iopole.fr/realms/iopole/protocol/openid-connect/token';
const IOPOLE_CLIENT_ID = process.env.IOPOLE_CLIENT_ID || '';
const IOPOLE_CLIENT_SECRET = process.env.IOPOLE_CLIENT_SECRET || '';
const IOPOLE_CUSTOMER_ID = process.env.IOPOLE_CUSTOMER_ID || '';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const res = await fetch(IOPOLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: IOPOLE_CLIENT_ID,
      client_secret: IOPOLE_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`Iopole auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in * 1000);
  return cachedToken!;
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    'Authorization': `Bearer ${token}`,
    'customer-id': IOPOLE_CUSTOMER_ID,
    'accept': 'application/json',
  };
}

export interface IopoleInvoiceMetadata {
  invoiceId: string;
  state: string;
  direction: string;
  createDate: string;
}

export interface IopoleInvoiceDetail {
  invoiceId: string;
  date: string;
  way: string;
  businessData: {
    seller: { name: string; siren: string };
    buyer: { name: string; siren: string };
    monetary: {
      invoiceAmount: { amount: number };
      taxBasisTotalAmount: { amount: number };
      taxTotalAmount: { amount: number; currency: string };
      invoiceCurrency: string;
    };
    invoiceId: string;
    invoiceDate: string;
    lines: { item: { name: string }; totalAmount: { amount: number } }[];
  };
}

export async function searchInvoices(direction: 'INBOUND' | 'OUTBOUND' = 'INBOUND'): Promise<IopoleInvoiceMetadata[]> {
  const headers = await getHeaders();
  const res = await fetch(`${IOPOLE_BASE_URL}/v1.1/invoice/search?direction=${direction}&page=0&size=50`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Iopole search error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return (data.data || []).map((d: { metadata: IopoleInvoiceMetadata }) => d.metadata);
}

export async function getInvoiceDetail(invoiceId: string): Promise<IopoleInvoiceDetail> {
  const headers = await getHeaders();
  const res = await fetch(`${IOPOLE_BASE_URL}/v1/invoice/${invoiceId}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Iopole detail error ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function downloadInvoicePdf(invoiceId: string): Promise<ArrayBuffer> {
  const headers = await getHeaders();
  const res = await fetch(`${IOPOLE_BASE_URL}/v1/invoice/${invoiceId}/download/readable`, {
    method: 'GET',
    headers: { ...headers, 'accept': 'application/pdf' },
  });

  if (!res.ok) {
    throw new Error(`Iopole download error ${res.status}`);
  }

  return res.arrayBuffer();
}

export function isIopoleConfigured(): boolean {
  return Boolean(IOPOLE_CLIENT_ID && IOPOLE_CLIENT_SECRET && IOPOLE_CUSTOMER_ID);
}
