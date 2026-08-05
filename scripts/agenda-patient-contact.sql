-- Ajoute email et telephone du patient sur le rendez-vous (independant de la fiche patient),
-- pour l'envoi de la confirmation et la gestion self-service (annulation / reprogrammation).
-- A executer une fois dans le SQL Editor de Supabase.

alter table rendez_vous add column if not exists patient_email text not null default '';
alter table rendez_vous add column if not exists patient_telephone text not null default '';
