// Au piano : jouer une note demandée, un accord, ou une suite de notes et une chanson guidées note à note.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Act, Target } from '../content/types';
import { Feedback, ListenState, QProps, SelfCheck, pick, praise, useAnswer } from './common';
import { useListener, usesMic } from '../core/listen';
import { Keyboard } from '../ui/Keyboard';
import { Staff, StaffItem } from '../ui/Staff';
import { Ev, cPositionFinger, colorOf, isBlack, nameOf, parseTune, pcOf } from '../core/music';
import { playNote, playTune, stopAll } from '../core/sound';
import { CHORDS } from '../content/steps';
import { Song, songById } from '../content/songs';

type A<K extends Act['kind']> = Extract<Act, { kind: K }>;

export const accepts = (t: Target, midi: number) =>
  (t.pcs ? t.pcs.includes(pcOf(midi)) : true) && (t.below === undefined || midi < t.below) && (t.above === undefined || midi > t.above);

/** Le piano entendu, en mots (« un ré grave »). */
const heard = (m: number) => `un ${nameOf(m)}${m < 53 ? ' grave' : m > 76 ? ' aigu' : ''}`;

// ------------------------------------------------------------------ Une note demandée

export function Play({ act, memo, done }: QProps<A<'play'>>) {
  const target = useMemo(() => pick(memo, 'target', act.targets, (a, b) => a.say === b.say && a.show?.staff?.note === b.show?.staff?.note), []);
  const ans = useAnswer(done);
  const shownAt = useRef(performance.now());
  const { mic, retry } = useListener({
    active: !ans.locked,
    onNote: (m) => {
      if (performance.now() - shownAt.current < 350) return;
      const ok = accepts(target, m);
      ans.answer(ok, ok ? undefined : `J’ai entendu ${heard(m)}.`);
    }
  });
  const staff = target.show?.staff;
  const pc = target.pcs?.length === 1 ? target.pcs[0] : null;
  return (
    <>
      {staff ? (
        <div style={{ width: 'min(100%, 340px)' }}>
          <Staff clef={staff.clef} items={[{ notes: [staff.note] }]} label="La note à jouer" />
        </div>
      ) : pc !== null ? (
        <div class="prompt-note" style={{ background: colorOf(60 + pc) }}>
          {nameOf(60 + pc)}
        </div>
      ) : (
        <div class="prompt-note" style={{ background: '#1f2a5a', fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', padding: '18px 28px' }}>
          {target.say}
        </div>
      )}
      {target.show?.key !== undefined ? <Keyboard from={48} to={76} marks={[target.show.key]} glow /> : null}
      <ListenState mic={mic} retry={retry} />
      {!usesMic() && !ans.locked ? <SelfCheck onOk={() => ans.answer(true)} onNo={() => ans.answer(false, 'Ce sera pour la prochaine !')} /> : null}
      <Feedback fb={ans.fb} />
    </>
  );
}

// ------------------------------------------------------------------ Un accord demandé

function ChordPrompt({ name }: { name: string }) {
  const notes = CHORDS[name];
  return (
    <>
      <div class="prompt-note" style={{ background: colorOf(notes[0]) }}>
        {name}
      </div>
      <Keyboard from={55} to={79} marks={notes} names={notes} fingers={{ [notes[0]]: 1, [notes[1]]: 3, [notes[2]]: 5 }} />
    </>
  );
}

export function Chord({ act, memo, done }: QProps<A<'chords'>>) {
  const name = useMemo(() => pick(memo, 'chord', act.chords), []);
  const ans = useAnswer(done);
  const [skip, setSkip] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSkip(true), 15000);
    return () => clearTimeout(t);
  }, []);
  const { mic, retry } = useListener({ active: !ans.locked, chord: CHORDS[name], onChord: () => ans.answer(true) });
  return (
    <>
      <ChordPrompt name={name} />
      <div class="row" style={{ gap: '10px' }}>
        <button class="btn small" onClick={() => playNote(CHORDS[name], 1.2)}>
          ▶ Écouter
        </button>
        {skip && usesMic() && !ans.locked ? (
          <button class="btn small" onClick={() => ans.answer(false, 'On passe à la suite.')}>
            Passer
          </button>
        ) : null}
      </div>
      <ListenState mic={mic} retry={retry} />
      {!usesMic() && !ans.locked ? <SelfCheck onOk={() => ans.answer(true)} onNo={() => ans.answer(false, 'Ce sera pour la prochaine !')} /> : null}
      <Feedback fb={ans.fb} />
    </>
  );
}

// ------------------------------------------------------------------ Guidé : suite de notes, chanson, suite d'accords

export interface GuideStep {
  /** Notes attendues (main droite ; la main gauche est montrée, pas vérifiée). */
  notes: number[];
  /** Accord : le nom (pour les suites d'accords). */
  chord?: string;
  finger?: number;
  /** Début en temps, et durée. */
  t: number;
  dur: number;
  phrase: number;
}

