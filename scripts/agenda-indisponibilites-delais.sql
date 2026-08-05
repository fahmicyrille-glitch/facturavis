-- Indisponibilites (blocages ponctuels + absences) et delais configurables de reservation
-- en ligne (annulation/modification, delai minimum de reservation).
-- A executer une fois dans le SQL Editor de Supabase.

-- Une indisponibilite est une ligne rendez_vous sans patient (titre = motif de l'absence,
-- ex. "Conges", "Formation", "Pause dejeuner"). Elle profite automatiquement de toute la
-- mecanique existante : contrainte anti-chevauchement, calcul des creneaux disponibles,
-- optimisation anti-trous — aucune modification necessaire sur ces mecanismes.
alter table rendez_vous add column if not exists type text not null default 'consultation'
  check (type in ('consultation', 'indisponibilite'));

-- Delai (en heures) en dessous duquel un patient ne peut plus annuler/reprogrammer un RDV
-- en ligne (0 = aucune limite, comportement actuel inchange).
alter table therapeutes add column if not exists delai_annulation_heures integer not null default 0;

-- Delai (en heures) minimum requis entre l'instant present et le debut d'un creneau pour
-- qu'il soit reservable en ligne (0 = aucune limite, comportement actuel inchange).
alter table therapeutes add column if not exists delai_reservation_heures integer not null default 0;
