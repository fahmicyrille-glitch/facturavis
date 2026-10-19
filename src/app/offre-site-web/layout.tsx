import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offre Outil + Site Web",
  description: "Votre agenda en ligne, votre facturation, vos avis Google automatiques, et un vrai site web professionnel construit pour votre cabinet. 39€/mois + 199€ de création unique.",
  keywords: [
    "site web praticien libéral",
    "site internet ostéopathe",
    "création site web psychologue",
    "agenda en ligne et site web thérapeute",
    "offre FacturAvis site web",
  ],
  alternates: {
    canonical: "https://facturavis.fr/offre-site-web",
  },
  openGraph: {
    title: "Offre Outil + Site Web — FacturAvis",
    description: "Votre outil de facturation et de rendez-vous en ligne, plus un vrai site web professionnel pour votre cabinet. 39€/mois + 199€ de création unique.",
    url: "https://facturavis.fr/offre-site-web",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Offre Outil + Site Web FacturAvis",
    }],
  },
};

export default function OffreSiteWebLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
