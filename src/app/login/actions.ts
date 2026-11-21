"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { siteUrl } from "@/lib/env";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { status: "error", message: "Please enter a valid email address." };

  // Build the link from the address actually being used, so it can never point at
  // localhost by mistake. Supabase only honours redirect URLs on its allow-list.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : siteUrl();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: false, // private app: accounts are created by the owner only
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  // Rate limiting is the only error worth surfacing. Otherwise respond identically
  // whether or not the address has an account, so the form can't be used to probe emails.
  if (error && /rate|seconds/i.test(error.message)) {
    return { status: "error", message: "Please wait a minute before requesting another link." };
  }
  return { status: "sent" };
}
