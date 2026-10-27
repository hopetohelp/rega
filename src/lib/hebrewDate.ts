import { HDate } from "@hebcal/core";

const DAYS = ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "שבת"];

/** "2026-11-16" ⇐ { hebrew: "ו׳ בכסלו תשפ״ז", greg: "16.11.2026", weekday: "יום שני" } */
export function hebrewDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  const parts = new HDate(date).renderGematriya(true).split(" ");
  const hebrew = `${parts[0]} ב${parts.slice(1, -1).join(" ")} ${parts[parts.length - 1]}`;
  return { hebrew, greg: `${d}.${m}.${y}`, weekday: DAYS[date.getDay()] };
}
