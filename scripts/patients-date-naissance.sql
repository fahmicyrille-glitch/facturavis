-- Date de naissance du patient (facultative).
-- A executer une fois dans le SQL Editor de Supabase.

alter table patients add column if not exists date_naissance date;
