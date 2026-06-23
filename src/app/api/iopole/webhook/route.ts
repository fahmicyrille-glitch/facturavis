import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const body = await request.text();

  try {
    const events = parseIopoleXml(body);

    if (events.length === 0) {
      return NextResponse.json({ received: true, skipped: 'no actionable events' });
    }

    let synced = 0;

    for (const event of events) {
      if (!event.invoiceId) continue;

      const { data: existing } = await supabaseAdmin
        .from('factures_recues')
        .select('id')
        .like('notes', `iopole:${event.invoiceId}%`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const { data: therapeutes } = await supabaseAdmin
        .from('therapeutes')
        .select('id, siret')
        .limit(100);

      if (!therapeutes || therapeutes.length === 0) continue;

      const matched = therapeutes.find(t => t.siret === event.buyerSiret) || therapeutes[0];

      const categorie = guessCategorie(event.sellerName);

      await supabaseAdmin.from('factures_recues').insert([{
        therapeute_id: matched.id,
        fournisseur_nom: event.sellerName || 'Fournisseur inconnu',
        montant: event.totalTTC,
        date_facture: event.issueDate || null,
        categorie,
        notes: `iopole:${event.invoiceId}`,
        fichier_path: `iopole-push-${event.invoiceId}`,
      }]);

      synced++;
    }

    return NextResponse.json({ received: true, synced });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur webhook Iopole:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface IopoleEvent {
  invoiceId: string | null;
  lifecycle: string | null;
  processCode: string | null;
  sellerName: string;
  sellerSiret: string;
  buyerSiret: string;
  totalHT: number | null;
  totalTVA: number | null;
  totalTTC: number | null;
  issueDate: string | null;
  currency: string;
}

function parseIopoleXml(rawBody: string): IopoleEvent[] {
  const events: IopoleEvent[] = [];

  const xmlDocs = rawBody.split('<?xml').filter(s => s.trim()).map(s => '<?xml' + s);

  for (const xml of xmlDocs) {
    if (xml.includes('CrossIndustryInvoice')) {
      const invoiceId = extractTag(xml, 'ram:ID', 'rsm:ExchangedDocument');
      const sellerSiret = extractSchemeId(xml, 'ram:SellerTradeParty', '0002');
      const buyerSiret = extractSchemeId(xml, 'ram:BuyerTradeParty', '0002');
      const totalHT = extractNumber(xml, 'ram:TaxBasisTotalAmount');
      const totalTVA = extractNumber(xml, 'ram:TaxTotalAmount');
      const issueDate = extractDateTag(xml, 'ram:IssueDateTime');

      const totalTTC = (totalHT !== null && totalTVA !== null) ? totalHT + totalTVA : totalHT;

      events.push({
        invoiceId,
        lifecycle: 'INVOICE',
        processCode: null,
        sellerName: '',
        sellerSiret: sellerSiret || '',
        buyerSiret: buyerSiret || '',
        totalHT,
        totalTVA,
        totalTTC,
        issueDate,
        currency: extractSimpleTag(xml, 'ram:InvoiceCurrencyCode') || 'EUR',
      });
    }

    if (xml.includes('CrossDomainAcknowledgementAndResponse')) {
      const lifecycle = extractSimpleTag(xml, 'ram:Name');
      const processCode = extractSimpleTag(xml, 'ram:ProcessConditionCode');
      const invoiceId = extractSimpleTag(xml, 'ram:IssuerAssignedID');

      const sellerParty = extractPartyByRole(xml, 'SE');
      const buyerParty = extractPartyByRole(xml, 'BY');

      if (lifecycle?.includes('MADE_AVAILABLE') || lifecycle?.includes('RECEIVED')) {
        events.push({
          invoiceId,
          lifecycle: lifecycle?.replace('Lifecycle - ', '') || null,
          processCode,
          sellerName: sellerParty.name,
          sellerSiret: sellerParty.siret,
          buyerSiret: buyerParty.siret,
          totalHT: null,
          totalTVA: null,
          totalTTC: null,
          issueDate: null,
          currency: 'EUR',
        });
      }
    }
  }

  const invoiceDoc = events.find(e => e.lifecycle === 'INVOICE');
  const statusEvents = events.filter(e => e.lifecycle !== 'INVOICE');

  if (invoiceDoc && statusEvents.length > 0) {
    for (const se of statusEvents) {
      if (!se.totalTTC && invoiceDoc.totalTTC) se.totalTTC = invoiceDoc.totalTTC;
      if (!se.sellerName && invoiceDoc.sellerSiret) se.sellerName = `Fournisseur SIRET ${invoiceDoc.sellerSiret}`;
      if (!se.issueDate && invoiceDoc.issueDate) se.issueDate = invoiceDoc.issueDate;
    }
    return statusEvents;
  }

  if (invoiceDoc) return [invoiceDoc];
  return statusEvents;
}

function extractSimpleTag(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]+)</${tagName}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function extractTag(xml: string, tagName: string, parentTag: string): string | null {
  const parentRegex = new RegExp(`<${parentTag}[^>]*>([\\s\\S]*?)</${parentTag}>`);
  const parentMatch = xml.match(parentRegex);
  if (!parentMatch) return null;
  return extractSimpleTag(parentMatch[1], tagName);
}

function extractNumber(xml: string, tagName: string): number | null {
  const val = extractSimpleTag(xml, tagName);
  if (!val) return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

function extractSchemeId(xml: string, parentTag: string, schemeId: string): string | null {
  const parentRegex = new RegExp(`<${parentTag}[^>]*>([\\s\\S]*?)</${parentTag}>`);
  const parentMatch = xml.match(parentRegex);
  if (!parentMatch) return null;
  const idRegex = new RegExp(`<ram:ID schemeID="${schemeId}">([^<]+)</ram:ID>`);
  const idMatch = parentMatch[1].match(idRegex);
  return idMatch ? idMatch[1].trim() : null;
}

function extractDateTag(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}>[\\s\\S]*?<udt:DateTimeString[^>]*>([^<]+)</udt:DateTimeString>[\\s\\S]*?</${tagName}>`);
  const match = xml.match(regex);
  if (!match) return null;
  const raw = match[1].trim();
  if (raw.length >= 8) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return null;
}

function extractPartyByRole(xml: string, roleCode: string): { name: string; siret: string } {
  const partyRegex = new RegExp(`<ram:RecipientTradeParty>[\\s\\S]*?<ram:RoleCode>${roleCode}</ram:RoleCode>[\\s\\S]*?</ram:RecipientTradeParty>`, 'g');
  let match = partyRegex.exec(xml);

  if (!match) {
    const issuerRegex = new RegExp(`<ram:IssuerTradeParty>[\\s\\S]*?<ram:RoleCode>${roleCode}</ram:RoleCode>[\\s\\S]*?</ram:IssuerTradeParty>`, 'g');
    match = issuerRegex.exec(xml);
  }

  if (!match) return { name: '', siret: '' };

  const block = match[0];
  const name = extractSimpleTag(block, 'ram:Name') || '';
  const siret = block.match(/<ram:GlobalID schemeID="0002">([^<]+)<\/ram:GlobalID>/)?.[1] || '';
  return { name, siret };
}

function guessCategorie(fournisseurNom: string): string {
  const nom = fournisseurNom.toLowerCase();
  if (nom.includes('comptab') || nom.includes('expert') || nom.includes('fiduci')) return 'Comptable';
  if (nom.includes('orange') || nom.includes('sfr') || nom.includes('free') || nom.includes('bouygues') || nom.includes('telecom')) return 'Télécom / Internet';
  if (nom.includes('edf') || nom.includes('engie') || nom.includes('énergie') || nom.includes('gaz')) return 'Énergie';
  if (nom.includes('assur') || nom.includes('maif') || nom.includes('axa') || nom.includes('allianz')) return 'Assurance';
  if (nom.includes('médic') || nom.includes('medic') || nom.includes('santé') || nom.includes('materiel')) return 'Matériel médical';
  if (nom.includes('loyer') || nom.includes('immobil') || nom.includes('foncier') || nom.includes('bail')) return 'Loyer / Local';
  if (nom.includes('format') || nom.includes('école') || nom.includes('université')) return 'Formation';
  return 'Autre';
}
