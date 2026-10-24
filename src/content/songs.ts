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
  /** Levée : temps avant la première barre de mesure. */
  pickup?: number;
  /** Phrases : nombre de notes jouées par phrase (pour découper l'affichage). */
  phrases: number[];
  /** Nuance de chaque phrase (« p » doux, « f » fort), montrée pendant qu'on joue. */
  nuances?: ('p' | 'f')[];
}

function song(s: Omit<Song, 'tune' | 'left' | 'phrases'> & { tune: string[]; fingers?: string; cpos?: boolean; left?: string }): Song {
  if (s.nuances && s.nuances.length !== s.tune.length) throw new Error('Une nuance par phrase : ' + s.id);
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
    pickup: s.pickup,
    nuances: s.nuances,
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
    pickup: 1,
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
  }),
  // ---------------------------------------------------------------- Étapes 11 à 18
  song({
    id: 'joie-nuances',
    title: 'Ode à la joie (doux, puis fort)',
    icon: '🎉',
    bpm: 100,
    beats: 4,
    cpos: true,
    nuances: ['p', 'f'],
    tune: ['mi mi fa sol | sol fa mi ré | do do ré mi | mip réc ré2', 'mi mi fa sol | sol fa mi ré | do do ré mi | rép doc do2']
  }),
  song({
    id: 'nuit',
    title: 'Douce nuit',
    icon: '🕯️',
    bpm: 84,
    beats: 3,
    tune: [
      'solp lac sol | mi3 | solp lac sol | mi3',
      "ré'2 ré' | si3 | do'2 do' | sol3",
      "la2 la | do'p sic la | solp lac sol | mi3",
      "la2 la | do'p sic la | solp lac sol | mi3",
      "ré'2 ré' | fa'p ré'c si | do'3 | mi'3",
      "do'p solc mi | solp fac ré | do3 | -3"
    ]
  }),
  song({
    id: 'anniv-sol',
    title: 'Joyeux anniversaire (en sol)',
    icon: '🎂',
    bpm: 100,
    beats: 3,
    pickup: 1,
    tune: ['réc réc | mi ré sol | fa+2', 'réc réc | mi ré la | sol2', "réc réc | ré' si sol | fa+ mi2", "do'c do'c | si sol la | sol2"]
  }),
  song({
    id: 'lune-sol',
    title: 'Au clair de la lune (en sol)',
    icon: '🌕',
    bpm: 84,
    beats: 4,
    tune: [
      'sol sol sol la | si2 la2 | sol si la la | sol4',
      'sol sol sol la | si2 la2 | sol si la la | sol4',
      'la la la la | mi2 mi2 | la sol fa+ mi | ré4',
      'sol sol sol la | si2 la2 | sol si la la | sol4'
    ]
  }),
  // Accompagner : la main gauche joue l'accord (Do, Fa ou Sol) au début de la mesure.
  song({
    id: 'lune-acc',
    title: 'Au clair de la lune (avec les accords)',
    icon: '🌙',
    bpm: 72,
    beats: 4,
    cpos: true,
    tune: ['do do do ré | mi2 ré2 | do mi ré ré | do4', 'do do do ré | mi2 ré2 | do mi ré ré | do4'],
    left: 'do/mi/sol4 | do/mi/sol2 si,/ré/sol2 | do/mi/sol2 si,/ré/sol2 | do/mi/sol4 | do/mi/sol4 | do/mi/sol2 si,/ré/sol2 | do/mi/sol2 si,/ré/sol2 | do/mi/sol4'
  }),
  song({
    id: 'grelots-acc',
    title: 'Vive le vent (avec les accords)',
    icon: '🔔',
    bpm: 96,
    beats: 4,
    cpos: true,
    tune: [
      'mi mi mi2 | mi mi mi2 | mi sol dop réc | mi4',
      'fa fa fap fac | fa mi mi mic mic | mi ré ré mi | ré2 sol2',
      'mi mi mi2 | mi mi mi2 | mi sol dop réc | mi4',
      'fa fa fap fac | fa mi mi mic mic | sol sol fa ré | do4'
    ],
    left:
      'do/mi/sol4 | do/mi/sol4 | do/mi/sol4 | do/mi/sol4 | do/fa/la4 | do/mi/sol4 | si,/ré/sol4 | si,/ré/sol4 | ' +
      'do/mi/sol4 | do/mi/sol4 | do/mi/sol4 | do/mi/sol4 | do/fa/la4 | do/mi/sol4 | si,/ré/sol4 | do/mi/sol4'
  }),
  song({
    id: 'joie-acc',
    title: 'Ode à la joie (avec les accords)',
    icon: '🎉',
    bpm: 84,
    beats: 4,
    cpos: true,
    tune: ['mi mi fa sol | sol fa mi ré | do do ré mi | mip réc ré2', 'mi mi fa sol | sol fa mi ré | do do ré mi | rép doc do2'],
    left: 'do/mi/sol4 | si,/ré/sol4 | do/mi/sol4 | si,/ré/sol4 | do/mi/sol4 | si,/ré/sol4 | do/mi/sol4 | si,/ré/sol2 do/mi/sol2'
  }),
  // Korobeiniki, air russe traditionnel : le thème de Tetris. Le début tient dans la position de la.
  song({
    id: 'tetris',
    title: 'Tetris (le début)',
    icon: '🧱',
    bpm: 100,
    beats: 4,
    fingers: '5 2 3 4 3 2 1 1 3 5 4 3 2 3 4 5 3 1 1 5 2 3 4 3 2 1 1 3 5 4 3 2 3 4 5 3 1 1',
    tune: ["mi' sic do'c ré' do'c sic | la lac do'c mi' ré'c do'c | sip do'c ré' mi' | do' la la2", "mi' sic do'c ré' do'c sic | la lac do'c mi' ré'c do'c | sip do'c ré' mi' | do' la la2"]
  }),
  song({
    id: 'tetris-full',
    title: 'Tetris (en entier)',
    icon: '🎮',
    bpm: 100,
    beats: 4,
    tune: [
      "mi' sic do'c ré' do'c sic | la lac do'c mi' ré'c do'c | sip do'c ré' mi' | do' la la2",
      "-c ré' fa'c la' sol'c fa'c | mi'p do'c mi' ré'c do'c | si sic do'c ré' mi' | do' la la2"
    ]
  }),
  song({
    id: 'jacques-min',
    title: 'Frère Jacques (en la mineur)',
    icon: '🌧️',
    bpm: 92,
    beats: 4,
    tune: [
      "la si do' la | la si do' la",
      "do' ré' mi'2 | do' ré' mi'2",
      "mi'c fa'c mi'c ré'c do' la | mi'c fa'c mi'c ré'c do' la",
      'la mi la2 | la mi la2'
    ]
  }),
  song({
    id: 'buns',
    title: 'Petits pains chauds',
    icon: '🥐',
    bpm: 96,
    beats: 4,
    cpos: true,
    tune: ['mi ré do2 | mi ré do2', 'doc doc doc doc réc réc réc réc | mi ré do2']
  }),
  // À déchiffrer (étape 18) : des airs que l'enfant ne connaît sans doute pas encore.
  song({
    id: 'ferme',
    title: 'Dans la ferme de Mathurin',
    icon: '🐄',
    bpm: 96,
    beats: 4,
    tune: ['do do do sol, | la, la, sol,2 | mi mi ré ré | do3 sol,', 'do do do sol, | la, la, sol,2 | mi mi ré ré | do4']
  }),
  song({
    id: 'saints',
    title: 'When the Saints',
    icon: '🎺',
    bpm: 100,
    beats: 4,
    tune: ['- do mi fa | sol4 | - do mi fa | sol4', '- do mi fa | sol2 mi2 | do2 mi2 | ré4', '- mi mi ré | do3 do | mi2 sol2 | sol fa3', '- mi fa sol | mi2 do2 | ré4 | do4']
  }),
  song({
    id: 'yankee',
    title: 'Yankee Doodle',
    icon: '🎩',
    bpm: 100,
    beats: 4,
    tune: ['do do ré mi | do mi ré sol, | do do ré mi | do2 si,2', 'do do ré mi | fa mi ré do | si, sol, la, si, | do2 do2']
  })
];

export const songById = (id: string) => {
  const s = SONGS.find((x) => x.id === id);
  if (!s) throw new Error('Chanson inconnue : ' + id);
  return s;
};
