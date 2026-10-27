import type { Idea } from "../types";
import { simcha } from "./simcha";

/** הרעיונות שמוכנים לשימוש; השאר יתווספו בהמשך באותו מבנה */
export const IDEAS: Idea[] = [simcha];

/** כל הרעיונות שיוצגו בבחירה — כולל אלה שבהכנה */
export const ALL_IDEAS = [
  { id: "simcha", name: "שמחה במשפחה", ready: true },
  { id: "chag", name: "חג שמח", ready: false },
  { id: "business", name: "מבצע לעסק", ready: false },
  { id: "community", name: "הודעה לקהילה", ready: false },
  { id: "year", name: "השנה שלי", ready: false },
];
