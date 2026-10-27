import type { Ctx } from "../types";

/** פנייה לצוות האתר (במקום מייל פרטי — כלל האנונימיות) */
export async function onRequestPost({ request, env }: Ctx) {
  let b: Record<string, unknown>;
  try { b = await request.json(); } catch { return new Response("bad", { status: 400 }); }
  const body = typeof b.body === "string" ? b.body.trim().slice(0, 2000) : "";
  if (body.length < 2) return new Response("bad", { status: 400 });
  const topic = typeof b.topic === "string" ? b.topic.slice(0, 40) : null;
  const reply = typeof b.reply === "string" ? b.reply.trim().slice(0, 120) || null : null;
  await env.DB.prepare("INSERT INTO messages (ts, topic, body, reply_to) VALUES (?,?,?,?)").bind(Date.now(), topic, body, reply).run();
  return new Response(null, { status: 204 });
}
