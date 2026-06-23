import Link from "next/link";
import Image from "next/image";

export default function PolitiqueConfidentialite() {
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
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Politique de Confidentialite</h1>
        <p className="text-[#7a6a5f] mb-10 font-medium">Derniere mise a jour : juin 2026</p>

        <div className="space-y-10 text-[#7a6a5f] leading-relaxed">
          {/* Responsable du traitement */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">1. Responsable du traitement</h2>
            <div className="bg-white p-6 rounded-2xl border border-[#f0e6de]">
              <p>
                Le responsable du traitement des donnees personnelles collectees sur le site
                <strong className="text-[#3e2f25]"> facturavis.fr</strong> est :
              </p>
              <ul className="list-none space-y-1 mt-3">
                <li><strong className="text-[#3e2f25]">FacturAvis</strong></li>
                <li>Email : <a href="mailto:facturavispro@gmail.com" className="text-[#a9825a] hover:underline">facturavispro@gmail.com</a></li>
              </ul>
            </div>
          </section>

          {/* Donnees collectees */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">2. Donnees collectees</h2>
            <p className="mb-4">
              Dans le cadre de l&apos;utilisation du service FacturAvis, nous sommes amenes a collecter les donnees
              personnelles suivantes :
            </p>
            <div className="bg-white p-6 rounded-2xl border border-[#f0e6de]">
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-[#3e2f25]">Donnees d&apos;identification :</strong> nom, prenom, adresse email, numero de telephone</li>
                <li><strong className="text-[#3e2f25]">Donnees professionnelles :</strong> profession, numero ADELI/RPPS, numero SIRET, adresse du cabinet</li>
                <li><strong className="text-[#3e2f25]">Donnees des patients :</strong> nom, prenom, email, telephone, notes therapeutiques, historique de consultations</li>
                <li><strong className="text-[#3e2f25]">Donnees de facturation :</strong> montants, dates de prestations, references de factures</li>
                <li><strong className="text-[#3e2f25]">Donnees techniques :</strong> adresse IP, type de navigateur, pages consultees</li>
              </ul>
            </div>
          </section>

          {/* Finalites */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">3. Finalites du traitement</h2>
            <p className="mb-4">Les donnees personnelles sont collectees pour les finalites suivantes :</p>
            <ul className="list-disc list-inside space-y-2 bg-white p-6 rounded-2xl border border-[#f0e6de]">
              <li>Creation et gestion du compte utilisateur</li>
              <li>Fourniture du service de facturation et de gestion de cabinet</li>
              <li>Envoi des factures aux patients par email</li>
              <li>Automatisation de la collecte d&apos;avis Google</li>
              <li>Generation de rapports mensuels d&apos;activite</li>
              <li>Communication relative au service (mises a jour, assistance)</li>
              <li>Mesure d&apos;audience et amelioration du service</li>
            </ul>
          </section>

          {/* Base legale */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">4. Base legale du traitement</h2>
            <p>Le traitement des donnees repose sur :</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li><strong className="text-[#3e2f25]">L&apos;execution du contrat</strong> (article 6.1.b du RGPD) pour la fourniture du service</li>
              <li><strong className="text-[#3e2f25]">Le consentement</strong> (article 6.1.a du RGPD) pour les cookies analytiques et les communications marketing</li>
              <li><strong className="text-[#3e2f25]">L&apos;interet legitime</strong> (article 6.1.f du RGPD) pour l&apos;amelioration du service</li>
            </ul>
          </section>

          {/* Duree de conservation */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">5. Duree de conservation</h2>
            <div className="bg-white p-6 rounded-2xl border border-[#f0e6de] space-y-3">
              <p><strong className="text-[#3e2f25]">Donnees du compte :</strong> conservees pendant toute la duree de l&apos;abonnement, puis 3 ans apres la cloture du compte.</p>
              <p><strong className="text-[#3e2f25]">Donnees de facturation :</strong> conservees 10 ans conformement aux obligations comptables et fiscales francaises.</p>
              <p><strong className="text-[#3e2f25]">Donnees de navigation :</strong> conservees 13 mois maximum (cookies analytiques).</p>
            </div>
          </section>

          {/* Droits des utilisateurs */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">6. Vos droits (RGPD — articles 15 a 21)</h2>
            <p className="mb-4">
              Conformement au Reglement General sur la Protection des Donnees (RGPD), vous disposez des droits suivants :
            </p>
            <div className="bg-white p-6 rounded-2xl border border-[#f0e6de]">
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-[#3e2f25]">Droit d&apos;acces</strong> (article 15) : obtenir la confirmation que des donnees vous concernant sont traitees et en recevoir une copie</li>
                <li><strong className="text-[#3e2f25]">Droit de rectification</strong> (article 16) : demander la correction de donnees inexactes ou incompletes</li>
                <li><strong className="text-[#3e2f25]">Droit a l&apos;effacement</strong> (article 17) : demander la suppression de vos donnees personnelles</li>
                <li><strong className="text-[#3e2f25]">Droit a la limitation du traitement</strong> (article 18) : demander la restriction du traitement de vos donnees</li>
                <li><strong className="text-[#3e2f25]">Droit a la portabilite</strong> (article 20) : recevoir vos donnees dans un format structure et lisible par machine</li>
                <li><strong className="text-[#3e2f25]">Droit d&apos;opposition</strong> (article 21) : vous opposer au traitement de vos donnees pour des motifs legitimes</li>
              </ul>
            </div>
            <p className="mt-4">
              Pour exercer ces droits, contactez-nous a l&apos;adresse :{" "}
              <a href="mailto:facturavispro@gmail.com" className="text-[#a9825a] hover:underline font-bold">
                facturavispro@gmail.com
              </a>
            </p>
            <p className="mt-2">
              Vous disposez egalement du droit d&apos;introduire une reclamation aupres de la CNIL
              (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#a9825a] hover:underline">www.cnil.fr</a>).
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">7. Cookies</h2>
            <p className="mb-4">Le site utilise les cookies suivants :</p>
            <div className="bg-white p-6 rounded-2xl border border-[#f0e6de]">
              <ul className="list-disc list-inside space-y-3">
                <li>
                  <strong className="text-[#3e2f25]">Cookies essentiels :</strong> necessaires au fonctionnement du site
                  (authentification, session utilisateur, preferences). Ces cookies ne peuvent pas etre desactives.
                </li>
                <li>
                  <strong className="text-[#3e2f25]">Google Analytics :</strong> cookies de mesure d&apos;audience permettant
                  d&apos;analyser la frequentation du site et d&apos;ameliorer l&apos;experience utilisateur.
                  Ces cookies sont deposes uniquement avec votre consentement.
                </li>
              </ul>
            </div>
          </section>

          {/* Hebergement */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">8. Hebergement des donnees</h2>
            <div className="bg-white p-6 rounded-2xl border border-[#f0e6de] space-y-3">
              <p>
                <strong className="text-[#3e2f25]">Base de donnees :</strong> Supabase Inc. — les donnees sont hebergees
                sur des serveurs situes dans l&apos;Union Europeenne (region eu-west), garantissant la conformite avec le RGPD.
              </p>
              <p>
                <strong className="text-[#3e2f25]">Hebergement web :</strong> Vercel Inc. — 440 N Barranca Ave #4133,
                Covina, CA 91723, Etats-Unis. Les transferts de donnees vers les Etats-Unis sont encadres par les
                clauses contractuelles types de la Commission europeenne.
              </p>
            </div>
          </section>

          {/* Securite */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">9. Securite des donnees</h2>
            <p>
              Nous mettons en oeuvre des mesures techniques et organisationnelles appropriees pour proteger vos
              donnees personnelles contre tout acces non autorise, perte, destruction ou alteration. Les donnees
              sont chiffrees en transit (TLS) et au repos. L&apos;acces aux donnees est strictement limite aux
              personnes autorisees.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">10. Contact</h2>
            <p>
              Pour toute question relative a la protection de vos donnees personnelles, vous pouvez nous contacter :
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
          <Link href="/cgv" className="text-[#a9825a] hover:text-[#3e2f25] transition-colors">
            Conditions Generales de Vente
          </Link>
        </div>
      </main>
    </div>
  );
}
