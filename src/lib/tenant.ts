export function tenantFromHost(host?: string, baseDomain = process.env.PUBLIC_BASE_DOMAIN || "kinjar.com") {
  if (!host) return null;
  // e.g. family1.kinjar.com => family1
  const h = host.toLowerCase();
  if (h === baseDomain || h.endsWith(`.${baseDomain}`)) {
    const parts = h.split(".");
    if (parts.length >= 3) return parts[0]; // subdomain
    return "www"; // default/root landing
  }
  // Local dev fallback for `localhost:3000` -> use query param or cookie in dev, if you prefer
  return null;
}
