export function guessCategorie(fournisseurNom: string): string {
  const nom = (fournisseurNom || '').toLowerCase();
  if (nom.includes('comptab') || nom.includes('expert') || nom.includes('fiduci')) return 'Comptable';
  if (nom.includes('orange') || nom.includes('sfr') || nom.includes('free') || nom.includes('bouygues') || nom.includes('telecom')) return 'Télécom / Internet';
  if (nom.includes('edf') || nom.includes('engie') || nom.includes('énergie') || nom.includes('gaz')) return 'Énergie';
  if (nom.includes('assur') || nom.includes('maif') || nom.includes('axa') || nom.includes('allianz')) return 'Assurance';
  if (nom.includes('médic') || nom.includes('medic') || nom.includes('santé') || nom.includes('materiel')) return 'Matériel médical';
  if (nom.includes('loyer') || nom.includes('immobil') || nom.includes('foncier') || nom.includes('bail')) return 'Loyer / Local';
  if (nom.includes('format') || nom.includes('école') || nom.includes('université')) return 'Formation';
  return 'Autre';
}
