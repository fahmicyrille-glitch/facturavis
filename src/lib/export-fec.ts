import type { Facture } from '@/lib/types';

interface FECParams {
  factures: Facture[];
  cabinets: { id: string; nom: string }[];
  siret: string;
  nomTherapeute: string;
}

function anonymizePatientName(fullName: string): string {
  const parts = fullName.split(' ').filter(p => p !== 'Mme' && p !== 'M.' && p !== 'Enfant');
  if (parts.length === 0) return 'Patient';
  const initials = parts.map(p => p.charAt(0).toUpperCase() + '.').join('');
  return `Patient ${initials}`;
}

export function generateFEC({ factures, cabinets, siret, nomTherapeute }: FECParams): string {
  // FEC header (mandatory columns per French law)
  const header = [
    'JournalCode',
    'JournalLib',
    'EcritureNum',
    'EcritureDate',
    'CompteNum',
    'CompteLib',
    'CompAuxNum',
    'CompAuxLib',
    'PieceRef',
    'PieceDate',
    'EcritureLib',
    'Debit',
    'Credit',
    'EcrtureLet',
    'DateLet',
    'ValidDate',
    'Montantdevise',
    'Idevise',
  ].join('\t');

  const lines: string[] = [header];
  let ecritureNum = 1;

  const validFactures = factures.filter(f => f.statut !== 'Annulée' && f.statut !== 'Annulee');

  for (const f of validFactures) {
    const date = new Date(f.created_at);
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const montant = (f.montant || 0).toFixed(2).replace('.', ',');
    const cab = cabinets.find(c => c.id === f.cabinet_id)?.nom || '';
    const numEcriture = `VE${String(ecritureNum).padStart(6, '0')}`;
    const pieceRef = `FA-${f.id.split('-')[0]}`;
    const anonymized = anonymizePatientName(f.patient_nom);

    // Ligne debit (compte client 411000)
    lines.push([
      'VE',
      'Ventes',
      numEcriture,
      dateStr,
      '411000',
      'Clients',
      '',
      anonymized,
      pieceRef,
      dateStr,
      `Honoraires ${anonymized} - ${cab}`,
      montant,
      '0,00',
      '',
      '',
      dateStr,
      '',
      'EUR',
    ].join('\t'));

    // Ligne credit (compte produit 706000 - Prestations de services)
    lines.push([
      'VE',
      'Ventes',
      numEcriture,
      dateStr,
      '706000',
      'Prestations de services',
      '',
      '',
      pieceRef,
      dateStr,
      `Honoraires ${anonymized} - ${cab}`,
      '0,00',
      montant,
      '',
      '',
      dateStr,
      '',
      'EUR',
    ].join('\t'));

    // If payment recorded, add encaissement entry
    if (f.mode_reglement) {
      const compteBank = f.mode_reglement === 'Espèces' ? '530000' :
                         f.mode_reglement === 'Chèque' ? '511200' :
                         '512000'; // CB & Virement -> Banque
      const compteLib = f.mode_reglement === 'Espèces' ? 'Caisse' :
                        f.mode_reglement === 'Chèque' ? 'Chèques à encaisser' :
                        'Banque';

      const numEncaissement = `BQ${String(ecritureNum).padStart(6, '0')}`;

      // Debit banque
      lines.push([
        'BQ',
        'Banque',
        numEncaissement,
        dateStr,
        compteBank,
        compteLib,
        '',
        '',
        pieceRef,
        dateStr,
        `Reglement ${f.mode_reglement} - ${anonymized}`,
        montant,
        '0,00',
        '',
        '',
        dateStr,
        '',
        'EUR',
      ].join('\t'));

      // Credit client
      lines.push([
        'BQ',
        'Banque',
        numEncaissement,
        dateStr,
        '411000',
        'Clients',
        '',
        anonymized,
        pieceRef,
        dateStr,
        `Reglement ${f.mode_reglement} - ${anonymized}`,
        '0,00',
        montant,
        '',
        '',
        dateStr,
        '',
        'EUR',
      ].join('\t'));
    }

    ecritureNum++;
  }

  return lines.join('\n');
}

export function downloadFEC(content: string, siret: string): void {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const filename = `${siret}FEC${dateStr}.txt`;

  const blob = new Blob(['﻿' + content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
