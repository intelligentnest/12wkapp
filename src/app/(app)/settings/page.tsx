import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProgram, getProfile } from "@/lib/data/program";
import { formatLongDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Settings" };

const fmt = (v: number | null, unit: string) => (v === null ? "—" : `${v} ${unit}`);

export default async function SettingsPage() {
  const [profile, program] = await Promise.all([getProfile(), getActiveProgram()]);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">Goals & settings</h1>

      <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="font-display text-xl">Account</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-ink-muted">Signed in as</dt><dd>{profile.email ?? "—"}</dd></div>
          <div><dt className="text-ink-muted">Timezone</dt><dd>{profile.timezone}</dd></div>
          <div>
            <dt className="text-ink-muted">Last personal export</dt>
            <dd>{profile.last_export_at ? new Date(profile.last_export_at).toLocaleString("en-CA", { timeZone: profile.timezone }) : "Not yet — export arrives in Stage 2"}</dd>
          </div>
        </dl>
      </section>

      {program && (
        <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="font-display text-xl">{program.name}</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-ink-muted">Dates</dt><dd>{formatLongDate(program.start_date)} – {formatLongDate(program.end_date)}</dd></div>
            <div><dt className="text-ink-muted">Starting weight</dt><dd>{fmt(program.starting_weight_kg, "kg")}</dd></div>
            <div><dt className="text-ink-muted">Aspirational marker</dt><dd>{fmt(program.goal_weight_kg, "kg")} · a reference, not a deadline</dd></div>
            <div><dt className="text-ink-muted">Protein guide</dt><dd>{fmt(program.protein_guide_g, "g/day")}</dd></div>
            <div><dt className="text-ink-muted">Fibre guide</dt><dd>{fmt(program.fibre_guide_g, "g/day")}</dd></div>
            <div><dt className="text-ink-muted">Writing intention</dt><dd>{program.writing_intention_min} minutes</dd></div>
          </dl>
          <p className="mt-4 text-xs text-ink-muted">
            Nutrition numbers are personal planning guides, not medical prescriptions. Editing arrives in Stage 5.
          </p>
        </section>
      )}

      <p className="text-sm"><Link href="/privacy" className="text-sage-700 underline underline-offset-4">How your data is stored</Link></p>
    </div>
  );
}
