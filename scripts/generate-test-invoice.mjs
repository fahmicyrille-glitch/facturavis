// Génère une facture Factur-X (CII / EN16931) "auto-adressée" pour tester la
// réception sur le PDP : vendeur ET acheteur = même SIREN.
//
// Usage :
//   node scripts/generate-test-invoice.mjs
//   node scripts/generate-test-invoice.mjs --siren 921866729 --nom "FAHMI CYRILLE-KYROLLES" --prix 50
//
// Le fichier PDF généré (avec XML Factur-X embarqué) est à uploader dans le
// portail SuperPDP -> "Factures de vente".

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// --- Arguments CLI ---
const args = process.argv.slice(2);
function arg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const SIREN = arg('siren', '921866729').replace(/\s/g, '').slice(0, 9);
const NOM = arg('nom', 'FAHMI CYRILLE-KYROLLES');
const PRIX = Number(arg('prix', '50'));
const PEPPOL_ID = arg('peppol', `0225:${SIREN}`); // ligne annuaire Peppol OK
const NUM_FACTURE = arg('num', `TEST-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`);

const prixStr = PRIX.toFixed(2);
const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 30);
const dueDateStr = dueDate.toISOString().split('T')[0].replace(/-/g, '');

function escapeXml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// Le point clé pour l'AUTO-ENVOI : le BuyerTradeParty porte le MÊME SIREN +
// le même endpoint de routage (0225 Peppol) que le vendeur.
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:BusinessProcessSpecifiedDocumentContextParameter>
      <ram:ID>S1</ram:ID>
    </ram:BusinessProcessSpecifiedDocumentContextParameter>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${escapeXml(NUM_FACTURE)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${dateStr}</udt:DateTimeString>
    </ram:IssueDateTime>
    <ram:IncludedNote>
      <ram:Content>Facture de TEST auto-adressee (verification reception PDP).</ram:Content>
    </ram:IncludedNote>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>1</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>Prestation de test</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${prixStr}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="C62">1</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>E</ram:CategoryCode>
          <ram:RateApplicablePercent>0</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${prixStr}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${escapeXml(NOM)}</ram:Name>
        <ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0002">${SIREN}</ram:ID>
        </ram:SpecifiedLegalOrganization>
        <ram:PostalTradeAddress>
          <ram:CountryID>FR</ram:CountryID>
        </ram:PostalTradeAddress>
        <ram:URIUniversalCommunication>
          <ram:URIID schemeID="0225">${escapeXml(PEPPOL_ID)}</ram:URIID>
        </ram:URIUniversalCommunication>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">FR00${SIREN}</ram:ID>
        </ram:SpecifiedTaxRegistration>
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${escapeXml(NOM)}</ram:Name>
        <ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0002">${SIREN}</ram:ID>
        </ram:SpecifiedLegalOrganization>
        <ram:PostalTradeAddress>
          <ram:CountryID>FR</ram:CountryID>
        </ram:PostalTradeAddress>
        <ram:URIUniversalCommunication>
          <ram:URIID schemeID="0225">${escapeXml(PEPPOL_ID)}</ram:URIID>
        </ram:URIUniversalCommunication>
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery>
      <ram:ActualDeliverySupplyChainEvent>
        <ram:OccurrenceDateTime>
          <udt:DateTimeString format="102">${dateStr}</udt:DateTimeString>
        </ram:OccurrenceDateTime>
      </ram:ActualDeliverySupplyChainEvent>
    </ram:ApplicableHeaderTradeDelivery>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>0.00</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:ExemptionReason>TVA non applicable - Article 261, 4, 1 du CGI</ram:ExemptionReason>
        <ram:BasisAmount>${prixStr}</ram:BasisAmount>
        <ram:CategoryCode>E</ram:CategoryCode>
        <ram:RateApplicablePercent>0</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>
      <ram:SpecifiedTradePaymentTerms>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${dueDateStr}</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${prixStr}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${prixStr}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">0.00</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${prixStr}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${prixStr}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;

// --- PDF lisible ---
const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([595.28, 841.89]);
const { height } = page.getSize();
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

page.drawText('FACTURE DE TEST', { x: 50, y: height - 60, size: 22, font: fontBold, color: rgb(0, 0, 0) });
const lines = [
  `Numero : ${NUM_FACTURE}`,
  `Date : ${new Date().toLocaleDateString('fr-FR')}`,
  '',
  `Vendeur : ${NOM} (SIREN ${SIREN})`,
  `Acheteur : ${NOM} (SIREN ${SIREN})  <-- auto-adresse`,
  `Routage Peppol : ${PEPPOL_ID}`,
  '',
  `Prestation de test .................. ${prixStr} EUR`,
  `TOTAL TTC ........................... ${prixStr} EUR`,
  'TVA non applicable - Article 261, 4, 1 du CGI',
];
let y = height - 110;
for (const l of lines) {
  page.drawText(l, { x: 50, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
  y -= 22;
}

// --- Injection Factur-X ---
await pdfDoc.attach(new TextEncoder().encode(xml), 'factur-x.xml', {
  mimeType: 'text/xml',
  description: 'Factur-X/ZUGFeRD Invoice XML',
  creationDate: new Date(),
  modificationDate: new Date(),
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPdf = join(__dirname, '..', `facture-test-${SIREN}.pdf`);
const outXml = join(__dirname, '..', `facture-test-${SIREN}.xml`);
writeFileSync(outPdf, await pdfDoc.save());
writeFileSync(outXml, xml);

console.log('OK - fichiers generes :');
console.log('  PDF (Factur-X) :', outPdf);
console.log('  XML (CII seul) :', outXml);
console.log('');
console.log('Vendeur = Acheteur = SIREN', SIREN, '| Peppol', PEPPOL_ID, '| Montant', prixStr, 'EUR');
console.log('=> Uploader le PDF dans le portail SuperPDP : "Factures de vente".');
