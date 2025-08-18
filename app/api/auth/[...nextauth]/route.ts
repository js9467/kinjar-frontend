export const runtime = "nodejs";
// CHANGE: stop using "@/auth"
import { handlers } from "../../../src/auth";
export const { GET, POST } = handlers;
