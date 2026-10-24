// Notes, noms français, couleurs, portée et petites chansons écrites en texte.

/** Les 7 notes, dans l'ordre. */
export const NAMES = ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si'] as const;
export type Name = (typeof NAMES)[number];
/** Classe de hauteur de chaque note blanche. */
export const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11];
export const mod = (n: number, m = 12) => ((n % m) + m) % m;
export const pcOf = (midi: number) => mod(midi);
export const isBlack = (midi: number) => [1, 3, 6, 8, 10].includes(pcOf(midi));

/** Couleur de chaque note (une par note blanche ; une touche noire prend celle de la note d'en dessous). */
export const NOTE_COLORS = ['#ff5a5f', '#ff9f1c', '#ffd23f', '#3ccf6e', '#2ec4f1', '#5b6cff', '#b25cff'];
export const letterOf = (midi: number): number => {
  const pc = pcOf(midi);
  let l = 0;
  for (let i = 0; i < 7; i++) if (NATURAL_PC[i] <= pc) l = i;
  return l;
};
export const colorOf = (midi: number) => NOTE_COLORS[letterOf(midi)];

/** Nom d'une note : « do », « fa♯ » (ou « sol♭ » si flat). */
export function nameOf(midi: number, flat = false): string {
  const pc = pcOf(midi);
  const i = NATURAL_PC.indexOf(pc);
  if (i >= 0) return NAMES[i];
  return flat ? NAMES[NATURAL_PC.indexOf(pc + 1)] + '♭' : NAMES[NATURAL_PC.indexOf(pc - 1)] + '♯';
}
export const octaveOf = (midi: number) => Math.floor(midi / 12) - 1;
/** Note blanche : nom + octave → MIDI (do 4 = 60, le do du milieu). */
export const midiOf = (name: Name, octave = 4) => 12 * (octave + 1) + NATURAL_PC[NAMES.indexOf(name)];

// ---------------------------------------------------------------- Portée

export type Clef = 'sol' | 'fa';
/** Rang diatonique (do 4 = 28) : place la note sur la portée. */
export const stepOf = (midi: number, flat = false) => {
  const pc = pcOf(midi);
  const l = NATURAL_PC.includes(pc) ? NATURAL_PC.indexOf(pc) : flat ? NATURAL_PC.indexOf(pc + 1) : NATURAL_PC.indexOf(pc - 1);
  return 7 * octaveOf(midi) + l;
};
/** Ligne du bas : mi 4 en clé de sol, sol 2 en clé de fa. */
export const BOTTOM_STEP: Record<Clef, number> = { sol: 7 * 4 + 2, fa: 7 * 2 + 4 };
/** Hauteur sur la portée en interlignes : 0 = ligne du haut, 4 = ligne du bas. */
export const staffY = (midi: number, clef: Clef, flat = false) => 4 - (stepOf(midi, flat) - BOTTOM_STEP[clef]) / 2;

// ---------------------------------------------------------------- Chansons écrites en texte

export interface Ev {
  /** Notes jouées ensemble (vide = silence). */
  notes: number[];
  /** Durée en temps (noire = 1). */
  dur: number;
  /** Doigt (1 = pouce), si indiqué. */
  finger?: number;
}

const DUR: Record<string, number> = { '': 1, c: 0.5, p: 1.5, '2': 2, '3': 3, '4': 4 };

/**
 * Lit une mélodie écrite « do ré mi2 | sol, do' fa+ - -2 » :
 * octave 4 par défaut, « , » une octave plus bas, « ' » une octave plus haut ;
 * durée : rien = noire, c = croche, p = noire pointée, 2 = blanche, 3 = blanche pointée, 4 = ronde ;
 * + = dièse, b = bémol (après le nom) ; « - » = silence ; « | » = barre de mesure (ignorée) ;
 * « do/mi/sol » = notes ensemble.
 */
export function parseTune(src: string, baseOctave = 4): Ev[] {
  const out: Ev[] = [];
  for (const tok of src.trim().split(/\s+/)) {
    if (!tok || tok === '|') continue;
    const rest = /^-(c|p|2|3|4)?$/.exec(tok);
    if (rest) {
      out.push({ notes: [], dur: DUR[rest[1] ?? ''] });
      continue;
    }
    // La durée s'écrit après la dernière note : « do/mi/sol2 ».
    const dm = /(c|p|2|3|4)?$/.exec(tok)!;
    const body = tok.slice(0, tok.length - (dm[1]?.length ?? 0));
    const notes = body.split('/').map((n) => {
      const m = /^(do|ré|re|mi|fa|sol|la|si)([+b]?)([,']*)$/.exec(n);
      if (!m) throw new Error(`Note illisible : « ${n} » dans « ${tok} »`);
      const name = (m[1] === 're' ? 'ré' : m[1]) as Name;
      const shift = [...m[3]].reduce((s, c) => s + (c === "'" ? 1 : -1), 0);
      return midiOf(name, baseOctave + shift) + (m[2] === '+' ? 1 : m[2] === 'b' ? -1 : 0);
    });
    out.push({ notes, dur: DUR[dm[1] ?? ''] });
  }
  return out;
}

/** Ajoute les doigts « 1 1 1 2 3 … » (un par note jouée, les silences sont sautés). */
export function withFingers(evs: Ev[], fingers?: string): Ev[] {
  if (!fingers) return evs;
  const f = fingers.trim().split(/\s+/).map(Number);
  let i = 0;
  return evs.map((e) => (e.notes.length ? { ...e, finger: f[i++] } : e));
}

/** Doigts de la position de do (main droite : do = 1 … sol = 5 ; main gauche : do = 5 … sol = 1). */
export function cPositionFinger(midi: number, hand: 'd' | 'g' = 'd'): number | undefined {
  const i = [0, 2, 4, 5, 7].indexOf(pcOf(midi));
  if (i < 0) return undefined;
  return hand === 'd' ? i + 1 : 5 - i;
}
