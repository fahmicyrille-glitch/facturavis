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

// --- SEO & METADATA ULTRA-VENDEUSES (MULTI-PRATICIENS) ---
export const metadata: Metadata = {
  title: "FacturAvis | Le Logiciel N°1 des Praticiens (Ostéopathes, Psy, Chiros...)",
  description: "Ostéopathes, Psychologues, Chiropracteurs, Diététiciens, Kinésiologues... Libérez-vous de l'administratif ! Dossiers sécurisés, factures en 10s et avis Google automatisés. Testez l'offre Membre Fondateur sans CB.",
  keywords: "logiciel ostéopathe, logiciel psychologue, facturation chiropracteur, gestion cabinet diététicien, kinésiologue, psychothérapeute, logiciel thérapeute, avis Google praticien santé, facturation mutuelle, FacturAvis",
  icons: {
    icon: "/logo/logo.png",
    shortcut: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
  openGraph: {
    title: 'FacturAvis | Simplifiez votre cabinet & Boostez vos rendez-vous',
    description: "L'outil tout-en-un adapté à toutes les spécialités de la santé et du bien-être. Facturez en un clic et devenez n°1 sur Google Maps. Découvrez notre accès Membre Fondateur !",
    url: 'https://facturavis.fr',
    siteName: 'FacturAvis',
    images: [{
      url: '/og-image.jpg', // Pense bien à avoir cette image dans ton dossier "public"
      width: 1200,
      height: 630,
      alt: "FacturAvis - Le logiciel de gestion des praticiens libéraux"
    }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FacturAvis | Le Logiciel des Thérapeutes Modernes',
    description: "Ostéopathes, Psys, Chiros, Diététiciens... Passez au niveau supérieur. Factures, dossiers et avis Google automatisés. Rejoignez les Membres Fondateurs.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
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
