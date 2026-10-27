/** הנעימות — כליות בלבד, 120 BPM, 20 שניות, עם עצירות ב-7.75 ו-15.75 ומכת סיום ב-19.5;
 *  כל נעימה מתאימה לכל רעיון. נוצרות ב-scripts/music.py */
export interface Track { id: string; label: string; file: string | null }

export const TRACKS: Track[] = [
  { id: "festive", label: "חגיגית", file: "/music/festive.aac" },
  { id: "beat", label: "קצבית", file: "/music/beat.aac" },
  { id: "uplift", label: "מרוממת", file: "/music/uplift.aac" },
  { id: "calm", label: "שקטה", file: "/music/calm.aac" },
  { id: "none", label: "בלי מוזיקה", file: null },
];

export const trackById = (id: string) => TRACKS.find((t) => t.id === id) ?? TRACKS[0];
