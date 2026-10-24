// Rythmes : écouter, puis taper sur le tambour (ou jouer au piano) avec le tic-tac ; reconnaître un rythme.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Act } from '../content/types';
import { Feedback, QProps, SelfCheck, pick, useAnswer } from './common';
import { RhythmLine } from '../ui/RhythmLine';
import { Beat, judge, makePattern, meterOf, onsets, parseRhythm, total } from '../core/rhythm';
import { audio, drum, hit, now, stopAll, tick } from '../core/sound';
import { listenOnsets, startMic } from '../core/listen/mic';
import { usesMic } from '../core/listen';

type A<K extends Act['kind']> = Extract<Act, { kind: K }>;

const bpmFor = (level: number) => (level === 4 || level === 6 ? 66 : 72);

/** Batterie « électro » : grosse caisse sur chaque temps, caisse claire sur 2 et 4, charleston sur les croches. */
function groove(t0: number, b: number, beats: number, meter: number) {
  for (let i = 0; i < beats; i++) {
    const t = t0 + i * b;
    drum('kick', t, 0.42);
    if (meter === 4 && i % 2 === 1) drum('snare', t, 0.3);
    drum('hat', t, 0.16);
    drum('hat', t + b / 2, 0.12);
  }
}

/** Joue un rythme (avec le tic-tac, ou la batterie) ; renvoie l'instant du premier temps. */
export function playRhythm(beats: Beat[], bpm: number, opts: { countIn?: boolean; ticks?: boolean; hits?: boolean; meter?: number; groove?: boolean } = {}) {
  const ctx = audio();
  const b = 60 / bpm;
  const meter = opts.meter ?? 4;
  const start = now() + 0.25;
  const pre = opts.countIn ? meter : 0;
  for (let i = 0; i < pre; i++) tick(start + i * b, i === 0);
  const t0 = start + pre * b;
  const len = total(beats);
  if (opts.groove) groove(t0, b, len, meter);
  else if (opts.ticks !== false) for (let i = 0; i < len; i++) tick(t0 + i * b, i % meter === 0);
  if (opts.hits !== false) for (const o of onsets(beats)) hit(t0 + o * b);
  void ctx;
  return { start, t0, beat: b, end: t0 + len * b };
}

/** Latence de sortie : le son programmé à l'instant T s'entend à T + latence. */
const outLatency = () => {
  const c = audio() as AudioContext & { outputLatency?: number };
  return (c.outputLatency ?? 0) + (c.baseLatency ?? 0);
};

