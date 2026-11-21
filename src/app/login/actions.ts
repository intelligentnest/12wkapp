"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/env";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { status: "error", message: "Please enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: false, // private app: accounts are created by the owner only
      emailRedirectTo: `${siteUrl()}/auth/confirm`,
    },
  });

  // Rate limiting is the only error worth surfacing. Otherwise respond identically
  // whether or not the address has an account, so the form can't be used to probe emails.
  if (error && /rate|seconds/i.test(error.message)) {
    return { status: "error", message: "Please wait a minute before requesting another link." };
  }
  return { status: "sent" };
}
