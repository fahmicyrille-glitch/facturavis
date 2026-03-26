// Déclaration pour que TypeScript reconnaisse gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Fonction pour envoyer un événement de conversion
export const trackConversion = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      event_category: 'engagement',
      event_label: 'Inscription Membre Fondateur',
      value: 1.0, // Tu peux donner une valeur fictive à un lead
      currency: 'EUR',
    });
  }
};
