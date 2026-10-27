import { useEffect, useRef, useState } from "react";
import { VIDEO, type Assets, type Idea, type Palette, type Values } from "../engine/types";

const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const ICON = {
  play: <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17 5v14L6 12z" /></svg>,
  pause: <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>,
  on: <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></svg>,
  off: <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M17 9l5 6M22 9l-5 6" /></svg>,
};

/** תצוגה חיה: מצייר את הסרטון בזמן אמת, בלולאה. עם צליל — השעון הוא המוזיקה עצמה, כך שהתמונה צמודה למכות */
export function Preview({ idea, values, palette, assets, music }: { idea: Idea; values: Values; palette: Palette; assets: Assets; music: string | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(!reduced());
  const [sound, setSound] = useState(false);
  const [t, setT] = useState(0);
  const props = useRef({ idea, values, palette, assets });
  props.current = { idea, values, palette, assets };
  const clock = useRef(0);

  useEffect(() => {
    const c = ref.current?.getContext("2d");
    if (!c) return;
    const au = audio.current, withSound = sound && !!music && !!au;
    if (withSound) { au.currentTime = clock.current; if (playing) void au.play().catch(() => setSound(false)); else au.pause(); }
    else au?.pause();
    let raf = 0, last = performance.now();
    const frame = (now: number) => {
      if (playing) {
        if (withSound && !au.paused) clock.current = Math.min(au.currentTime, VIDEO.DUR - 1e-3);
        else clock.current = (clock.current + Math.max(0, now - last) / 1000) % VIDEO.DUR;  // חותמת הפריים יכולה להקדים את now ההתחלתי
      }
      last = now;
      const time = clock.current, p = props.current;
      p.idea.draw(c, time, p.values, p.palette, p.assets);
      setT((old) => (Math.floor(old * 4) === Math.floor(time * 4) ? old : time));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); au?.pause(); };
  }, [playing, sound, music]);

  return (
    <>
      <div className="screen">
        <canvas ref={ref} width={VIDEO.W} height={VIDEO.H} role="img" aria-label={`תצוגה מקדימה: ${idea.name}`} />
      </div>
      {music && <audio ref={audio} src={music} loop preload="auto" onEnded={() => { clock.current = 0; }} />}
      <div className="play">
        <button type="button" className="pill icon" aria-label={playing ? "השהיה" : "ניגון"} onClick={() => setPlaying(!playing)}>{playing ? ICON.pause : ICON.play}</button>
        {music && <button type="button" className="pill icon" aria-label={sound ? "השתקה" : "הפעלת צליל"} aria-pressed={sound} onClick={() => setSound(!sound)}>{sound ? ICON.on : ICON.off}</button>}
        <div className="bar" aria-hidden="true"><span style={{ width: `${(t / VIDEO.DUR) * 100}%` }} /></div>
        <span dir="ltr" style={{ fontSize: 13, color: "var(--soft)", fontVariantNumeric: "tabular-nums" }}>0:{String(Math.floor(t)).padStart(2, "0")} / 0:20</span>
      </div>
    </>
  );
}
