export const ESTABLISHMENT_TZ = process.env.REACT_APP_ESTABLISHMENT_TZ || 'America/Mexico_City';

export function nowInTimeZone(tz = ESTABLISHMENT_TZ) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  });
  const parts = fmt.formatToParts(now);
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  const date = `${map.year}-${map.month}-${map.day}`;
  const time = `${map.hour}:${map.minute}`;
  return { date, time };
}

export function isPastSameDayReservation(requestedDate, requestedTime, tz = ESTABLISHMENT_TZ) {
  if (!requestedDate || !requestedTime) return false;
  const { date, time } = nowInTimeZone(tz);
  if (requestedDate !== date) return false;
  const req = String(requestedTime).padStart(5, '0');
  const cur = String(time).padStart(5, '0');
  return req < cur;
}