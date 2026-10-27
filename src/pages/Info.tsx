import { useState, type ReactNode } from "react";

export const INFO_PATHS = ["/about", "/privacy", "/accessibility", "/terms", "/contact"] as const;
export type InfoPath = (typeof INFO_PATHS)[number];

const UPDATED = "27.10.2026";

const PAGES: Record<InfoPath, { title: string; body: ReactNode }> = {
  "/about": {
    title: "על רגע לברך",
    body: (
      <>
        <p>כותבים כמה מילים — ומקבלים סרטון ברכה אישי, מוכן לשליחה בוואטסאפ. בחינם, בלי הרשמה.</p>
        <p>המוזיקה כלית בלבד, בלי שירה. הגרפיקה בלי דמויות של אנשים. האתר סגור בשבת ובחג.</p>
        <p>שאלה, הצעה או תקלה? <a href="/contact">כתבו לנו</a>.</p>
      </>
    ),
  },
  "/privacy": {
    title: "מדיניות פרטיות",
    body: (
      <>
        <p><strong>מה לא נשמר אצלנו:</strong> הטקסטים שכתבתם, התמונה שהעליתם והסרטון עצמו. הם נשארים במכשיר שלכם, ושם גם נבנה הסרטון.</p>
        <p><strong>מה כן נשמר:</strong> ספירה אנונימית — כניסה לאתר, יצירת סרטון, שליחה או הורדה; עם סוג המכשיר (טלפון/טאבלט/מחשב), הצבע והמוזיקה שנבחרו, זמן הבנייה, ומספר אקראי שנשמר במכשיר כדי לספור משתמשים. אין בזה שם, מייל או טלפון.</p>
        <p><strong>בלי מעקב:</strong> אין עוגיות מעקב, אין כלים של צד שלישי, והגופנים נטענים מהאתר עצמו.</p>
        <p><strong>מחיקה:</strong> מחיקת נתוני האתר בדפדפן מוחקת את המספר האקראי. פנייה בנושא פרטיות — <a href="/contact">כאן</a>.</p>
        <p className="upd">עודכן: {UPDATED}</p>
      </>
    ),
  },
  "/accessibility": {
    title: "הצהרת נגישות",
    body: (
      <>
        <p>האתר נבנה בשאיפה לעמוד בתקן הישראלי 5568 (WCAG 2.1 ברמה AA).</p>
        <ul>
          <li>הפעלה מלאה במקלדת, עם סימון פוקוס ברור.</li>
          <li>תוויות לכל שדה וכפתור, לקוראי מסך.</li>
          <li>ניגודיות צבעים מספקת, בתצוגת יום ובתצוגת לילה.</li>
          <li>כיבוד הגדרת "הפחתת תנועה": התצוגה המקדימה לא מתנגנת מעצמה.</li>
          <li>התאמה לטלפון, לטאבלט ולמחשב, ולהגדלת טקסט.</li>
        </ul>
        <p><strong>מגבלות ידועות:</strong> בסרטון עצמו אין קריינות (הטקסט מוצג על המסך); בוחרי התאריך והשעה תלויים בדפדפן.</p>
        <p>נתקלתם בבעיה? <a href="/contact">כתבו לנו</a> ונטפל בהקדם.</p>
        <p className="upd">עודכן: {UPDATED}</p>
      </>
    ),
  },
  "/terms": {
    title: "תנאי שימוש",
    body: (
      <>
        <p>השימוש באתר חינם. הסרטונים שלכם — שלכם.</p>
        <p><strong>אחריות על התוכן:</strong> הטקסטים והתמונות שאתם מוסיפים הם באחריותכם בלבד. אין להעלות תוכן פוגעני, מטעה, מתחזה או שאין לכם זכות להשתמש בו.</p>
        <p>האתר ניתן כמו שהוא, בלי התחייבות לזמינות רצופה. אנחנו רשאים לשנות או להפסיק שירותים.</p>
        <p className="upd">עודכן: {UPDATED}</p>
      </>
    ),
  },
  "/contact": { title: "פנייה לצוות האתר", body: <Contact /> },
};

function Contact() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    const r = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(f)) }).catch(() => null);
    setState(r?.ok ? "sent" : "error");
  }
  if (state === "sent") return <p role="status">תודה! הפנייה הגיעה לצוות האתר.</p>;
  return (
    <form className="form" onSubmit={send}>
      <label>נושא
        <select name="topic"><option>שאלה</option><option>תקלה</option><option>נגישות</option><option>פרטיות</option><option>הצעה</option></select>
      </label>
      <label>מה תרצו לכתוב?
        <textarea name="body" required minLength={2} maxLength={2000} rows={5} />
      </label>
      <label>איך לחזור אליכם? (רשות)
        <input name="reply" maxLength={120} />
      </label>
      <button className="go" type="submit" disabled={state === "sending"}>{state === "sending" ? "שולחים…" : "שליחה"}</button>
      {state === "error" && <p role="alert" style={{ margin: 0, color: "var(--acc)" }}>השליחה לא הצליחה. אפשר לנסות שוב.</p>}
    </form>
  );
}

export function Info({ path }: { path: InfoPath }) {
  const page = PAGES[path];
  return (
    <div className="page">
      <header className="top"><a href="/" className="logo" style={{ textDecoration: "none" }}>רגע לברך<i>.</i></a></header>
      <main className="info">
        <h1>{page.title}</h1>
        {page.body}
        <p><a href="/">חזרה לדף הבית</a></p>
      </main>
    </div>
  );
}
