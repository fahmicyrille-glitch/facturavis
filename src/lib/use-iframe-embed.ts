'use client';

import { useEffect, useState } from 'react';

// Permet d'intégrer une page patient dans un <iframe> sur le site du praticien (widget de
// réservation façon Doctolib). Deux choses à régler pour qu'un iframe "auto-hauteur"
// fonctionne proprement :
//  1. La page est pensée pour un onglet plein écran (min-h-screen) — en iframe, ça forcerait
//     une hauteur d'au moins 100vh de L'IFRAME (souvent minuscule par défaut), inutile ici.
//  2. Le site parent doit connaître la vraie hauteur du contenu pour ajuster l'iframe —
//     on la lui envoie par postMessage à chaque changement (changement d'étape, résultat...).
// Le script d'intégration fourni au praticien écoute ce message pour redimensionner l'iframe.
export function useIframeEmbed(): boolean {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Lecture d'une API navigateur pure (indisponible côté serveur) : ne peut être connue
    // qu'après le montage, sous peine de désaccord d'hydratation SSR/client si on l'évaluait
    // dès le rendu initial.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsEmbedded(window.self !== window.top);
  }, []);

  useEffect(() => {
    if (!isEmbedded) return;

    const report = () => {
      window.parent.postMessage(
        { source: 'facturavis-reserver', height: document.documentElement.scrollHeight },
        '*',
      );
    };
    report();

    const observer = new ResizeObserver(report);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, [isEmbedded]);

  return isEmbedded;
}

// Snippet HTML à coller sur le site du praticien : l'iframe + le script qui la redimensionne
// automatiquement à la hauteur réelle du contenu (reçue via postMessage ci-dessus).
export function buildEmbedSnippet(bookingUrl: string): string {
  const frameId = `facturavis-rdv-${Math.random().toString(36).slice(2, 8)}`;
  return `<iframe id="${frameId}" src="${bookingUrl}" width="100%" height="600" style="border:none;max-width:600px;display:block;margin:0 auto;"></iframe>
<script>
(function () {
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.source !== 'facturavis-reserver') return;
    var frame = document.getElementById('${frameId}');
    if (frame) frame.style.height = e.data.height + 'px';
  });
})();
</script>`;
}
