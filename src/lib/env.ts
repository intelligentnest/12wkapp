/**
 * Public configuration. Only the project URL and the publishable key are ever
 * exposed to the browser; all data access is guarded by Row Level Security.
 */
export function publicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local.",
    );
  }
  if (/service_role|sb_secret_/i.test(key)) {
    throw new Error("Refusing to start: a secret/service-role key was supplied as the public key.");
  }
  return { url, key };
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
