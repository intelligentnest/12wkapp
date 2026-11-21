export function ComingSoon({ title, stage }: { title: string; stage: number }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-6">
      <h1 className="font-display text-2xl text-ink">{title}</h1>
      <p className="mt-2 text-ink-muted">This area arrives in Stage {stage}. Nothing here yet.</p>
    </section>
  );
}
