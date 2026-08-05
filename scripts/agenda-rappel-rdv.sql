-- Marque si le rappel automatique (24h avant, envoye par le cron quotidien)
-- a deja ete envoye pour ce rendez-vous, pour eviter les doublons.
-- A executer une fois dans le SQL Editor de Supabase.

alter table rendez_vous add column if not exists rappel_envoye boolean not null default false;
