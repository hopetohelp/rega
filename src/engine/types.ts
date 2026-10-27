/** מידות הסרטון: לאורך, 20 שניות, קטעים של 2 שניות (רשת המוזיקה — 120 BPM, תיבה = 2 שניות) */
export const VIDEO = { W: 1080, H: 1920, FPS: 30, DUR: 20, SEG: 2 } as const;

export type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export interface Palette {
  id: string;
  label: string;
  /** צבע הכפתור לבחירה */
  swatch: string;
  bg: string;
  bg2: string;
  ink: string;
  soft: string;
  acc: string;
}

export type FieldKind = "text" | "select" | "date" | "time";

export interface Field {
  id: string;
  label: string;
  kind: FieldKind;
  default: string;
  options?: string[];
  max?: number;
}

export type Values = Record<string, string>;

export interface Assets {
  image: CanvasImageSource | null;
}

export interface Idea {
  id: string;
  name: string;
  fields: Field[];
  /** זמני המעברים בשניות — כל אחד כפולה של 2, כדי שינחת על מכה בכל נעימה */
  cuts: number[];
  draw(c: Ctx, t: number, v: Values, p: Palette, a: Assets): void;
}

export const defaults = (idea: Idea): Values => Object.fromEntries(idea.fields.map((f) => [f.id, f.default]));
