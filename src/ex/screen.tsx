// Questions sans piano : le clavier à l'écran, l'oreille, la lecture, les doigts, les durées.
import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Act } from '../content/types';
import { Feedback, QProps, pick, shuffle, useAnswer } from './common';
import { Keyboard } from '../ui/Keyboard';
import { Staff } from '../ui/Staff';
import { Hand } from '../ui/Hand';
import { RhythmLine } from '../ui/RhythmLine';
import { NAMES, NATURAL_PC, colorOf, isBlack, nameOf, pcOf } from '../core/music';
import { parseRhythm } from '../core/rhythm';
import { playMood, playNote, playRow, playTune } from '../core/sound';
import { SONGS } from '../content/songs';

type A<K extends Act['kind']> = Extract<Act, { kind: K }>;
const KB = { from: 48, to: 76 };

/** Une touche du clavier à l'écran : elle sonne, puis on juge. */
function useKeyAnswer(done: (ok: boolean) => void) {
  const a = useAnswer(done);
  const [flash, setFlash] = useState<{ midi: number; ok: boolean } | null>(null);
  const press = (midi: number, ok: boolean, msg?: string) => {
    if (a.locked) return;
    playNote(midi, 0.7);
    setFlash({ midi, ok });
    a.answer(ok, msg);
  };
  return { ...a, flash, press };
}

// ------------------------------------------------------------------ Groupes de noires

export function Groups({ act, done }: QProps<A<'groups'>>) {
  const k = useKeyAnswer(done);
  const want = act.size === 2 ? [1, 3] : [6, 8, 10];
  return (
    <>
      <Keyboard {...KB} flash={k.flash} onPress={(m) => k.press(m, want.includes(pcOf(m)), isBlack(m) ? undefined : 'C’est une touche blanche !')} />
      <Feedback fb={k.fb} />
    </>
  );
}

// ------------------------------------------------------------------ Trouver une note

export function Find({ act, memo, done }: QProps<A<'find'>>) {
  const target = useMemo(() => pick(memo, 'find', act.pool), []);
  const k = useKeyAnswer(done);
  const name = nameOf(target, act.flat);
  const bg = isBlack(target) ? '#1f2a5a' : colorOf(target);
  return (
    <>
      <div class="prompt-note" style={{ background: bg }}>
        {name}
      </div>
      <Keyboard
        {...KB}
        colors={act.colors}
        flat={act.flat}
        flash={k.flash}
        onPress={(m) => k.press(m, pcOf(m) === pcOf(target), `Tu as touché ${nameOf(m, act.flat)}.`)}
      />
      <Feedback fb={k.fb} />
    </>
  );
}

// ------------------------------------------------------------------ Nommer la touche qui brille

function NameButtons({ names, onPick, right, picked }: { names: number[]; onPick: (pc: number) => void; right: number; picked: number | null }) {
  return (
    <div class="answers">
      {names.map((pc) => {
        const m = 60 + pc;
        const cls = picked === null ? '' : pc === right ? ' ok' : pc === picked ? ' no' : '';
        return (
          <button key={pc} class={'btn' + cls} style={picked === null ? { boxShadow: `0 6px 0 ${colorOf(m)}` } : undefined} onClick={() => onPick(pc)}>
            {nameOf(m)}
          </button>
        );
      })}
    </div>
  );
}

export function Name({ act, memo, done }: QProps<A<'name'>>) {
  const target = useMemo(() => {
    const m = pick(memo, 'name', act.pool);
    return Math.random() < 0.5 ? m - 12 : m;
  }, []);
  const a = useAnswer(done);
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <>
      <Keyboard {...KB} marks={[target]} glow />
      <NameButtons
        names={NATURAL_PC}
        right={pcOf(target)}
        picked={picked}
        onPick={(pc) => {
          if (a.locked) return;
          setPicked(pc);
          playNote(target, 0.7);
          a.answer(pc === pcOf(target), pc === pcOf(target) ? undefined : `C’était ${nameOf(target)}.`);
        }}
      />
      <Feedback fb={a.fb} />
    </>
  );
}

// ------------------------------------------------------------------ Oreille : grave ou aigu, ça monte, joyeux ou triste

