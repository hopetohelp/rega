import type { Ctx } from "../types";

const TYPES = new Set(["visit", "create", "share", "download", "image"]);
const short = (v: unknown, n = 24) => (typeof v === "string" ? v.slice(0, n) : null);

/** רישום אירוע אנונימי. אף פעם לא נשמר טקסט חופשי של הגולש */
export async function onRequestPost({ request, env }: Ctx) {
  let b: Record<string, unknown>;
  try { b = await request.json(); } catch { return new Response("bad", { status: 400 }); }
  const type = short(b.type, 12);
  if (!type || !TYPES.has(type)) return new Response("bad", { status: 400 });
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());
  const ms = typeof b.ms === "number" && b.ms > 0 && b.ms < 600_000 ? Math.round(b.ms) : null;
  await env.DB.prepare("INSERT INTO events (ts, day, type, idea, palette, music, device, ms, uid) VALUES (?,?,?,?,?,?,?,?,?)")
    .bind(Date.now(), day, type, short(b.idea), short(b.palette), short(b.music), short(b.device, 8), ms, short(b.uid, 40)).run();
  return new Response(null, { status: 204 });
}
