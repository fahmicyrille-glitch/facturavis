import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales",
  description: "Mentions légales du site FacturAvis, logiciel de facturation pour praticiens libéraux.",
  alternates: { canonical: "https://facturavis.fr/mentions-legales" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
