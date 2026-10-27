/**
 * שמחה במשפחה — הזמנה. 20 שניות, 10 מסכים של 2 שניות (כל מעבר על מכה).
 * הפריים הראשון שלם (סוג השמחה + שם המזמין) — זו התמונה שרואים לפני שהסרטון מתנגן.
 */
import { hebrewDate } from "../../lib/hebrewDate";
import { background, burst, ease, flash, ornament, roundImage, rule, SANS, SERIF, span, sweep, text, words } from "../draw";
import { VIDEO, type Assets, type Ctx, type Idea, type Palette, type Values } from "../types";

const { W, H, SEG } = VIDEO;

const nextWeek = () => {
  const d = new Date(); d.setDate(d.getDate() + 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

type Scene = (c: Ctx, lt: number, t: number, v: Values, p: Palette, a: Assets) => void;

/** הופעה מהירה של שורה משנית */
const fade = (lt: number, at: number) => ease(span(lt, at, at + 0.25));

const SCENES: Scene[] = [
  // 0–2: פתיח — שלם כבר בפריים הראשון
  (c, lt, t, v, p) => {
    ornament(c, t, W / 2, 640, 0.95 + 0.05 * Math.sin(t * 2), p, 0.9);
    text(c, "הזמנה", 1060, 76, SANS, p.acc, 1, 500);
    text(c, `ל${v.occasion}`, 1210, 150, SERIF, p.ink, 1, 900);
    rule(c, 1330, 120, p, 1);
    text(c, v.inviter, 1440, 92, SERIF, p.acc, 1, 700);
    burst(c, lt, 1.2, W / 2, 640, p, 30);
  },
  // 2–4: פתיחה חגיגית
  (c, lt, t, _v, p) => {
    words(c, "בשעה טובה ומוצלחת", 880, 120, SERIF, p.ink, lt, 0.05);
    text(c, "אנו שמחים להזמינכם", 1060, 70, SANS, p.soft, fade(lt, 0.55), 500);
    ornament(c, t, W / 2, 1420, 0.3, p, fade(lt, 0.3));
  },
  // 4–6: בעל השמחה
  (c, lt, t, v, p) => {
    ornament(c, t, W / 2, 940, 1 + 0.15 * ease(span(lt, 0, 0.6)), p, 0.5);
    text(c, `ל${v.occasion} של`, 780, 78, SANS, p.soft, fade(lt, 0), 500);
    words(c, v.name, 960, 200, SERIF, p.ink, lt, 0.15, { gold: p });
    burst(c, lt, 0.15, W / 2, 960, p);
  },
  // 6–8: מזל טוב (עם התמונה, אם יש)
  (c, lt, t, _v, p, a) => {
    if (a.image) roundImage(c, a.image, W / 2, 760, 230 * (0.85 + 0.15 * ease(span(lt, 0, 0.5))), p, fade(lt, 0));
    else ornament(c, t * 2, W / 2, 760, 0.85 + 0.2 * ease(span(lt, 0, 0.6)), p, 1);
    words(c, "מזל טוב!", 1240, 170, SERIF, p.ink, lt, 0.2, { gold: p });
  },
  // 8–10: התאריך העברי
  (c, lt, _t, v, p) => {
    const hd = hebrewDate(v.date);
    text(c, hd?.weekday ?? "", 800, 76, SANS, p.soft, fade(lt, 0), 500);
    words(c, hd?.hebrew ?? "", 960, 140, SERIF, p.ink, lt, 0.12);
    rule(c, 1090, 120 * ease(span(lt, 0.5, 0.9)), p, 1);
  },
  // 10–12: התאריך הלועזי והשעה
  (c, lt, _t, v, p) => {
    const hd = hebrewDate(v.date);
    text(c, hd?.greg ?? "", 820, 84, SANS, p.soft, fade(lt, 0), 400);
    text(c, "בשעה", 980, 72, SANS, p.soft, fade(lt, 0.2), 500);
    const k = ease(span(lt, 0.3, 0.7));
    c.save(); c.translate(W / 2, 1140); c.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); c.translate(-W / 2, -1140);
    text(c, v.time, 1140, 200, SERIF, p.acc, k, 900); c.restore();
  },
  // 12–14: המקום
  (c, lt, t, v, p) => {
    text(c, "המקום", 820, 76, SANS, p.soft, fade(lt, 0), 500);
    words(c, v.place, 980, 150, SERIF, p.ink, lt, 0.15);
    ornament(c, t, W / 2, 1400, 0.28, p, fade(lt, 0.4));
  },
  // 14–16: המזמין
  (c, lt, _t, v, p) => {
    text(c, "מזמינים בשמחה", 840, 76, SANS, p.soft, fade(lt, 0), 500);
    words(c, v.inviter, 1000, 150, SERIF, p.ink, lt, 0.15, { gold: p });
    rule(c, 1130, 120 * ease(span(lt, 0.6, 1)), p, 1);
  },
  // 16–18: נשמח לראותכם
  (c, lt, _t, _v, p) => {
    words(c, "נשמח לראותכם!", 960, 150, SERIF, p.ink, lt, 0.1);
    burst(c, lt, 0.4, W / 2, 960, p, 60);
  },
  // 18–20: סיום
  (c, lt, t, v, p) => {
    const pulse = 1 + 0.06 * Math.exp(-Math.max(0, lt - 1.5) * 4) * (lt > 1.5 ? 1 : 0);
    ornament(c, t, W / 2, 700, (0.75 + 0.1 * ease(span(lt, 0, 0.6))) * pulse, p, 1);
    words(c, `${v.occasion} · ${v.name}`, 1220, 96, SERIF, p.ink, lt, 0.05);
    text(c, v.inviter, 1360, 72, SANS, p.acc, fade(lt, 0.5), 500);
    burst(c, lt, 1.5, W / 2, 700, p, 70);
  },
];

/** כניסה למסך — מתחלפת בין ארבעה סוגים */
function enter(c: Ctx, i: number, lt: number) {
  const k = ease(span(lt, 0, 0.32));
  if (i === 0 || k >= 1) return;
  switch (i % 4) {
    case 1: { const s = 1.25 - 0.25 * k; c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2); c.globalAlpha = k; break; }  // זום פנימה
    case 2: c.translate((1 - k) * -W * 0.6, 0); break;                                                                                 // החלקה
    case 3: c.beginPath(); c.arc(W / 2, H / 2, Math.max(1, k * 1150), 0, Math.PI * 2); c.clip(); break;                                // איריס
    default: c.translate(0, (1 - k) * 320); c.globalAlpha = k;                                                                          // עלייה
  }
}