function Choice({ options, right, onAnswer, locked }: { options: { id: string; label: string }[]; right: string; onAnswer: (id: string) => void; locked: boolean }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div class="answers">
      {options.map((o) => (
        <button
          key={o.id}
          class={'btn big' + (picked === null ? '' : o.id === right ? ' ok' : o.id === picked ? ' no' : '')}
          onClick={() => {
            if (locked) return;
            setPicked(o.id);
            onAnswer(o.id);
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Replay({ play }: { play: () => void }) {
  useEffect(() => {
    const t = setTimeout(play, 350);
    return () => clearTimeout(t);
  }, []);
  return (
    <button class="btn go big" onClick={play}>
      ▶ Écouter
    </button>
  );
}

export function HighLow({ qi, done }: QProps<A<'highlow'>>) {
  const q = useMemo(() => {
    // D'abord de grands écarts, puis de plus en plus proches.
    const [lo, hi] = qi < 4 ? [7, 14] : qi < 7 ? [3, 7] : [2, 4];
    const gap = lo + Math.floor(Math.random() * (hi - lo + 1));
    const a = 55 + Math.floor(Math.random() * 14);
    const up = Math.random() < 0.5;
    return { a, b: up ? a + gap : a - gap, up };
  }, []);
  const ans = useAnswer(done);
  return (
    <>
      <Replay play={() => playRow([q.a, q.b], 0.8)} />
      <Choice
        options={[
          { id: 'up', label: '🐭 Plus aiguë' },
          { id: 'down', label: '🐘 Plus grave' }
        ]}
        right={q.up ? 'up' : 'down'}
        locked={ans.locked}
        onAnswer={(id) => ans.answer((id === 'up') === q.up)}
      />
      <Feedback fb={ans.fb} />
    </>
  );
}

export function Contour({ done }: QProps<A<'contour'>>) {
  const q = useMemo(() => {
    const kind = (['up', 'down', 'same'] as const)[Math.floor(Math.random() * 3)];
    const step = () => [2, 2, 3, 4][Math.floor(Math.random() * 4)];
    const a = 60 + Math.floor(Math.random() * 8);
    const s1 = step();
    const s2 = step();
    const notes = kind === 'same' ? [a, a, a] : kind === 'up' ? [a, a + s1, a + s1 + s2] : [a + s1 + s2, a + s2, a];
    return { kind, notes };
  }, []);
  const ans = useAnswer(done);
  return (
    <>
      <Replay play={() => playRow(q.notes, 0.65)} />
      <Choice
        options={[
          { id: 'up', label: '⬆️ Ça monte' },
          { id: 'down', label: '⬇️ Ça descend' },
          { id: 'same', label: '➡️ Ça reste' }
        ]}
        right={q.kind}
        locked={ans.locked}
        onAnswer={(id) => ans.answer(id === q.kind)}
      />
      <Feedback fb={ans.fb} />
    </>
  );
}

export function Mood({ done }: QProps<A<'mood'>>) {
  const q = useMemo(() => ({ root: 55 + Math.floor(Math.random() * 10), minor: Math.random() < 0.5 }), []);
  const ans = useAnswer(done);
  return (
    <>
      <Replay play={() => playMood(q.root, q.minor)} />
      <Choice
        options={[
          { id: 'maj', label: '😀 Joyeux' },
          { id: 'min', label: '😢 Triste' }
        ]}
        right={q.minor ? 'min' : 'maj'}
        locked={ans.locked}
        onAnswer={(id) => ans.answer((id === 'min') === q.minor)}
      />
      <Feedback fb={ans.fb} />
    </>
  );
}

export function WhichSong({ act, memo, done }: QProps<A<'whichsong'>>) {
  const songs = act.songs.map((id) => SONGS.find((s) => s.id === id)!);
  const song = useMemo(() => pick(memo, 'song', songs, (a, b) => a.id === b.id), []);
  const ans = useAnswer(done);
  // Le début : la première phrase.
  const play = () => {
    const n = song.phrases[0];
    let k = 0;
    const head = song.tune.filter((e) => (e.notes.length ? k++ < n : k < n));
    playTune(head, song.bpm);
  };
  return (
    <>
      <Replay play={play} />
      <Choice options={songs.map((s) => ({ id: s.id, label: `${s.icon} ${s.title}` }))} right={song.id} locked={ans.locked} onAnswer={(id) => ans.answer(id === song.id)} />
      <Feedback fb={ans.fb} />
    </>
  );
}

// ------------------------------------------------------------------ Doigts

export function Finger({ act, memo, done }: QProps<A<'finger'>>) {
  const f = useMemo(() => pick(memo, 'finger', [1, 2, 3, 4, 5]), []);
  const ans = useAnswer(done);
  const [picked, setPicked] = useState<number | null>(null);
  if (act.mode === 'number') {
    return (
      <>
        <Hand hand={act.hand} finger={f} labels={['', '', '', '', '']} />
        <div class="answers">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              class={'btn big' + (picked === null ? '' : n === f ? ' ok' : n === picked ? ' no' : '')}
              onClick={() => {
                if (ans.locked) return;
                setPicked(n);
                ans.answer(n === f, n === f ? undefined : `C’est le doigt ${f}.`);
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <Feedback fb={ans.fb} />
      </>
    );
  }
  // Position de do : main droite do = 1 … sol = 5 ; main gauche do = 5 … sol = 1.
  const idx = act.hand === 'd' ? f - 1 : 5 - f;
  const right = NATURAL_PC[idx];
  const base = act.hand === 'd' ? 60 : 48;
  return (
    <>
      <div class="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        <Hand hand={act.hand} finger={f} />
        <div class="prompt-note" style={{ background: '#1f2a5a' }}>
          {f}
        </div>
      </div>
      <NameButtons
        names={NATURAL_PC.slice(0, 5)}
        right={right}
        picked={picked}
        onPick={(pc) => {
          if (ans.locked) return;
          setPicked(pc);
          playNote(base + pc, 0.7);
          ans.answer(pc === right, pc === right ? undefined : `Le doigt ${f} joue ${NAMES[idx]}.`);
        }}
      />
      <Feedback fb={ans.fb} />
    </>
  );
}

// ------------------------------------------------------------------ Lire sur la portée

export function Read({ act, memo, done }: QProps<A<'read'>>) {
  const note = useMemo(() => pick(memo, 'read', act.pool), []);
  const clef = act.clef === 'mix' ? (note < 60 ? 'fa' : 'sol') : act.clef;
  const k = useKeyAnswer(done);
  const [picked, setPicked] = useState<number | null>(null);
  const names = [...new Set(act.pool.map(pcOf))].sort((a, b) => a - b);
  return (
    <>
      <div style={{ width: 'min(100%, 340px)' }}>
        <Staff clef={clef} items={[{ notes: [note] }]} label="La note à lire" />
      </div>
      {act.answer === 'name' ? (
        <NameButtons
          names={names.length >= 3 ? names : NATURAL_PC}
          right={pcOf(note)}
          picked={picked}
          onPick={(pc) => {
            if (k.locked) return;
            setPicked(pc);
            playNote(note, 0.8);
            k.answer(pc === pcOf(note), pc === pcOf(note) ? undefined : `C’était ${nameOf(note)}.`);
          }}
        />
      ) : (
        <Keyboard {...KB} flash={k.flash} onPress={(m) => k.press(m, pcOf(m) === pcOf(note), `C’était ${nameOf(note)}.`)} />
      )}
      <Feedback fb={k.fb} />
    </>
  );
}

// ------------------------------------------------------------------ Combien de temps ?

const FIGURES = [
  { r: '1', beats: 1, name: 'la noire' },
  { r: '2', beats: 2, name: 'la blanche' },
  { r: '4', beats: 4, name: 'la ronde' },
  { r: '-1', beats: 1, name: 'le soupir' }
];

export function Beats({ memo, done }: QProps<A<'beats'>>) {
  const fig = useMemo(() => pick(memo, 'fig', FIGURES), []);
  const ans = useAnswer(done);
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <>
      <div style={{ width: 'min(60vw, 200px)' }}>
        <RhythmLine beats={parseRhythm(fig.r)} per={99} />
      </div>
      <div class="answers">
        {[1, 2, 4].map((n) => (
          <button
            key={n}
            class={'btn big' + (picked === null ? '' : n === fig.beats ? ' ok' : n === picked ? ' no' : '')}
            onClick={() => {
              if (ans.locked) return;
              setPicked(n);
              ans.answer(n === fig.beats, n === fig.beats ? `Oui, ${fig.name} : ${n} temps !` : `Non : ${fig.name} dure ${fig.beats} temps.`);
            }}
          >
            {n} temps
          </button>
        ))}
      </div>
      <Feedback fb={ans.fb} />
    </>
  );
}

export const shuffled = shuffle;
