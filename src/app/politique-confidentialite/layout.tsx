import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
  description: "Politique de confidentialité et protection des données personnelles de FacturAvis, conforme au RGPD.",
  alternates: { canonical: "https://facturavis.fr/politique-confidentialite" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
