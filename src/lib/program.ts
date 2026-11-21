import { addDays, diffDays } from "./dates";

export const CHAPTER_LENGTH = 21;
export const CHAPTER_NAMES = ["Foundation", "Consistency", "Momentum", "Strengthen & sustain"] as const;

export type ProgramDates = { start_date: string; end_date: string };

export function programLength(p: ProgramDates): number {
  return diffDays(p.start_date, p.end_date) + 1;
}

/** 1-based day number, or null when the date is outside the program. */
export function dayNumber(p: ProgramDates, date: string): number | null {
  const n = diffDays(p.start_date, date) + 1;
  return n >= 1 && n <= programLength(p) ? n : null;
}

export function chapterFor(p: ProgramDates, date: string) {
  const day = dayNumber(p, date);
  if (day === null) return null;
  const number = Math.floor((day - 1) / CHAPTER_LENGTH) + 1;
  return { number, name: CHAPTER_NAMES[number - 1] ?? `Chapter ${number}` };
}

export function chapters(p: ProgramDates) {
  const count = Math.ceil(programLength(p) / CHAPTER_LENGTH);
  return Array.from({ length: count }, (_, i) => {
    const start = addDays(p.start_date, i * CHAPTER_LENGTH);
    const endCandidate = addDays(start, CHAPTER_LENGTH - 1);
    const end = diffDays(endCandidate, p.end_date) < 0 ? p.end_date : endCandidate;
    return { number: i + 1, name: CHAPTER_NAMES[i] ?? `Chapter ${i + 1}`, start, end };
  });
}

export function weeks(p: ProgramDates) {
  const count = Math.ceil(programLength(p) / 7);
  return Array.from({ length: count }, (_, i) => {
    const start = addDays(p.start_date, i * 7);
    const endCandidate = addDays(start, 6);
    const end = diffDays(endCandidate, p.end_date) < 0 ? p.end_date : endCandidate;
    return { number: i + 1, start, end };
  });
}

/** Calendar months touched by the program, as "YYYY-MM". */
export function months(p: ProgramDates): string[] {
  const out: string[] = [];
  for (let d = p.start_date; diffDays(d, p.end_date) >= 0; d = addDays(d, 1)) {
    const ym = d.slice(0, 7);
    if (out.at(-1) !== ym) out.push(ym);
  }
  return out;
}
