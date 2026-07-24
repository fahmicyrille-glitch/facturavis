-- Suivi du tunnel d'avis Google : mesurer ce qui se passe APRÈS le clic 5 étoiles,
-- segment qui n'était jusqu'ici pas instrumenté (redirection JS invisible pour l'analytics).
-- À exécuter une fois dans le SQL Editor de Supabase.

-- Horodatage du moment où le patient met sa note (permet de relancer X jours après une
-- note 5★ sans clic Google, sans jamais relancer les factures notées AVANT cette feature :
-- leurs note_at restent NULL et sont donc exclues de la relance).
alter table factures add column if not exists note_at timestamptz;

-- Horodatage du clic réel sur le bouton « laisser mon avis Google » (mesure first-party,
-- indépendante de Google Analytics / bloqueurs de pub).
alter table factures add column if not exists avis_google_click_at timestamptz;

-- Anti-doublon : la relance « avis » n'est envoyée qu'une seule fois par facture.
alter table factures add column if not exists relance_avis_envoye boolean not null default false;

-- Accélère la sélection des factures à relancer par le cron quotidien.
create index if not exists factures_relance_avis_idx
  on factures (note, avis_google_click_at, relance_avis_envoye, note_at);
