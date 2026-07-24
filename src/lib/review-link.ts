// Ouverture du lien d'avis Google en contournant les navigateurs intégrés (in-app).
//
// Problème vérifié : pour publier un avis, Google exige une connexion, et redirige donc
// vers accounts.google.com — que Google REFUSE d'afficher dans un navigateur intégré
// (Gmail, Instagram, Facebook…) avec l'erreur « disallowed_useragent ». Beaucoup de
// patients ouvrent le lien de facture depuis un email/réseau social sur mobile : le clic
// vers l'avis échoue alors silencieusement.
//
// Stratégie (sans copier-coller) :
//   - Android in-app  → lien intent:// qui force l'ouverture dans Chrome (session Google
//     déjà active), avec repli https si Chrome est absent.
//   - iOS in-app      → lien https direct : il déclenche le plus souvent l'appli Google Maps
//     (où le patient est déjà connecté). Aucun moyen fiable de forcer Safari depuis un
//     webview iOS — le cas résiduel est rattrapé par la relance email à J+3.
//   - Navigateur normal → nouvel onglet classique.

export type BrowserContext = 'android-inapp' | 'ios-inapp' | 'normal';

const IN_APP_RE = /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|WhatsApp|Twitter|TikTok|Snapchat|Pinterest|GSA\//i;

export function detectBrowserContext(ua: string): BrowserContext {
  if (!IN_APP_RE.test(ua)) return 'normal';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios-inapp';
  return 'android-inapp';
}

export interface ReviewHref {
  href: string;
  // true → ouvrir dans un nouvel onglet (navigateur normal) ; false → navigation directe
  // (les schémas intent:// et les deep links d'app ne fonctionnent pas avec target=_blank).
  newTab: boolean;
}

export function buildReviewHref(googleLink: string, ua: string): ReviewHref {
  const context = detectBrowserContext(ua);

  if (context === 'android-inapp') {
    const stripped = googleLink.replace(/^https?:\/\//, '');
    const fallback = encodeURIComponent(googleLink);
    return {
      href: `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`,
      newTab: false,
    };
  }

  if (context === 'ios-inapp') {
    // Lien direct : laisse iOS ouvrir l'appli Maps/Google si installée.
    return { href: googleLink, newTab: false };
  }

  return { href: googleLink, newTab: true };
}
