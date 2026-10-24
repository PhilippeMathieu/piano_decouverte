// Les chansons jouées avec les vrais échantillons de piano, écoutées comme au micro (fenêtre de readNote, toutes les 50 ms).
import { beforeAll, describe, expect, it } from 'vitest';
import { SR, loadSamples, note, seeded } from './testing/piano';
import { rms, yin } from './detect';
import { NoteTracker } from './tracker';
import { SONGS } from '../../content/songs';
import { Ev, pcOf } from '../music';

/** Rend la main droite : chaque note relâchée à 92 % de sa durée (comme le moteur audio). */
function render(tune: Ev[], bpm: number, rnd: () => number, noise = 0.002, gain = 1) {
  const beat = 60 / bpm;
  const len = Math.ceil((tune.reduce((a, e) => a + e.dur, 0) * beat + 1) * SR);
  const out = new Float32Array(len);
  let t = 0.3;
  for (const e of tune) {
    for (const m of e.notes) {
      const hold = e.dur * beat * 0.92;
      const n = Math.min(len - Math.floor(t * SR), Math.floor((hold + 0.6) * SR));
      const x = note(m, n, 0.0);
      const v = (0.55 + 0.35 * rnd()) * gain;
      const at = Math.floor(t * SR);
      for (let i = 0; i < n; i++) {
        const s = i / SR;
        const env = s < hold ? 1 : Math.exp(-(s - hold) / 0.16);
        out[at + i] += v * env * x[i];
      }
    }
    t += e.dur * beat;
  }
  for (let i = 0; i < len; i++) out[i] += noise * (rnd() * 2 - 1);
  return out;
}

/** Ce que l'appli entendrait : nouvelles notes, toutes les 50 ms, sur les 3072 derniers échantillons. */
function hear(buf: Float32Array, gate: number): number[] {
  const tr = new NoteTracker();
  const W = 3072;
  const got: number[] = [];
  for (let end = W; end < buf.length; end += Math.round(SR * 0.05)) {
    const w = buf.subarray(end - W, end);
    const level = rms(w);
    const pitch = level > gate ? yin(w, SR, 60, 2200) : null;
    const ev = tr.push(pitch, level, (end / SR) * 1000, gate, rms(w.subarray(W - 1024)));
    if (ev) got.push(ev.midi);
  }
  return got;
}

describe('chansons au micro', () => {
  beforeAll(loadSamples, 60000);
  const songs = SONGS.filter((s) => !s.left);
  it.each(songs.map((s) => [s.title, s] as const))('%s : toutes les notes reconnues, dans l’ordre', (_, s) => {
    const rnd = seeded(7);
    // Un enfant guidé note à note joue plus lentement que le tempo de la chanson : on teste aux 3/4 du tempo.
    const buf = render(s.tune, s.bpm * 0.75, rnd);
    const got = hear(buf, 4 * 0.002);
    const want = s.tune.filter((e) => e.notes.length).map((e) => pcOf(e.notes[0]));
    // Le guidage n'avance que sur la bonne note : on vérifie qu'on la retrouve, dans l'ordre, sans fausse note entre deux.
    let k = 0;
    let wrong = 0;
    let merged = 0;
    for (const m of got) {
      if (k < want.length && pcOf(m) === want[k]) k++;
      // Note répétée (do do) dont la 2ᵉ, plus douce, n'est pas entendue : l'enfant la rejoue, sans faute comptée.
      else if (k > 0 && k + 1 < want.length && want[k] === want[k - 1] && pcOf(m) === want[k + 1]) {
        merged++;
        k += 2;
      }
      // Comme le guidage : la note qu'on vient de jouer, entendue une 2e fois, n'est pas une faute.
      else if (k > 0 && pcOf(m) === want[k - 1]) continue;
      else wrong++;
    }
    if (wrong || k < want.length) console.log(s.id, 'got', got.map(pcOf).join(' '), '\nwant', want.join(' '));
    expect({ found: k, wrong }).toEqual({ found: want.length, wrong: 0 });
    // Au plus une note répétée à rejouer par chanson.
    expect(merged).toBeLessThanOrEqual(1);
  });
  it('joué doucement (−12 dB), au même tempo', () => {
    const s = SONGS.find((x) => x.id === 'lune')!;
    const buf = render(s.tune, s.bpm, seeded(3), 0.0005, 0.25);
    const got = hear(buf, 4 * 0.0005);
    const want = s.tune.filter((e) => e.notes.length).map((e) => pcOf(e.notes[0]));
    expect(got.map(pcOf)).toEqual(want);
  });
});
