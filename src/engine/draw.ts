/** כלי ציור משותפים לכל הרעיונות */
import { VIDEO, type Ctx, type Palette } from "./types";

const { W, H } = VIDEO;

export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
/** כמה התקדמנו בין שני זמנים, 0..1 */
export const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const SERIF = "'Frank Ruhl Libre', serif";
export const SANS = "Rubik, sans-serif";

/** רקע חי: מעבר צבע, שני זוהרים איטיים ונצנוצים עדינים */
export function background(c: Ctx, t: number, p: Palette) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, p.bg2); g.addColorStop(1, p.bg);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const glows: [number, number, number, number][] = [
    [540 + 220 * Math.sin(t * 0.5), 760 + 120 * Math.cos(t * 0.4), 900, 0.28],
    [320 + 180 * Math.cos(t * 0.35), 1480 + 120 * Math.sin(t * 0.6), 760, 0.18],
  ];
  for (const [x, y, r, a] of glows) {
    const rg = c.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, withAlpha(p.acc, a)); rg.addColorStop(1, withAlpha(p.acc, 0));
    c.fillStyle = rg; c.fillRect(0, 0, W, H);
  }
  c.save(); c.fillStyle = p.acc;
  for (let i = 0; i < 70; i++) {
    const x = rnd(i) * W, y0 = rnd(i + 99) * H - t * (24 + 50 * rnd(i + 7));
    const y = ((y0 % H) + H) % H;
    c.globalAlpha = 0.15 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2.6 + i));
    c.beginPath(); c.arc(x, y, 2 + 3.5 * rnd(i + 3), 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

/** קישוט: טבעות מסתובבות עם פסים */
export function ornament(c: Ctx, t: number, cx: number, cy: number, s: number, p: Palette, a = 1) {
  if (a <= 0 || s <= 0) return;
  c.save(); c.translate(cx, cy); c.scale(s, s); c.strokeStyle = p.acc; c.lineCap = "round";
  for (let k = 0; k < 3; k++) {
    c.save(); c.rotate(t * (k % 2 ? -0.35 : 0.25) + k); c.lineWidth = 4 - k; c.globalAlpha *= a * (0.9 - k * 0.25);
    const r = 230 + k * 70;
    c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
    for (let j = 0; j < 24; j++) {
      const q = (j / 24) * Math.PI * 2;
      c.beginPath(); c.moveTo(Math.cos(q) * (r - 15), Math.sin(q) * (r - 15)); c.lineTo(Math.cos(q) * (r + 15), Math.sin(q) * (r + 15)); c.stroke();
    }
    c.restore();
  }
  c.restore();
}

/** שורת טקסט ממורכזת מימין לשמאל; מקטינה את הגופן עד שהשורה נכנסת */
export function text(c: Ctx, s: string, y: number, size: number, font: string, color: string, a = 1, weight = 700) {
  if (a <= 0 || !s) return;
  c.save(); c.globalAlpha *= a; c.direction = "rtl"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = color;
  let px = size;
  c.font = `${weight} ${px}px ${font}`;
  while (c.measureText(s).width > W - 140 && px > 28) { px -= 4; c.font = `${weight} ${px}px ${font}`; }
  c.fillText(s, W / 2, y); c.restore();
}

/** קו זהב קצר */
export function rule(c: Ctx, y: number, w: number, p: Palette, a = 1) {
  if (a <= 0) return;
  c.save(); c.globalAlpha *= a; c.fillStyle = p.acc; c.fillRect(W / 2 - w / 2, y - 2, w, 4); c.restore();
}

/** תמונה של הגולש בעיגול, חתוכה אוטומטית */
export function roundImage(c: Ctx, img: CanvasImageSource, cx: number, cy: number, r: number, p: Palette, a = 1) {
  if (a <= 0) return;
  const iw = (img as { width: number }).width, ih = (img as { height: number }).height;
  const k = Math.max((2 * r) / iw, (2 * r) / ih);
  c.save(); c.globalAlpha *= a;
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.clip();
  c.drawImage(img, cx - (iw * k) / 2, cy - (ih * k) / 2, iw * k, ih * k);
  c.restore();
  c.save(); c.globalAlpha *= a; c.strokeStyle = p.acc; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); c.restore();
}

function withAlpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** קפיצה קלה מעבר ליעד ובחזרה (לכניסת מילים) */
export const back = (x: number) => { const k = clamp(x), s = 1.6; return 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); };

/**
 * כותרת שנכנסת מילה אחר מילה (מימין לשמאל): כל מילה קופצת מגודל 70% ומתבהרת.
 * at — זמן התחלת הכניסה; gap — הפרש בין מילים; gold — מילוי זהב מנצנץ.
 */
export function words(c: Ctx, s: string, y: number, size: number, font: string, color: string, t: number, at: number, opts: { weight?: number; gap?: number; out?: number; gold?: Palette } = {}) {
  const { weight = 900, gap = 0.08, out = 1, gold } = opts;
  if (!s || out <= 0) return;
  c.save(); c.direction = "rtl"; c.textBaseline = "middle"; c.textAlign = "center";
  let px = size; c.font = `${weight} ${px}px ${font}`;
  const parts = s.split(" ");
  const fit = () => parts.reduce((w, p) => w + c.measureText(p).width, 0) + c.measureText(" ").width * (parts.length - 1);
  while (fit() > W - 140 && px > 28) { px -= 4; c.font = `${weight} ${px}px ${font}`; }
  const space = c.measureText(" ").width;
  let x = W / 2 + fit() / 2;
  parts.forEach((p, i) => {
    const w = c.measureText(p).width, k = span(t, at + i * gap, at + i * gap + 0.35);
    if (k > 0) {
      c.save(); c.globalAlpha *= Math.min(1, k * 1.6) * out;
      c.translate(x - w / 2, y + (1 - ease(k)) * 40); const sc = 0.7 + 0.3 * back(k); c.scale(sc, sc);
      if (gold) {
        const g = c.createLinearGradient(-w, 0, w, 0), m = ((t * 0.6 + i * 0.2) % 1.6) - 0.3;
        g.addColorStop(0, gold.acc); g.addColorStop(clamp(m), mix(gold.acc, "#FFFFFF", 0.65)); g.addColorStop(1, gold.acc);
        c.fillStyle = g;
      } else c.fillStyle = color;
      c.fillText(p, 0, 0); c.restore();
    }
    x -= w + space;
  });
  c.restore();
}

/** פרץ ניצוצות מהמרכז, בתחילת מסך */
export function burst(c: Ctx, t: number, at: number, cx: number, cy: number, p: Palette, n = 46) {
  const k = span(t, at, at + 0.9);
  if (k <= 0 || k >= 1) return;
  c.save(); c.fillStyle = p.acc; const base = c.globalAlpha;
  for (let i = 0; i < n; i++) {
    const q = rnd(i + at * 7) * Math.PI * 2, d = (260 + 520 * rnd(i + 31)) * ease(k);
    c.globalAlpha = base * (1 - k) * 0.9;
    c.beginPath(); c.arc(cx + Math.cos(q) * d, cy + Math.sin(q) * d, (2 + 5 * rnd(i + 5)) * (1 - k * 0.5), 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

/** קרן אור אלכסונית שחוצה את המסך */
export function sweep(c: Ctx, t: number, at: number, p: Palette, dur = 0.7) {
  const k = span(t, at, at + dur);
  if (k <= 0 || k >= 1) return;
  c.save(); c.translate(W / 2, H / 2); c.rotate(-0.45);
  const x = (k * 2 - 1) * 1500, g = c.createLinearGradient(x - 260, 0, x + 260, 0);
  g.addColorStop(0, withAlpha(p.acc, 0)); g.addColorStop(0.5, withAlpha(mix(p.acc, "#FFFFFF", 0.5), 0.35)); g.addColorStop(1, withAlpha(p.acc, 0));
  c.fillStyle = g; c.fillRect(-1700, -1700, 3400, 3400); c.restore();
}

/** הבזק אור קצר במעבר */
export function flash(c: Ctx, t: number, at: number, p: Palette, strength = 0.55) {
  const k = t - at;
  if (k < 0 || k > 0.4) return;
  c.save(); c.globalAlpha = strength * Math.exp(-k * 12); c.fillStyle = mix(p.acc, "#FFFFFF", 0.7); c.fillRect(0, 0, W, H); c.restore();
}

function mix(a: string, b: string, k: number) {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((x >> s) & 255) * (1 - k) + ((y >> s) & 255) * k);
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("")}`;
}
