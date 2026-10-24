// Rythmes à lire et à taper : noire (1 temps), blanche (2), ronde (4), croche (½), soupir (1 temps de silence).

export interface Beat {
  /** Durée en temps. */
  dur: number;
  rest: boolean;
}

/** « 1 1 2 | -1 1 2 | .5 .5 1 2 » : nombre = durée, « - » devant = silence. */
export function parseRhythm(src: string): Beat[] {
  return src
    .trim()
    .split(/\s+/)
    .filter((t) => t && t !== '|')
    .map((t) => ({ rest: t.startsWith('-'), dur: Math.abs(parseFloat(t)) }));
}
export const total = (r: Beat[]) => r.reduce((s, b) => s + b.dur, 0);
/** Instants (en temps) où l'on doit jouer. */
export function onsets(r: Beat[]): number[] {
  const out: number[] = [];
  let t = 0;
  for (const b of r) {
    if (!b.rest) out.push(t);
    t += b.dur;
  }
  return out;
}

/**
 * Mesures possibles, par niveau (chaque niveau ajoute aux précédents de même mesure) :
 * 1 à 4 et 6 en 4 temps, 5 en 3 temps (valse, blanche pointée), 6 : noire pointée et contretemps.
 */
const BARS: string[][] = [
  ['1 1 1 1'],
  ['2 1 1', '1 1 2', '2 2', '1 2 1'],
  ['4', '1 -1 1 1', '1 1 -1 1', '2 -1 1', '-1 1 2', '1 -1 2'],
  ['.5 .5 1 2', '1 .5 .5 1 1', '.5 .5 .5 .5 2', '1 1 .5 .5 1', '.5 .5 1 .5 .5 1'],
  ['3', '2 1', '1 2', '1 1 1', '1 -1 1', '.5 .5 1 1', '2 -1'],
  ['1.5 .5 1 1', '1 1 1.5 .5', '.5 1 .5 2', '.5 1 .5 1 1', '1.5 .5 2', '1 .5 1 .5 1']
];
/** Temps par mesure d'un niveau. */
export const meterOf = (level: number): 3 | 4 => (level === 5 ? 3 : 4);
export const barsFor = (level: number) =>
  BARS.slice(0, level)
    .filter((_, i) => meterOf(i + 1) === meterOf(level))
    .flat();
/** Les mesures propres au niveau (ce qu'on vient d'apprendre), pour qu'elles reviennent souvent. */
const newBars = (level: number) => BARS[level - 1];

/** Un rythme de 2 mesures : au moins une mesure du niveau en cours (sauf niveau 1). */
export function makePattern(level: number, rnd: () => number = Math.random): string {
  const all = barsFor(level);
  const fresh = newBars(level);
  const pick = (a: string[]) => a[Math.floor(rnd() * a.length)];
  const a = pick(fresh);
  const b = pick(all);
  return rnd() < 0.5 ? `${a} | ${b}` : `${b} | ${a}`;
}

export interface Judged {
  /** Pour chaque note attendue : écart (s) ou null si manquée. */
  hits: (number | null)[];
  /** Coups en trop. */
  extra: number;
  ok: boolean;
}

/**
 * Compare les coups de l'enfant (instants en s) aux instants attendus (s).
 * Tolérance large : un enfant de 8 ans, sur un écran ou un piano.
 */
export function judge(expected: number[], taps: number[], tol = 0.2): Judged {
  const used = new Set<number>();
  const hits = expected.map((t) => {
    let best = -1;
    let bestD = Infinity;
    taps.forEach((x, i) => {
      const d = Math.abs(x - t);
      if (!used.has(i) && d <= tol && d < bestD) {
        best = i;
        bestD = d;
      }
    });
    if (best < 0) return null;
    used.add(best);
    return taps[best] - t;
  });
  const extra = taps.length - used.size;
  return { hits, extra, ok: hits.every((h) => h !== null) && extra <= 1 };
}
