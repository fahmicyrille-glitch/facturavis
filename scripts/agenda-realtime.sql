-- Active la synchronisation temps reel de l'agenda (page /dashboard/agenda
-- mise a jour sans rechargement quand un patient annule/reprogramme).
-- A executer une fois dans le SQL Editor de Supabase.

alter publication supabase_realtime add table rendez_vous;