export interface Guide {
  steps: GuideStep[];
  left: { notes: number[]; t: number; dur: number }[];
  bpm: number;
  beats: number;
  pickup: number;
  clef: 'sol' | 'fa' | 'grand';
  tune?: Ev[];
  leftTune?: Ev[];
}

/** Une chanson ou une suite de notes, prête à guider. */
export function guideOf(act: A<'sequence'> | A<'song'> | A<'chords'>): Guide {
  if (act.kind === 'chords') {
    return {
      steps: act.chords.map((c, i) => ({ notes: CHORDS[c], chord: c, t: i * 4, dur: 4, phrase: 0 })),
      left: [],
      bpm: 60,
      beats: 4,
      pickup: 0,
      clef: 'sol'
    };
  }
  let tune: Ev[];
  let left: Ev[] = [];
  let phrases: number[];
  let bpm = 80;
  let beats = 4;
  let pickup = 0;
  if (act.kind === 'song') {
    const s: Song = songById(act.id);
    tune = s.tune;
    left = s.left ?? [];
    phrases = s.phrases;
    bpm = s.bpm;
    beats = s.beats;
    pickup = s.pickup ?? 0;
  } else {
    tune = parseTune(act.tune, act.octave ?? 4);
    phrases = [tune.filter((e) => e.notes.length).length];
  }
  const steps: GuideStep[] = [];
  let t = 0;
  let ph = 0;
  let inPhrase = 0;
  for (const e of tune) {
    if (e.notes.length) {
      // Doigt : celui de la chanson, sinon la position de do de la main qui joue (selon le registre).
      const finger = e.finger ?? (act.kind === 'sequence' ? cPositionFinger(e.notes[0], e.notes[0] < 60 ? 'g' : 'd') : undefined);
      steps.push({ notes: e.notes, finger, t, dur: e.dur, phrase: ph });
      if (++inPhrase >= phrases[ph] && ph < phrases.length - 1) {
        ph++;
        inPhrase = 0;
      }
    }
    t += e.dur;
  }
  const lefts: Guide['left'] = [];
  let tl = 0;
  for (const e of left) {
    if (e.notes.length) lefts.push({ notes: e.notes, t: tl, dur: e.dur });
    tl += e.dur;
  }
  const all = [...steps.flatMap((s) => s.notes), ...lefts.flatMap((l) => l.notes)];
  const clef = lefts.length || (Math.min(...all) < 55 && Math.max(...all) >= 60) ? 'grand' : Math.max(...all) < 60 ? 'fa' : 'sol';
  return { steps, left: lefts, bpm, beats, pickup, clef, tune, leftTune: left.length ? left : undefined };
}

/** Clavier qui couvre toutes les notes (au moins une octave et demie, de do à mi). */
export function rangeOf(notes: number[]) {
  const lo = Math.min(...notes);
  const hi = Math.max(...notes);
  let from = 12 * Math.floor(lo / 12);
  let to = Math.max(hi, from + 16);
  if (to - from > 30) from = lo - (isBlack(lo) ? 1 : 0);
  while (isBlack(to)) to++;
  while (isBlack(from)) from--;
  return { from, to };
}

