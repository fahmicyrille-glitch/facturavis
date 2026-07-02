import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions Légales — FacturAvis" };

export default function MentionsLegales() {
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
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-10">Mentions Legales</h1>

        <div className="space-y-10 text-[#7a6a5f] leading-relaxed">
          {/* Editeur */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">1. Editeur du site</h2>
            <p className="mb-2">
              Le site <strong className="text-[#3e2f25]">facturavis.fr</strong> est edite par :
            </p>
            <ul className="list-none space-y-1 bg-white p-6 rounded-2xl border border-[#f0e6de]">
              <li><strong className="text-[#3e2f25]">Raison sociale :</strong> FacturAvis</li>
              <li><strong className="text-[#3e2f25]">Responsable de la publication :</strong> Mr Fahmi Cyrille-Kyrolles</li>
              <li><strong className="text-[#3e2f25]">Adresse :</strong> France</li>
              <li><strong className="text-[#3e2f25]">Email :</strong> <a href="mailto:facturavispro@gmail.com" className="text-[#a9825a] hover:underline">facturavispro@gmail.com</a></li>
            </ul>
          </section>

          {/* Hebergement */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">2. Hebergement</h2>
            <div className="bg-white p-6 rounded-2xl border border-[#f0e6de] space-y-4">
              <div>
                <h3 className="font-bold text-[#3e2f25] mb-1">Hebergement du site web</h3>
                <p>Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, Etats-Unis.</p>
                <p>Site : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#a9825a] hover:underline">vercel.com</a></p>
              </div>
              <div>
                <h3 className="font-bold text-[#3e2f25] mb-1">Hebergement des donnees</h3>
                <p>Supabase Inc. — Les donnees sont hebergees sur des serveurs situes dans l&apos;Union Europeenne (region eu-west).</p>
                <p>Site : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#a9825a] hover:underline">supabase.com</a></p>
              </div>
            </div>
          </section>

          {/* Propriete intellectuelle */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">3. Propriete intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus presents sur le site facturavis.fr (textes, images, logos, icones, logiciels, base de donnees)
              sont proteges par le droit d&apos;auteur et le droit de la propriete intellectuelle. Toute reproduction, representation,
              modification, publication ou adaptation de tout ou partie des elements du site, quel que soit le moyen ou le procede
              utilise, est interdite sans l&apos;autorisation ecrite prealable de FacturAvis.
            </p>
          </section>

          {/* Donnees personnelles */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">4. Donnees personnelles</h2>
            <p>
              Les informations relatives au traitement de vos donnees personnelles sont detaillees dans notre{" "}
              <Link href="/politique-confidentialite" className="text-[#a9825a] hover:underline font-bold">
                Politique de Confidentialite
              </Link>.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">5. Cookies</h2>
            <p>
              Le site utilise des cookies essentiels au fonctionnement du service (authentification, preferences)
              ainsi que Google Analytics pour mesurer l&apos;audience du site. Pour plus d&apos;informations, consultez notre{" "}
              <Link href="/politique-confidentialite" className="text-[#a9825a] hover:underline font-bold">
                Politique de Confidentialite
              </Link>.
            </p>
          </section>

          {/* Loi applicable */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-[#3e2f25] mb-4">6. Loi applicable</h2>
            <p>
              Les presentes mentions legales sont soumises au droit francais. En cas de litige, et apres tentative
              de resolution amiable, competence est attribuee aux tribunaux francais competents.
            </p>
          </section>
        </div>

        {/* Navigation links */}
        <div className="mt-16 pt-8 border-t border-[#f0e6de] flex flex-wrap gap-6 text-sm font-bold">
          <Link href="/" className="text-[#a9825a] hover:text-[#3e2f25] transition-colors">
            Retour a l&apos;accueil
          </Link>
          <Link href="/politique-confidentialite" className="text-[#a9825a] hover:text-[#3e2f25] transition-colors">
            Politique de Confidentialite
          </Link>
          <Link href="/cgv" className="text-[#a9825a] hover:text-[#3e2f25] transition-colors">
            Conditions Generales de Vente
          </Link>
        </div>
      </main>
    </div>
  );
}
