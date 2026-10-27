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
    c.save(); c.rotate(t * (k % 2 ? -0.35 : 0.25) + k); c.lineWidth = 4 - k; c.globalAlpha = a * (0.9 - k * 0.25);
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
  c.save(); c.globalAlpha = a; c.direction = "rtl"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = color;
  let px = size;
  c.font = `${weight} ${px}px ${font}`;
  while (c.measureText(s).width > W - 140 && px > 28) { px -= 4; c.font = `${weight} ${px}px ${font}`; }
  c.fillText(s, W / 2, y); c.restore();
}

/** קו זהב קצר */
export function rule(c: Ctx, y: number, w: number, p: Palette, a = 1) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.fillStyle = p.acc; c.fillRect(W / 2 - w / 2, y - 2, w, 4); c.restore();
}

/** תמונה של הגולש בעיגול, חתוכה אוטומטית */
export function roundImage(c: Ctx, img: CanvasImageSource, cx: number, cy: number, r: number, p: Palette, a = 1) {
  if (a <= 0) return;
  const iw = (img as { width: number }).width, ih = (img as { height: number }).height;
  const k = Math.max((2 * r) / iw, (2 * r) / ih);
  c.save(); c.globalAlpha = a;
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.clip();
  c.drawImage(img, cx - (iw * k) / 2, cy - (ih * k) / 2, iw * k, ih * k);
  c.restore();
  c.save(); c.globalAlpha = a; c.strokeStyle = p.acc; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); c.restore();
}

function withAlpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
