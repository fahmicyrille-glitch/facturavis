import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description: "Conditions générales de vente du service FacturAvis, logiciel de facturation et collecte d'avis pour praticiens libéraux.",
  alternates: { canonical: "https://facturavis.fr/cgv" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
