/** יום כברירת מחדל (הכרעת בעלים); בחירת הגולש נזכרת במכשיר */
export type Theme = "light" | "dark";

export function savedTheme(): Theme {
  try { return localStorage.getItem("rega-theme") === "dark" ? "dark" : "light"; } catch { return "light"; }
}

export function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "dark" ? "#15120E" : "#F7F2E9");
  try { localStorage.setItem("rega-theme", t); } catch { /* מצב פרטי — לא נזכר, וזה בסדר */ }
}