/** יציאה מהמסך — מתקרב ונעלם ברבע השנייה האחרון */
function leave(c: Ctx, i: number, lt: number) {
  const k = ease(span(lt, SEG - 0.25, SEG));
  if (i === SCENES.length - 1 || k <= 0) return;
  const s = 1 + 0.12 * k;
  c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2); c.globalAlpha = 1 - k;
}

export const simcha: Idea = {
  id: "simcha",
  name: "שמחה במשפחה",
  cuts: [2, 4, 6, 8, 10, 12, 14, 16, 18],
  fields: [
    { id: "occasion", label: "סוג השמחה", kind: "select", default: "בר מצווה", options: ["בר מצווה", "ברית", "פדיון הבן", "חנוכת בית", "סיום מסכת", "הכנסת ספר תורה"] },
    { id: "name", label: "שם בעל השמחה", kind: "text", default: "יוסף", max: 30 },
    { id: "date", label: "תאריך", kind: "date", default: nextWeek() },
    { id: "time", label: "שעה", kind: "time", default: "19:30" },
    { id: "place", label: "מקום", kind: "text", default: "אולם השמחות", max: 40 },
    { id: "inviter", label: "שם המזמין — פרטי ומשפחה", kind: "text", default: "אברהם כהן", max: 40 },
  ],
  draw(c, t, v, p, a) {
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
    // מצלמה: דחיפה איטית פנימה לאורך כל הסרטון
    const cam = 1 + 0.05 * (t / VIDEO.DUR);
    c.save(); c.translate(W / 2, H / 2); c.scale(cam, cam); c.translate(-W / 2, -H / 2);
    background(c, t, p);
    c.restore();

    const i = Math.max(0, Math.min(SCENES.length - 1, Math.floor(t / SEG))), lt = t - i * SEG;
    c.save(); enter(c, i, lt); leave(c, i, lt);
    SCENES[i](c, lt, t, v, p, a);
    c.restore();

    // אפקטים על המעברים
    for (const cut of this.cuts) flash(c, t, cut, p, cut % 4 === 0 ? 0.5 : 0.3);
    for (const cut of [2, 8, 14]) sweep(c, t, cut - 0.1, p);
    flash(c, t, 19.5, p, 0.35);
  },
};
