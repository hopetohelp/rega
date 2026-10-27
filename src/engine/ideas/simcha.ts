/**
 * שמחה במשפחה — הזמנה קצבית. 20 שניות, 120 BPM: כל מילה נוחתת על מכה (כל חצי שנייה),
 * וכל מעבר גדול על תחילת תיבה (כל 2 שניות) — עם גליץ', טשטוש תנועה, זום או איריס.
 * הפריים הראשון שלם (סוג השמחה + שם המזמין) — זו התמונה שרואים לפני שהסרטון מתנגן.
 */
import { hebrewDate } from "../../lib/hebrewDate";
import { background, BEAT, beatRing, burst, composite, downbeat, flash, layer, ornament, pulse, roundImage, rule, SANS, SERIF, slam, sweep, text } from "../draw";
import { VIDEO, type Assets, type Ctx, type Idea, type Palette, type Values } from "../types";

const { W, H } = VIDEO;

const nextWeek = () => {
  const d = new Date(); d.setDate(d.getDate() + 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** shot: מתחיל במכה b (0..39); lt = הזמן מתחילת השוט */
type Shot = { b: number; draw: (c: Ctx, lt: number, t: number, v: Values, p: Palette, a: Assets) => void };

const SHOTS: Shot[] = [
  // 0–2: פתיח — שלם בפריים הראשון, פועם עם המכות
  { b: 0, draw: (c, lt, t, v, p) => {
    ornament(c, t, W / 2, 640, 0.95 + 0.06 * pulse(t), p, 0.9);
    text(c, "הזמנה", 1060, 76, SANS, p.acc, 1, 500);
    text(c, `ל${v.occasion}`, 1210, 150, SERIF, p.ink, 1, 900);
    rule(c, 1330, 120, p, 1);
    text(c, v.inviter, 1440, 92, SERIF, p.acc, 1, 700);
    burst(c, lt, 1, W / 2, 640, p, 36);
  } },
  // 2–4: "בשעה · טובה · ומוצלחת · כל המשפט"
  { b: 4, draw: (c, lt, _t, _v, p) => slam(c, "בשעה", 960, 230, SERIF, p.ink, lt) },
  { b: 5, draw: (c, lt, _t, _v, p) => slam(c, "טובה", 960, 230, SERIF, p.ink, lt) },
  { b: 6, draw: (c, lt, _t, _v, p) => slam(c, "ומוצלחת", 960, 210, SERIF, p.acc, lt) },
  { b: 7, draw: (c, lt, _t, _v, p) => { slam(c, "בשעה טובה ומוצלחת", 900, 110, SERIF, p.ink, lt, { from: 0.3 }); text(c, "שמחים להזמינכם", 1060, 70, SANS, p.soft, Math.min(1, lt * 8), 500); } },
  // 4–6: סוג השמחה ⇐ "של" ⇐ השם
  { b: 8, draw: (c, lt, _t, v, p) => slam(c, v.occasion, 960, 190, SERIF, p.acc, lt) },
  { b: 9, draw: (c, lt, _t, _v, p) => slam(c, "של", 960, 200, SERIF, p.ink, lt) },
  { b: 10, draw: (c, lt, t, v, p) => {
    ornament(c, t, W / 2, 960, 1.1 + 0.4 * (1 - Math.exp(-lt * 5)), p, 0.55);
    slam(c, v.name, 960, 220, SERIF, p.ink, lt, { gold: p });
    burst(c, lt, 0, W / 2, 960, p, 60);
  } },
  // 6–8: מזל · טוב! · ביחד (עם התמונה)
  { b: 12, draw: (c, lt, _t, _v, p) => slam(c, "מזל", 960, 260, SERIF, p.ink, lt) },
  { b: 13, draw: (c, lt, _t, _v, p) => slam(c, "טוב!", 960, 260, SERIF, p.acc, lt) },
  { b: 14, draw: (c, lt, t, _v, p, a) => {
    if (a.image) roundImage(c, a.image, W / 2, 700, 230 * (1 + 0.04 * pulse(t)), p, Math.min(1, lt * 8));
    else ornament(c, t * 2, W / 2, 700, 0.85 + 0.08 * pulse(t), p, 1);
    slam(c, "מזל טוב!", 1260, 170, SERIF, p.ink, lt, { gold: p, from: 0.3 });
    burst(c, lt, 0, W / 2, 700, p, 50);
  } },
  // 8–10: יום ⇐ התאריך העברי
  { b: 16, draw: (c, lt, _t, v, p) => slam(c, hebrewDate(v.date)?.weekday ?? "", 960, 170, SERIF, p.ink, lt) },
  { b: 17, draw: (c, lt, _t, v, p) => {
    text(c, hebrewDate(v.date)?.weekday ?? "", 800, 70, SANS, p.soft, 1, 500);
    slam(c, hebrewDate(v.date)?.hebrew ?? "", 960, 150, SERIF, p.ink, lt, { from: 0.35 });
    rule(c, 1090, 140 * Math.min(1, lt * 3), p, 1);
  } },
  // 10–12: תאריך לועזי ⇐ "בשעה" ⇐ השעה
  { b: 20, draw: (c, lt, _t, v, p) => slam(c, hebrewDate(v.date)?.greg ?? "", 960, 170, SANS, p.ink, lt, { weight: 700 }) },
  { b: 21, draw: (c, lt, _t, _v, p) => slam(c, "בשעה", 960, 200, SERIF, p.soft, lt) },
  { b: 22, draw: (c, lt, _t, v, p) => { slam(c, v.time, 960, 280, SERIF, p.acc, lt); burst(c, lt, 0, W / 2, 960, p, 40); } },
  // 12–14: המקום
  { b: 24, draw: (c, lt, _t, _v, p) => slam(c, "המקום", 960, 200, SERIF, p.soft, lt) },
  { b: 25, draw: (c, lt, t, v, p) => { slam(c, v.place, 960, 170, SERIF, p.ink, lt, { from: 0.4 }); ornament(c, t, W / 2, 1400, 0.28 + 0.04 * pulse(t), p, Math.min(1, lt * 6)); } },
  // 14–16: מזמינים · בשמחה · המזמין
  { b: 28, draw: (c, lt, _t, _v, p) => slam(c, "מזמינים", 960, 210, SERIF, p.ink, lt) },
  { b: 29, draw: (c, lt, _t, _v, p) => slam(c, "בשמחה", 960, 210, SERIF, p.acc, lt) },
  { b: 30, draw: (c, lt, _t, v, p) => { slam(c, v.inviter, 960, 170, SERIF, p.ink, lt, { gold: p, from: 0.4 }); rule(c, 1100, 140 * Math.min(1, lt * 3), p, 1); } },
  // 16–18: בנייה — "נשמח · לראותכם" ואז הבזקים מהירים
  { b: 32, draw: (c, lt, _t, _v, p) => slam(c, "נשמח", 960, 240, SERIF, p.ink, lt) },
  { b: 33, draw: (c, lt, _t, _v, p) => slam(c, "לראותכם", 960, 220, SERIF, p.acc, lt) },
  { b: 34, draw: (c, lt, t, _v, p) => {
    const s = 1 + 0.08 * lt;  // מתקרב לאט לקראת הדרופ
    c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2);
    slam(c, "נשמח לראותכם!", 960, 150, SERIF, p.ink, lt, { from: 0.3 }); c.restore();
    burst(c, t, 17, W / 2, 960, p, 40);
  } },
  // 18–20: דרופ וסיום
  { b: 36, draw: (c, lt, t, v, p) => {
    ornament(c, t, W / 2, 700, 0.8 + 0.08 * pulse(t) + 0.1 * Math.exp(-Math.max(0, t - 19.5) * 4) * (t >= 19.5 ? 1 : 0), p, 1);
    slam(c, `${v.occasion} · ${v.name}`, 1220, 100, SERIF, p.ink, lt, { from: 0.3 });
    text(c, v.inviter, 1360, 72, SANS, p.acc, Math.min(1, Math.max(0, lt - 0.25) * 6), 500);
    burst(c, lt, 0, W / 2, 700, p, 70);
    burst(c, t, 19.5, W / 2, 700, p, 80);
  } },
];

/** אפקט המעבר בכל תחילת תיבה, לפי הסדר */
const CUT_FX = ["glitch", "whip", "punch", "glitch", "iris", "whip", "glitch", "punch", "glitch"] as const;

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
    t = Math.max(0, Math.min(t, VIDEO.DUR - 1e-3));
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
    // מצלמה: דחיפה איטית פנימה + קפיצה קטנה על כל מכה + רעידה במכת תיבה
    const shake = t >= 2 ? downbeat(t) * 14 : 0;
    const cam = (1 + 0.05 * (t / VIDEO.DUR)) * (1 + 0.012 * pulse(t));
    c.save(); c.translate(W / 2 + Math.sin(t * 91) * shake, H / 2 + Math.cos(t * 77) * shake); c.scale(cam, cam); c.translate(-W / 2, -H / 2);
    background(c, t, p);
    c.restore();
    if (t >= 2 && !(t > 7.75 && t < 8) && !(t > 15.75 && t < 16)) beatRing(c, t, p);

    const i = SHOTS.reduce((k, s, j) => (s.b * BEAT <= t ? j : k), 0), shot = SHOTS[i], lt = t - shot.b * BEAT;
    const l = layer(), target: Ctx = l ?? c;
    target.save();
    shot.draw(target, lt, t, v, p, a);
    target.restore();
    if (l) {
      const cut = Math.round(t / 2) * 2, d = t - cut, ci = cut / 2 - 1;
      const fx = ci >= 0 && ci < CUT_FX.length && d > -0.08 && d < 0.22 ? CUT_FX[ci] : "none";
      const k = fx === "none" ? 0 : Math.max(0, 1 - Math.abs(d + 0.02) / 0.22);
      composite(c, l, fx, k, cut, 1 + 0.025 * pulse(t));
    }

    // אור על המעברים
    for (const cut of this.cuts) flash(c, t, cut, p, cut % 4 === 0 ? 0.45 : 0.28);
    for (const cut of [2, 8, 14]) sweep(c, t, cut - 0.1, p);
    if (t >= 17 && t < 18) for (let q = 17; q < 18; q += BEAT / 2) flash(c, t, q, p, 0.18 + 0.2 * (q - 17));
    flash(c, t, 19.5, p, 0.4);
  },
};
