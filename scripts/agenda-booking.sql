-- Prise de rendez-vous en ligne publique + visio + liste d'attente + anamnese.
-- A executer une fois dans le SQL Editor de Supabase.

-- Duree par defaut d'une consultation (minutes) et lien visio personnel du praticien
alter table therapeutes add column if not exists duree_consultation integer not null default 60;
alter table therapeutes add column if not exists visio_url text not null default '';

-- Nom du patient saisi lors d'une reservation en ligne (pas encore de fiche patient liee)
alter table rendez_vous add column if not exists patient_nom text not null default '';
alter table rendez_vous add column if not exists mode text not null default 'cabinet' check (mode in ('cabinet', 'visio'));

-- Anamnese structuree du dossier patient (motif, antecedents, traitements, allergies, mode de vie)
alter table patients add column if not exists anamnese jsonb not null default '{}'::jsonb;

-- Liste d'attente : patients alertes par email quand un creneau se libere
create table if not exists liste_attente (
  id uuid primary key default gen_random_uuid(),
  therapeute_id uuid not null references therapeutes(id) on delete cascade,
  nom text not null default '',
  email text not null,
  telephone text not null default '',
  notifie boolean not null default false,
  created_at timestamptz not null default now()
);

alter table liste_attente enable row level security;

-- Le praticien voit et gere sa propre liste ; les inscriptions publiques passent par l'API (service role)
create policy "Praticiens gerent leur liste d'attente"
  on liste_attente for all
  using (auth.uid() = therapeute_id)
  with check (auth.uid() = therapeute_id);
