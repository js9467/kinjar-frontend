export const runtime = "nodejs";
// Using relative import to avoid path alias
import { handlers } from "../../../../src/auth";
export const { GET, POST } = handlers;
