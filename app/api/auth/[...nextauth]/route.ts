export const runtime = "nodejs";
// Re-export NextAuth handlers via relative import to avoid path aliases
export { GET, POST } from "../../../../src/auth";
