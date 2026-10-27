import type { Palette } from "./types";

/** צבעי הסרטון — חמים; ניגודיות הטקסט נבדקת בבדיקות */
export const PALETTES: Palette[] = [
  { id: "gold", label: "זהב על כהה", swatch: "#E2B15B", bg: "#1A140C", bg2: "#2E2214", ink: "#F6EEDD", soft: "#CDBE9F", acc: "#E2B15B" },
  { id: "cream", label: "שמנת וזהב", swatch: "#F3E7CF", bg: "#F6EEDD", bg2: "#EADBBE", ink: "#2A1F10", soft: "#6A5838", acc: "#8A5C0C" },
  { id: "olive", label: "ירוק זית", swatch: "#6E7F3A", bg: "#F3F1E6", bg2: "#E2E2CC", ink: "#262B14", soft: "#4F5636", acc: "#5C6B2E" },
  { id: "wine", label: "בורדו", swatch: "#8C2F39", bg: "#1C0F11", bg2: "#341A1E", ink: "#F5E9EA", soft: "#D3B9BC", acc: "#E3A0A7" },
];

export const paletteById = (id: string) => PALETTES.find((p) => p.id === id) ?? PALETTES[0];
