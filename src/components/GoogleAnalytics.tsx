'use client';

import Script from 'next/script';

// On déclare l'interface pour satisfaire TypeScript lors du build
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
      {/* Chargement de la bibliothèque gtag.js une seule fois */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />

      {/* Configuration simultanée de Analytics et Ads */}
      <Script
        id="google-tags-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Initialisation Google Analytics
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });

            // Initialisation Google Ads
            gtag('config', '${ADS_ID}');
          `,
        }}
      />
    </>
  );
}
