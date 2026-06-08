import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offre Membre Fondateur — -10€ à Vie | FacturAvis",
  description: "Rejoignez les 50 premiers praticiens fondateurs de FacturAvis. Accédez au logiciel de facturation Factur-X 2026 et de collecte d'avis Google à tarif fondateur bloqué à vie. Places très limitées.",
  keywords: [
    "offre fondateur logiciel praticien",
    "abonnement ostéopathe logiciel",
    "logiciel facturation pas cher praticien",
    "essai gratuit facturation électronique",
    "inscription FacturAvis",
  ],
  alternates: {
    canonical: "https://facturavis.fr/fondateur",
  },
  openGraph: {
    title: "Offre Membre Fondateur — Rejoignez FacturAvis à -10€ à Vie",
    description: "50 places à tarif fondateur bloqué. Logiciel Factur-X + avis Google automatisés pour ostéopathes, psychologues, chiropracteurs. Ne ratez pas cette offre.",
    url: "https://facturavis.fr/fondateur",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Offre Membre Fondateur FacturAvis",
    }],
  },
};

export default function FondateurLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
