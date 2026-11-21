/** Only allow same-site relative paths, to prevent open redirects after sign-in. */
export function safeNextPath(next: string | null | undefined, fallback = "/today"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
