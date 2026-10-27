/**
 * בניית הסרטון במכשיר: WebCodecs (H.264) + המוזיקה כ-AAC מוכן, ארוזים ל-MP4.
 * גיבוי לדפדפן בלי WebCodecs: הקלטה בזמן אמת (MediaRecorder).
 */
import { ArrayBufferTarget, Muxer } from "mp4-muxer";
import { VIDEO, type Assets, type Idea, type Palette, type Values } from "./types";

const { W, H, FPS, DUR } = VIDEO;
const FRAMES = FPS * DUR, RATE = 48000;

export interface VideoFile { blob: Blob; name: string; type: string; ms: number }
type Job = { idea: Idea; values: Values; palette: Palette; assets: Assets; music: string | null };

const canvas = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return c; };

/** מסגרות AAC מתוך קובץ ADTS */
function adtsFrames(buf: Uint8Array): Uint8Array[] {
  const out: Uint8Array[] = [];
  for (let i = 0; i + 7 <= buf.length;) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xf0) !== 0xf0) break;
    const head = buf[i + 1] & 1 ? 7 : 9, len = ((buf[i + 3] & 3) << 11) | (buf[i + 4] << 3) | (buf[i + 5] >> 5);
    if (len <= head || i + len > buf.length) break;
    out.push(buf.subarray(i + head, i + len)); i += len;
  }
  return out;
}

async function webCodecs(job: Job, aac: Uint8Array | null, onProgress: (k: number) => void): Promise<Blob | null> {
  if (typeof VideoEncoder === "undefined" || typeof VideoFrame === "undefined") return null;
  const video = { codec: "avc1.640028", width: W, height: H, bitrate: 5_000_000, framerate: FPS };
  if (!(await VideoEncoder.isConfigSupported(video).catch(() => null))?.supported) return null;
  const frames = aac ? adtsFrames(aac).slice(1) : [];
  const muxer = new Muxer({
    target: new ArrayBufferTarget(), fastStart: "in-memory", firstTimestampBehavior: "offset",
    video: { codec: "avc", width: W, height: H, frameRate: FPS },
    ...(frames.length ? { audio: { codec: "aac" as const, numberOfChannels: 2, sampleRate: RATE } } : {}),
  });
  let failed: unknown = null;
  const ve = new VideoEncoder({ output: (ch, meta) => muxer.addVideoChunk(ch, meta), error: (e) => { failed = e; } });
  ve.configure(video);
  const cv = canvas(), ctx = cv.getContext("2d")!;
  for (let i = 0; i < FRAMES; i++) {
    if (failed) throw failed;
    job.idea.draw(ctx, i / FPS, job.values, job.palette, job.assets);
    const frame = new VideoFrame(cv, { timestamp: Math.round((i * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
    ve.encode(frame, { keyFrame: i % (FPS * 2) === 0 }); frame.close();
    while (ve.encodeQueueSize > 6) await new Promise((r) => setTimeout(r, 4));
    if (i % 10 === 0) { onProgress(i / FRAMES); await new Promise((r) => setTimeout(r, 0)); }
  }
  await ve.flush(); ve.close();
  if (failed) throw failed;
  const step = (1024 / RATE) * 1e6;
  const meta = { decoderConfig: { codec: "mp4a.40.2", sampleRate: RATE, numberOfChannels: 2, description: new Uint8Array([0x11, 0x90]) } };
  frames.slice(0, Math.ceil((DUR * 1e6) / step)).forEach((f, i) => muxer.addAudioChunkRaw(f, "key", Math.round(i * step), Math.round(step), i ? undefined : meta));
  muxer.finalize();
  return new Blob([muxer.target.buffer], { type: "video/mp4" });
}

async function realtime(job: Job, aac: Uint8Array | null, onProgress: (k: number) => void): Promise<Blob> {
  const cv = canvas(), ctx = cv.getContext("2d")!;
  job.idea.draw(ctx, 0, job.values, job.palette, job.assets);
  const stream = cv.captureStream(FPS), ac = new AudioContext({ sampleRate: RATE });
  const audio = aac ? await ac.decodeAudioData(aac.slice().buffer).catch(() => null) : null;
  let src: AudioBufferSourceNode | null = null;
  if (audio) { const dest = ac.createMediaStreamDestination(); src = ac.createBufferSource(); src.buffer = audio; src.connect(dest); dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t)); }
  const type = ["video/mp4;codecs=avc1,mp4a", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
  const rec = new MediaRecorder(stream, { mimeType: type || undefined, videoBitsPerSecond: 5_000_000 }), parts: Blob[] = [];
  rec.ondataavailable = (e) => { if (e.data.size) parts.push(e.data); };
  const done = new Promise<void>((r) => { rec.onstop = () => r(); });
  rec.start(250); src?.start();
  const t0 = ac.currentTime;
  try {
    await new Promise<void>((resolve, fail) => {
      const tick = () => {
        try {
          const t = ac.currentTime - t0;
          job.idea.draw(ctx, Math.min(t, DUR), job.values, job.palette, job.assets); onProgress(Math.min(1, t / DUR));
          if (t >= DUR) resolve(); else requestAnimationFrame(tick);
        } catch (e) { fail(e); }
      };
      requestAnimationFrame(tick);
    });
  } catch (e) { rec.stop(); src?.stop(); void ac.close(); throw e; }
  rec.stop(); await done; void ac.close();
  return new Blob(parts, { type: (rec.mimeType || type).includes("mp4") ? "video/mp4" : "video/webm" });
}

/** בונה את הסרטון. onProgress — 0..1 */
export async function renderVideo(job: Job, onProgress: (k: number) => void = () => {}): Promise<VideoFile> {
  const t0 = performance.now();
  // הגופנים חייבים להיות טעונים לפני הפריים הראשון, אחרת הסרטון נפתח בגופן חלופי
  await Promise.all(["900 100px 'Frank Ruhl Libre'", "700 100px 'Frank Ruhl Libre'", "500 100px Rubik", "400 100px Rubik"].map((f) => document.fonts.load(f, "אב"))).catch(() => {});
  const aac = job.music ? await fetch(job.music).then((r) => (r.ok ? r.arrayBuffer() : null)).then((b) => b && new Uint8Array(b)).catch(() => null) : null;
  let blob: Blob | null = null;
  try { blob = await webCodecs(job, aac, onProgress); } catch { blob = null; }
  if (!blob) blob = await realtime(job, aac, onProgress);
  onProgress(1);
  const mp4 = blob.type === "video/mp4";
  return { blob, type: blob.type, name: `rega-${job.idea.id}.${mp4 ? "mp4" : "webm"}`, ms: performance.now() - t0 };
}
