/** שמחה במשפחה — הזמנה (20 שניות; מעברים ב-4, 8, 12, 16, 18) */
import { hebrewDate } from "../../lib/hebrewDate";
import { background, ease, ornament, roundImage, rule, SANS, SERIF, span, text } from "../draw";
import { VIDEO, type Idea } from "../types";

const { W } = VIDEO;

const nextWeek = () => {
  const d = new Date(); d.setDate(d.getDate() + 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** הופעה ויציאה של קטע: נכנס בחצי השנייה הראשונה, יוצא ב-0.35 האחרונות */
const show = (t: number, a: number, b: number) => ease(span(t, a, a + 0.5)) * (1 - ease(span(t, b - 0.35, b)));
const lift = (t: number, a: number) => (1 - ease(span(t, a, a + 0.6))) * 60;

export const simcha: Idea = {
  id: "simcha",
  name: "שמחה במשפחה",
  cuts: [4, 8, 12, 16, 18],
  fields: [
    { id: "occasion", label: "סוג השמחה", kind: "select", default: "בר מצווה", options: ["בר מצווה", "ברית", "פדיון הבן", "חנוכת בית", "סיום מסכת", "הכנסת ספר תורה"] },
    { id: "name", label: "שם בעל השמחה", kind: "text", default: "יוסף", max: 30 },
    { id: "date", label: "תאריך", kind: "date", default: nextWeek() },
    { id: "time", label: "שעה", kind: "time", default: "19:30" },
    { id: "place", label: "מקום", kind: "text", default: "אולם השמחות", max: 40 },
    { id: "hosts", label: "מי מברכים", kind: "text", default: "משפחת כהן", max: 40 },
  ],
  draw(c, t, v, p, a) {
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
    background(c, t, p);
    const hd = hebrewDate(v.date);

    // 0–4: פתיח
    if (t < 4) {
      const k = show(t, 0, 4), grow = ease(span(t, 0, 1.4));
      if (a.image) {
        ornament(c, t, W / 2, 700, 0.75 * grow, p, k);
        roundImage(c, a.image, W / 2, 700, 150 * grow, p, k);
      } else ornament(c, t, W / 2, 760, grow, p, k);
      text(c, "הזמנה", 1180 - lift(t, 0.3), 150, SERIF, p.ink, show(t, 0.3, 4), 900);
      text(c, `ל${v.occasion}`, 1340 - lift(t, 0.8), 92, SERIF, p.acc, show(t, 0.8, 4), 700);
    }
    // 4–8: בעל השמחה
    else if (t < 8) {
      const k = show(t, 4, 8);
      ornament(c, t, W / 2, 520, 0.42, p, k);
      text(c, v.occasion, 860 - lift(t, 4), 80, SANS, p.acc, k, 500);
      text(c, v.name, 1010 - lift(t, 4.2), 190, SERIF, p.ink, show(t, 4.2, 8), 900);
      rule(c, 1160, 90 * ease(span(t, 4.6, 5.4)), p, k);
    }
    // 8–12: מתי
    else if (t < 12) {
      const k = show(t, 8, 12);
      text(c, hd?.weekday ?? "", 800 - lift(t, 8), 72, SANS, p.soft, k, 500);
      text(c, hd?.hebrew ?? "", 940 - lift(t, 8.2), 128, SERIF, p.ink, show(t, 8.2, 12), 900);
      text(c, hd?.greg ?? "", 1070 - lift(t, 8.4), 64, SANS, p.soft, show(t, 8.4, 12), 400);
      text(c, `בשעה ${v.time}`, 1220 - lift(t, 8.7), 104, SERIF, p.acc, show(t, 8.7, 12), 700);
    }
    // 12–16: איפה
    else if (t < 16) {
      const k = show(t, 12, 16);
      ornament(c, t, W / 2, 1460, 0.3, p, k);
      text(c, "נשמח לראותכם", 860 - lift(t, 12), 70, SANS, p.soft, k, 500);
      text(c, v.place, 1010 - lift(t, 12.3), 140, SERIF, p.ink, show(t, 12.3, 16), 900);
    }
    // 16–18: המזמינים
    else if (t < 18) {
      const k = show(t, 16, 18);
      text(c, "מזמינים בשמחה", 880 - lift(t, 16), 70, SANS, p.soft, k, 500);
      text(c, v.hosts, 1030 - lift(t, 16.2), 140, SERIF, p.ink, show(t, 16.2, 18), 900);
    }
    // 18–20: סיום
    else {
      const k = ease(span(t, 18, 18.5));
      ornament(c, t, W / 2, 700, 0.8 + 0.06 * Math.sin((t - 18) * 3), p, k);
      text(c, "בואו לשמוח איתנו", 1240, 112, SERIF, p.ink, k, 900);
      text(c, `${v.occasion} · ${v.name}`, 1390, 70, SANS, p.acc, ease(span(t, 18.4, 19)), 500);
    }
  },
};
