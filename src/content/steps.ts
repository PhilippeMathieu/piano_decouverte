// Les 10 étapes du parcours : de la première touche aux accords.
import type { Exercise, Step, Target } from './types';
import { NAMES, NATURAL_PC, midiOf } from '../core/music';

const W4 = [60, 62, 64, 65, 67, 69, 71];
const C_POS = [60, 62, 64, 65, 67];
const C_POS_LEFT = [48, 50, 52, 53, 55];
const KB = { from: 48, to: 76 };

/** « Joue un do » : n'importe quel do (l'enfant cherche la touche, pas l'octave). */
const T = (i: number, show?: Target['show']): Target => ({
  say: `Joue un ${NAMES[i]}`,
  pcs: [NATURAL_PC[i]],
  show
});

const quiz = (n: number, need: number) => ({ n, need });

export const STEPS: Step[] = [
  // ------------------------------------------------------------------ 1
  {
    id: 1,
    title: 'Le clavier',
    icon: '🎹',
    sticker: '🐘',
    color: '#ff5a5f',
    lessons: [
      {
        id: 'l1-touches',
        title: 'Blanches et noires',
        slides: [
          { text: 'Le piano a des touches blanches et des touches noires.', kb: { ...KB } },
          { text: 'Les touches noires vont par 2…', kb: { ...KB, groups: 2 } },
          { text: '… ou par 3.', kb: { ...KB, groups: 3 } },
          {
            text: '2 noires, puis 3 noires, puis 2, puis 3… Ça recommence tout le long du clavier.',
            kb: { ...KB, groups: 'both' }
          }
        ]
      },
      {
        id: 'l1-grave-aigu',
        title: 'Grave et aigu',
        slides: [
          {
            text: 'À gauche, les sons sont graves : gros comme un éléphant.',
            big: '🐘',
            play: [{ notes: [36, 40, 43], gap: 0.5, label: 'Écoute le grave' }]
          },
          {
            text: 'À droite, les sons sont aigus : petits comme une souris.',
            big: '🐭',
            play: [{ notes: [84, 88, 91], gap: 0.3, label: 'Écoute l’aigu' }]
          },
          {
            text: 'Plus tu vas vers la droite, plus le son monte.',
            kb: { ...KB },
            play: [{ notes: [48, 52, 55, 60, 64, 67, 72, 76], gap: 0.3, label: 'Écoute monter' }]
          }
        ]
      }
    ],
    exercises: [
      { id: 'e1-g2', title: 'Les groupes de 2', say: 'Touche une noire d’un groupe de 2.', where: 'ecran', act: { kind: 'groups', size: 2 }, goal: quiz(8, 7) },
      { id: 'e1-g3', title: 'Les groupes de 3', say: 'Touche une noire d’un groupe de 3.', where: 'ecran', act: { kind: 'groups', size: 3 }, goal: quiz(8, 7) },
      { id: 'e1-hl', title: 'Grave ou aigu ?', say: 'Écoute les 2 notes. La 2ᵉ est-elle plus aiguë ou plus grave ?', where: 'ecran', act: { kind: 'highlow' }, goal: quiz(10, 8) },
      {
        id: 'e1-zones',
        title: 'Au piano : grave, aigu, noires',
        say: 'Joue ce qui est demandé.',
        where: 'piano',
        act: {
          kind: 'play',
          targets: [
            { say: 'Joue une note grave, tout à gauche 🐘', below: 53 },
            { say: 'Joue une note aiguë, tout à droite 🐭', above: 76 },
            { say: 'Joue une noire d’un groupe de 2', pcs: [1, 3] },
            { say: 'Joue une noire d’un groupe de 3', pcs: [6, 8, 10] }
          ]
        },
        goal: quiz(8, 6)
      }
    ]
  },
  // ------------------------------------------------------------------ 2
  {
    id: 2,
    title: 'Do, ré, mi',
    icon: '🔴',
    sticker: '🦊',
    color: '#ff9f1c',
    lessons: [
      {
        id: 'l2-do',
        title: 'Trouver le do',
        slides: [
          { text: 'Regarde les groupes de 2 noires.', kb: { ...KB, groups: 2 } },
          {
            text: 'La touche blanche juste à gauche des 2 noires, c’est le do !',
            kb: { ...KB, groups: 2, marks: [48, 60, 72], names: [48, 60, 72] },
            play: [{ notes: [48, 60, 72], gap: 0.6, label: 'Écoute les do' }]
          },
          {
            text: 'Le do au milieu du piano s’appelle le do du milieu. C’est ta maison.',
            kb: { ...KB, marks: [60], names: [60] },
            play: [{ notes: [60], label: 'Écoute' }]
          }
        ]
      },
      {
        id: 'l2-7notes',
        title: 'Les 7 notes',
        slides: [
          {
            text: 'Après do, on monte : do, ré, mi, fa, sol, la, si.',
            kb: { ...KB, names: W4, colors: true },
            play: [{ notes: W4, gap: 0.5, label: 'Écoute' }]
          },
          {
            text: 'Après si, ça recommence : do, ré, mi…',
            kb: { ...KB, names: true, colors: true },
            play: [{ notes: [...W4, 72, 74, 76], gap: 0.4, label: 'Écoute' }]
          },
          {
            text: 'Une astuce : ré est entre les 2 noires. Fa est juste à gauche des 3 noires.',
            kb: { ...KB, groups: 'both', marks: [62, 65], names: [62, 65] }
          }
        ]
      }
    ],
    exercises: [
      { id: 'e2-do', title: 'Trouve le do', say: 'Touche un do.', where: 'ecran', act: { kind: 'find', pool: [60] }, goal: quiz(6, 5) },
      { id: 'e2-dremi', title: 'Do, ré, mi', say: 'Touche la note demandée.', where: 'ecran', act: { kind: 'find', pool: [60, 62, 64], colors: true }, goal: quiz(10, 8) },
      { id: 'e2-7', title: 'Les 7 notes', say: 'Touche la note demandée.', where: 'ecran', act: { kind: 'find', pool: W4 }, goal: quiz(10, 8) },
      { id: 'e2-nom', title: 'Comment s’appelle-t-elle ?', say: 'Quelle est la note qui brille ?', where: 'ecran', act: { kind: 'name', pool: W4 }, goal: quiz(10, 8) },
      {
        id: 'e2-p-do',
        title: 'Au piano : les do',
        say: 'Joue un do. Puis un autre do, ailleurs sur le piano !',
        where: 'piano',
        act: { kind: 'play', targets: [T(0)] },
        goal: quiz(5, 4)
      },
      {
        id: 'e2-p-7',
        title: 'Au piano : les 7 notes',
        say: 'Joue la note demandée.',
        where: 'piano',
        act: { kind: 'play', targets: [0, 1, 2, 3, 4, 5, 6].map((i) => T(i)) },
        goal: quiz(10, 8)
      }
    ]
  },
  // ------------------------------------------------------------------ 3
  {
    id: 3,
    title: 'Mes doigts',
    icon: '✋',
    sticker: '🐢',
    color: '#ffd23f',
    lessons: [
      {
        id: 'l3-doigts',
        title: 'Les numéros des doigts',
        slides: [
          { text: 'Au piano, chaque doigt a un numéro. Le pouce, c’est 1.', hand: { hand: 'd', finger: 1 } },
          { text: 'Puis 2, 3, 4… et le petit doigt, c’est 5.', hand: { hand: 'd', finger: 5 } },
          { text: 'La main gauche aussi : le pouce, c’est 1, le petit doigt, 5.', hand: { hand: 'g', finger: 1 } }
        ]
      },
      {
        id: 'l3-position',
        title: 'La position de do',
        slides: [
          {
            text: 'Pose ton pouce droit sur le do du milieu. Chaque doigt a sa touche : do, ré, mi, fa, sol.',
            kb: { ...KB, names: C_POS, colors: true, fingers: { 60: 1, 62: 2, 64: 3, 65: 4, 67: 5 } },
            play: [{ notes: C_POS, gap: 0.5, label: 'Écoute' }]
          },
          { text: 'Ta main reste bien ronde, comme si tu tenais une bulle.', big: '🫧' },
          { text: 'Joue avec le bout des doigts, un doigt à la fois.', hand: { hand: 'd' } }
        ]
      }
    ],
    exercises: [
      { id: 'e3-num', title: 'Quel doigt ?', say: 'Quel est le numéro du doigt qui brille ?', where: 'ecran', act: { kind: 'finger', hand: 'd', mode: 'number' }, goal: quiz(10, 8) },
      { id: 'e3-note', title: 'Quel doigt, quelle note ?', say: 'Ta main est en position de do. Quelle note joue ce doigt ?', where: 'ecran', act: { kind: 'finger', hand: 'd', mode: 'note' }, goal: quiz(10, 8) },
      { id: 'e3-monte', title: 'Au piano : on monte', say: 'Joue do, ré, mi, fa, sol avec les doigts 1, 2, 3, 4, 5.', where: 'piano', act: { kind: 'sequence', tune: 'do ré mi fa sol2', hand: 'd' } },
      { id: 'e3-aller-retour', title: 'Au piano : aller-retour', say: 'Monte jusqu’au sol, puis redescends.', where: 'piano', act: { kind: 'sequence', tune: 'do ré mi fa sol2 fa mi ré do4', hand: 'd' } },
      { id: 'e3-sauts', title: 'Au piano : les sauts', say: 'Saute une touche : do, mi, sol…', where: 'piano', act: { kind: 'sequence', tune: 'do mi sol mi | do2 ré fa | ré do4', hand: 'd' } }
    ]
  },
  // ------------------------------------------------------------------ 4
  {
    id: 4,
    title: 'Le rythme',
    icon: '🥁',
    sticker: '🦉',
    color: '#3ccf6e',
    lessons: [
      {
        id: 'l4-durees',
        title: 'Noire, blanche, ronde',
        slides: [
          { text: 'La noire dure 1 temps. On dit « ta ».', rhythm: '1 1 1 1', play: [{ rhythm: '1 1 1 1', label: 'Écoute' }] },
          { text: 'La blanche dure 2 temps : « ta-a ».', rhythm: '2 2', play: [{ rhythm: '2 2', label: 'Écoute' }] },
          { text: 'La ronde dure 4 temps : « ta-a-a-a ».', rhythm: '4', play: [{ rhythm: '4', label: 'Écoute' }] },
          { text: 'Ensemble, ça fait un rythme !', rhythm: '1 1 2 | 2 1 1 | 4', play: [{ rhythm: '1 1 2 2 1 1 4', label: 'Écoute' }] }
        ]
      },
      {
        id: 'l4-silence',
        title: 'Le silence',
        slides: [
          { text: 'Le soupir, c’est 1 temps de silence. On ne joue pas, on dit « chut » dans sa tête.', rhythm: '1 -1 1 -1', play: [{ rhythm: '1 -1 1 -1', label: 'Écoute' }] },
          { text: 'Les temps continuent pendant le silence : compte bien 1, 2, 3, 4.', rhythm: '1 1 -1 1 | 2 -1 1', play: [{ rhythm: '1 1 -1 1 2 -1 1', label: 'Écoute' }] }
        ]
      }
    ],
    exercises: [
      { id: 'e4-temps', title: 'Combien de temps ?', say: 'Combien de temps dure ce signe ?', where: 'ecran', act: { kind: 'beats' }, goal: quiz(10, 8) },
      { id: 'e4-noires', title: 'Tape les noires', say: 'Écoute, puis tape sur le tambour avec le tic-tac.', where: 'ecran', act: { kind: 'rhythm', level: 1, input: 'tap' }, goal: quiz(4, 3) },
      { id: 'e4-blanches', title: 'Noires et blanches', say: 'Écoute le rythme, puis tape-le.', where: 'ecran', act: { kind: 'rhythm', level: 2, input: 'tap' }, goal: quiz(5, 3) },
      { id: 'e4-silences', title: 'Rondes et silences', say: 'Écoute le rythme, puis tape-le. Attention aux silences !', where: 'ecran', act: { kind: 'rhythm', level: 3, input: 'tap' }, goal: quiz(5, 3) },
      { id: 'e4-oreille', title: 'Quel rythme ?', say: 'Écoute. Quel rythme as-tu entendu ?', where: 'ecran', act: { kind: 'rhythmear', level: 3 }, goal: quiz(8, 6) },
      { id: 'e4-piano', title: 'Au piano : le rythme', say: 'Joue le rythme sur un do.', where: 'piano', act: { kind: 'rhythm', level: 3, input: 'piano' }, goal: quiz(5, 3) }
    ]
  },
  // ------------------------------------------------------------------ 5
  {
    id: 5,
    title: 'La portée',
    icon: '🎼',
    sticker: '🐬',
    color: '#2ec4f1',
    lessons: [
      {
        id: 'l5-portee',
        title: 'La portée',
        slides: [
          { text: 'Les notes s’écrivent sur 5 lignes : la portée.', staff: { clef: 'sol', notes: [] } },
          { text: 'Au début, la clé de sol. Elle dit : « Ici, on joue avec la main droite ».', staff: { clef: 'sol', notes: [] } },
          { text: 'Une note est sur une ligne… ou entre deux lignes. Plus elle est haut, plus elle est aiguë.', staff: { clef: 'sol', notes: [64, 65, 67, 69, 71] }, play: [{ notes: [64, 65, 67, 69, 71], gap: 0.5, label: 'Écoute' }] }
        ]
      },
      {
        id: 'l5-doremi',
        title: 'Do, ré, mi sur la portée',
        slides: [
          { text: 'Le do du milieu est sous la portée, sur une petite ligne rien que pour lui.', staff: { clef: 'sol', notes: [60], names: true }, play: [{ notes: [60], label: 'Écoute' }] },
          { text: 'Le ré est juste sous la portée, accroché à la première ligne.', staff: { clef: 'sol', notes: [60, 62], names: true }, play: [{ notes: [60, 62], label: 'Écoute' }] },
          { text: 'Le mi est sur la première ligne, en bas.', staff: { clef: 'sol', notes: [60, 62, 64], names: true }, play: [{ notes: [60, 62, 64], label: 'Écoute' }] }
        ]
      },
      {
        id: 'l5-fasol',
        title: 'Fa et sol',
        slides: [
          { text: 'Le fa est entre la 1ʳᵉ et la 2ᵉ ligne.', staff: { clef: 'sol', notes: [60, 62, 64, 65], names: true } },
          { text: 'Le sol est sur la 2ᵉ ligne, là où tourne la clé de sol.', staff: { clef: 'sol', notes: [60, 62, 64, 65, 67], names: true }, play: [{ notes: C_POS, gap: 0.5, label: 'Écoute' }] },
          { text: 'Une note après l’autre : ligne, interligne, ligne… comme un escalier.', staff: { clef: 'sol', notes: [60, 62, 64, 65, 67, 69, 71, 72], names: true }, play: [{ notes: [...W4, 72], gap: 0.4, label: 'Écoute' }] }
        ]
      }
    ],
    exercises: [
      { id: 'e5-dremi', title: 'Lire do, ré, mi', say: 'Quelle est cette note ?', where: 'ecran', act: { kind: 'read', clef: 'sol', pool: [60, 62, 64], answer: 'name' }, goal: quiz(10, 8) },
      { id: 'e5-5', title: 'Lire de do à sol', say: 'Quelle est cette note ?', where: 'ecran', act: { kind: 'read', clef: 'sol', pool: C_POS, answer: 'name' }, goal: quiz(10, 8) },
      { id: 'e5-touche', title: 'Lis et touche', say: 'Lis la note, puis touche-la sur le clavier.', where: 'ecran', act: { kind: 'read', clef: 'sol', pool: C_POS, answer: 'key' }, goal: quiz(10, 8) },
      { id: 'e5-monte', title: 'Ça monte ou ça descend ?', say: 'Écoute les 3 notes. Ça monte, ça descend ou ça reste ?', where: 'ecran', act: { kind: 'contour' }, goal: quiz(10, 8) },
      {
        id: 'e5-piano',
        title: 'Au piano : lis et joue',
        say: 'Lis la note et joue-la.',
        where: 'piano',
        act: { kind: 'play', targets: C_POS.map((m, i) => ({ say: 'Joue cette note', pcs: [NATURAL_PC[i]], show: { staff: { clef: 'sol', note: m } } })) },
        goal: quiz(10, 8)
      }
    ]
  },
  // ------------------------------------------------------------------ 6
  {
    id: 6,
    title: 'Mes premières chansons',
    icon: '🎵',
    sticker: '🦄',
    color: '#5b6cff',
    lessons: [
      {
        id: 'l6-jouer',
        title: 'Jouer une chanson',
        slides: [
          { text: 'Pose ta main en position de do : pouce sur le do du milieu.', kb: { ...KB, names: C_POS, colors: true, fingers: { 60: 1, 62: 2, 64: 3, 65: 4, 67: 5 } } },
          { text: 'La touche qui brille, c’est la note à jouer. Le chiffre, c’est le doigt.', kb: { ...KB, marks: [64], fingers: { 64: 3 } } },
          { text: 'L’appli attend que tu joues la bonne note. Prends ton temps !', big: '🐌' },
          { text: 'Écoute d’abord la chanson, pour l’avoir dans la tête.', play: [{ song: 'lune', label: 'Écoute Au clair de la lune' }] }
        ]
      }
    ],
    exercises: [
      { id: 'e6-quelle', title: 'Quelle chanson ?', say: 'Écoute. Quelle chanson est-ce ?', where: 'ecran', act: { kind: 'whichsong', songs: ['lune', 'agneau', 'joie', 'grelots'] }, goal: quiz(6, 5) },
      { id: 'e6-lune', title: 'Au clair de la lune', say: 'Joue la note qui brille.', where: 'piano', act: { kind: 'song', id: 'lune', help: 'keys' } },
      { id: 'e6-agneau', title: 'Marie avait un agneau', say: 'Joue la note qui brille.', where: 'piano', act: { kind: 'song', id: 'agneau', help: 'keys' } },
      { id: 'e6-joie', title: 'Ode à la joie', say: 'Joue la note qui brille.', where: 'piano', act: { kind: 'song', id: 'joie', help: 'keys' } },
      { id: 'e6-grelots', title: 'Vive le vent', say: 'Joue la note qui brille.', where: 'piano', act: { kind: 'song', id: 'grelots', help: 'keys' } },
      { id: 'e6-lune-lire', title: 'Au clair de la lune, en lisant', say: 'Cette fois, lis les notes sur la portée.', where: 'piano', act: { kind: 'song', id: 'lune', help: 'staff' } }
    ]
  },
  // ------------------------------------------------------------------ 7
  {
    id: 7,
    title: 'La main gauche',
    icon: '🐻',
    sticker: '🐝',
    color: '#b25cff',
    lessons: [
      {
        id: 'l7-gauche',
        title: 'La position de la main gauche',
        slides: [
          { text: 'La main gauche joue plus bas, à gauche du do du milieu.', kb: { ...KB, marks: [48], names: [48, 60] } },
          {
            text: 'Petit doigt (5) sur ce do. Puis 4 sur ré, 3 sur mi, 2 sur fa, et le pouce sur sol.',
            kb: { ...KB, names: C_POS_LEFT, colors: true, fingers: { 48: 5, 50: 4, 52: 3, 53: 2, 55: 1 } },
            play: [{ notes: C_POS_LEFT, gap: 0.5, label: 'Écoute' }]
          }
        ]
      },
      {
        id: 'l7-cle-fa',
        title: 'La clé de fa',
        slides: [
          { text: 'Pour les notes graves, on écrit avec la clé de fa.', staff: { clef: 'fa', notes: [] } },
          { text: 'Ses 2 points entourent la ligne du fa.', staff: { clef: 'fa', notes: [53], names: true }, play: [{ notes: [53], label: 'Écoute' }] },
          { text: 'Do, ré, mi, fa, sol de la main gauche : un escalier, comme en clé de sol.', staff: { clef: 'fa', notes: C_POS_LEFT, names: true }, play: [{ notes: C_POS_LEFT, gap: 0.5, label: 'Écoute' }] }
        ]
      }
    ],
    exercises: [
      { id: 'e7-doigts', title: 'Main gauche : quelle note ?', say: 'Ta main gauche est en position de do. Quelle note joue ce doigt ?', where: 'ecran', act: { kind: 'finger', hand: 'g', mode: 'note' }, goal: quiz(10, 8) },
      { id: 'e7-lire', title: 'Lire en clé de fa', say: 'Quelle est cette note ?', where: 'ecran', act: { kind: 'read', clef: 'fa', pool: C_POS_LEFT, answer: 'name' }, goal: quiz(10, 8) },
      { id: 'e7-monte', title: 'Au piano : main gauche', say: 'Avec la main gauche : do, ré, mi, fa, sol, et on redescend.', where: 'piano', act: { kind: 'sequence', tune: 'do ré mi fa sol2 fa mi ré do4', octave: 3, hand: 'g', clef: 'fa' } },
      {
        id: 'e7-piano',
        title: 'Au piano : lis et joue',
        say: 'Lis la note et joue-la avec la main gauche.',
        where: 'piano',
        act: { kind: 'play', targets: C_POS_LEFT.map((m, i) => ({ say: 'Joue cette note', pcs: [NATURAL_PC[i]], below: 60, show: { staff: { clef: 'fa', note: m } } })) },
        goal: quiz(10, 8)
      }
    ]
  },
  // ------------------------------------------------------------------ 8
  {
    id: 8,
    title: 'Plus de notes, plus de chansons',
    icon: '⭐',
    sticker: '🐼',
    color: '#ff5a5f',
    lessons: [
      {
        id: 'l8-croche',
        title: 'La croche',
        slides: [
          { text: 'La croche dure un demi-temps. Deux croches = 1 temps : « ti-ti ».', rhythm: '.5 .5 .5 .5 1 1', play: [{ rhythm: '.5 .5 .5 .5 1 1', label: 'Écoute' }] },
          { text: 'Ta, ta, ti-ti, ta…', rhythm: '1 1 .5 .5 1', play: [{ rhythm: '1 1 .5 .5 1', label: 'Écoute' }] }
        ]
      },
      {
        id: 'l8-notes',
        title: 'La, si, do… et en dessous',
        slides: [
          { text: 'Après sol : la (dans l’interligne), si (sur la ligne du milieu), puis le do d’en haut.', staff: { clef: 'sol', notes: [67, 69, 71, 72], names: true }, play: [{ notes: [67, 69, 71, 72], gap: 0.5, label: 'Écoute' }] },
          { text: 'Sous le do du milieu : si, la, sol. Ta main se déplace un peu.', staff: { clef: 'sol', notes: [60, 59, 57, 55], names: true }, play: [{ notes: [60, 59, 57, 55], gap: 0.5, label: 'Écoute' }] }
        ]
      }
    ],
    exercises: [
      { id: 'e8-lire', title: 'Lire jusqu’au do d’en haut', say: 'Quelle est cette note ?', where: 'ecran', act: { kind: 'read', clef: 'sol', pool: [...W4, 72], answer: 'name' }, goal: quiz(10, 8) },
      { id: 'e8-croches', title: 'Tape les croches', say: 'Écoute le rythme, puis tape-le.', where: 'ecran', act: { kind: 'rhythm', level: 4, input: 'tap' }, goal: quiz(5, 3) },
      { id: 'e8-etoile', title: 'Ah ! vous dirai-je, maman', say: 'Joue la note qui brille.', where: 'piano', act: { kind: 'song', id: 'etoile', help: 'keys' } },
      { id: 'e8-jacques', title: 'Frère Jacques', say: 'Joue la note qui brille.', where: 'piano', act: { kind: 'song', id: 'jacques', help: 'keys' } },
      { id: 'e8-anniv', title: 'Joyeux anniversaire', say: 'Joue la note qui brille.', where: 'piano', act: { kind: 'song', id: 'anniv', help: 'keys' } },
      { id: 'e8-lune', title: 'Au clair de la lune, en entier', say: 'Lis les notes sur la portée.', where: 'piano', act: { kind: 'song', id: 'lune-complete', help: 'staff' } }
    ]
  },
  // ------------------------------------------------------------------ 9
  {
    id: 9,
    title: 'Les deux mains',
    icon: '🙌',
    sticker: '🦁',
    color: '#3ccf6e',
    lessons: [
      {
        id: 'l9-2mains',
        title: 'Une main, puis l’autre',
        slides: [
          { text: 'Main droite en position de do, main gauche en position de do. Les deux pouces sont proches.', kb: { ...KB, names: [...C_POS_LEFT, ...C_POS], colors: true, fingers: { 48: 5, 50: 4, 52: 3, 53: 2, 55: 1, 60: 1, 62: 2, 64: 3, 65: 4, 67: 5 } } },
          { text: 'Deux portées : en haut la main droite (clé de sol), en bas la main gauche (clé de fa).', staff: { clef: 'grand', notes: [48, 60] } },
          { text: 'Pour apprendre : chaque main seule d’abord, puis ensemble, lentement.', big: '🐢' }
        ]
      },
      {
        id: 'l9-ensemble',
        title: 'Ensemble',
        slides: [
          { text: 'La main gauche tient une note longue pendant que la droite chante.', play: [{ song: 'lune-2m', label: 'Écoute' }] },
          { text: 'L’appli écoute surtout la main droite. Joue la main gauche au début de chaque mesure.', big: '👂' }
        ]
      }
    ],
    exercises: [
      { id: 'e9-lire', title: 'Lire les deux clés', say: 'Quelle est cette note ?', where: 'ecran', act: { kind: 'read', clef: 'mix', pool: [...C_POS_LEFT, ...C_POS], answer: 'name' }, goal: quiz(10, 8) },
      { id: 'e9-question', title: 'Au piano : question-réponse', say: 'La main droite pose la question, la main gauche répond.', where: 'piano', act: { kind: 'sequence', tune: 'do ré mi2 | do, ré, mi,2 | mi ré do2 | mi, ré, do,2', hand: 'd' } },
      { id: 'e9-lune', title: 'Au clair de la lune, 2 mains', say: 'Main gauche au début de chaque mesure.', where: 'piano', act: { kind: 'song', id: 'lune-2m', help: 'keys' } },
      { id: 'e9-joie', title: 'Ode à la joie, 2 mains', say: 'Main gauche au début de chaque mesure.', where: 'piano', act: { kind: 'song', id: 'joie-2m', help: 'keys' } }
    ]
  },
  // ------------------------------------------------------------------ 10
  {
    id: 10,
    title: 'Dièses et accords',
    icon: '🌈',
    sticker: '🐉',
    color: '#ff9f1c',
    lessons: [
      {
        id: 'l10-noires',
        title: 'Le nom des touches noires',
        slides: [
          { text: 'Dièse (♯) : la touche juste à droite. Do dièse est juste à droite de do.', kb: { ...KB, marks: [60, 61], names: [60] }, play: [{ notes: [60, 61], label: 'Écoute' }] },
          { text: 'Bémol (♭) : la touche juste à gauche. Mi bémol est juste à gauche de mi.', kb: { ...KB, marks: [64, 63], names: [64] }, play: [{ notes: [64, 63], label: 'Écoute' }] },
          { text: 'Une touche noire a donc deux noms : do dièse = ré bémol.', kb: { ...KB, marks: [61], names: [60, 62] } }
        ]
      },
      {
        id: 'l10-humeur',
        title: 'Joyeux ou triste ?',
        slides: [
          { text: 'Trois notes ensemble font un accord. Celui-ci est joyeux : on dit majeur.', big: '😀', play: [{ mood: 'joyeux', label: 'Écoute' }] },
          { text: 'Celui-ci est plus triste : on dit mineur.', big: '😢', play: [{ mood: 'triste', label: 'Écoute' }] }
        ]
      },
      {
        id: 'l10-accords',
        title: 'Do, Fa et Sol',
        slides: [
          { text: 'L’accord de Do : do, mi, sol. Une touche sur deux, doigts 1, 3, 5.', kb: { ...KB, marks: [60, 64, 67], names: [60, 64, 67], fingers: { 60: 1, 64: 3, 67: 5 } }, play: [{ chord: [60, 64, 67], label: 'Écoute' }] },
          { text: 'L’accord de Fa : fa, la, do.', kb: { ...KB, marks: [65, 69, 72], names: [65, 69, 72], fingers: { 65: 1, 69: 3, 72: 5 } }, play: [{ chord: [65, 69, 72], label: 'Écoute' }] },
          { text: 'L’accord de Sol : sol, si, ré.', kb: { ...KB, marks: [67, 71, 74], names: [67, 71, 74], fingers: { 67: 1, 71: 3, 74: 5 } }, play: [{ chord: [67, 71, 74], label: 'Écoute' }] },
          { text: 'Avec ces 3 accords, on peut accompagner beaucoup de chansons !', play: [{ chord: [60, 64, 67], label: 'Do' }, { chord: [65, 69, 72], label: 'Fa' }, { chord: [67, 71, 74], label: 'Sol' }] }
        ]
      }
    ],
    exercises: [
      { id: 'e10-noires', title: 'Dièses et bémols', say: 'Touche la note demandée.', where: 'ecran', act: { kind: 'find', pool: [61, 63, 66, 68, 70] }, goal: quiz(10, 8) },
      { id: 'e10-bemols', title: 'Bémols', say: 'Touche la note demandée.', where: 'ecran', act: { kind: 'find', pool: [61, 63, 66, 68, 70], flat: true }, goal: quiz(10, 8) },
      { id: 'e10-humeur', title: 'Joyeux ou triste ?', say: 'Écoute l’accord. Joyeux ou triste ?', where: 'ecran', act: { kind: 'mood' }, goal: quiz(10, 8) },
      { id: 'e10-accords', title: 'Au piano : Do, Fa, Sol', say: 'Joue l’accord demandé, les 3 notes ensemble.', where: 'piano', act: { kind: 'chords', chords: ['Do', 'Fa', 'Sol'] }, goal: quiz(8, 6) },
      { id: 'e10-suite', title: 'Au piano : accompagner', say: 'Joue les accords l’un après l’autre.', where: 'piano', act: { kind: 'chords', chords: ['Do', 'Do', 'Fa', 'Do', 'Sol', 'Do'], fixed: true } }
    ]
  }
];

export const CHORDS: Record<string, number[]> = {
  Do: [midiOf('do'), midiOf('mi'), midiOf('sol')],
  Fa: [midiOf('fa'), midiOf('la'), midiOf('do', 5)],
  Sol: [midiOf('sol'), midiOf('si'), midiOf('ré', 5)]
};

export const ALL_EXERCISES: (Exercise & { step: number })[] = STEPS.flatMap((s) => s.exercises.map((e) => ({ ...e, step: s.id })));
export const exerciseById = (id: string) => ALL_EXERCISES.find((e) => e.id === id);
export const lessonById = (id: string) => {
  for (const s of STEPS) for (const l of s.lessons) if (l.id === id) return { ...l, step: s.id };
  return undefined;
};