export function Guided({ act, finish }: { act: A<'sequence'> | A<'song'> | A<'chords'>; finish: (mistakes: number, notes: number) => void }) {
  const g = useMemo(() => guideOf(act), []);
  const [i, setI] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [flash, setFlash] = useState<{ midi: number; ok: boolean } | null>(null);
  const [fb, setFb] = useState<{ ok: boolean; msg: string } | null>(null);
  const [rating, setRating] = useState(false);
  const missHere = useRef(0);
  const playing = useRef<number | null>(null);
  const [demo, setDemo] = useState<number | null>(null);
  const help = act.kind === 'song' ? act.help : 'keys';
  const step = g.steps[i];
  const end = i >= g.steps.length;
  const mic = usesMic();

  useEffect(() => () => stopAll(), []);
  useEffect(() => {
    if (!end) return;
    if (mic) {
      setFb({ ok: true, msg: praise() });
      const t = setTimeout(() => finish(mistakes, g.steps.length), 1100);
      return () => clearTimeout(t);
    }
    setRating(true);
  }, [end]);

  const advance = () => {
    missHere.current = 0;
    setI((x) => x + 1);
  };
  const { mic: micState, retry } = useListener({
    active: !end && demo === null,
    chord: step?.chord ? step.notes : undefined,
    onChord: () => {
      setFb({ ok: true, msg: praise() });
      advance();
    },
    onNote: (m) => {
      if (!step || step.chord) return;
      if (step.notes.some((n) => pcOf(n) === pcOf(m))) {
        setFlash({ midi: step.notes[0], ok: true });
        setFb(null);
        advance();
      } else if (i > 0 && g.steps[i - 1].notes.some((n) => pcOf(n) === pcOf(m))) {
        // La note qu'on vient de jouer, entendue une 2e fois (résonance, rebond) : ni faute ni message.
        return;
      } else {
        setFlash({ midi: m, ok: false });
        setFb({ ok: false, msg: `Oups, ${nameOf(m)} ! Cherche ${nameOf(step.notes[0])}.` });
        // Une seule faute comptée par note : on ne punit pas les essais.
        if (missHere.current++ === 0) setMistakes((x) => x + 1);
      }
    }
  });

  const listenAll = () => {
    stopAll();
    if (g.tune) {
      setDemo(0);
      const dur = playTune(g.tune, g.bpm, { left: g.leftTune, onNote: (k) => setDemo(k) });
      playing.current = window.setTimeout(() => setDemo(null), dur * 1000 + 300);
    } else {
      // Suite d'accords : l'un après l'autre.
      g.steps.forEach((s, k) => window.setTimeout(() => (setDemo(k), playNote(s.notes, 1.1)), k * 1300));
      playing.current = window.setTimeout(() => setDemo(null), g.steps.length * 1300 + 300);
    }
  };
  const stopDemo = () => {
    stopAll();
    if (playing.current) clearTimeout(playing.current);
    setDemo(null);
  };

  const shown = demo ?? Math.min(i, g.steps.length - 1);
  const cur = g.steps[shown];
  const phraseSteps = g.steps.filter((s) => s.phrase === cur.phrase);
  const t0 = phraseSteps[0].t;
  const t1 = phraseSteps[phraseSteps.length - 1].t + phraseSteps[phraseSteps.length - 1].dur;
  const items: StaffItem[] = phraseSteps.map((s) => {
    const k = g.steps.indexOf(s);
    return {
      notes: s.notes,
      dur: s.dur,
      t: s.t - t0,
      finger: help === 'keys' ? s.finger : undefined,
      state: k === shown && !end ? 'now' : k < shown || end ? 'done' : undefined,
      staff: g.clef === 'grand' ? (s.notes[0] < 60 ? 'fa' : 'sol') : undefined
    };
  });
  for (const l of g.left) if (l.t >= t0 && l.t < t1) items.push({ notes: l.notes, dur: l.dur, t: l.t - t0, staff: 'fa' });

  const allNotes = [...g.steps.flatMap((s) => s.notes), ...g.left.flatMap((l) => l.notes)];
  const range = rangeOf(allNotes);
  const fingers: Record<number, number> = {};
  if (help === 'keys' && cur.finger && !end) fingers[cur.notes[0]] = cur.finger;
  if (cur.chord) cur.notes.forEach((n, k) => (fingers[n] = [1, 3, 5][k]));
  const leftNow = g.left.find((l) => l.t === cur.t);

  if (rating) {
    return (
      <div class="self-check">
        <p>Comment ça s’est passé ?</p>
        <div class="answers">
          <button class="btn ok" onClick={() => finish(0, g.steps.length)}>
            ⭐⭐⭐ Sans faute
          </button>
          <button class="btn" onClick={() => finish(Math.round(g.steps.length / 8) * 2, g.steps.length)}>
            ⭐⭐ Presque
          </button>
          <button class="btn" onClick={() => finish(Math.round(g.steps.length / 8) * 4, g.steps.length)}>
            ⭐ Avec des erreurs
          </button>
          <button class="btn no" onClick={() => finish(999, g.steps.length)}>
            Pas encore
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {cur.chord ? (
        <ChordPrompt name={cur.chord} />
      ) : (
        <div style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '900px' }}>
            <Staff
              clef={g.clef}
              items={items}
              rhythm
              beats={g.beats}
              firstBar={(((g.pickup - t0) % g.beats) + g.beats) % g.beats}
              colored={help === 'keys'}
              minWidth={24}
              label="La chanson"
            />
          </div>
        </div>
      )}
      {!cur.chord ? (
        <Keyboard
          {...range}
          marks={help === 'keys' && !end ? [...cur.notes, ...(leftNow ? leftNow.notes : [])] : []}
          glow
          names={help === 'keys' && !end ? [...cur.notes, ...(leftNow ? leftNow.notes : [])] : undefined}
          fingers={fingers}
          flash={flash}
        />
      ) : null}
      <div class="row" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {demo === null ? (
          <button class="btn small" onClick={listenAll}>
            ▶ Écouter {act.kind === 'song' ? 'la chanson' : ''}
          </button>
        ) : (
          <button class="btn small" onClick={stopDemo}>
            ⏹ Stop
          </button>
        )}
        <span class="pill">
          {Math.min(i, g.steps.length)} / {g.steps.length}
        </span>
        {!mic && !end ? (
          <button class="btn go" onClick={advance}>
            {cur.chord ? 'Accord suivant ▶' : 'Note suivante ▶'}
          </button>
        ) : null}
      </div>
      {mic ? <ListenState mic={micState} retry={retry} /> : null}
      <Feedback fb={fb} />
    </>
  );
}
