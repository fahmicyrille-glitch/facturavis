export function register() {
  // Vercel bloque la variable d'env "TZ" (nom reserve). Sans ca, le serveur tourne
  // en UTC en production alors que l'agenda (horaires, creneaux, rappels) raisonne
  // en heure de Paris comme en local. On la force ici, au tout premier demarrage
  // du process serveur, avant toute manipulation de date.
  process.env.TZ = 'Europe/Paris';
}
