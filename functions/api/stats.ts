import type { Ctx } from "../types";

/** כרטיס המספרים: ברכות · משתמשים · כניסות (שמור במטמון לחמש דקות) */
export async function onRequestGet({ env }: Ctx) {
  const row = await env.DB.prepare(
    "SELECT SUM(type='create') AS greetings, COUNT(DISTINCT uid) AS users, SUM(type='visit') AS visits FROM events",
  ).first<{ greetings: number | null; users: number; visits: number | null }>();
  return Response.json(
    { greetings: row?.greetings ?? 0, users: row?.users ?? 0, visits: row?.visits ?? 0 },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
