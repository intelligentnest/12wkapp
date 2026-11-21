import type { Metadata } from "next";
import { getActiveProgram, getRhythm } from "@/lib/data/program";
import { chapterFor, dayNumber, programLength } from "@/lib/program";
import { diffDays, formatLongDate, todayIn } from "@/lib/dates";
import { SetupCard } from "./setup-card";

export const metadata: Metadata = { title: "Today" };

export default async function TodayPage() {
  const program = await getActiveProgram();
  if (!program) return <SetupCard />;

  const today = todayIn(program.timezone);
  const day = dayNumber(program, today);
  const chapter = chapterFor(program, today);
  const total = programLength(program);
  const rhythm = await getRhythm();

  let status: string;
  if (day !== null) status = `Day ${day} of ${total} · Chapter ${chapter!.number}: ${chapter!.name}`;
  else if (diffDays(today, program.start_date) > 0) {
    const n = diffDays(today, program.start_date);
    status = `Your cycle begins ${formatLongDate(program.start_date)} — ${n} day${n === 1 ? "" : "s"} to go.`;
  } else status = "This cycle has finished. Your records remain here.";

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-ink-muted">{formatLongDate(today)}</p>
        <h1 className="mt-1 font-display text-3xl text-ink">{status}</h1>
      </section>

      <section className="rounded-3xl border border-dashed border-line bg-surface/60 p-5 text-sm text-ink-muted">
        The daily check-in is being built next (Stage 3). Until it&apos;s ready and your data has been migrated,
        keep logging in your current tracker and export a backup every few days.
      </section>

      <section aria-labelledby="rhythm-heading" className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <h2 id="rhythm-heading" className="font-display text-xl text-ink">Your daily rhythm</h2>
        <p className="mt-1 text-sm text-ink-muted">A guide, not a rigid timetable.</p>
        <ol className="mt-4 divide-y divide-line">
          {rhythm.map((b) => (
            <li key={b.id} className="grid gap-1 py-3 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
              <p className="text-sm tabular-nums text-sage-700">{b.time_label}</p>
              <div>
                <p className="font-medium text-ink">{b.title}</p>
                {b.details && <p className="mt-0.5 text-sm text-ink-muted">{b.details}</p>}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-ink-muted">
          Prayer times change through the year — use your actual local prayer times.
        </p>
      </section>
    </div>
  );
}
