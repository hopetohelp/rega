/** הנעימות — כליות בלבד, 120 BPM, 20 שניות; כל נעימה מתאימה לכל רעיון */
export interface Track { id: string; label: string; file: string | null }

export const TRACKS: Track[] = [
  { id: "none", label: "בלי מוזיקה", file: null },
];

export const trackById = (id: string) => TRACKS.find((t) => t.id === id) ?? TRACKS[0];
