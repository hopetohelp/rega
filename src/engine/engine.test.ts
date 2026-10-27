import { IDEAS } from "./ideas";
import { PALETTES } from "./palettes";
import { VIDEO, defaults } from "./types";

const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

describe("רעיונות", () => {
  it.each(IDEAS.map((i) => [i.id, i] as const))("%s: כל מעבר על רשת של 2 שניות, בתוך הסרטון", (_, idea) => {
    for (const c of idea.cuts) {
      expect(c % VIDEO.SEG).toBe(0);
      expect(c).toBeGreaterThan(0);
      expect(c).toBeLessThan(VIDEO.DUR);
    }
  });
  it.each(IDEAS.map((i) => [i.id, i] as const))("%s: לפחות 5 התאמות אישיות (כולל צבע, מוזיקה ותמונה)", (_, idea) => {
    expect(idea.fields.length + 3).toBeGreaterThanOrEqual(5);
    expect(Object.keys(defaults(idea))).toHaveLength(idea.fields.length);
  });
});

describe("צבעים", () => {
  it.each(PALETTES.map((p) => [p.label, p] as const))("%s: טקסט קריא על הרקע", (_, p) => {
    expect(contrast(p.ink, p.bg)).toBeGreaterThanOrEqual(7);
    expect(contrast(p.ink, p.bg2)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(p.soft, p.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(p.acc, p.bg)).toBeGreaterThanOrEqual(3);
  });
});

describe("ציור", () => {
  it.each(IDEAS.map((i) => [i.id, i] as const))("%s: זמנים בקצוות לא מפילים את הציור", (_, idea) => {
    const noop = () => {};
    const ctx = new Proxy({}, { get: (_t, k) => (k === "measureText" ? () => ({ width: 10 }) : k === "createLinearGradient" || k === "createRadialGradient" ? () => ({ addColorStop: noop }) : noop), set: () => true }) as unknown as CanvasRenderingContext2D;
    for (const t of [-0.01, 0, 1.999, 2, 19.999, 20]) expect(() => idea.draw(ctx, t, defaults(idea), PALETTES[0], { image: null })).not.toThrow();
  });
});
