import { useEffect, useState } from "react";

interface Totals { greetings: number; users: number; visits: number }
const fmt = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString("he-IL"));

/** כרטיס המספרים בתחתית: ברכות · משתמשים · כניסות (מהשרת; עד שהשרת קיים — מקף) */
export function Stats() {
  const [s, setS] = useState<Partial<Totals>>({});
  useEffect(() => {
    fetch("/api/stats").then((r) => (r.ok ? r.json() : null)).then((j) => j && setS(j)).catch(() => {});
  }, []);
  return (
    <section className="stats" aria-label="רגע לברך במספרים">
      <div><b>{fmt(s.greetings)}</b><span>ברכות</span></div>
      <div><b>{fmt(s.users)}</b><span>משתמשים</span></div>
      <div><b>{fmt(s.visits)}</b><span>כניסות</span></div>
    </section>
  );
}
