-- Agenda praticien : rendez-vous (vue semaine/jour + CRUD).
-- À exécuter une fois dans le SQL Editor de Supabase.

create table if not exists rendez_vous (
  id uuid primary key default gen_random_uuid(),
  therapeute_id uuid not null references therapeutes(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  cabinet_id uuid references cabinets(id) on delete set null,
  titre text not null default 'Consultation',
  date_debut timestamptz not null,
  date_fin timestamptz not null,
  statut text not null default 'confirme' check (statut in ('confirme', 'en_attente', 'annule', 'termine')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  constraint rendez_vous_dates_check check (date_fin > date_debut)
);

create index if not exists rendez_vous_therapeute_date_idx on rendez_vous (therapeute_id, date_debut);

alter table rendez_vous enable row level security;

create policy "Praticiens gèrent leurs propres rendez-vous"
  on rendez_vous for all
  using (auth.uid() = therapeute_id)
  with check (auth.uid() = therapeute_id);
