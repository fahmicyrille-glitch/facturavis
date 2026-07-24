import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { supabaseAdmin, isAllowedStorageUrl } from '@/lib/supabase-admin';

function escapeXml(str: string): string {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// Découpe un texte en plusieurs lignes qui tiennent dans maxWidth (points PDF),
// pour éviter qu'une adresse longue ne déborde de la facture. Un mot plus large que
// maxWidth reste seul sur sa ligne (débordement rare, préférable à une coupe en plein mot).
function wrapText(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function generateFacturXXML(data: any, totalAmount?: number) {
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const amount = totalAmount !== undefined ? totalAmount : Number(data.prix);
  const prixFormatte = amount.toFixed(2);

  const lignes = data.lignes && Array.isArray(data.lignes)
    ? data.lignes
    : [{ nom: data.acte || 'Consultation', prix: Number(data.prix) || 0 }];

  const linesXml = lignes.map((ligne: { nom: string; prix: number }, idx: number) => {
    const lineAmount = Number(ligne.prix).toFixed(2);
    return `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${idx + 1}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${escapeXml(ligne.nom || 'Consultation')}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${lineAmount}</ram:ChargeAmount>
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
          <ram:LineTotalAmount>${lineAmount}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`;
  }).join('');

  const siren = (data.siret || '').replace(/\s/g, '').substring(0, 9);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  const dueDateStr = dueDate.toISOString().split('T')[0].replace(/-/g, '');

  return `<?xml version="1.0" encoding="UTF-8"?>
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
    <ram:ID>${escapeXml(data.numFacture)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${dateStr}</udt:DateTimeString>
    </ram:IssueDateTime>
    <ram:IncludedNote>
      <ram:Content>TVA non applicable - Article 261, 4, 1° du CGI</ram:Content>
      <ram:SubjectCode>AAB</ram:SubjectCode>
    </ram:IncludedNote>
    <ram:IncludedNote>
      <ram:Content>En cas de retard de paiement, indemnite forfaitaire pour frais de recouvrement de 40 euros (art. L441-10 C. com.).</ram:Content>
      <ram:SubjectCode>PMT</ram:SubjectCode>
    </ram:IncludedNote>
    <ram:IncludedNote>
      <ram:Content>Penalites de retard exigibles le lendemain de la date d echeance au taux annuel de 10%.</ram:Content>
      <ram:SubjectCode>PMD</ram:SubjectCode>
    </ram:IncludedNote>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>${linesXml}
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${escapeXml(data.nomTherapeute)}</ram:Name>
        <ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0002">${siren}</ram:ID>
        </ram:SpecifiedLegalOrganization>
        <ram:PostalTradeAddress>
          <ram:CountryID>FR</ram:CountryID>
        </ram:PostalTradeAddress>
        <ram:URIUniversalCommunication>
          <ram:URIID schemeID="0009">${siren}</ram:URIID>
        </ram:URIUniversalCommunication>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">FR00${siren}</ram:ID>
        </ram:SpecifiedTaxRegistration>
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${escapeXml(data.patientNom)}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:CountryID>FR</ram:CountryID>
        </ram:PostalTradeAddress>
        <ram:URIUniversalCommunication>
          <ram:URIID schemeID="0009">0000000000</ram:URIID>
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
        <ram:BasisAmount>${prixFormatte}</ram:BasisAmount>
        <ram:CategoryCode>E</ram:CategoryCode>
        <ram:RateApplicablePercent>0</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>
      <ram:SpecifiedTradePaymentTerms>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${dueDateStr}</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${prixFormatte}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${prixFormatte}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">0.00</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${prixFormatte}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${prixFormatte}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}

export async function POST(request: Request) {
  try {
    // Auth: vérifier le Bearer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse('Non autorisé', { status: 401 });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const body = await request.json();
    const {
      nomTherapeute, titreTherapeute, telephone, emailTherapeute,
      patientNom, patientAdresse, patientSecu, acte, prix,
      numFacture, adresseCabinet, siteWeb, adeli, siret,
      codeApe, logoUrl, signatureUrl, modeReglement, lignes
    } = body;

    // Multi-line support with backwards compatibility
    const lignesArray: { nom: string; prix: number }[] = lignes && Array.isArray(lignes)
      ? lignes
      : [{ nom: acte || "Consultation", prix: Number(prix) || 0 }];

    const totalAmount = lignesArray.reduce((sum: number, l: any) => sum + (Number(l.prix) || 0), 0);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const colorBeige = rgb(0.85, 0.76, 0.62);
    const colorBlack = rgb(0, 0, 0);
    const colorGray = rgb(0.4, 0.4, 0.4);

    // 1. EN-TÊTE
    page.drawRectangle({ x: 0, y: height - 120, width: width, height: 120, color: colorBeige });

    if (logoUrl && isAllowedStorageUrl(logoUrl)) {
      try {
        const logoRes = await fetch(logoUrl);
        const logoBytes = await logoRes.arrayBuffer();
        const isPng = logoUrl.toLowerCase().includes('.png');
        const logoImg = isPng ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);
        page.drawImage(logoImg, { x: 40, y: height - 100, width: 80, height: 80 });
      } catch (e) { console.error("Erreur logo PDF:", e); }
    }

    const nomHeader = `${nomTherapeute || ''}`.toUpperCase();
    const nomWidth = fontBold.widthOfTextAtSize(nomHeader, 24);
    page.drawText(nomHeader, { x: (width - nomWidth) / 2, y: height - 60, size: 24, font: fontBold, color: colorBlack });

    const titreHeader = `${titreTherapeute || ''}`.toUpperCase();
    const titreWidth = fontRegular.widthOfTextAtSize(titreHeader, 12);
    page.drawText(titreHeader, { x: (width - titreWidth) / 2, y: height - 85, size: 12, font: fontRegular, color: colorBlack });

    // 2. COORDONNÉES DU PRATICIEN
    let practitionerY = height - 180;
    const drawLine = (label: string, value: string) => {
      if (value && value.trim() !== "") {
        page.drawText(`${label} : ${value}`, { x: 50, y: practitionerY, size: 10, font: fontRegular, color: colorBlack });
        practitionerY -= 15;
      }
    };
    drawLine("Web", siteWeb);
    drawLine("Email", emailTherapeute);
    drawLine("Tel", telephone);
    drawLine("ADELI", adeli);
    drawLine("APE", codeApe);

    // 3. INFOS PATIENT & NUMÉRO FACTURE
    let patientY = height - 200;
    const rightX = width - 240;

    page.drawText(patientNom || "", { x: rightX, y: patientY, size: 12, font: fontBold, color: colorBlack });
    patientY -= 15;

    if (patientAdresse) {
      const addrLines = wrapText(patientAdresse, fontRegular, 10, width - rightX - 30);
      for (const line of addrLines) {
        page.drawText(line, { x: rightX, y: patientY, size: 10, font: fontRegular, color: colorBlack });
        patientY -= 15;
      }
    }

    if (patientSecu) {
      page.drawText(`N° Sécu : ${patientSecu}`, { x: rightX, y: patientY, size: 10, font: fontRegular, color: colorBlack });
      patientY -= 15;
    }

    page.drawText(`Le : ${new Date().toLocaleDateString('fr-FR')}`, { x: rightX, y: patientY - 10, size: 10, font: fontBold, color: colorBlack });
    page.drawText(`Facture n° : ${numFacture}`, { x: rightX, y: patientY - 25, size: 9, font: fontRegular, color: colorGray });

    // 4. TABLEAU DES PRESTATIONS
    const tableY = height - 380;
    page.drawRectangle({ x: 50, y: tableY, width: width - 100, height: 35, borderColor: colorBlack, borderWidth: 1 });
    page.drawText("PRESTATION", { x: 70, y: tableY + 12, size: 10, font: fontBold });
    page.drawText("PRIX", { x: width - 200, y: tableY + 12, size: 10, font: fontBold });
    page.drawText("TOTAL", { x: width - 110, y: tableY + 12, size: 10, font: fontBold });

    // Draw each line item
    let currentY = tableY;
    for (const ligne of lignesArray) {
      currentY -= 40;
      page.drawRectangle({ x: 50, y: currentY, width: width - 100, height: 40, color: rgb(0.96, 0.96, 0.96) });
      page.drawText(ligne.nom || "Consultation", { x: 70, y: currentY + 14, size: 10, font: fontRegular });
      const lignePrix = `${Number(ligne.prix).toFixed(2).replace('.', ',')} EUR`;
      page.drawText(lignePrix, { x: width - 200, y: currentY + 14, size: 10, font: fontRegular });
      page.drawText(lignePrix, { x: width - 110, y: currentY + 14, size: 10, font: fontRegular });
    }

    // Total row if multiple lines
    if (lignesArray.length > 1) {
      currentY -= 35;
      page.drawRectangle({ x: 50, y: currentY, width: width - 100, height: 35, borderColor: colorBlack, borderWidth: 1 });
      page.drawText("TOTAL", { x: 70, y: currentY + 10, size: 11, font: fontBold });
      const totalStr = `${totalAmount.toFixed(2).replace('.', ',')} EUR`;
      page.drawText(totalStr, { x: width - 110, y: currentY + 10, size: 11, font: fontBold });
    }

    // 5. BAS DE PAGE - positions adjusted based on table height
    const basDePageY = Math.min(currentY - 60, 180);
    page.drawText("Fait pour servir et valoir ce que de droit.", { x: 50, y: basDePageY, size: 10, font: fontRegular, color: colorGray });
    page.drawRectangle({ x: 50, y: basDePageY - 70, width: 140, height: 40, borderColor: colorBlack, borderWidth: 2 });
    page.drawText("FACTURE\nACQUITTÉE", { x: 72, y: basDePageY - 45, size: 11, font: fontBold, lineHeight: 14 });

    if (modeReglement) {
      page.drawText(`Réglée par : ${modeReglement}`, { x: 50, y: basDePageY - 88, size: 10, font: fontBold, color: colorBlack });
    }

    page.drawText("TVA non applicable - Article 261, 4, 1° du CGI", { x: 50, y: basDePageY - 110, size: 8, font: fontRegular, color: colorGray });
    page.drawText("Dispensé d'immatriculation au RCS et au RM - SIRET :", { x: 50, y: basDePageY - 125, size: 8, font: fontRegular, color: colorGray });
    page.drawText(`${siret || ''}`, { x: 255, y: basDePageY - 125, size: 8, font: fontBold, color: colorBlack });

    const stampX = width - 240;
    let stampY = basDePageY - 20;

    const stampMaxWidth = width - stampX - 20;
    // Nom du praticien, puis métier/fonction sur la ligne en dessous (chacun replié si trop long)
    wrapText(nomHeader, fontBold, 11, stampMaxWidth).forEach((line) => {
      page.drawText(line, { x: stampX, y: stampY, size: 11, font: fontBold, color: colorBlack });
      stampY -= 16;
    });
    if (titreHeader) {
      wrapText(titreHeader, fontBold, 11, stampMaxWidth).forEach((line) => {
        page.drawText(line, { x: stampX, y: stampY, size: 11, font: fontBold, color: colorBlack });
        stampY -= 16;
      });
    }

    if (adresseCabinet) {
      const parts = adresseCabinet.split(',');
      parts.forEach((p: string) => {
        const partLines = wrapText(p.trim().toUpperCase(), fontBold, 11, width - stampX - 20);
        partLines.forEach((line) => {
          page.drawText(line, { x: stampX, y: stampY, size: 11, font: fontBold, color: colorBlack });
          stampY -= 16;
        });
      });
    }

    if (telephone) {
      page.drawText(telephone, { x: stampX, y: stampY, size: 11, font: fontBold, color: colorBlack });
      stampY -= 10;
    }

    if (signatureUrl && isAllowedStorageUrl(signatureUrl)) {
      try {
        const sigRes = await fetch(signatureUrl);
        const sigBytes = await sigRes.arrayBuffer();
        const isPng = signatureUrl.toLowerCase().includes('.png');
        const sigImg = isPng ? await pdfDoc.embedPng(sigBytes) : await pdfDoc.embedJpg(sigBytes);
        page.drawImage(sigImg, { x: stampX, y: stampY - 60, width: 130, height: 65 });
      } catch (e) { console.error("Erreur signature image PDF:", e); }
    }

    // 6. INJECTION FACTUR-X
    const xmlString = generateFacturXXML(body, totalAmount);
    const xmlBytes = new TextEncoder().encode(xmlString);
    await pdfDoc.attach(xmlBytes, 'factur-x.xml', {
      mimeType: 'text/xml',
      description: 'Factur-X/ZUGFeRD Invoice XML',
      creationDate: new Date(),
      modificationDate: new Date(),
    });

    const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true });
    return NextResponse.json({ success: true, pdfDataUri: pdfBase64 });

  } catch (error: any) {
    console.error("Erreur générale PDF:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
