import { useEffect, useMemo, useState } from "react";
import { ALL_IDEAS, IDEAS } from "./engine/ideas";
import { TRACKS, trackById } from "./engine/music";
import { PALETTES, paletteById } from "./engine/palettes";
import { renderVideo, type VideoFile } from "./engine/render";
import { defaults, type Assets, type Values } from "./engine/types";
import { Preview } from "./components/Preview";
import { PersonalArea } from "./components/PersonalArea";
import { Stats } from "./components/Stats";
import { applyTheme, savedTheme, type Theme } from "./lib/theme";
import { isClosed, reopensAt } from "./lib/shabbat";

const SUN = <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
const MOON = <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></svg>;
const THUMB: Record<string, string> = { simcha: "הזמנה\nלשמחה", chag: "חג\nשמח", business: "מבצע\nהשבוע", community: "שיעור\nהשבוע", year: "השנה\nשלי" };

/** תמונה של הגולש: מוקטנת במכשיר, לא עולה לשום מקום */
async function loadImage(file: File) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 900 / Math.max(bmp.width, bmp.height));
  return k < 1 ? createImageBitmap(bmp, { resizeWidth: Math.round(bmp.width * k), resizeHeight: Math.round(bmp.height * k) }) : bmp;
}

export function App() {
  const [closed, setClosed] = useState(isClosed());
  useEffect(() => { const id = setInterval(() => setClosed(isClosed()), 60_000); return () => clearInterval(id); }, []);
  const [theme, setTheme] = useState<Theme>(savedTheme());
  const [ideaId, setIdeaId] = useState(IDEAS[0].id);
  const idea = IDEAS.find((i) => i.id === ideaId) ?? IDEAS[0];
  const [values, setValues] = useState<Values>(() => defaults(idea));
  const [paletteId, setPaletteId] = useState(PALETTES[0].id);
  const [trackId, setTrackId] = useState(TRACKS[0].id);
  const [assets, setAssets] = useState<Assets>({ image: null });
  const [progress, setProgress] = useState<number | null>(null);
  const [video, setVideo] = useState<(VideoFile & { url: string }) | null>(null);
  const [error, setError] = useState("");
  const palette = paletteById(paletteId);
  const fileName = useMemo(() => video?.name ?? "", [video]);

  if (closed) return (
    <main className="closed">
      <span className="logo">רגע לברך<i>.</i></span>
      <h1>סגור בשבת ובחג</h1>
      <p>נשמח לברך איתכם שוב {reopensAt()}.</p>
    </main>
  );

  const set = (id: string, v: string) => { setValues({ ...values, [id]: v }); setVideo(null); };
  const toggleTheme = () => { const t = theme === "dark" ? "light" : "dark"; setTheme(t); applyTheme(t); };

  async function make() {
    setError(""); setVideo(null); setProgress(0);
    try {
      const f = await renderVideo({ idea, values, palette, assets, music: trackById(trackId).file }, setProgress);
      setVideo({ ...f, url: URL.createObjectURL(f.blob) });
    } catch {
      setError("משהו השתבש. אפשר לנסות שוב.");
    } finally { setProgress(null); }
  }

  async function share() {
    if (!video) return;
    const file = new File([video.blob], video.name, { type: video.type });
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: "רגע לברך" }).catch(() => {});
    else { const a = document.createElement("a"); a.href = video.url; a.download = video.name; a.click(); }
  }

  return (
    <div className="page">
      <header className="top">
        <div className="brand"><span className="logo">רגע לברך<i>.</i></span><span className="tag">רגע אחד, והברכה מוכנה.</span></div>
        <div className="actions">
          <button type="button" className="pill icon" aria-label={theme === "dark" ? "מעבר לתצוגת יום" : "מעבר לתצוגת לילה"} onClick={toggleTheme}>{theme === "dark" ? SUN : MOON}</button>
          <PersonalArea />
        </div>
      </header>

      <section className="hero">
        <h1>רגע אחד,<br />והברכה מוכנה.</h1>
        <p>סרטון ברכה אישי ומרגש — לשמחה, לחג או לעסק. בחינם.</p>
      </section>

      <main className="main">
        <nav className="pick" aria-labelledby="s1">
          <h2 className="step" id="s1"><b>01</b>על מה מברכים?</h2>
          <div className="ideas">
            {ALL_IDEAS.map((x) => (
              <button key={x.id} type="button" className="idea" disabled={!x.ready} aria-pressed={x.id === ideaId}
                onClick={() => { const n = IDEAS.find((i) => i.id === x.id); if (n) { setIdeaId(n.id); setValues(defaults(n)); setVideo(null); } }}>
                <span className="thumb" style={{ whiteSpace: "pre-line" }}>{THUMB[x.id]}</span>
                <span className="txt"><span className="nm">{x.name}</span><span className="mt">{x.ready ? "0 ברכות · 0 לייקים" : "בקרוב"}</span></span>
              </button>
            ))}
          </div>
        </nav>

        <form className="form" onSubmit={(e) => { e.preventDefault(); void make(); }}>
          <h2 className="step"><b>02</b>מה לכתוב?</h2>
          {idea.fields.map((f) => f.kind === "select" ? (
            <label key={f.id}>{f.label}
              <select value={values[f.id]} onChange={(e) => set(f.id, e.target.value)}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>
            </label>
          ) : (
            <label key={f.id}>{f.label}
              <input type={f.kind} value={values[f.id]} maxLength={f.max} required onChange={(e) => set(f.id, e.target.value)} />
            </label>
          ))}
          <h2 className="step" style={{ marginTop: 8 }}><b>03</b>צבע וצליל</h2>
          <div className="swatches" role="group" aria-label="צבעים">
            {PALETTES.map((p) => <button key={p.id} type="button" className="swatch" style={{ background: p.swatch }} aria-label={p.label} aria-pressed={p.id === paletteId} onClick={() => { setPaletteId(p.id); setVideo(null); }} />)}
          </div>
          <label>מוזיקה
            <select value={trackId} onChange={(e) => { setTrackId(e.target.value); setVideo(null); }}>{TRACKS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
          </label>
          <label className="ghost" style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", color: "var(--ink)", cursor: "pointer" }}>
            {assets.image ? "החלפת התמונה" : "+ תמונה או לוגו"}
            <input type="file" accept="image/*" className="sr" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setAssets({ image: await loadImage(f) }); setVideo(null); } }} />
          </label>
          {assets.image && <button type="button" className="ghost" onClick={() => { setAssets({ image: null }); setVideo(null); }}>הסרת התמונה</button>}
          <button className="go" type="submit" disabled={progress !== null}>{progress === null ? "לברך" : `עוד רגע… ${Math.round(progress * 100)}%`}</button>
          {error && <p role="alert" style={{ margin: 0, color: "var(--acc)" }}>{error}</p>}
        </form>

        <div className="stage" aria-live="polite">
          {video ? (
            <>
              <div className="screen"><video src={video.url} controls playsInline autoPlay /></div>
              <div className="result">
                <div className="acts">
                  <button type="button" className="primary" onClick={() => void share()}>שליחה</button>
                  <a href={video.url} download={fileName}>הורדה</a>
                </div>
                <button type="button" className="pill" onClick={() => setVideo(null)}>חזרה לעריכה</button>
              </div>
            </>
          ) : <Preview idea={idea} values={values} palette={palette} assets={assets} music={trackById(trackId).file} />}
        </div>
      </main>

      <Stats />

      <footer className="foot">
        <About />
      </footer>
    </div>
  );
}

function About() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="pill" aria-expanded={open} onClick={() => setOpen(!open)} style={{ color: "var(--soft)" }}>אודות</button>
      {open && <div className="links"><a href="/about">על רגע לברך</a><a href="/privacy">פרטיות</a><a href="/accessibility">הצהרת נגישות</a><a href="/terms">תנאי שימוש</a></div>}
    </>
  );
}
