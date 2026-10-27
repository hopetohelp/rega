import { HDate, HebrewCalendar, flags } from "@hebcal/core";

/** שעון ישראל: התאריך והשעה עכשיו */
function israelNow(now: Date) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const p = Object.fromEntries(f.formatToParts(now).map((x) => [x.type, x.value]));
  return { date: new Date(Number(p.year), Number(p.month) - 1, Number(p.day)), hour: Number(p.hour) + Number(p.minute) / 60 };
}

/** שבת או יום טוב (בלוח של ארץ ישראל) */
function holy(day: Date) {
  if (day.getDay() === 6) return true;
  const ev = HebrewCalendar.getHolidaysOnDate(new HDate(day), true) ?? [];
  return ev.some((e) => (e.getFlags() & flags.CHAG) !== 0);
}

/** סגור: מ-16:00 בערב שבת/חג ועד 20:00 במוצאי שבת/חג (הכרעת בעלים) */
export function isClosed(now = new Date()) {
  const { date, hour } = israelNow(now);
  const tomorrow = new Date(date); tomorrow.setDate(date.getDate() + 1);
  return (holy(date) && hour < 20) || (holy(tomorrow) && hour >= 16);
}

/** מתי נפתח שוב, לתצוגה: "במוצאי שבת" / "במוצאי החג", בשעה 20:00 */
export function reopensAt(now = new Date()) {
  const { date } = israelNow(now);
  const last = new Date(date);
  if (!holy(last)) last.setDate(last.getDate() + 1);
  for (let i = 0; i < 3; i++) {
    const next = new Date(last); next.setDate(last.getDate() + 1);
    if (!holy(next)) break;
    last.setDate(last.getDate() + 1);
  }
  const chag = (HebrewCalendar.getHolidaysOnDate(new HDate(last), true) ?? []).some((e) => (e.getFlags() & flags.CHAG) !== 0);
  return `${chag ? "במוצאי החג" : "במוצאי שבת"} בשעה 20:00`;
}
