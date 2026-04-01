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

// --- SEO & METADATA ULTRA-VENDEUSES (MULTI-PRATICIENS + FACTUR-X) ---
export const metadata: Metadata = {
  metadataBase: new URL('https://facturavis.fr'),
  title: "FacturAvis | Logiciel Factur-X 2026 & Avis Google pour Praticiens",
  description: "Praticiens libéraux (Ostéopathes, Psys, Chiros...) : Passez à la facturation électronique Factur-X 2026 en 1 clic. Automatisez vos avis Google et vos dossiers patients. Testez gratuitement.",
  keywords: "logiciel ostéopathe, factur-x santé, facture électronique 2026, logiciel psychologue, facturation chiropracteur, gestion cabinet libéral, avis Google praticien santé, facturation mutuelle, FacturAvis",
  icons: {
    icon: "/logo/logo.png",
    shortcut: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
  openGraph: {
    title: 'FacturAvis | Factur-X 2026 & Boostez vos rendez-vous',
    description: "L'outil tout-en-un adapté aux praticiens de santé. Facturez aux normes 2026 (Factur-X) en un clic et devenez n°1 sur Google Maps.",
    url: 'https://facturavis.fr',
    siteName: 'FacturAvis',
    images: [{
      url: '/og-image.jpg', // Pense bien à avoir cette image dans ton dossier "public"
      width: 1200,
      height: 630,
      alt: "FacturAvis - Le logiciel Factur-X des praticiens libéraux"
    }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FacturAvis | Le Logiciel des Thérapeutes Modernes',
    description: "Passez aux normes Factur-X 2026. Factures, dossiers et avis Google automatisés pour Ostéos, Psys, Chiros... Rejoignez les Membres Fondateurs.",
  }
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
