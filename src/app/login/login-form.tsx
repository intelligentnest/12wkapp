"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div role="status" className="rounded-2xl bg-sage-50 p-5 text-ink">
        <p className="font-medium">Check your inbox.</p>
        <p className="mt-1 text-sm text-ink-muted">
          If this email has access, a sign-in link is on its way. It expires in one hour.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm text-ink-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage-600 focus:ring-2 focus:ring-sage-200"
        />
      </div>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-clay-700">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-sage-700 px-4 py-3 font-medium text-white transition hover:bg-sage-800 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
