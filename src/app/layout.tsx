import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from '@/components/GoogleAnalytics';

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
    default: "FacturAvis — Logiciel de Facturation & Avis Google pour Praticiens Libéraux",
    template: "%s | FacturAvis",
  },
  description: "Ostéopathes, Psychologues, Chiropracteurs, Diététiciens : générez vos factures conformes Factur-X 2026 en 10 secondes et récoltez automatiquement vos avis Google. Essai gratuit, sans CB.",

  keywords: [
    "logiciel ostéopathe",
    "logiciel facturation praticien libéral",
    "facture ostéopathie mutuelle",
    "factur-x praticien santé",
    "facturation électronique 2026",
    "logiciel psychologue facturation",
    "logiciel chiropracteur",
    "avis Google cabinet médical",
    "automatiser avis Google praticien",
    "gestion cabinet libéral",
    "note d'honoraires ostéopathe",
    "note d'honoraires psychologue",
    "logiciel diététicien facturation",
    "logiciel naturopathe",
    "logiciel sophrologue",
    "facturation hypnothérapeute",
    "reçu honoraires kinésiologue",
    "logiciel réflexologue",
    "dossier patient sécurisé",
    "réforme facturation 2026 professionnel santé",
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
    title: "FacturAvis — Factures Factur-X + Avis Google automatisés pour Praticiens",
    description: "Générez vos factures conformes aux normes 2026 en 10s et récoltez 3× plus d'avis Google automatiquement. Logiciel tout-en-un pour praticiens libéraux.",
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
    title: "FacturAvis — Factures Factur-X & Avis Google pour Praticiens",
    description: "10 secondes pour facturer. 3× plus d'avis Google. L'outil des praticiens libéraux modernes. Essai gratuit.",
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
      </body>
    </html>
  );
}
