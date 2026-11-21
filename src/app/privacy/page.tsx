import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-5 py-10 text-ink">
      <h1 className="font-display text-3xl">How your data is stored</h1>
      <p><strong>Database (Supabase, Postgres):</strong> your daily entries, habits, measurements, reviews and settings. Every row is tied to your account and protected by database-level access rules, so no other account can read or change it.</p>
      <p><strong>Hosting (Vercel):</strong> serves the app over HTTPS. It does not store your entries, and the app does not log their contents.</p>
      <p><strong>Your browser:</strong> only the sign-in session cookie. Your entries are not kept in browser storage.</p>
      <p><strong>Backups:</strong> a separate automatic nightly copy of your data, plus personal exports you download yourself. Details and status are shown in Settings once enabled.</p>
      <p><strong>No analytics, tracking or sharing.</strong> This is a personal reflection tool, not a medical device.</p>
    </main>
  );
}
