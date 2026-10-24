// Chansons de l'appli : airs traditionnels ou anciens, du domaine public (écrits ici en do).
import { Ev, cPositionFinger, parseTune, withFingers } from '../core/music';

export interface Song {
  id: string;
  title: string;
  icon: string;
  /** Mélodie (main droite). */
  tune: Ev[];
  /** Main gauche, jouée en même temps (notes longues). */
  left?: Ev[];
  bpm: number;
  /** Temps par mesure. */
  beats: number;
  /** Phrases : nombre de notes jouées par phrase (pour découper l'affichage). */
  phrases: number[];
}

function song(s: Omit<Song, 'tune' | 'left' | 'phrases'> & { tune: string[]; fingers?: string; cpos?: boolean; left?: string }): Song {
  const lines = s.tune.map((l) => parseTune(l));
  let tune = lines.flat();
  if (s.fingers) tune = withFingers(tune, s.fingers);
  else if (s.cpos) tune = tune.map((e) => (e.notes.length ? { ...e, finger: cPositionFinger(e.notes[0]) } : e));
  return {
    id: s.id,
    title: s.title,
    icon: s.icon,
    bpm: s.bpm,
    beats: s.beats,
    tune,
    left: s.left ? parseTune(s.left, 3) : undefined,
    phrases: lines.map((l) => l.filter((e) => e.notes.length).length)
  };
}

export const SONGS: Song[] = [
  song({
    id: 'lune',
    title: 'Au clair de la lune',
    icon: '🌙',
    bpm: 84,
    beats: 4,
    cpos: true,
    tune: ['do do do ré | mi2 ré2 | do mi ré ré | do4', 'do do do ré | mi2 ré2 | do mi ré ré | do4']
  }),
  song({
    id: 'agneau',
    title: 'Marie avait un agneau',
    icon: '🐑',
    bpm: 96,
    beats: 4,
    cpos: true,
    tune: ['mi ré do ré | mi mi mi2 | ré ré ré2 | mi sol sol2', 'mi ré do ré | mi mi mi mi | ré ré mi ré | do4']
  }),
  song({
    id: 'joie',
    title: 'Ode à la joie',
    icon: '🎉',
    bpm: 100,
    beats: 4,
    cpos: true,
    tune: ['mi mi fa sol | sol fa mi ré | do do ré mi | mip réc ré2', 'mi mi fa sol | sol fa mi ré | do do ré mi | rép doc do2']
  }),
  song({
    id: 'grelots',
    title: 'Vive le vent',
    icon: '🔔',
    bpm: 112,
    beats: 4,
    cpos: true,
    tune: [
      'mi mi mi2 | mi mi mi2 | mi sol dop réc | mi4',
      'fa fa fap fac | fa mi mi mic mic | mi ré ré mi | ré2 sol2',
      'mi mi mi2 | mi mi mi2 | mi sol dop réc | mi4',
      'fa fa fap fac | fa mi mi mic mic | sol sol fa ré | do4'
    ]
  }),
  song({
    id: 'etoile',
    title: 'Ah ! vous dirai-je, maman',
    icon: '⭐',
    bpm: 92,
    beats: 4,
    fingers: '1 1 4 4 5 5 4 4 4 3 3 2 2 1 5 5 4 4 3 3 2 5 5 4 4 3 3 2 1 1 4 4 5 5 4 4 4 3 3 2 2 1',
    tune: [
      'do do sol sol | la la sol2 | fa fa mi mi | ré ré do2',
      'sol sol fa fa | mi mi ré2 | sol sol fa fa | mi mi ré2',
      'do do sol sol | la la sol2 | fa fa mi mi | ré ré do2'
    ]
  }),
  song({
    id: 'jacques',
    title: 'Frère Jacques',
    icon: '🔔',
    bpm: 96,
    beats: 4,
    tune: [
      'do ré mi do | do ré mi do',
      'mi fa sol2 | mi fa sol2',
      'solc lac solc fac mi do | solc lac solc fac mi do',
      'do sol, do2 | do sol, do2'
    ]
  }),
  song({
    id: 'anniv',
    title: 'Joyeux anniversaire',
    icon: '🎂',
    bpm: 100,
    beats: 3,
    tune: ['sol,c sol,c | la, sol, do | si,2', 'sol,c sol,c | la, sol, ré | do2', 'sol,c sol,c | sol mi do | si, la,2', 'fac fac | mi do ré | do2']
  }),
  song({
    id: 'lune-complete',
    title: 'Au clair de la lune (en entier)',
    icon: '🌕',
    bpm: 84,
    beats: 4,
    tune: [
      'do do do ré | mi2 ré2 | do mi ré ré | do4',
      'do do do ré | mi2 ré2 | do mi ré ré | do4',
      'ré ré ré ré | la,2 la,2 | ré do si, la, | sol,4',
      'do do do ré | mi2 ré2 | do mi ré ré | do4'
    ]
  }),
  // Deux mains : la main gauche tient une note longue au début de chaque mesure.
  song({
    id: 'lune-2m',
    title: 'Au clair de la lune (2 mains)',
    icon: '🌙',
    bpm: 76,
    beats: 4,
    cpos: true,
    tune: ['do do do ré | mi2 ré2 | do mi ré ré | do4'],
    left: 'do4 | do2 sol,2 | do2 sol,2 | do4'
  }),
  song({
    id: 'joie-2m',
    title: 'Ode à la joie (2 mains)',
    icon: '🎉',
    bpm: 84,
    beats: 4,
    cpos: true,
    tune: ['mi mi fa sol | sol fa mi ré | do do ré mi | mip réc ré2', 'mi mi fa sol | sol fa mi ré | do do ré mi | rép doc do2'],
    left: 'do4 | sol,4 | do4 | sol,4 | do4 | sol,4 | do4 | sol,2 do2'
  })
];

export const songById = (id: string) => {
  const s = SONGS.find((x) => x.id === id);
  if (!s) throw new Error('Chanson inconnue : ' + id);
  return s;
};
