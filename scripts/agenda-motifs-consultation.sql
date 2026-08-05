-- Motifs de consultation definis par chaque praticien (nom + duree), a la Doctolib.
-- Les patients choisissent un motif lors de la reservation en ligne, ce qui determine
-- la duree du creneau propose. A executer une fois dans le SQL Editor de Supabase.

create table if not exists motifs_consultation (
  id uuid primary key default gen_random_uuid(),
  therapeute_id uuid not null references therapeutes(id) on delete cascade,
  nom text not null,
  duree_minutes integer not null check (duree_minutes > 0 and duree_minutes <= 480),
  actif boolean not null default true,
  ordre integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists motifs_consultation_therapeute_idx on motifs_consultation (therapeute_id, ordre);

alter table motifs_consultation enable row level security;

create policy "Praticiens gerent leurs motifs de consultation"
  on motifs_consultation for all
  using (auth.uid() = therapeute_id)
  with check (auth.uid() = therapeute_id);

-- Lien du rendez-vous vers le motif choisi (nullable : RDV bloques manuellement sans motif,
-- ou motif supprime depuis). motif_nom capture le libelle au moment de la reservation, pour
-- garder un historique lisible meme si le motif est renomme/supprime plus tard.
alter table rendez_vous add column if not exists motif_id uuid references motifs_consultation(id) on delete set null;
alter table rendez_vous add column if not exists motif_nom text not null default '';
