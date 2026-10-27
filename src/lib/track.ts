/** ספירה אנונימית: מזהה אקראי במכשיר + סוג המכשיר. בלי טקסטים, בלי עוגיות */
type Type = "visit" | "create" | "share" | "download" | "image";

function uid() {
  try {
    let id = localStorage.getItem("rega-uid");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("rega-uid", id); }
    return id;
  } catch { return null; }
}

const device = () => (innerWidth < 760 ? "phone" : innerWidth < 1200 ? "tablet" : "desktop");

export function track(type: Type, extra: Record<string, string | number> = {}) {
  const body = JSON.stringify({ type, uid: uid(), device: device(), ...extra });
  try {
    if (!navigator.sendBeacon?.("/api/event", new Blob([body], { type: "application/json" })))
      void fetch("/api/event", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
  } catch { /* הספירה לא חשובה יותר מהגולש */ }
}

/** כניסה: פעם אחת לכל 30 דקות במכשיר */
export function trackVisit() {
  try {
    const last = Number(localStorage.getItem("rega-visit") ?? 0);
    if (Date.now() - last < 30 * 60_000) return;
    localStorage.setItem("rega-visit", String(Date.now()));
  } catch { /* בלי אחסון — סופרים כל כניסה */ }
  track("visit");
}
