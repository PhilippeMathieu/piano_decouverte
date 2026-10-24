// Le parcours : étapes, leçons et exercices (données).
import type { Clef } from '../core/music';

/** Ce qu'il faut pour faire l'exercice. */
export type Where = 'piano' | 'ecran';

export interface KbSpec {
  from: number;
  to: number;
  /** Touches qui brillent (couleur de la note). */
  marks?: number[];
  /** Touches qui portent leur nom ; true = toutes les blanches. */
  names?: boolean | number[];
  /** Touches blanches colorées comme leur note. */
  colors?: boolean;
  /** Entourer les groupes de 2 et/ou 3 noires. */
  groups?: 2 | 3 | 'both';
  /** Numéro de doigt sur des touches. */
  fingers?: Record<number, number>;
}

export type Play =
  | { notes: number[]; gap?: number; label?: string }
  | { chord: number[]; label?: string }
  | { rhythm: string; label?: string }
  | { mood: 'joyeux' | 'triste'; label?: string }
  | { song: string; label?: string };

export interface Slide {
  text: string;
  kb?: KbSpec;
  staff?: { clef: Clef | 'grand'; notes: number[]; names?: boolean };
  hand?: { hand: 'd' | 'g'; finger?: number; labels?: string[] };
  rhythm?: string;
  big?: string;
  play?: Play[];
}

export interface Lesson {
  id: string;
  title: string;
  slides: Slide[];
}

/** Une note à jouer au piano : la consigne, et ce qui est accepté. */
export interface Target {
  /** « Joue un do ». */
  say: string;
  /** Classes de hauteur acceptées (n'importe quelle octave), ou bornes MIDI. */
  pcs?: number[];
  below?: number;
  above?: number;
  /** Ce qu'on montre : la touche au clavier, le nom seul ou la note sur la portée. */
  show?: { key?: number; staff?: { clef: Clef; note: number } };
}

export type Act =
  | { kind: 'groups'; size: 2 | 3 }
  | { kind: 'find'; pool: number[]; flat?: boolean; colors?: boolean }
  | { kind: 'name'; pool: number[] }
  | { kind: 'highlow' }
  | { kind: 'contour' }
  | { kind: 'mood' }
  | { kind: 'whichsong'; songs: string[] }
  | { kind: 'finger'; hand: 'd' | 'g'; mode: 'number' | 'note' }
  | { kind: 'read'; clef: Clef | 'mix'; pool: number[]; answer: 'name' | 'key' }
  | { kind: 'beats' }
  | { kind: 'rhythm'; level: number; input: 'tap' | 'piano' }
  | { kind: 'rhythmear'; level: number }
  | { kind: 'play'; targets: Target[] }
  | { kind: 'sequence'; tune: string; octave?: number; hand: 'd' | 'g'; clef?: Clef; repeat?: number }
  | { kind: 'song'; id: string; help: 'keys' | 'staff' }
  | { kind: 'chords'; chords: string[]; fixed?: boolean };

export interface Exercise {
  id: string;
  title: string;
  /** La consigne, dite à l'enfant. */
  say: string;
  where: Where;
  act: Act;
  /** Questions (ou essais) et réussites nécessaires. Absent : une seule performance (chanson, suite). */
  goal?: { n: number; need: number };
}

export interface Step {
  id: number;
  title: string;
  icon: string;
  /** Autocollant gagné à la fin de l'étape. */
  sticker: string;
  color: string;
  lessons: Lesson[];
  exercises: Exercise[];
}
