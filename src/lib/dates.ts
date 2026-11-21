/**
 * Calendar-date helpers. Dates are plain "YYYY-MM-DD" strings representing a local
 * calendar day — never parsed with `new Date("YYYY-MM-DD")`, which would be UTC.
 * All arithmetic is done on UTC midnights purely as a day counter.
 */
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(s: string): boolean {
  const m = ISO.exec(s);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

function toDayNumber(s: string): number {
  if (!isIsoDate(s)) throw new Error(`Invalid date: ${s}`);
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

function fromDayNumber(n: number): string {
  return new Date(n * 86_400_000).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  return fromDayNumber(toDayNumber(date) + days);
}

/** Whole days from a to b (b - a). */
export function diffDays(a: string, b: string): number {
  return toDayNumber(b) - toDayNumber(a);
}

/** Today's calendar date in an IANA timezone, e.g. America/Toronto. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function formatLongDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
