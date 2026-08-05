function toIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

interface IcsEvent {
  uid: string;
  summary: string;
  description: string;
  location?: string;
  startIso: string;
  endIso: string;
}

function buildVEvent(event: IcsEvent, dtstamp: string, organizer?: { name: string; email: string }): string[] {
  const { uid, summary, description, location, startIso, endIso } = event;
  return [
    'BEGIN:VEVENT',
    `UID:${uid}@facturavis.fr`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${toIcsDate(startIso)}`,
    `DTEND:${toIcsDate(endIso)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    location ? `LOCATION:${escapeIcsText(location)}` : null,
    organizer ? `ORGANIZER;CN=${escapeIcsText(organizer.name)}:mailto:${organizer.email}` : null,
    'STATUS:CONFIRMED',
    'END:VEVENT',
  ].filter((line): line is string => line !== null);
}

export function buildRdvIcs(params: {
  uid: string;
  summary: string;
  description: string;
  location?: string;
  startIso: string;
  endIso: string;
  organizerEmail: string;
  organizerName: string;
}): string {
  const { organizerEmail, organizerName, ...event } = params;
  const dtstamp = toIcsDate(new Date().toISOString());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FacturAvis//Agenda//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...buildVEvent(event, dtstamp, { name: organizerName, email: organizerEmail }),
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

// Flux multi-événements pour la synchronisation calendrier personnelle du praticien
// (abonnement Google Calendar / Apple Calendar) — un seul VCALENDAR, un VEVENT par RDV.
export function buildAgendaIcsFeed(calendarName: string, events: IcsEvent[]): string {
  const dtstamp = toIcsDate(new Date().toISOString());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FacturAvis//Agenda//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    // Suggère aux clients calendrier de revérifier le flux toutes les 15 minutes.
    'X-PUBLISHED-TTL:PT15M',
    ...events.flatMap((event) => buildVEvent(event, dtstamp)),
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}
