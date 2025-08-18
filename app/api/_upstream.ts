export const runtime = "nodejs";
const RAW = process.env.KINJAR_API_BASE || "";
export const API_BASE = RAW.replace(/\/+$/, ""); // strip trailing slash