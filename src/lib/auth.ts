import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Data Access Layer entry point: verifies the session signature and returns the user id. */
export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (error || !sub) redirect("/login");
  return { supabase, userId: sub, email: (data.claims.email as string | undefined) ?? null };
}
