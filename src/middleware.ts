// /middleware.ts
export { auth as middleware } from "./auth";

// Exclude the Auth.js API endpoints and static assets.
// (If you want to exclude ALL /api routes, change to (?!api/|...).)
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
