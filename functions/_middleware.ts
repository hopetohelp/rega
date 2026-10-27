import { isClosed, reopensAt } from "../src/lib/shabbat";
import type { Ctx } from "./types";

const PAGE = (when: string) => `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>רגע לברך — סגור בשבת ובחג</title>
<style>body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#F7F2E9;color:#1E1912;font-family:system-ui,sans-serif;text-align:center;padding:24px}h1{margin:0;font-size:40px}p{margin:0;color:#5E5446;font-size:18px}@media(prefers-color-scheme:dark){body{background:#15120E;color:#F3ECDF}p{color:#B9AC97}}</style></head>
<body><strong>רגע לברך.</strong><h1>סגור בשבת ובחג</h1><p>נשמח לברך איתכם שוב ${when}.</p></body></html>`;

/** שבת וחג: הכול סגור — גם דפי הקישור וה-API (הכרעת בעלים) */
export async function onRequest({ request, next }: Ctx) {
  if (!isClosed()) return next();
  const path = new URL(request.url).pathname;
  if (path.startsWith("/api/")) return Response.json({ closed: true }, { status: 423 });
  if (/\.[a-z0-9]+$/i.test(path)) return next();  // קבצים (גופנים, סמל) — בלי תוכן
  return new Response(PAGE(reopensAt()), { status: 503, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "retry-after": "3600" } });
}
