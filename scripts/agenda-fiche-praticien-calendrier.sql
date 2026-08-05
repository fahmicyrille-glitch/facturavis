-- Enrichissement de la fiche praticien (page de reservation en ligne + email de confirmation)
-- et flux de synchronisation calendrier personnel du praticien (Google Calendar / Apple Calendar).
-- A executer une fois dans le SQL Editor de Supabase.

-- Courte presentation affichee sur la page de reservation en ligne, pour rassurer un patient
-- qui decouvre le praticien via le lien (pas encore client).
alter table therapeutes add column if not exists bio text not null default '';

-- Instructions d'acces au cabinet (etage, code portail, interphone...) — INCLUSES UNIQUEMENT
-- dans l'email de confirmation apres reservation, jamais affichees publiquement avant (un
-- code d'acces ne doit pas etre visible par n'importe qui avant d'avoir reellement un RDV).
alter table therapeutes add column if not exists instructions_acces text not null default '';

-- Jeton opaque du flux ICS abonnable (Google Calendar "Autres agendas > A partir de l'URL",
-- Apple Calendar "Nouvel abonnement"). Distinct de l'ID praticien pour pouvoir etre regenere
-- (si le lien fuite) sans casser le lien public de reservation.
alter table therapeutes add column if not exists calendar_feed_token uuid not null default gen_random_uuid();
