import { supabaseAdmin } from './supabase-admin';
import { HOUR_START, HOUR_END } from './agenda-constants';
import type { HorairesOuverture } from './types';

const STEP_MINUTES = 15;
const HORIZON_DAYS = 21;

export interface MotifResolu {
  dureeMinutes: number;
  motifNom: string;
  motifId: string | null;
}

// Resout un motif de consultation cote serveur : ne jamais faire confiance a une duree
// envoyee par le client (sinon un patient pourrait forger une duree arbitraire). Si le
// praticien n'a encore configure aucun motif, on retombe sur sa duree de consultation
// par defaut pour ne rien casser tant qu'il n'a pas migre vers les motifs structures.
export async function resolveMotif(
  therapeuteId: string,
  motifId: string | null | undefined,
): Promise<{ ok: true } & MotifResolu | { ok: false; reason: string }> {
  const { data: motifs, error } = await supabaseAdmin
    .from('motifs_consultation')
    .select('id, nom, duree_minutes')
    .eq('therapeute_id', therapeuteId)
    .eq('actif', true)
    .order('ordre', { ascending: true });
  if (error) throw error;

  if (motifId) {
    const motif = (motifs || []).find((m) => m.id === motifId);
    if (!motif) return { ok: false, reason: 'Motif de consultation invalide.' };
    return { ok: true, dureeMinutes: motif.duree_minutes, motifNom: motif.nom, motifId: motif.id };
  }

  if (motifs && motifs.length > 0) {
    return { ok: false, reason: 'Merci de choisir un motif de consultation.' };
  }

  const { data: therapeute } = await supabaseAdmin
    .from('therapeutes')
    .select('duree_consultation')
    .eq('id', therapeuteId)
    .single();
  return { ok: true, dureeMinutes: therapeute?.duree_consultation || 60, motifNom: 'Consultation', motifId: null };
}

export interface JourCreneaux {
  date: string;
  label: string;
  creneaux: string[];
}

function parseHeureToMinutes(hhmm: string, fallback: number): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return fallback;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

// Verifie qu'un creneau demande est reellement reservable : dans le futur,
// dans les horaires d'ouverture du praticien, et sans chevauchement avec un
// RDV existant. Utilise par les endpoints publics (reservation, reprogrammation)
// pour refuser toute date forgee manuellement hors des creneaux proposes.
export async function isSlotBookable(
  therapeuteId: string,
  debut: Date,
  fin: Date,
  excludeRdvId?: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime()) || fin <= debut) {
    return { ok: false, reason: 'Horaires invalides.' };
  }

  const { data: therapeute } = await supabaseAdmin
    .from('therapeutes')
    .select('horaires_ouverture, delai_reservation_heures')
    .eq('id', therapeuteId)
    .single();
  const horaires = therapeute?.horaires_ouverture as HorairesOuverture | undefined;
  const delaiReservationMs = (therapeute?.delai_reservation_heures || 0) * 3600000;

  if (debut.getTime() < Date.now() + delaiReservationMs) {
    return delaiReservationMs > 0
      ? { ok: false, reason: `Ce créneau doit être réservé au moins ${therapeute?.delai_reservation_heures}h à l'avance.` }
      : { ok: false, reason: 'Ce créneau est déjà passé.' };
  }

  const jourConfig = horaires?.[String(debut.getDay())];
  const bornMin = jourConfig ? parseHeureToMinutes(jourConfig.debut, HOUR_START * 60) : HOUR_START * 60;
  const bornMax = jourConfig ? parseHeureToMinutes(jourConfig.fin, HOUR_END * 60) : HOUR_END * 60;
  const debutMins = debut.getHours() * 60 + debut.getMinutes();
  const finMins = fin.getHours() * 60 + fin.getMinutes();
  const memeJour = debut.toDateString() === fin.toDateString();
  if ((jourConfig && !jourConfig.actif) || !memeJour || debutMins < bornMin || finMins > bornMax) {
    return { ok: false, reason: 'Ce créneau est en dehors des horaires d\'ouverture.' };
  }

  // Chevauchement avec la pause déjeuner (ou autre coupure quotidienne), traitée comme un
  // horaire fermé pour ce jour-là.
  if (jourConfig?.pauseDebut && jourConfig?.pauseFin) {
    const pauseDebut = parseHeureToMinutes(jourConfig.pauseDebut, -1);
    const pauseFin = parseHeureToMinutes(jourConfig.pauseFin, -1);
    if (pauseFin > pauseDebut && debutMins < pauseFin && finMins > pauseDebut) {
      return { ok: false, reason: 'Ce créneau chevauche une coupure (pause déjeuner) du praticien.' };
    }
  }

  let conflictQuery = supabaseAdmin
    .from('rendez_vous')
    .select('id')
    .eq('therapeute_id', therapeuteId)
    .neq('statut', 'annule')
    .lt('date_debut', fin.toISOString())
    .gt('date_fin', debut.toISOString());
  if (excludeRdvId) conflictQuery = conflictQuery.neq('id', excludeRdvId);
  const { data: conflits, error } = await conflictQuery;
  if (error) throw error;
  if (conflits && conflits.length > 0) {
    return { ok: false, reason: 'Ce créneau vient d\'être pris, merci d\'en choisir un autre.' };
  }

  return { ok: true };
}

