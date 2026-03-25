import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nomTherapeute,
      titreTherapeute,
      telephone,
      emailTherapeute,
      patientNom,
      patientAdresse,
      patientSecu,
      acte,
      prix,
      numFacture,
      adresseCabinet,
      siteWeb,
      adeli,
      siret,
      codeApe,
      logoUrl,
      signatureUrl,
      modeReglement // NOUVEAU : Récupération du mode de règlement
    } = body;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const colorBeige = rgb(0.85, 0.76, 0.62);
    const colorBlack = rgb(0, 0, 0);
    const colorGray = rgb(0.4, 0.4, 0.4);

    // ==========================================
    // 1. EN-TÊTE (Bandeau Beige + LOGO)
    // ==========================================
    page.drawRectangle({ x: 0, y: height - 120, width: width, height: 120, color: colorBeige });

    // LOGO
    if (logoUrl) {
      try {
        const logoRes = await fetch(logoUrl);
        const logoBytes = await logoRes.arrayBuffer();
        const isPng = logoUrl.toLowerCase().includes('.png');
        const logoImg = isPng ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);

        page.drawImage(logoImg, {
          x: 40,
          y: height - 100,
          width: 80,
          height: 80,
        });
      } catch (e) { console.error("Erreur logo PDF:", e); }
    }

    const nomHeader = `${nomTherapeute || ''}`.toUpperCase();
    const nomWidth = fontBold.widthOfTextAtSize(nomHeader, 24);
    page.drawText(nomHeader, { x: (width - nomWidth) / 2, y: height - 60, size: 24, font: fontBold, color: colorBlack });

    const titreHeader = `${titreTherapeute || ''}`.toUpperCase();
    const titreWidth = fontRegular.widthOfTextAtSize(titreHeader, 12);
    page.drawText(titreHeader, { x: (width - titreWidth) / 2, y: height - 85, size: 12, font: fontRegular, color: colorBlack, letterSpacing: 2 });

    // ==========================================
    // 2. COORDONNÉES DU PRATICIEN (DYNAMIQUE)
    // ==========================================
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

    // ==========================================
    // 3. INFOS PATIENT & NUMÉRO FACTURE
    // ==========================================
    let patientY = height - 200;
    const rightX = width - 240;

    page.drawText(patientNom || "", { x: rightX, y: patientY, size: 12, font: fontBold, color: colorBlack });
    patientY -= 15;

    if (patientAdresse) {
      page.drawText(patientAdresse, { x: rightX, y: patientY, size: 10, font: fontRegular, color: colorBlack });
      patientY -= 15;
    }

    if (patientSecu) {
      page.drawText(`N° Sécu : ${patientSecu}`, { x: rightX, y: patientY, size: 10, font: fontRegular, color: colorBlack });
      patientY -= 15;
    }

    page.drawText(`Le : ${new Date().toLocaleDateString('fr-FR')}`, { x: rightX, y: patientY - 10, size: 10, font: fontBold, color: colorBlack });

    // Utilisation du numéro de facture séquentiel envoyé par le front
    page.drawText(`Facture n° : ${numFacture}`, { x: rightX, y: patientY - 25, size: 9, font: fontRegular, color: colorGray });

    // ==========================================
    // 4. TABLEAU DES PRESTATIONS
    // ==========================================
    const tableY = height - 380;
    page.drawRectangle({ x: 50, y: tableY, width: width - 100, height: 35, borderColor: colorBlack, borderWidth: 1 });
    page.drawText("PRESTATION", { x: 70, y: tableY + 12, size: 10, font: fontBold });
    page.drawText("PRIX", { x: width - 200, y: tableY + 12, size: 10, font: fontBold });
    page.drawText("TOTAL", { x: width - 110, y: tableY + 12, size: 10, font: fontBold });

    page.drawRectangle({ x: 50, y: tableY - 50, width: width - 100, height: 50, color: rgb(0.96, 0.96, 0.96) });
    page.drawText(acte || "Consultation d'ostéopathie", { x: 70, y: tableY - 30, size: 10, font: fontRegular });
    const prixStr = `${Number(prix).toFixed(2).replace('.', ',')} EUR`;
    page.drawText(prixStr, { x: width - 200, y: tableY - 30, size: 10, font: fontRegular });
    page.drawText(prixStr, { x: width - 110, y: tableY - 30, size: 10, font: fontRegular });

    // ==========================================
    // 5. BAS DE PAGE (Mentions & Tampon Auto)
    // ==========================================
    page.drawText("Fait pour servir et valoir ce que de droit.", { x: 50, y: 180, size: 10, font: fontRegular, color: colorGray });

    page.drawRectangle({ x: 50, y: 110, width: 140, height: 40, borderColor: colorBlack, borderWidth: 2 });
    page.drawText("FACTURE\nACQUITTÉE", { x: 72, y: 135, size: 11, font: fontBold, lineHeight: 14 });

    // NOUVEAU : Affichage du mode de règlement sous l'encadré
    if (modeReglement) {
      page.drawText(`Réglée par : ${modeReglement}`, { x: 50, y: 92, size: 10, font: fontBold, color: colorBlack });
    }

    page.drawText("TVA non applicable - Article 261, 4, 1° du CGI", { x: 50, y: 70, size: 8, font: fontRegular, color: colorGray });
    page.drawText("Dispensé d'immatriculation au RCS et au RM - SIRET :", { x: 50, y: 55, size: 8, font: fontRegular, color: colorGray });
    page.drawText(`${siret || ''}`, { x: 255, y: 55, size: 8, font: fontBold, color: colorBlack });

    // --- LE TAMPON AUTOMATIQUE (Style Gras) ---
    const stampX = width - 240;
    let stampY = 160;

    page.drawText(`${nomHeader} ${titreHeader || ''}`, { x: stampX, y: stampY, size: 11, font: fontBold, color: colorBlack });
    stampY -= 16;

    if (adresseCabinet) {
      const parts = adresseCabinet.split(',');
      parts.forEach(p => {
        page.drawText(p.trim().toUpperCase(), { x: stampX, y: stampY, size: 11, font: fontBold, color: colorBlack });
        stampY -= 16;
      });
    }

    if (telephone) {
      page.drawText(telephone, { x: stampX, y: stampY, size: 11, font: fontBold, color: colorBlack });
      stampY -= 10;
    }

    // --- SIGNATURE IMAGE (Sous le tampon auto) ---
    if (signatureUrl) {
      try {
        const sigRes = await fetch(signatureUrl);
        const sigBytes = await sigRes.arrayBuffer();
        const isPng = signatureUrl.toLowerCase().includes('.png');
        const sigImg = isPng ? await pdfDoc.embedPng(sigBytes) : await pdfDoc.embedJpg(sigBytes);

        page.drawImage(sigImg, {
          x: stampX,
          y: stampY - 60,
          width: 130,
          height: 65,
        });
      } catch (e) { console.error("Erreur signature image PDF:", e); }
    }

    const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true });
    return NextResponse.json({ success: true, pdfDataUri: pdfBase64 });

  } catch (error: any) {
    console.error("Erreur générale PDF:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
