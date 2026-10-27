#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ארבע הנעימות של רגע לברך — כליות בלבד, בלי AI ובלי שירה, דטרמיניסטיות.
כולן על אותה רשת (120 BPM, תיבה = 2 שניות, 20 שניות), כך שכל נעימה מתאימה לכל רעיון:
  0     מכת פתיחה                    7.75–8 ו-15.75–16  עצירה קצרה (שקט לפני מעבר גדול)
  2..18 מכה בכל תחילת תיבה           16–18  בנייה (רול סנר ועולה)    18  דרופ    19.5  מכת סיום
כלי הסינתזה: Content-creator/tools (synth, beat, trailer).

שימוש:
  python3 scripts/music.py --tools ../Content-creator/tools --out public/music
"""
import argparse, os, subprocess, sys
import numpy as np, soundfile as sf

STYLES = {
    "festive": dict(label="חגיגית", chords=[(50, 54, 57), (47, 50, 54), (43, 47, 50), (45, 49, 52)], roots=[38, 35, 43, 45], kick="all", clap=True, arp=16, hats=.22, bright=1.3),
    "calm":    dict(label="שקטה", chords=[(50, 54, 57), (47, 50, 54), (43, 47, 50), (45, 49, 52)], roots=[38, 35, 43, 45], kick="half", clap=False, arp=8, hats=.08, bright=.8),
    "beat":    dict(label="קצבית", chords=[(50, 53, 57), (46, 50, 53), (53, 57, 60), (48, 52, 55)], roots=[38, 34, 41, 36], kick="all", clap=True, arp=16, hats=.3, bright=1.5),
    "uplift":  dict(label="מרוממת", chords=[(43, 47, 50), (40, 43, 47), (36, 40, 43), (38, 42, 45)], roots=[31, 28, 36, 38], kick="toms", clap=True, arp=8, hats=.14, bright=1.6),
}
SECONDS, BEAT, BAR = 20.0, 0.5, 2.0
STOPS = [(7.75, 8.0), (15.75, 16.0)]
END = 19.5


def build(st, S, B, T):
    SR = S.SR
    stopped = lambda t: any(a <= t < b for a, b in STOPS)
    at = T.at
    n = int(SECONDS * SR)
    drums, bass, music, fx = (np.zeros((n + SR, 2)) for _ in range(4))
    k, clap, ch, oh = B.kick(), B.clap(), B.hat(), B.hat(open_=True)
    bar = lambda t: int(t // BAR) % 4
    # תופים
    for i in range(int(SECONDS / BEAT * 4)):
        t = i * BEAT / 4
        if t >= 17.5 and t < 18.0 or t >= END or stopped(t):
            continue
        on = i % 4 == 0
        pos = (i // 4) % 4
        if on:
            if st["kick"] == "all" or (st["kick"] == "half" and pos in (0, 2)):
                at(drums, k, t, .9 if t >= 2 else .6)
            if st["kick"] == "toms" and pos in (0, 2):
                at(drums, T.tom(70, .5, seed=i), t, .9); at(drums, k, t, .6)
            if st["clap"] and pos in (1, 3) and t >= 2:
                at(drums, clap, t, .7)
        if i % 4 == 2 and t >= 2:
            at(drums, oh if st["hats"] > .2 else ch, t, st["hats"])
        elif i % 2 == 1 and t >= 4 and st["arp"] == 16:
            at(drums, ch, t, .07)
    # בנייה 16–18: רול סנר מתחזק
    for j in range(16):
        at(drums, B.snare(.1, seed=40 + j), 16.0 + j * BEAT / 4 * (1 if j < 8 else .5) + (0 if j < 8 else 1.0), .12 + .03 * j)
    # באס: שמיניות על שורש האקורד
    for i in range(int(SECONDS / (BEAT / 2))):
        t = i * BEAT / 2
        if t < 2 or t >= END or stopped(t) or 17.5 <= t < 18:
            continue
        at(bass, B.sub(BEAT / 2 * .95, T.hz(st["roots"][bar(t)] + (12 if i % 2 else 0))), t, .36)
    # הרמוניה: פד בכל תיבה + ארפג'ו
    for b in range(10):
        t0 = b * BAR
        c = st["chords"][b % 4]
        lift = 12 if t0 >= 18 else 0
        at(music, S.widen(T.pad([m + 24 + lift for m in c], BAR, seed=b + 3, bright=st["bright"] * (.6 if b == 0 else 1)), .5), t0, .6)
        if t0 >= 2:
            seq = [c[0], c[1], c[2], c[0] + 12, c[2], c[1], c[2], c[0] + 12]
            step = BAR / st["arp"]
            for j in range(st["arp"]):
                t = t0 + j * step
                if t < END and not stopped(t):
                    at(music, S.pan(T.pluck(seq[j % 8] + 24 + lift, dur=.16, seed=j).mean(1), (-.4, .4)[j % 2]), t, .26)
    # נשימה עם הפעמה (סיידצ'יין)
    sc = np.ones(len(music)); rel = int(.2 * SR)
    for i in range(int(SECONDS / BEAT) + 1):
        p = int(i * BEAT * SR)
        if p < len(sc):
            e = min(len(sc), p + rel)
            sc[p:e] = np.minimum(sc[p:e], 1 - .6 * np.exp(-4 * np.linspace(0, 1, e - p)))
    music *= sc[:, None]; bass *= sc[:, None]
    # מכות במעברים
    for t in np.arange(0, 19, BAR):
        big = t in (0, 4, 8, 12, 16, 18)
        at(fx, T.impact(1.2 if big else .6, seed=int(t * 10)), t, .5 if big else .25)
        if big:
            at(fx, T.stab(tuple(m + 36 for m in st["chords"][int(t // BAR) % 4]), seed=int(t * 10)), t, .3)
    for a, _b in STOPS:
        at(fx, T.riser(.8, seed=int(a * 10)), a - .8, .22)
    at(fx, T.riser(1.6, seed=91), 16.2, .3)
    at(fx, T.riser(1.2, seed=93), 0.6, .18)
    # סיום
    at(fx, T.impact(1.0, seed=95), END, 1.0)
    at(fx, T.braam(1.0, root=T.D1, seed=96), END, .6)
    at(fx, T.pad([m + 36 for m in st["chords"][0]], 1.0, seed=99, bright=1.6), END, .55)
    crash = S.band_noise(SR, 3000, 14000, seed=98) * S.perc_env(SR, .002, 1.0, curve=3.5)
    at(fx, S.widen(np.stack([crash, np.roll(crash, 37)], 1), .6), END, .3)
    mix = drums + bass * .9 + music * .8 + fx * .9
    wet = S.convolve(music * .6 + fx * .4 + drums * .15, S.reverb_ir(1.5, 5.0))[:len(mix)]
    gate = np.ones(len(mix)); fade = int(.015 * SR)
    for a_, b_ in STOPS:
        i0, i1 = int(a_ * SR), int(b_ * SR)
        gate[i0:i0 + fade] = np.linspace(1, .03, fade); gate[i0 + fade:i1] = .03
    out = mix * gate[:, None] + wet * .22 * np.maximum(gate, .35)[:, None]
    out = S.compress(out, -15, 3.0)[:n]
    out[-int(.12 * SR):] *= np.linspace(1, 0, int(.12 * SR))[:, None] ** 1.4
    return S.limit(out, ceiling=.89, true_peak=True), SR


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tools", default=os.path.join(os.path.dirname(__file__), "../../Content-creator/tools"))
    ap.add_argument("--out", default="public/music")
    a = ap.parse_args()
    sys.path.insert(0, os.path.abspath(a.tools))
    import synth as S, beat as B, trailer as T
    os.makedirs(a.out, exist_ok=True)
    for sid, st in STYLES.items():
        wav = os.path.join(a.out, f"{sid}.wav"); aac = os.path.join(a.out, f"{sid}.aac")
        audio, sr = build(st, S, B, T)
        sf.write(wav, audio, sr, subtype="PCM_16")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "160k", "-f", "adts", aac], check=True)
        os.remove(wav)
        print(sid, st["label"], aac)


if __name__ == "__main__":
    main()
