-- Deux champs libres, affichés l'un au-dessus de l'autre sur la facture PDF, juste en
-- dessous des coordonnées du praticien (ex : mention de conventionnement, assurance RCP,
-- numéro d'agrément...). Optionnels, vides par défaut.
-- À exécuter une fois dans le SQL Editor de Supabase.

alter table therapeutes add column if not exists mention_facture_1 text not null default '';
alter table therapeutes add column if not exists mention_facture_2 text not null default '';
