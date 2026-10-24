// Faire entendre des notes, des chansons et des rythmes. Pendant que l'appli joue, le micro ignore ce qu'il entend.
import { Ev } from './music';
import { audio, click, now, piano, playChord, silence } from './audio/engine';

let busyUntil = 0;
/** Vrai tant que l'appli joue (plus 0,4 s de résonance) : le micro ne doit pas prendre ce son pour l'enfant. */
export const appPlaying = () => now() < busyUntil + 0.4;
const busy = (end: number) => (busyUntil = Math.max(busyUntil, end));

export function stopAll() {
  silence();
  busyUntil = 0;
  timers.forEach(clearTimeout);
  timers.length = 0;
}
const timers: number[] = [];

/** Une note (ou plusieurs ensemble). */
export function playNote(midi: number | number[], dur = 0.9, vel = 0.6) {
  audio();
  const t = now() + 0.03;
  const ns = Array.isArray(midi) ? midi : [midi];
  if (ns.length > 1) playChord(ns, t, dur, vel, 0.015);
  else piano(ns[0], t, dur, vel);
  busy(t + dur);
}

/** Notes l'une après l'autre (gap secondes) ; vel : force (une par note ou pour toutes). */
export function playRow(midis: number[], gap = 0.6, dur = gap * 0.95, vel: number | number[] = 0.6) {
  audio();
  const t0 = now() + 0.05;
  midis.forEach((m, i) => piano(m, t0 + i * gap, dur, Array.isArray(vel) ? (vel[i] ?? 0.6) : vel));
  busy(t0 + midis.length * gap);
}

/** Accords l'un après l'autre (gap secondes) ; onChord(i) quand le i-ème sonne. */
export function playChords(chords: number[][], gap = 1.1, onChord?: (i: number) => void) {
  audio();
  const t0 = now() + 0.05;
  chords.forEach((c, i) => {
    playChord(c, t0 + i * gap, gap * 0.95, 0.5, 0.012);
    if (onChord) timers.push(window.setTimeout(() => onChord(i), (t0 + i * gap - now()) * 1000));
  });
  busy(t0 + chords.length * gap);
  return chords.length * gap;
}

/**
 * Joue une mélodie (et sa main gauche). onNote(i) est appelé quand la i-ème note jouée sonne (pour la faire briller).
 * Renvoie la durée totale (s).
 */
export function playTune(tune: Ev[], bpm: number, opts: { left?: Ev[]; onNote?: (i: number) => void; from?: number } = {}): number {
  audio();
  const beat = 60 / bpm;
  const t0 = now() + 0.1;
  let t = 0;
  let k = 0;
  const start = opts.from ?? 0;
  tune.forEach((e, idx) => {
    if (idx < start) {
      if (e.notes.length) k++;
      return;
    }
    if (e.notes.length) {
      const at = t0 + t;
      e.notes.forEach((m) => piano(m, at, e.dur * beat * 0.92, 0.62));
      const i = k++;
      if (opts.onNote) timers.push(window.setTimeout(() => opts.onNote!(i), (at - now()) * 1000));
    }
    t += e.dur * beat;
  });
  if (opts.left && start === 0) {
    let tl = 0;
    for (const e of opts.left) {
      e.notes.forEach((m) => piano(m, t0 + tl, e.dur * beat * 0.95, 0.45));
      tl += e.dur * beat;
    }
  }
  busy(t0 + t);
  return t;
}

/** Accord majeur ou mineur, plaqué puis arpégé. */
export function playMood(root: number, minor: boolean) {
  const n = [root, root + (minor ? 3 : 4), root + 7];
  audio();
  const t = now() + 0.05;
  playChord(n, t, 1.1, 0.5, 0.01);
  n.forEach((m, i) => piano(m, t + 1.3 + i * 0.32, 0.5, 0.55));
  piano(n[0] + 12, t + 1.3 + 3 * 0.32, 0.9, 0.55);
  busy(t + 3);
}

/** Tic du métronome (bois). */
export function tick(when: number, accent = false) {
  click(when, accent);
}
/** Coup de rythme joué par l'appli (une note de piano bien sèche). */
export function hit(when: number, midi = 72) {
  piano(midi, when, 0.18, 0.7);
}
export { audio, now };
export { drum } from './audio/engine';
