// Derive family from hostname (subdomain) or cookie (set by middleware)
export function resolveFamily(hostname: string, cookieFamily?: string, localFallback?: string) {
  // e.g. slaughterbecks.kinjar.com -> "slaughterbecks"
  const lower = (hostname || "").toLowerCase();
  // localhost: prefer cookie or fallback
  if (lower.includes("localhost") || /^[0-9.]+$/.test(lower)) {
    return cookieFamily || localFallback || "demo";
  }
  // kinjar.com root -> no subdomain (landing / marketing)
  const parts = lower.split(".");
  if (parts.length >= 3) return parts[0]; // subdomain.kinjar.com
  return cookieFamily || null; // might be a custom domain w/ middleware set
}