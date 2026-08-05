import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from '@/components/GoogleAnalytics';
import WhatsAppButton from '@/components/WhatsAppButton';
import FloatingCTA from '@/components/FloatingCTA';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://facturavis.fr'),

  title: {
    default: "FacturAvis — Agenda en Ligne, Facturation & Avis Google | Réforme 2026",
    template: "%s | FacturAvis",
  },
  description: "Agenda en ligne : vos patients réservent 24h/24 avec rappels automatiques. Facturation Factur-X, avis Google automatiques et réception gratuite des factures fournisseurs (réforme sept. 2026). Pour ostéopathes, psychologues, praticiens bien-être. Sans CB.",

  keywords: [
    // Réforme 2026
    "réforme facturation électronique 2026",
    "facture électronique thérapeute 2026",
    "plateforme agréée dgfip praticien santé",
    "obligation facture électronique professionnel santé",
    "réception facture électronique ostéopathe",
    "se conformer réforme 2026 thérapeute",
    "factur-x praticien libéral",
    // Facturation par profession
    "logiciel facturation ostéopathe",
    "logiciel facturation psychologue",
    "logiciel facturation chiropracteur",
    "logiciel facturation diététicien",
    "logiciel facturation naturopathe",
    "logiciel facturation sophrologue",
    "logiciel facturation kinésithérapeute",
    "note d'honoraires ostéopathe",
    "note d'honoraires psychologue",
    "note d'honoraires praticien libéral",
    "logiciel praticien libéral",
    "logiciel gestion cabinet libéral",
    // Avis Google
    "avis Google cabinet médical automatique",
    "augmenter avis Google ostéopathe",
    "avis Google automatique thérapeute",
    // Agenda & RDV en ligne
    "prise de rendez-vous en ligne thérapeute",
    "agenda en ligne praticien bien-être",
    "alternative doctolib médecine douce",
    "logiciel agenda ostéopathe",
    "rappel rdv automatique praticien",
    // Divers
    "dossier patient sécurisé thérapeute",
    "logiciel hypnothérapeute",
    "logiciel sophrologue facturation",
    "FacturAvis",
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },

  alternates: {
    canonical: "https://facturavis.fr",
  },

  icons: {
    icon: "/logo/logo.png",
    shortcut: "/logo/logo.png",
    apple: "/logo/logo.png",
  },

  openGraph: {
    title: "FacturAvis — Agenda en Ligne + Facturation + Avis Google pour Praticiens",
    description: "Agenda avec réservation en ligne 24h/24, facturation Factur-X, 3× plus d'avis Google et réception gratuite des factures fournisseurs (réforme 2026). Logiciel tout-en-un pour praticiens libéraux.",
    url: "https://facturavis.fr",
    siteName: "FacturAvis",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "FacturAvis - Logiciel de facturation et avis Google pour praticiens libéraux",
    }],
    locale: "fr_FR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "FacturAvis — Agenda, Factures Factur-X & Avis Google pour Praticiens",
    description: "Agenda en ligne 24h/24, facturation en 10s, 3× plus d'avis Google. L'outil complet des praticiens libéraux modernes. Essai gratuit.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        {/* Balises Analytics & Ads pour tracker les inscriptions Fondateur */}
        <GoogleAnalytics
          GA_MEASUREMENT_ID="G-G8524720E3"
          ADS_ID="AW-18043378456"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <FloatingCTA />
        <WhatsAppButton />
      </body>
    </html>
  );
}
