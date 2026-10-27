import { useEffect, useRef, useState } from "react";

/** מזהה הלקוח של Google — גלוי, לא סוד (הכרעת בעלים: המזהה המשותף, בשם התצוגה hopetohelp) */
const CLIENT_ID = "842977993302-8n4sibbf7rgr6e1ludvi28oojua9ht9t.apps.googleusercontent.com";

interface User { name: string; email: string; verified: boolean }
type GoogleId = { accounts: { id: { initialize(o: object): void; renderButton(el: HTMLElement, o: object): void; disableAutoSelect(): void } } };

/** תוכן האסימון של Google — לתצוגה בלבד; האימות האמיתי ייעשה בשרת */
function readToken(jwt: string): User | null {
  try {
    const b = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const p = JSON.parse(decodeURIComponent(escape(atob(b))));
    return { name: p.name ?? "", email: p.email ?? "", verified: !!p.email_verified };
  } catch { return null; }
}

function loadGoogle(): Promise<GoogleId | null> {
  const w = window as unknown as { google?: GoogleId };
  if (w.google) return Promise.resolve(w.google);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client"; s.async = true;
    s.onload = () => resolve(w.google ?? null); s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

export function PersonalArea() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [note, setNote] = useState("");
  const slot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || user || !slot.current) return;
    let alive = true;
    loadGoogle().then((g) => {
      if (!alive || !g || !slot.current) return;
      g.accounts.id.initialize({ client_id: CLIENT_ID, callback: (r: { credential: string }) => setUser(readToken(r.credential)) });
      g.accounts.id.renderButton(slot.current, { theme: "outline", size: "large", text: "signin_with", locale: "he", width: 236 });
    });
    return () => { alive = false; };
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  const later = (what: string) => setNote(`${what} — בקרוב.`);

  return (
    <div style={{ position: "relative" }}>
      <button type="button" className="pill" aria-expanded={open} aria-haspopup="true" onClick={() => { setOpen(!open); setNote(""); }}>אזור אישי</button>
      {open && (
        <div className="card-pop" role="dialog" aria-label="אזור אישי">
          {user ? (
            <>
              <div className="who"><strong style={{ color: "var(--ink)", fontSize: 16 }}>{user.name}</strong>
                <span>{user.email}{user.verified ? " · מייל מאומת ✓" : ""}</span></div>
              <hr />
              <button type="button" onClick={() => later("היסטוריה")}>היסטוריה</button>
              <button type="button" onClick={() => later("תמיכה")}>תמיכה</button>
              <hr />
              <button type="button" onClick={() => { setUser(null); setNote(""); (window as unknown as { google?: GoogleId }).google?.accounts.id.disableAutoSelect(); }}>התנתקות</button>
            </>
          ) : (
            <>
              <div ref={slot} style={{ padding: "6px 4px", minHeight: 48 }} />
              <hr />
              <button type="button" onClick={() => later("היסטוריה")}>היסטוריה</button>
              <button type="button" onClick={() => later("תמיכה")}>תמיכה</button>
            </>
          )}
          {note && <p role="status" style={{ margin: "6px 12px", fontSize: 14, color: "var(--soft)" }}>{note}</p>}
        </div>
      )}
    </div>
  );
}
