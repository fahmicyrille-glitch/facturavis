'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID: string;
  ADS_ID: string;
}

export default function GoogleAnalytics({
  GA_MEASUREMENT_ID,
  ADS_ID
}: GoogleAnalyticsProps) {
  return (
    <>
      {/* Chargement asynchrone optimisé du script Google */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
      />

      {/* Initialisation de la balise Globale */}
      <Script
        id="google-tags-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Configuration Google Analytics
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });

            // Configuration Google Ads (AW-18043378456)
            gtag('config', '${ADS_ID}');
          `,
        }}
      />
    </>
  );
}