// Detecte l'erreur PostgreSQL levee par la contrainte d'exclusion rendez_vous_no_overlap
// (filet de securite ultime contre les reservations strictement simultanees).
export function isOverlapConstraintError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23P01';
}

// Calcule les creneaux libres d'un praticien sur les 21 prochains jours,
// en respectant ses horaires d'ouverture, ses RDV existants et la duree demandee.
//
// Optimisation anti-trous morts : un creneau n'est propose que s'il ne cree aucun reliquat
// inexploitable dans la journee du praticien. Concretement, chaque plage libre est bornee
// par des "bords durs" — un RDV existant, l'ouverture/fermeture du jour, et l'heure courante
// pour aujourd'hui. Un creneau doit soit coller a un bord, soit laisser de chaque cote un
// reliquat au moins egal au plus court des motifs actifs du praticien (donc encore
// reservable). Exemple : a 14h55, un creneau a 15h30 laisserait 35 min que personne ne peut
// reserver — il n'est pas propose, alors que 15h00 (colle) et 15h45 (laisse 45 min
// reservables) le sont.
export async function computeAvailableSlots(
  therapeuteId: string,
  dureeMinutes: number,
  excludeRdvId?: string,
): Promise<JourCreneaux[]> {
  const [{ data: therapeute }, { data: motifsActifs }] = await Promise.all([
    supabaseAdmin.from('therapeutes').select('horaires_ouverture, delai_reservation_heures').eq('id', therapeuteId).single(),
    supabaseAdmin.from('motifs_consultation').select('duree_minutes').eq('therapeute_id', therapeuteId).eq('actif', true),
  ]);
  const horaires = therapeute?.horaires_ouverture as HorairesOuverture | undefined;
  const delaiReservationMs = (therapeute?.delai_reservation_heures || 0) * 3600000;

  // Plus petit "grain" de RDV réellement proposable chez ce praticien : un trou plus court
  // que ça, où qu'il apparaisse, ne pourra jamais être rempli par personne.
  const minUsefulGap = motifsActifs && motifsActifs.length > 0
    ? Math.min(...motifsActifs.map((m) => m.duree_minutes))
    : dureeMinutes;

  const now = new Date();
  // Aucun créneau ne peut démarrer avant ce point (délai minimum de réservation inclus) —
  // c'est ce point, pas "maintenant", qui sert de bord dur pour la journée en cours.
  const effectiveNow = new Date(now.getTime() + delaiReservationMs);

  const rangeStart = new Date(now);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + HORIZON_DAYS);

  let busyQuery = supabaseAdmin
    .from('rendez_vous')
    .select('date_debut, date_fin')
    .eq('therapeute_id', therapeuteId)
    .neq('statut', 'annule')
    .lt('date_debut', rangeEnd.toISOString())
    .gt('date_fin', rangeStart.toISOString());
  if (excludeRdvId) busyQuery = busyQuery.neq('id', excludeRdvId);

  const { data: busyRows, error: busyError } = await busyQuery;
  if (busyError) throw busyError;

  const busy = (busyRows || []).map((r) => ({
    start: new Date(r.date_debut).getTime(),
    end: new Date(r.date_fin).getTime(),
  }));

  const jours: JourCreneaux[] = [];

  for (let i = 0; i < HORIZON_DAYS; i++) {
    const day = new Date(rangeStart);
    day.setDate(day.getDate() + i);

    const jourConfig = horaires?.[String(day.getDay())];
    if (jourConfig && !jourConfig.actif) continue;

    const bornMin = jourConfig ? parseHeureToMinutes(jourConfig.debut, HOUR_START * 60) : HOUR_START * 60;
    const bornMax = jourConfig ? parseHeureToMinutes(jourConfig.fin, HOUR_END * 60) : HOUR_END * 60;

    const dayMidnight = new Date(day);
    dayMidnight.setHours(0, 0, 0, 0);
    const dayMidnightMs = dayMidnight.getTime();

    // Jour entièrement avant le délai minimum de réservation (ex. délai de 48h qui déborde
    // sur plusieurs jours) : rien n'y est réservable, on saute directement.
    if (dayMidnightMs + bornMax * 60000 <= effectiveNow.getTime()) continue;

    // Sur le jour où tombe le seuil réservable, la journée ne commence pas à l'ouverture
    // mais à ce seuil : bord dur, comme le serait un RDV.
    const isSeuilDay = day.toDateString() === effectiveNow.toDateString();
    const seuilMinutes = effectiveNow.getHours() * 60 + effectiveNow.getMinutes();
    const startOfDay = isSeuilDay
      ? Math.max(bornMin, Math.ceil((seuilMinutes + 1) / STEP_MINUTES) * STEP_MINUTES)
      : bornMin;
    if (startOfDay + dureeMinutes > bornMax) continue;

    // Pause déjeuner (ou autre coupure quotidienne) : traitée comme un bord dur au même
    // titre qu'un RDV, donc protégée elle aussi par l'optimisation anti-trous ci-dessous.
    const pauseBlock = jourConfig?.pauseDebut && jourConfig?.pauseFin
      ? [{ start: parseHeureToMinutes(jourConfig.pauseDebut, -1), end: parseHeureToMinutes(jourConfig.pauseFin, -1) }]
        .filter((p) => p.start >= 0 && p.end > p.start)
      : [];

    // RDV + pause du jour, en minutes depuis minuit, bornés à la fenêtre réservable,
    // fusionnés s'ils se chevauchent (garde-fou).
    const busyToday = busy
      .map((b) => ({
        start: Math.round((b.start - dayMidnightMs) / 60000),
        end: Math.round((b.end - dayMidnightMs) / 60000),
      }))
      .concat(pauseBlock)
      .map((b) => ({ start: Math.max(startOfDay, b.start), end: Math.min(bornMax, b.end) }))
      .filter((b) => b.end > startOfDay && b.start < bornMax && b.end > b.start)
      .sort((a, b) => a.start - b.start);

    const merged: { start: number; end: number }[] = [];
    for (const b of busyToday) {
      const last = merged[merged.length - 1];
      if (last && b.start <= last.end) last.end = Math.max(last.end, b.end);
      else merged.push({ ...b });
    }

    // Plages libres, chacune bornée par deux bords durs (RDV, ouverture/fermeture, ou « maintenant »)
    const freeIntervals: { start: number; end: number }[] = [];
    let cursor = startOfDay;
    for (const b of merged) {
      if (b.start > cursor) freeIntervals.push({ start: cursor, end: b.start });
      cursor = Math.max(cursor, b.end);
    }
    if (cursor < bornMax) freeIntervals.push({ start: cursor, end: bornMax });

    const creneaux: string[] = [];
    for (const free of freeIntervals) {
      if (free.end - free.start < dureeMinutes) continue;

      // Candidats : la grille de 15 min depuis le début de la plage, plus le créneau collé
      // à la fin (sinon un remplissage parfait en fin de plage pourrait être manqué quand
      // la plage n'est pas un multiple exact du pas).
      const candidats = new Set<number>();
      for (let mins = free.start; mins + dureeMinutes <= free.end; mins += STEP_MINUTES) candidats.add(mins);
      candidats.add(free.end - dureeMinutes);

      for (const mins of Array.from(candidats).sort((a, b) => a - b)) {
        if (mins < free.start || mins + dureeMinutes > free.end) continue;

        // Un reliquat non nul mais trop court pour le plus petit motif du praticien
        // est du temps definitivement perdu : on ne propose pas ce créneau.
        const leadingGap = mins - free.start;
        const trailingGap = free.end - (mins + dureeMinutes);
        if (leadingGap > 0 && leadingGap < minUsefulGap) continue;
        if (trailingGap > 0 && trailingGap < minUsefulGap) continue;

        const h = String(Math.floor(mins / 60)).padStart(2, '0');
        const m = String(mins % 60).padStart(2, '0');
        creneaux.push(`${h}:${m}`);
      }
    }

    if (creneaux.length > 0) {
      const y = day.getFullYear();
      const m = String(day.getMonth() + 1).padStart(2, '0');
      const d = String(day.getDate()).padStart(2, '0');
      jours.push({
        date: `${y}-${m}-${d}`,
        label: day.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        creneaux,
      });
    }
  }

  return jours;
}
