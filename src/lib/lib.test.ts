import { hebrewDate } from "./hebrewDate";
import { isClosed, reopensAt } from "./shabbat";

/** זמן בשעון ישראל (חורף: UTC+2) */
const il = (iso: string) => new Date(`${iso}+02:00`);

describe("תאריך עברי", () => {
  it("כותב באותיות, עם ב' לפני החודש", () => {
    expect(hebrewDate("2026-11-16")).toEqual({ hebrew: "ו׳ בכסלו תשפ״ז", greg: "16.11.2026", weekday: "יום שני" });
  });
  it("תאריך ריק ⇐ null", () => { expect(hebrewDate("")).toBeNull(); });
});

describe("שבת וחג", () => {
  it("יום רביעי בצהריים — פתוח", () => { expect(isClosed(il("2026-11-18T12:00:00"))).toBe(false); });
  it("שישי 15:59 פתוח, 16:00 סגור", () => {
    expect(isClosed(il("2026-11-20T15:59:00"))).toBe(false);
    expect(isClosed(il("2026-11-20T16:00:00"))).toBe(true);
  });
  it("שבת 19:59 סגור, 20:00 פתוח", () => {
    expect(isClosed(il("2026-11-21T19:59:00"))).toBe(true);
    expect(isClosed(il("2026-11-21T20:00:00"))).toBe(false);
  });
  it("במוצאי שבת", () => { expect(reopensAt(il("2026-11-21T10:00:00"))).toBe("במוצאי שבת בשעה 20:00"); });
  it("ערב פסח 16:00 סגור, ובפסח עצמו סגור עד 20:00 (ט״ו בניסן תשפ״ז = 22.4.2027)", () => {
    expect(isClosed(new Date("2027-04-21T16:30:00+03:00"))).toBe(true);
    expect(isClosed(new Date("2027-04-22T12:00:00+03:00"))).toBe(true);
    expect(isClosed(new Date("2027-04-22T20:30:00+03:00"))).toBe(false);
    expect(reopensAt(new Date("2027-04-22T12:00:00+03:00"))).toBe("במוצאי החג בשעה 20:00");
  });
});