export function Rhythm({ act, memo, done }: QProps<A<'rhythm'>>) {
  const src = useMemo(() => pick(memo, 'pattern', Array.from({ length: 6 }, () => makePattern(act.level))), []);
  const beats = useMemo(() => parseRhythm(src), [src]);
  const bpm = act.bpm ?? bpmFor(act.level);
  const meter = meterOf(act.level);
  const ans = useAnswer(done);
  const [phase, setPhase] = useState<'look' | 'count' | 'play' | 'check' | 'judged'>('look');
  const [count, setCount] = useState('');
  const [states, setStates] = useState<('ok' | 'bad' | undefined)[]>([]);
  const [cur, setCur] = useState<number | undefined>(undefined);
  const [hitAnim, setHitAnim] = useState(false);
  const taps = useRef<number[]>([]);
  const timers = useRef<number[]>([]);
  const piano = act.input === 'piano';
  const mic = piano && usesMic();

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      stopAll();
    },
    []
  );

  const listenFirst = () => {
    stopAll();
    const r = playRhythm(beats, bpm, { meter, groove: act.groove });
    follow(r.t0, r.beat);
  };

  /** Fait briller la note qui se joue. */
  const follow = (t0: number, beat: number) => {
    const ons = onsets(beats);
    ons.forEach((o, i) => timers.current.push(window.setTimeout(() => setCur(i), (t0 + o * beat - now()) * 1000)));
    timers.current.push(window.setTimeout(() => setCur(undefined), (t0 + total(beats) * beat - now()) * 1000));
  };

  const go = async () => {
    stopAll();
    taps.current = [];
    setStates([]);
    if (mic) await startMic({ echo: true });
    const r = playRhythm(beats, bpm, { countIn: true, hits: false, meter, groove: act.groove });
    setPhase('count');
    const lat = outLatency();
    Array.from({ length: meter }, (_, i) => i + 1).forEach((n, i) => timers.current.push(window.setTimeout(() => setCount(String(n)), (r.start + i * r.beat - now()) * 1000)));
    timers.current.push(
      window.setTimeout(() => {
        setCount('À toi !');
        setPhase('play');
      }, (r.t0 - now()) * 1000 - 60)
    );
    follow(r.t0, r.beat);
    let stop = () => {};
    if (mic) stop = listenOnsets((t) => taps.current.push(t - lat));
    timers.current.push(
      window.setTimeout(() => {
        stop();
        setCount('');
        const expected = onsets(beats).map((o) => r.t0 + o * r.beat);
        if (piano && !mic) {
          setPhase('check');
          return;
        }
        // Les coups tapés trop tôt (avant le premier temps, moins la tolérance) ne comptent pas.
        const j = judge(expected, taps.current.filter((t) => t > r.t0 - 0.35));
        setStates(j.hits.map((h) => (h === null ? 'bad' : 'ok')));
        setPhase('judged');
        const missed = j.hits.filter((h) => h === null).length;
        ans.answer(j.ok, j.ok ? undefined : missed ? `${missed} note${missed > 1 ? 's' : ''} pas au bon moment.` : 'Un peu trop de coups !');
      }, (r.end - now()) * 1000 + 350)
    );
  };

  const tap = (e: Event) => {
    e.preventDefault();
    if (phase !== 'play' && phase !== 'count') return;
    taps.current.push(now() - outLatency());
    setHitAnim(true);
    window.setTimeout(() => setHitAnim(false), 90);
  };

  return (
    <>
      <div style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <RhythmLine beats={beats} states={states} now={cur} per={meter} />
      </div>
      {phase === 'look' ? (
        <div class="answers">
          <button class="btn big" onClick={listenFirst}>
            ▶ Écouter
          </button>
          <button class="btn go big" onClick={go}>
            {piano ? '🎹 À toi !' : '🥁 À toi !'}
          </button>
        </div>
      ) : null}
      {phase === 'count' || phase === 'play' ? <div class="count">{count}</div> : null}
      {!piano && (phase === 'count' || phase === 'play') ? (
        <button class={'drum' + (hitAnim ? ' hit' : '')} onPointerDown={tap} aria-label="Tambour">
          🥁
        </button>
      ) : null}
      {phase === 'check' ? (
        <SelfCheck
          onOk={() => ans.answer(true)}
          onNo={() => ans.answer(false, 'On recommence la prochaine fois !')}
          okLabel="✅ Bon rythme"
          noLabel="❌ Pas encore"
        />
      ) : null}
      <Feedback fb={ans.fb} />
    </>
  );
}

export function RhythmEar({ act, done }: QProps<A<'rhythmear'>>) {
  const q = useMemo(() => {
    const a = makePattern(act.level);
    let b = makePattern(act.level);
    for (let i = 0; i < 20 && onsets(parseRhythm(b)).join() === onsets(parseRhythm(a)).join(); i++) b = makePattern(act.level);
    return { pats: [a, b], right: Math.random() < 0.5 ? 0 : 1 };
  }, []);
  const ans = useAnswer(done);
  const [picked, setPicked] = useState<number | null>(null);
  const play = () => {
    stopAll();
    playRhythm(parseRhythm(q.pats[q.right]), bpmFor(act.level), { meter: meterOf(act.level) });
  };
  useEffect(() => {
    const t = setTimeout(play, 350);
    return () => {
      clearTimeout(t);
      stopAll();
    };
  }, []);
  return (
    <>
      <button class="btn go big" onClick={play}>
        ▶ Écouter
      </button>
      <div class="answers" style={{ width: '100%' }}>
        {q.pats.map((p, i) => (
          <button
            key={i}
            class={'btn wide' + (picked === null ? '' : i === q.right ? ' ok' : i === picked ? ' no' : '')}
            style={{ minHeight: '96px', maxWidth: '520px' }}
            onClick={() => {
              if (ans.locked) return;
              setPicked(i);
              ans.answer(i === q.right);
            }}
            aria-label={`Rythme ${i + 1}`}
          >
            <RhythmLine beats={parseRhythm(p)} per={meterOf(act.level)} />
          </button>
        ))}
      </div>
      <Feedback fb={ans.fb} />
    </>
  );
}
