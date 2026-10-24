// Étapes 11 à 18 : nuances, valse, position de sol, accompagner, contretemps, improviser, la mineur, lire seul.
import type { Step } from './types';

const KB = { from: 48, to: 76 };
const C_POS = [60, 62, 64, 65, 67];
const G_POS = [67, 69, 71, 72, 74];
const A_POS = [69, 71, 72, 74, 76];
const quiz = (n: number, need: number) => ({ n, need });

export const STEPS_2: Step[] = [
  // ------------------------------------------------------------------ 11
  {
    id: 11,
    title: 'Doux ou fort',
    icon: '🔊',
    sticker: '🐨',
    color: '#ffd23f',
    lessons: [
      {
        id: 'l11-nuances',
        title: 'Piano, forte',
        slides: [
          { text: 'Piano veut dire doux. On l’écrit p. Appuie doucement, comme sur une plume.', big: '🐭', play: [{ notes: [60, 64, 67, 72], gap: 0.5, vel: 0.12, label: 'Écoute doux' }] },
          { text: 'Forte veut dire fort. On l’écrit f. Appuie franchement, sans taper.', big: '🦁', play: [{ notes: [60, 64, 67, 72], gap: 0.5, vel: 0.95, label: 'Écoute fort' }] },
          {
            text: 'On peut aussi grandir peu à peu, du tout doux au très fort.',
            big: '🎈',
            play: [{ notes: [60, 62, 64, 65, 67, 69, 71, 72], gap: 0.4, vel: [0.1, 0.18, 0.28, 0.4, 0.52, 0.65, 0.8, 0.95], label: 'Écoute grandir' }]
          }
        ]
      },
      {
        id: 'l11-touche',
        title: 'Lié ou détaché',
        slides: [
          { text: 'Lié : les notes se tiennent la main. Un doigt se lève quand le suivant appuie.', big: '〰️', play: [{ notes: C_POS, gap: 0.45, len: 1.05, label: 'Écoute lié' }] },
          { text: 'Détaché : les notes sautent comme une balle. Lève vite le doigt.', big: '⚽', play: [{ notes: C_POS, gap: 0.45, len: 0.22, label: 'Écoute détaché' }] },
          { text: 'Doux ou fort, lié ou détaché : avec les mêmes notes, tu racontes une autre histoire.', big: '📖' }
        ]
      }
    ],
    exercises: [
      { id: 'e11-nuance', title: 'Doux ou fort ?', say: 'Écoute. C’est joué doux ou fort ?', where: 'ecran', act: { kind: 'contrast', what: 'nuance' }, goal: quiz(10, 8) },
      { id: 'e11-touche', title: 'Lié ou détaché ?', say: 'Écoute. Les notes sont liées ou détachées ?', where: 'ecran', act: { kind: 'contrast', what: 'touch' }, goal: quiz(10, 8) },
      {
        id: 'e11-p-nuances',
        title: 'Au piano : doux, fort',
        say: 'Joue la note demandée, doux ou fort.',
        where: 'piano',
        act: {
          kind: 'play',
          targets: [
            { say: 'Un do tout doux 🐭', pcs: [0] },
            { say: 'Un sol bien fort 🦁', pcs: [7] },
            { say: 'Un mi tout doux 🐭', pcs: [4] },
            { say: 'Un ré bien fort 🦁', pcs: [2] }
          ]
        },
        goal: quiz(8, 6)
      },
      { id: 'e11-joie', title: 'Ode à la joie, doux puis fort', say: 'La 1ʳᵉ phrase douce, la 2ᵉ forte.', where: 'piano', act: { kind: 'song', id: 'joie-nuances', help: 'keys' } }
    ],
    more: [
      { id: 'm11-nuance', title: 'Défi : oreille fine', say: 'Doux ou fort ? 12 sur 12 !', where: 'ecran', act: { kind: 'contrast', what: 'nuance' }, goal: quiz(12, 12), bonus: '🔔' },
      { id: 'm11-joie', title: 'Défi : l’Ode de mémoire', say: 'Sans les notes : joue l’Ode à la joie de mémoire.', where: 'piano', act: { kind: 'song', id: 'joie', help: 'none' }, bonus: '🧠' }
    ]
  },
  // ------------------------------------------------------------------ 12
  {
    id: 12,
    title: 'La valse : 3 temps',
    icon: '💃',
    sticker: '🦩',
    color: '#3ccf6e',
    lessons: [
      {
        id: 'l12-trois',
        title: 'Compter jusqu’à 3',
        slides: [
          { text: 'Une valse se compte 1, 2, 3 – 1, 2, 3. Le 1 est un peu plus fort.', rhythm: '1 1 1 | 1 1 1', meter: 3, play: [{ rhythm: '1 1 1 1 1 1', meter: 3, label: 'Écoute' }] },
          { text: 'Une marche se compte jusqu’à 4 : 1, 2, 3, 4.', rhythm: '1 1 1 1 | 1 1 1 1', play: [{ rhythm: '1 1 1 1 1 1 1 1', label: 'Écoute' }] },
          { text: 'Joyeux anniversaire est une valse ! Compte 1, 2, 3 en l’écoutant.', big: '🎂', play: [{ song: 'anniv', label: 'Écoute' }] }
        ]
      },
      {
        id: 'l12-pointee',
        title: 'La blanche pointée',
        slides: [
          { text: 'Le point ajoute la moitié. Blanche pointée = 2 + 1 = 3 temps : « ta-a-a ».', rhythm: '3 | 3', meter: 3, play: [{ rhythm: '3 3', meter: 3, label: 'Écoute' }] },
          { text: 'Elle remplit toute une mesure de valse.', rhythm: '1 1 1 | 2 1 | 3', meter: 3, play: [{ rhythm: '1 1 1 2 1 3', meter: 3, label: 'Écoute' }] },
          { text: 'Douce nuit est une valse lente, pleine de blanches pointées.', big: '🕯️', play: [{ song: 'nuit', label: 'Écoute Douce nuit' }] }
        ]
      }
    ],
    exercises: [
      { id: 'e12-temps', title: 'Combien de temps ?', say: 'Combien de temps dure ce signe ?', where: 'ecran', act: { kind: 'beats', dotted: true }, goal: quiz(10, 8) },
      { id: 'e12-valse', title: 'Valse ou marche ?', say: 'Écoute. On compte jusqu’à 3 (valse) ou jusqu’à 4 (marche) ?', where: 'ecran', act: { kind: 'contrast', what: 'meter' }, goal: quiz(8, 6) },
      { id: 'e12-taper', title: 'Tape la valse', say: 'Écoute le rythme, puis tape-le. 1, 2, 3 !', where: 'ecran', act: { kind: 'rhythm', level: 5, input: 'tap' }, goal: quiz(5, 3) },
      { id: 'e12-piano', title: 'Au piano : la valse', say: 'Joue le rythme sur un do.', where: 'piano', act: { kind: 'rhythm', level: 5, input: 'piano' }, goal: quiz(5, 3) },
      { id: 'e12-nuit', title: 'Douce nuit', say: 'Joue la note qui brille.', where: 'piano', act: { kind: 'song', id: 'nuit', help: 'keys' } }
    ],
    more: [
      { id: 'm12-nuit', title: 'Douce nuit, en lisant', say: 'Cette fois, lis les notes sur la portée.', where: 'piano', act: { kind: 'song', id: 'nuit', help: 'staff' }, bonus: '⛄' },
      { id: 'm12-vite', title: 'Défi : valse rapide', say: 'Le même jeu, plus vite !', where: 'ecran', act: { kind: 'rhythm', level: 5, input: 'tap', bpm: 100 }, goal: quiz(5, 4), bonus: '🎠' }
    ]
  },
  // ------------------------------------------------------------------ 13
  {
    id: 13,
    title: 'Une nouvelle maison : sol',
    icon: '🏡',
    sticker: '🦒',
    color: '#2ec4f1',
    lessons: [
      {
        id: 'l13-position',
        title: 'La position de sol',
        slides: [
          {
            text: 'Déménage ta main droite : pouce sur le sol. Chaque doigt a sa touche : sol, la, si, do, ré.',
            kb: { from: 55, to: 79, names: G_POS, colors: true, fingers: { 67: 1, 69: 2, 71: 3, 72: 4, 74: 5 } },
            play: [{ notes: G_POS, gap: 0.5, label: 'Écoute' }]
          },
          { text: 'Sur la portée : sol est sur la 2ᵉ ligne, puis on monte comme un escalier.', staff: { clef: 'sol', notes: G_POS, names: true }, play: [{ notes: G_POS, gap: 0.5, label: 'Écoute' }] }
        ]
      },
      {
        id: 'l13-fadiese',
        title: 'Le fa dièse',
        slides: [
          {
            text: 'Dans la maison de sol, le fa change : on joue la touche noire juste à droite. C’est fa dièse.',
            kb: { from: 55, to: 79, marks: [65, 66], names: [65, 67] },
            play: [{ notes: [65, 66], gap: 0.7, label: 'Écoute fa, puis fa dièse' }]
          },
          { text: 'Sur la portée, le dièse ♯ s’écrit juste avant la note.', staff: { clef: 'sol', notes: [66], names: true }, play: [{ notes: [66], label: 'Écoute' }] },
          {
            text: 'La gamme de sol : sol, la, si, do, ré, mi, fa dièse, sol. Écoute, elle sonne juste !',
            staff: { clef: 'sol', notes: [67, 69, 71, 72, 74, 76, 78, 79], names: true },
            play: [{ notes: [67, 69, 71, 72, 74, 76, 78, 79], gap: 0.4, label: 'Écoute' }]
          },
          { text: 'Joyeux anniversaire en sol : écoute bien le fa dièse.', big: '🎂', play: [{ song: 'anniv-sol', label: 'Écoute' }] }
        ]
      }
    ],
    exercises: [
      { id: 'e13-find', title: 'Trouve la note', say: 'Touche la note demandée.', where: 'ecran', act: { kind: 'find', pool: [...G_POS, 66] }, goal: quiz(10, 8) },
      { id: 'e13-lire', title: 'Lire de fa dièse à ré', say: 'Quelle est cette note ?', where: 'ecran', act: { kind: 'read', clef: 'sol', pool: [66, ...G_POS], answer: 'name' }, goal: quiz(10, 8) },
      {
        id: 'e13-monte',
        title: 'Au piano : la maison de sol',
        say: 'Pouce sur le sol : monte jusqu’au ré, puis redescends.',
        where: 'piano',
        act: { kind: 'sequence', tune: "sol la si do' ré'2 do' si la sol4", hand: 'd', fingers: '1 2 3 4 5 4 3 2 1' }
      },
      { id: 'e13-anniv', title: 'Joyeux anniversaire en sol', say: 'Joue la note qui brille. Attention au fa dièse !', where: 'piano', act: { kind: 'song', id: 'anniv-sol', help: 'keys' } },
      { id: 'e13-lune', title: 'Au clair de la lune en sol', say: 'Joue la note qui brille. Attention au fa dièse !', where: 'piano', act: { kind: 'song', id: 'lune-sol', help: 'keys' } }
    ],
    more: [
      { id: 'm13-lire', title: 'Défi : lecteur de sol', say: 'Sans faute !', where: 'ecran', act: { kind: 'read', clef: 'sol', pool: [66, ...G_POS, 76, 78], answer: 'name' }, goal: quiz(10, 10), bonus: '🗝️' },
      { id: 'm13-lune', title: 'Au clair de la lune en sol, en lisant', say: 'Lis les notes sur la portée.', where: 'piano', act: { kind: 'song', id: 'lune-sol', help: 'staff' }, bonus: '🏰' }
    ]
  },
  // ------------------------------------------------------------------ 14
  {
    id: 14,
    title: 'Accompagner une chanson',
    icon: '🎶',
    sticker: '🐙',
    color: '#5b6cff',
    lessons: [
      {
        id: 'l14-gauche',
        title: 'Les accords à la main gauche',
        slides: [
          {
            text: 'Main gauche, l’accord de Do : do, mi, sol. Doigts 5, 3, 1.',
            kb: { ...KB, marks: [48, 52, 55], names: [48, 52, 55], fingers: { 48: 5, 52: 3, 55: 1 } },
            play: [{ chord: [48, 52, 55], label: 'Écoute Do' }]
          },
          {
            text: 'Fa : do, fa, la. Le do reste, les deux autres montent.',
            kb: { ...KB, marks: [48, 53, 57], names: [48, 53, 57], fingers: { 48: 5, 53: 2, 57: 1 } },
            play: [{ chord: [48, 53, 57], label: 'Écoute Fa' }]
          },
          {
            text: 'Sol : si, ré, sol. Le sol reste, les deux autres descendent d’une touche.',
            kb: { from: 47, to: 76, marks: [47, 50, 55], names: [47, 50, 55], fingers: { 47: 5, 50: 3, 55: 1 } },
            play: [{ chord: [47, 50, 55], label: 'Écoute Sol' }]
          },
          { text: 'Ta main bouge à peine : c’est le secret des pianistes.', play: [{ chords: [[48, 52, 55], [48, 53, 57], [48, 52, 55], [47, 50, 55], [48, 52, 55]], label: 'Do, Fa, Do, Sol, Do' }] }
        ]
      },
      {
        id: 'l14-ensemble',
        title: 'Mélodie et accords',
        slides: [
          { text: 'La main droite chante la mélodie. La main gauche joue l’accord au début de la mesure, et le tient.', big: '🎶', play: [{ song: 'lune-acc', label: 'Écoute' }] },
          {
            text: 'Do, c’est la maison : une chanson finit presque toujours sur Do. Sol, c’est « pas encore fini ».',
            big: '🏠',
            play: [
              { chords: [[48, 52, 55], [48, 53, 57], [47, 50, 55]], label: 'Pas fini…' },
              { chords: [[48, 52, 55], [48, 53, 57], [47, 50, 55], [48, 52, 55]], label: 'Fini !' }
            ]
          },
          { text: 'L’appli écoute la main droite. Joue l’accord de la main gauche en même temps que la première note de la mesure.', big: '👂' }
        ]
      }
    ],
    exercises: [
      { id: 'e14-fini', title: 'Fini ou pas fini ?', say: 'Écoute les accords. La musique est finie (retour à la maison), ou pas encore ?', where: 'ecran', act: { kind: 'contrast', what: 'cadence' }, goal: quiz(10, 8) },
      { id: 'e14-accords', title: 'Au piano : Do, Fa, Sol à gauche', say: 'Main gauche : joue l’accord demandé, les 3 notes ensemble.', where: 'piano', act: { kind: 'chords', chords: ['Do-g', 'Fa-g', 'Sol-g'] }, goal: quiz(8, 6) },
      {
        id: 'e14-suite',
        title: 'Au piano : enchaîner',
        say: 'Main gauche : les accords l’un après l’autre, en bougeant le moins possible.',
        where: 'piano',
        act: { kind: 'chords', chords: ['Do-g', 'Fa-g', 'Do-g', 'Sol-g', 'Do-g'], fixed: true }
      },
      { id: 'e14-lune', title: 'Au clair de la lune, accompagné', say: 'Main droite la mélodie, main gauche l’accord au début de la mesure.', where: 'piano', act: { kind: 'song', id: 'lune-acc', help: 'keys' } },
      { id: 'e14-grelots', title: 'Vive le vent, accompagné', say: 'Main droite la mélodie, main gauche l’accord au début de la mesure.', where: 'piano', act: { kind: 'song', id: 'grelots-acc', help: 'keys' } }
    ],
    more: [
      { id: 'm14-joie', title: 'Ode à la joie, accompagnée', say: 'Main droite la mélodie, main gauche Do ou Sol.', where: 'piano', act: { kind: 'song', id: 'joie-acc', help: 'keys' }, bonus: '🎹' },
      { id: 'm14-fini', title: 'Défi : fini ou pas fini ?', say: '12 sur 12 !', where: 'ecran', act: { kind: 'contrast', what: 'cadence' }, goal: quiz(12, 12), bonus: '🏁' }
    ]
  },
  // ------------------------------------------------------------------ 15
  {
    id: 15,
    title: 'Le rythme qui bouge',
    icon: '⚡',
    sticker: '🐸',
    color: '#b25cff',
    lessons: [
      {
        id: 'l15-pointee',
        title: 'La noire pointée',
        slides: [
          { text: 'Le point ajoute la moitié : noire pointée = 1 temps et demi.', rhythm: '1.5 .5 1 1', play: [{ rhythm: '1.5 .5 1 1', label: 'Écoute' }] },
          { text: 'Avec une croche, ça fait 2 temps : « taaa-ti ». Tu l’as déjà joué dans l’Ode à la joie !', rhythm: '1 1 1.5 .5 | 2 2', play: [{ rhythm: '1 1 1.5 .5 2 2', label: 'Écoute' }] }
        ]
      },
      {
        id: 'l15-contretemps',
        title: 'Entre les temps',
        slides: [
          { text: 'Une note peut tomber entre deux temps : « ti-ta-ti ». C’est le contretemps.', rhythm: '.5 1 .5 2', play: [{ rhythm: '.5 1 .5 2', label: 'Écoute' }] },
          {
            text: 'La musique électro et pop adore ça : ça donne envie de danser !',
            rhythm: '.5 1 .5 1 1 | 1.5 .5 2',
            play: [{ rhythm: '.5 1 .5 1 1 1.5 .5 2', groove: true, bpm: 96, label: 'Écoute avec la batterie' }]
          }
        ]
      }
    ],
    exercises: [
      { id: 'e15-oreille', title: 'Quel rythme ?', say: 'Écoute. Quel rythme as-tu entendu ?', where: 'ecran', act: { kind: 'rhythmear', level: 6 }, goal: quiz(8, 6) },
      { id: 'e15-taper', title: 'Tape le contretemps', say: 'Écoute le rythme, puis tape-le.', where: 'ecran', act: { kind: 'rhythm', level: 6, input: 'tap' }, goal: quiz(5, 3) },
      { id: 'e15-electro', title: 'Rythme électro', say: 'La batterie joue. Tape le rythme par-dessus !', where: 'ecran', act: { kind: 'rhythm', level: 6, input: 'tap', groove: true, bpm: 88 }, goal: quiz(5, 3) },
      { id: 'e15-piano', title: 'Au piano : le contretemps', say: 'Joue le rythme sur un do.', where: 'piano', act: { kind: 'rhythm', level: 6, input: 'piano' }, goal: quiz(5, 3) }
    ],
    more: [
      { id: 'm15-electro', title: 'Défi : électro rapide', say: 'Plus vite, avec la batterie !', where: 'ecran', act: { kind: 'rhythm', level: 6, input: 'tap', groove: true, bpm: 108 }, goal: quiz(5, 4), bonus: '🕺' },
      { id: 'm15-piano', title: 'Défi : électro au piano', say: 'La batterie joue, tu joues le rythme sur un do.', where: 'piano', act: { kind: 'rhythm', level: 6, input: 'piano', groove: true, bpm: 88 }, goal: quiz(5, 3), bonus: '🪩' }
    ]
  },
  // ------------------------------------------------------------------ 16
  {
    id: 16,
    title: 'Inventer ma musique',
    icon: '🎨',
    sticker: '🐕',
    color: '#ff5a5f',
    lessons: [
      {
        id: 'l16-noires',
        title: 'Les 5 touches noires',
        slides: [
          { text: 'Les touches noires : un groupe de 2 et un groupe de 3. Ça fait 5 notes.', kb: { ...KB, groups: 'both' } },
          { text: 'Sur les touches noires, tout sonne bien ensemble. Impossible de se tromper !', kb: { ...KB, groups: 'both' }, play: [{ notes: [61, 63, 66, 70, 68, 66, 63, 66], gap: 0.3, label: 'Écoute' }] },
          { text: 'Improviser, c’est inventer sa musique en direct. Il n’y a pas de fausse note, seulement des idées.', big: '💡' }
        ]
      },
      {
        id: 'l16-dialogue',
        title: 'Question, réponse',
        slides: [
          { text: 'Croche joue une petite question. Tu réponds avec tes notes à toi.', big: '💬', play: [{ notes: [66, 68, 70, 73], gap: 0.35, label: 'Une question' }] },
          { text: 'Une bonne réponse n’est pas trop longue, et finit sur une note qui se repose : une note longue.', big: '🛋️', play: [{ notes: [73, 70, 68, 66], gap: 0.35, label: 'Une réponse' }] },
          { text: 'Tu peux aussi répéter exactement ce que joue Croche : c’est l’écho. Ça muscle l’oreille !', big: '🦜' }
        ]
      }
    ],
    exercises: [
      { id: 'e16-echo-ecran', title: 'L’écho sur l’écran', say: 'Écoute Croche, puis touche les mêmes notes.', where: 'ecran', act: { kind: 'echo', pool: [61, 63, 66, 68, 70], len: 3, input: 'tap' }, goal: quiz(8, 6) },
      { id: 'e16-echo', title: 'Au piano : l’écho', say: 'Écoute Croche, puis joue les mêmes notes sur les touches noires.', where: 'piano', act: { kind: 'echo', pool: [61, 63, 66, 68, 70], len: 3, input: 'piano' }, goal: quiz(6, 4) },
      { id: 'e16-reponse', title: 'Au piano : réponds à Croche', say: 'Croche pose une question. Réponds avec au moins 3 notes sur les touches noires.', where: 'piano', act: { kind: 'improv', mode: 'reponse' }, goal: quiz(5, 4) },
      { id: 'e16-libre', title: 'Au piano : ma musique', say: 'La batterie joue 20 secondes. Invente ta musique sur les touches noires !', where: 'piano', act: { kind: 'improv', mode: 'libre' }, goal: quiz(1, 1) }
    ],
    more: [
      { id: 'm16-echo4', title: 'Défi : écho de 4 notes', say: 'Écoute Croche : 4 notes cette fois !', where: 'ecran', act: { kind: 'echo', pool: [61, 63, 66, 68, 70, 73], len: 4, input: 'tap' }, goal: quiz(6, 5), bonus: '🧩' },
      { id: 'm16-echo-blanches', title: 'Défi : écho sur les blanches', say: 'Écoute Croche, puis touche les mêmes notes : do, ré, mi, fa, sol.', where: 'ecran', act: { kind: 'echo', pool: C_POS, len: 3, input: 'tap' }, goal: quiz(6, 5), bonus: '🦜' }
    ]
  },
  // ------------------------------------------------------------------ 17
  {
    id: 17,
    title: 'La mineur, la musique triste',
    icon: '🌧️',
    sticker: '🐺',
    color: '#ff9f1c',
    lessons: [
      {
        id: 'l17-accord',
        title: 'L’accord de la mineur',
        slides: [
          {
            text: 'La, do, mi : l’accord de la mineur. Une touche sur deux, doigts 1, 3, 5. Il sonne triste.',
            kb: { from: 60, to: 79, marks: [69, 72, 76], names: [69, 72, 76], fingers: { 69: 1, 72: 3, 76: 5 } },
            play: [{ chord: [69, 72, 76], label: 'Écoute' }]
          },
          { text: 'Compare avec Do, joyeux. Ils ont 2 notes en commun : do et mi !', play: [{ chord: [60, 64, 67], label: 'Do 😀' }, { chord: [57, 60, 64], label: 'la mineur 😢' }] }
        ]
      },
      {
        id: 'l17-position',
        title: 'La position de la',
        slides: [
          {
            text: 'Pouce droit sur le la : la, si, do, ré, mi. Que des touches blanches !',
            kb: { from: 57, to: 79, names: A_POS, colors: true, fingers: { 69: 1, 71: 2, 72: 3, 74: 4, 76: 5 } },
            play: [{ notes: A_POS, gap: 0.5, label: 'Écoute' }]
          },
          { text: 'Le thème de Tetris est en la mineur ! C’est un vieil air russe.', big: '🧱', play: [{ song: 'tetris', label: 'Écoute' }] },
          { text: 'Même Frère Jacques devient triste en la mineur.', big: '🌧️', play: [{ song: 'jacques-min', label: 'Écoute' }] }
        ]
      },
      {
        id: 'l17-pop',
        title: 'Les 4 accords de la pop',
        slides: [
          {
            text: 'Do, Sol, la mineur, Fa : ces 4 accords accompagnent des centaines de chansons modernes !',
            big: '🎤',
            play: [{ chords: [[60, 64, 67], [67, 71, 74], [69, 72, 76], [65, 69, 72]], label: 'Écoute' }]
          },
          {
            text: 'Main droite : Do (do, mi, sol), Sol (sol, si, ré), la mineur (la, do, mi), Fa (fa, la, do).',
            kb: { from: 60, to: 79, marks: [60, 64, 67, 71, 74], names: [60, 64, 67, 69, 72, 76] }
          }
        ]
      }
    ],
    exercises: [
      { id: 'e17-quel', title: 'Do ou la mineur ?', say: 'Écoute l’accord. C’est Do (joyeux) ou la mineur (triste) ?', where: 'ecran', act: { kind: 'whichchord', chords: ['Do', 'Lam'] }, goal: quiz(10, 8) },
      { id: 'e17-lire', title: 'Lire de la à mi', say: 'Quelle est cette note ?', where: 'ecran', act: { kind: 'read', clef: 'sol', pool: A_POS, answer: 'name' }, goal: quiz(10, 8) },
      { id: 'e17-tetris', title: 'Tetris', say: 'Pouce sur le la. Joue la note qui brille.', where: 'piano', act: { kind: 'song', id: 'tetris', help: 'keys' } },
      { id: 'e17-jacques', title: 'Frère Jacques en mineur', say: 'Joue la note qui brille.', where: 'piano', act: { kind: 'song', id: 'jacques-min', help: 'keys' } },
      {
        id: 'e17-pop',
        title: 'Au piano : les 4 accords de la pop',
        say: 'Joue les accords l’un après l’autre : Do, Sol, la mineur, Fa.',
        where: 'piano',
        act: { kind: 'chords', chords: ['Do', 'Sol', 'Lam', 'Fa', 'Do', 'Sol', 'Lam', 'Fa'], fixed: true }
      }
    ],
    more: [
      { id: 'm17-tetris', title: 'Tetris en entier', say: 'La suite monte haut : ta main se déplace.', where: 'piano', act: { kind: 'song', id: 'tetris-full', help: 'keys' }, bonus: '🎮' },
      { id: 'm17-quel', title: 'Défi : quatre accords', say: 'Quel accord ? Do, Fa, Sol ou la mineur ?', where: 'ecran', act: { kind: 'whichchord', chords: ['Do', 'Fa', 'Sol', 'Lam'] }, goal: quiz(10, 7), bonus: '🎤' }
    ]
  },
  // ------------------------------------------------------------------ 18
  {
    id: 18,
    title: 'Lire tout seul',
    icon: '📖',
    sticker: '🦅',
    color: '#3ccf6e',
    lessons: [
      {
        id: 'l18-reperes',
        title: 'Les notes repères',
        slides: [
          { text: 'Trois repères en clé de sol : le do du milieu, le sol (2ᵉ ligne), le do d’en haut.', staff: { clef: 'sol', notes: [60, 67, 72], names: true }, play: [{ notes: [60, 67, 72], gap: 0.6, label: 'Écoute' }] },
          { text: 'En clé de fa : le do (2ᵉ interligne) et le fa (entre les 2 points).', staff: { clef: 'fa', notes: [48, 53], names: true }, play: [{ notes: [48, 53], gap: 0.6, label: 'Écoute' }] },
          { text: 'Depuis un repère, compte les marches : ligne, interligne, ligne…', staff: { clef: 'sol', notes: [67, 69, 71, 72], names: true } }
        ]
      },
      {
        id: 'l18-dechiffrer',
        title: 'Déchiffrer',
        slides: [
          { text: 'Déchiffrer, c’est jouer une chanson jamais entendue, juste en lisant. Comme lire une histoire !', big: '🕵️' },
          { text: '1. Trouve la première note. 2. Regarde si ça monte ou si ça descend. 3. Joue lentement.', big: '🐢' },
          { text: 'Cette fois, pas d’écoute avant : c’est toi qui découvres la chanson ! Tu l’écoutes à la fin.', big: '🎁' }
        ]
      }
    ],
    exercises: [
      { id: 'e18-lire', title: 'Lire en clé de sol', say: 'Quelle est cette note ?', where: 'ecran', act: { kind: 'read', clef: 'sol', pool: [57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76], answer: 'name' }, goal: quiz(12, 10) },
      { id: 'e18-lire-fa', title: 'Lire en clé de fa', say: 'Quelle est cette note ?', where: 'ecran', act: { kind: 'read', clef: 'fa', pool: [43, 45, 47, 48, 50, 52, 53, 55, 57], answer: 'name' }, goal: quiz(10, 8) },
      { id: 'e18-ferme', title: 'Chanson mystère 1', say: 'Lis et joue. Tu l’écouteras à la fin !', where: 'piano', act: { kind: 'song', id: 'ferme', help: 'read' } },
      { id: 'e18-yankee', title: 'Chanson mystère 2', say: 'Lis et joue. Tu l’écouteras à la fin !', where: 'piano', act: { kind: 'song', id: 'yankee', help: 'read' } },
      { id: 'e18-saints', title: 'Chanson mystère 3', say: 'Lis et joue. Attention aux silences !', where: 'piano', act: { kind: 'song', id: 'saints', help: 'read' } }
    ],
    more: [
      { id: 'm18-lire', title: 'Défi : les deux clés, sans faute', say: 'Clé de sol ou clé de fa : 10 sur 10 !', where: 'ecran', act: { kind: 'read', clef: 'mix', pool: [45, 47, 48, 50, 52, 53, 55, 60, 62, 64, 65, 67, 69, 71, 72], answer: 'name' }, goal: quiz(10, 10), bonus: '🏆' },
      { id: 'm18-nuit', title: 'Déchiffrer Douce nuit', say: 'Lis et joue, sans écouter avant.', where: 'piano', act: { kind: 'song', id: 'nuit', help: 'read' }, bonus: '✨' }
    ]
  }
];
