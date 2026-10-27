import { useEffect, useRef, useState } from "react";
import { VIDEO, type Assets, type Idea, type Palette, type Values } from "../engine/types";

const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** תצוגה חיה: מצייר את הסרטון בזמן אמת, בלולאה */
export function Preview({ idea, values, palette, assets }: { idea: Idea; values: Values; palette: Palette; assets: Assets }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(!reduced());
  const [t, setT] = useState(0);
  const props = useRef({ idea, values, palette, assets });
  props.current = { idea, values, palette, assets };

  useEffect(() => {
    const c = ref.current?.getContext("2d");
    if (!c) return;
    let raf = 0, last = performance.now(), time = t;
    const frame = (now: number) => {
      if (playing) time = (time + Math.max(0, now - last) / 1000) % VIDEO.DUR;  // חותמת הזמן של הפריים יכולה להקדים את now ההתחלתי
      last = now;
      const p = props.current;
      p.idea.draw(c, time, p.values, p.palette, p.assets);
      setT((old) => (Math.floor(old * 4) === Math.floor(time * 4) ? old : time));  // פס ההתקדמות — 4 עדכונים בשנייה
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return (
    <>
      <div className="screen">
        <canvas ref={ref} width={VIDEO.W} height={VIDEO.H} role="img" aria-label={`תצוגה מקדימה: ${idea.name}`} />
      </div>
      <div className="play">
        <button type="button" className="pill icon" aria-label={playing ? "השהיה" : "ניגון"} onClick={() => setPlaying(!playing)}>
          {playing
            ? <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
            : <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17 5v14L6 12z" /></svg>}
        </button>
        <div className="bar" aria-hidden="true"><span style={{ width: `${(t / VIDEO.DUR) * 100}%` }} /></div>
        <span dir="ltr" style={{ fontSize: 13, color: "var(--soft)", fontVariantNumeric: "tabular-nums" }}>0:{String(Math.floor(t)).padStart(2, "0")} / 0:20</span>
      </div>
    </>
  );
}
