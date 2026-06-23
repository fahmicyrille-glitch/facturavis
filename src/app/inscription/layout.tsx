import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Inscription — Créez votre espace praticien",
  description: "Inscrivez-vous gratuitement sur FacturAvis. Facturation Factur-X, dossiers patients et avis Google en 2 minutes.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
