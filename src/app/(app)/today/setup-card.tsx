"use client";

import { useActionState } from "react";
import { setupFirstCycle, type SetupState } from "./actions";

export function SetupCard() {
  const [state, action, pending] = useActionState<SetupState>(setupFirstCycle, {});
  return (
    <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <h1 className="font-display text-2xl text-ink">Welcome. Let&apos;s set up your first cycle.</h1>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-ink-muted">Dates</dt><dd>Sun 22 Nov 2026 – Sat 13 Feb 2027 (84 days)</dd></div>
        <div><dt className="text-ink-muted">Chapters</dt><dd>Four 21-day chapters</dd></div>
        <div><dt className="text-ink-muted">Habits</dt><dd>22 across five pillars</dd></div>
        <div><dt className="text-ink-muted">Timezone</dt><dd>America/Toronto</dd></div>
      </dl>
      <p className="mt-4 text-sm text-ink-muted">
        Starting weight 71 kg and an aspirational marker of 59 kg — a gentle reference, not a deadline.
        You can edit all of this later in Settings.
      </p>
      {state.error && <p role="alert" className="mt-4 text-sm text-clay-700">{state.error}</p>}
      <form action={action} className="mt-6">
        <button
          disabled={pending}
          className="rounded-xl bg-sage-700 px-5 py-3 font-medium text-white hover:bg-sage-800 disabled:opacity-60"
        >
          {pending ? "Setting up…" : "Create my first cycle"}
        </button>
      </form>
    </section>
  );
}
