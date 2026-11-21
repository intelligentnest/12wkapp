import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Private journal</p>
        <h1 className="mt-2 font-display text-3xl text-ink">My 12-Week Transformation</h1>
        <p className="mt-2 text-ink-muted">Progress without perfection.</p>
        {error === "link" && (
          <p role="alert" className="mt-6 rounded-xl bg-clay-50 p-3 text-sm text-clay-700">
            That sign-in link has expired or was already used. Request a new one below.
          </p>
        )}
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
