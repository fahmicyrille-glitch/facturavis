-- Horaires d'ouverture configurables par jour de la semaine, utilises pour
-- filtrer les creneaux proposes au patient lors d'une reprogrammation.
-- Cle '0' = dimanche ... '6' = samedi (comme Date.getDay()).
-- Par defaut : tous les jours actifs 08:00-20:00, pour ne rien changer au
-- comportement actuel tant que le praticien n'a pas personnalise ses horaires.
-- A executer une fois dans le SQL Editor de Supabase.

alter table therapeutes add column if not exists horaires_ouverture jsonb not null default '{
  "0": {"actif": true, "debut": "08:00", "fin": "20:00"},
  "1": {"actif": true, "debut": "08:00", "fin": "20:00"},
  "2": {"actif": true, "debut": "08:00", "fin": "20:00"},
  "3": {"actif": true, "debut": "08:00", "fin": "20:00"},
  "4": {"actif": true, "debut": "08:00", "fin": "20:00"},
  "5": {"actif": true, "debut": "08:00", "fin": "20:00"},
  "6": {"actif": true, "debut": "08:00", "fin": "20:00"}
}'::jsonb;
