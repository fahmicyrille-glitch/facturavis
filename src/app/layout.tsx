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

// --- SEO & METADATA BOOSTÉES ---
export const metadata: Metadata = {
  title: "FacturAvis | Le Logiciel de Facturation et Avis Google pour Thérapeutes",
  description: "Gérez vos dossiers patients, générez vos factures en 10s et récoltez automatiquement des avis Google 5 étoiles. L'outil tout-en-un des praticiens libéraux.",
  keywords: "logiciel thérapeute, facturation ostéopathe, gestion cabinet médical, avis Google cabinet",
  icons: {
    icon: "/logo/logo.png",
    shortcut: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
  openGraph: {
    title: 'FacturAvis | Boostez votre cabinet libéral',
    description: "Dossiers, factures et avis automatisés. Simplifiez votre quotidien.",
    url: 'https://facturavis.fr',
    siteName: 'FacturAvis',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Ton ID de mesure Google Analytics récupéré sur ta capture */}
        <GoogleAnalytics GA_MEASUREMENT_ID="G-G8524720E3" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
