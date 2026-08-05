-- Blindage de l'agenda : impossible physiquement de creer deux RDV qui se chevauchent
-- pour un meme praticien (protection contre les reservations simultanees).
-- A executer une fois dans le SQL Editor de Supabase.

-- Extension requise pour la contrainte d'exclusion sur uuid + plage de temps
create extension if not exists btree_gist;

-- Si cette contrainte echoue a la creation, c'est qu'il existe deja des RDV qui se
-- chevauchent. Les lister avec :
--   select a.id, b.id from rendez_vous a
--   join rendez_vous b on a.therapeute_id = b.therapeute_id and a.id < b.id
--   and a.statut <> 'annule' and b.statut <> 'annule'
--   and tstzrange(a.date_debut, a.date_fin) && tstzrange(b.date_debut, b.date_fin);
-- puis supprimer/annuler les doublons avant de relancer.
alter table rendez_vous add constraint rendez_vous_no_overlap
  exclude using gist (
    therapeute_id with =,
    tstzrange(date_debut, date_fin) with &&
  ) where (statut <> 'annule');

-- Accelere la recherche de doublons en liste d'attente
create index if not exists liste_attente_therapeute_email_idx on liste_attente (therapeute_id, email);
