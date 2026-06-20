const SAFE_NEXT_PATHS = /^\/(dashboard|alertes|monitoring)(\/|$|\?)/;

export function sanitizeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/")) return "/dashboard";
  if (next.startsWith("/auth/v1") || next.startsWith("/auth/callback")) {
    return "/dashboard";
  }
  if (next.startsWith("/login")) return "/dashboard";
  if (SAFE_NEXT_PATHS.test(next)) return next.split("?")[0];
  return "/dashboard";
}

export function isValidSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".supabase.co");
  } catch {
    return false;
  }
}
