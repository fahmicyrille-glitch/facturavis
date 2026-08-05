-- Lie un rendez-vous d'agenda a une seance (table consultations existante).
-- A executer une fois dans le SQL Editor de Supabase, apres agenda-schema.sql.

alter table consultations add column if not exists rendez_vous_id uuid references rendez_vous(id) on delete set null;
