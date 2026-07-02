import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "CGV — FacturAvis" };

export default function CGV() {
  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#3e2f25] font-sans">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-[#f0e6de] px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo/logo.png" alt="Logo FacturAvis" width={32} height={32} className="object-contain rounded-xl" />
            <span className="text-lg font-black tracking-tighter text-[#3e2f25]">FacturAvis</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-[#a9825a] hover:text-[#3e2f25] transition-colors">
            Retour a l&apos;accueil
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Conditions Generales de Vente</h1>
        <p className="text-[#7a6a5f] mb-10 font-medium">En vigueur a compter du 1er janvier 2026</p>

        <div className="space-y-10 text-[#7a6a5f] leading-relaxed">
          {/* Objet */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">1. Objet</h2>
            <p>
              Les presentes Conditions Generales de Vente (CGV) regissent l&apos;utilisation du service en ligne
              <strong className="text-[#3e2f25]"> FacturAvis</strong>, accessible a l&apos;adresse
              <strong className="text-[#3e2f25]"> facturavis.fr</strong>. En souscrivant au service, l&apos;utilisateur
              accepte sans reserve les presentes conditions.
            </p>
          </section>

          {/* Description du service */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">2. Description du service</h2>
            <p className="mb-4">
              FacturAvis est un logiciel en ligne (SaaS) destine aux praticiens liberaux du secteur de la sante.
              Le service comprend :
            </p>
            <ul className="list-disc list-inside space-y-2 bg-white p-6 rounded-2xl border border-[#f0e6de]">
              <li>La gestion des dossiers patients (notes therapeutiques, historique)</li>
              <li>La generation de factures et notes d&apos;honoraires conformes au format Factur-X</li>
              <li>L&apos;envoi automatise des factures par email aux patients</li>
              <li>L&apos;automatisation de la collecte d&apos;avis Google Maps</li>
              <li>L&apos;export comptable des donnees de facturation</li>
              <li>La gestion multi-cabinets (SIRET et pages Google distincts)</li>
              <li>La generation de rapports mensuels d&apos;activite</li>
            </ul>
          </section>

          {/* Tarifs */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">3. Tarifs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#f0e6de]">
                <div className="inline-block bg-[#fdf2e9] text-[#a9825a] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                  Fondateur
                </div>
                <p className="text-3xl font-black text-[#3e2f25] mb-2">19 &euro; <span className="text-base font-medium text-[#7a6a5f]">/ mois TTC</span></p>
                <p>Tarif bloque a vie pour les membres fondateurs. Acces a l&apos;ensemble des fonctionnalites.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#f0e6de]">
                <div className="inline-block bg-[#3e2f25] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                  Standard
                </div>
                <p className="text-3xl font-black text-[#3e2f25] mb-2">29 &euro; <span className="text-base font-medium text-[#7a6a5f]">/ mois TTC</span></p>
                <p>Tarif standard applicable apres la periode fondateur. Acces a l&apos;ensemble des fonctionnalites.</p>
              </div>
            </div>
            <p className="mt-4">
              Les prix sont indiques en euros, toutes taxes comprises (TTC). FacturAvis se reserve le droit de
              modifier ses tarifs a tout moment. Les nouveaux tarifs s&apos;appliquent uniquement aux nouveaux
              abonnements ou aux renouvellements suivant la modification.
            </p>
          </section>

          {/* Essai gratuit */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">4. Essai gratuit</h2>
            <div className="bg-white p-6 rounded-2xl border border-[#f0e6de]">
              <p>
                FacturAvis propose un <strong className="text-[#3e2f25]">essai gratuit de 14 jours</strong>,
                sans engagement et sans carte bancaire. A l&apos;issue de la periode d&apos;essai, l&apos;utilisateur
                peut choisir de souscrire a un abonnement payant. En l&apos;absence de souscription, le compte est
                automatiquement desactive. Les donnees sont conservees pendant 30 jours supplementaires avant suppression
                definitive.
              </p>
            </div>
          </section>

          {/* Abonnement */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">5. Abonnement et paiement</h2>
            <p className="mb-3">
              L&apos;abonnement est souscrit pour une duree d&apos;un mois, renouvelable automatiquement par tacite
              reconduction. Le paiement est effectue par carte bancaire via notre prestataire de paiement securise
              (Stripe).
            </p>
            <p>
              La facturation intervient a la date anniversaire de souscription de l&apos;abonnement. Un recu est
              automatiquement envoye par email a chaque paiement.
            </p>
          </section>

          {/* Resiliation */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">6. Resiliation</h2>
            <div className="bg-white p-6 rounded-2xl border border-[#f0e6de] space-y-3">
              <p>
                L&apos;utilisateur peut resilier son abonnement a tout moment depuis son espace personnel ou en
                contactant le support a l&apos;adresse{" "}
                <a href="mailto:facturavispro@gmail.com" className="text-[#a9825a] hover:underline font-bold">
                  facturavispro@gmail.com
                </a>.
              </p>
              <p>
                La resiliation prend effet a la fin de la periode de facturation en cours. Aucun remboursement
                au prorata n&apos;est effectue pour la periode restante.
              </p>
              <p>
                Apres resiliation, l&apos;utilisateur conserve l&apos;acces au service jusqu&apos;a la fin de sa
                periode payee. Les donnees sont conservees pendant 30 jours apres la date effective de resiliation,
                durant lesquels l&apos;utilisateur peut exporter ses donnees. Passe ce delai, les donnees sont
                definitivement supprimees.
              </p>
            </div>
          </section>

          {/* Droit de retractation */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">7. Droit de retractation</h2>
            <p>
              Conformement a l&apos;article L221-28 du Code de la consommation, le droit de retractation ne peut
              etre exerce pour les contrats de fourniture de contenu numerique non fourni sur un support materiel
              dont l&apos;execution a commence avec l&apos;accord prealable du consommateur. Toutefois, l&apos;essai
              gratuit de 14 jours permet de tester le service sans engagement.
            </p>
          </section>

          {/* Responsabilite */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">8. Limitation de responsabilite</h2>
            <p className="mb-3">
              FacturAvis s&apos;engage a fournir le service avec diligence et selon les regles de l&apos;art.
              Il s&apos;agit d&apos;une obligation de moyens et non de resultat.
            </p>
            <p className="mb-3">
              FacturAvis ne saurait etre tenu responsable des dommages directs ou indirects resultant de
              l&apos;utilisation ou de l&apos;impossibilite d&apos;utilisation du service, notamment :
            </p>
            <ul className="list-disc list-inside space-y-2 bg-white p-6 rounded-2xl border border-[#f0e6de]">
              <li>Les interruptions temporaires de service pour maintenance ou mise a jour</li>
              <li>La perte de donnees en cas de force majeure</li>
              <li>L&apos;utilisation frauduleuse du compte par un tiers</li>
              <li>Les erreurs de saisie commises par l&apos;utilisateur dans les factures</li>
              <li>Les consequences fiscales ou comptables decoulant de l&apos;utilisation du service</li>
            </ul>
            <p className="mt-3">
              En tout etat de cause, la responsabilite de FacturAvis est limitee au montant des sommes effectivement
              versees par l&apos;utilisateur au cours des 12 derniers mois precedant le fait generateur.
            </p>
          </section>

          {/* Obligations utilisateur */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">9. Obligations de l&apos;utilisateur</h2>
            <p className="mb-3">L&apos;utilisateur s&apos;engage a :</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Fournir des informations exactes et a jour lors de son inscription</li>
              <li>Maintenir la confidentialite de ses identifiants de connexion</li>
              <li>Utiliser le service conformement a sa destination et aux lois en vigueur</li>
              <li>Ne pas tenter de contourner les mesures de securite du service</li>
              <li>Respecter les droits de propriete intellectuelle de FacturAvis</li>
            </ul>
          </section>

          {/* Donnees personnelles */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">10. Donnees personnelles</h2>
            <p>
              Le traitement des donnees personnelles est decrit dans notre{" "}
              <Link href="/politique-confidentialite" className="text-[#a9825a] hover:underline font-bold">
                Politique de Confidentialite
              </Link>.
              L&apos;utilisateur est responsable du traitement des donnees de ses patients qu&apos;il saisit dans
              le service, conformement au RGPD.
            </p>
          </section>

          {/* Loi applicable */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">11. Loi applicable et juridiction competente</h2>
            <div className="bg-white p-6 rounded-2xl border border-[#f0e6de]">
              <p className="mb-3">
                Les presentes CGV sont regies par le <strong className="text-[#3e2f25]">droit francais</strong>.
              </p>
              <p>
                En cas de litige relatif a l&apos;interpretation ou a l&apos;execution des presentes conditions,
                les parties s&apos;efforceront de trouver une solution amiable. A defaut, le litige sera soumis
                aux tribunaux competents du ressort du siege social de FacturAvis. Conformement aux articles
                L.616-1 et R.616-1 du Code de la consommation, le consommateur peut recourir gratuitement au
                service de mediation propose.
              </p>
            </div>
          </section>

          {/* Modification des CGV */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">12. Modification des CGV</h2>
            <p>
              FacturAvis se reserve le droit de modifier les presentes CGV a tout moment. Les utilisateurs seront
              informes de toute modification par email au moins 30 jours avant l&apos;entree en vigueur des nouvelles
              conditions. La poursuite de l&apos;utilisation du service apres cette date vaut acceptation des nouvelles CGV.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">13. Contact</h2>
            <p>
              Pour toute question relative aux presentes conditions, vous pouvez nous contacter :
            </p>
            <div className="bg-white p-6 rounded-2xl border border-[#f0e6de] mt-3">
              <p>Email : <a href="mailto:facturavispro@gmail.com" className="text-[#a9825a] hover:underline font-bold">facturavispro@gmail.com</a></p>
            </div>
          </section>
        </div>

        {/* Navigation links */}
        <div className="mt-16 pt-8 border-t border-[#f0e6de] flex flex-wrap gap-6 text-sm font-bold">
          <Link href="/" className="text-[#a9825a] hover:text-[#3e2f25] transition-colors">
            Retour a l&apos;accueil
          </Link>
          <Link href="/mentions-legales" className="text-[#a9825a] hover:text-[#3e2f25] transition-colors">
            Mentions Legales
          </Link>
          <Link href="/politique-confidentialite" className="text-[#a9825a] hover:text-[#3e2f25] transition-colors">
            Politique de Confidentialite
          </Link>
        </div>
      </main>
    </div>
  );
}
