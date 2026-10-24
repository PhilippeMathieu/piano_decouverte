// Écho (répéter les notes de Croche) et improvisation sur les touches noires (répondre, ou jouer librement).
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Act } from '../content/types';
import { Feedback, ListenState, QProps, SelfCheck, useAnswer } from './common';
import { useListener, usesMic } from '../core/listen';
import { Keyboard } from '../ui/Keyboard';
import { colorOf, isBlack, nameOf, pcOf } from '../core/music';
import { audio, drum, now, playNote, playRow, stopAll } from '../core/sound';
import { rangeOf } from './piano';

type A<K extends Act['kind']> = Extract<Act, { kind: K }>;

/** Les touches noires du milieu du piano. */
const BLACK_POOL = [61, 63, 66, 68, 70, 73, 75];

/** Une suite de `len` notes du pool, sans répéter deux fois de suite la même. */
export function makeEcho(pool: number[], len: number, rnd: () => number = Math.random): number[] {
  const out: number[] = [];
  while (out.length < len) {
    const cands = pool.filter((m) => m !== out[out.length - 1]);
    out.push(cands[Math.floor(rnd() * cands.length)]);
  }
  return out;
}

/** Une réponse improvisée est réussie : au moins `min` notes, et surtout des touches noires. */
export function judgeImprov(notes: number[], min: number): { ok: boolean; msg: string } {
  if (notes.length < min) return { ok: false, msg: notes.length ? `${notes.length} note${notes.length > 1 ? 's' : ''} : joue-en au moins ${min} !` : 'Je n’ai rien entendu. À toi de jouer !' };
  const black = notes.filter(isBlack).length / notes.length;
  if (black < 0.6) return { ok: false, msg: 'Reste sur les touches noires !' };
  return { ok: true, msg: ['Belle réponse !', 'Quelle musique !', 'Bravo, artiste !', 'Super idée !'][Math.floor(Math.random() * 4)] };
}

function Dots({ n, got }: { n: number; got: number }) {
  return (
    <div class="row" style={{ justifyContent: 'center', gap: '8px', fontSize: '1.6rem' }} aria-label={`${got} sur ${n}`}>
      {Array.from({ length: n }, (_, k) => (
        <span key={k}>{k < got ? '🟢' : '⚪'}</span>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ Écho

export function Echo({ act, done }: QProps<A<'echo'>>) {
  const seq = useMemo(() => makeEcho(act.pool, act.len), []);
  const ans = useAnswer(done);
  const [got, setGot] = useState(0);
  const [flash, setFlash] = useState<{ midi: number; ok: boolean } | null>(null);
  const [heardOnce, setHeardOnce] = useState(false);
  const piano = act.input === 'piano';
  const range = rangeOf([...act.pool, 60]);
  const play = () => {
    stopAll();
    playRow(seq, 0.55, 0.5);
    setHeardOnce(true);
  };
  useEffect(() => {
    const t = setTimeout(play, 400);
    return () => clearTimeout(t);
  }, []);

  const take = (m: number) => {
    if (ans.locked || !heardOnce) return;
    const want = seq[got];
    if (pcOf(m) === pcOf(want)) {
      setFlash({ midi: piano ? want : m, ok: true });
      const g = got + 1;
      setGot(g);
      if (g >= seq.length) ans.answer(true);
    } else if (piano && got > 0 && pcOf(m) === pcOf(seq[got - 1])) {
      // La note d'avant, réentendue : on l'ignore.
      return;
    } else {
      setFlash({ midi: m, ok: false });
      ans.answer(false, `C’était ${seq.map((x) => nameOf(x)).join(', ')}.`);
    }
  };
  const { mic, retry } = useListener({ active: piano && !ans.locked && heardOnce, onNote: take });

  return (
    <>
      <button class="btn go big" onClick={play}>
        ▶ Écouter Croche
      </button>
      <Dots n={seq.length} got={got} />
      <Keyboard
        {...range}
        marks={act.pool.filter((m) => !isBlack(m))}
        flash={flash}
        onPress={
          piano
            ? undefined
            : (m) => {
                playNote(m, 0.6);
                take(m);
              }
        }
      />
      {piano ? <ListenState mic={mic} retry={retry} /> : null}
      {piano && !usesMic() && !ans.locked ? <SelfCheck onOk={() => ans.answer(true)} onNo={() => ans.answer(false, 'On réessaie la prochaine fois !')} /> : null}
      <Feedback fb={ans.fb} />
    </>
  );
}

// ------------------------------------------------------------------ Improviser

/** Batterie douce (grosse caisse et charleston) pendant `seconds` secondes. */
function playDrums(seconds: number, bpm = 100) {
  audio();
  const b = 60 / bpm;
  const t0 = now() + 0.1;
  for (let i = 0; i * b < seconds; i++) {
    const t = t0 + i * b;
    drum('kick', t, i % 4 === 0 ? 0.3 : 0.2);
    drum('hat', t + b / 2, 0.08);
  }
  return t0;
}

export function Improv({ act, done }: QProps<A<'improv'>>) {
  const libre = act.mode === 'libre';
  const seconds = libre ? 20 : 7;
  const min = libre ? 8 : 3;
  const call = useMemo(() => makeEcho(BLACK_POOL.slice(0, 5), 4), []);
  const ans = useAnswer(done);
  const [phase, setPhase] = useState<'ready' | 'call' | 'play' | 'check'>(libre ? 'ready' : 'call');
  const [left, setLeft] = useState(seconds);
  const [notes, setNotes] = useState<number[]>([]);
  const notesRef = useRef<number[]>([]);
  const timers = useRef<number[]>([]);
  const lastNote = useRef(0);
  const mic = usesMic();

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      stopAll();
    },
    []
  );

  const finish = () => {
    timers.current.forEach(clearTimeout);
    stopAll();
    if (!mic) {
      setPhase('check');
      return;
    }
    const j = judgeImprov(notesRef.current, min);
    ans.answer(j.ok, j.msg);
  };

  const startPlaying = () => {
    setPhase('play');
    const t0 = performance.now();
    lastNote.current = t0;
    const tickDown = () => {
      const elapsed = (performance.now() - t0) / 1000;
      setLeft(Math.max(0, Math.ceil(seconds - elapsed)));
      // Réponse : finie dès que l'enfant s'arrête 1,5 s après au moins 3 notes.
      const quiet = (performance.now() - lastNote.current) / 1000;
      if (elapsed >= seconds || (!libre && mic && notesRef.current.length >= min && quiet > 1.5)) finish();
      else timers.current.push(window.setTimeout(tickDown, 200));
    };
    timers.current.push(window.setTimeout(tickDown, 200));
  };

  const go = () => {
    if (libre) {
      playDrums(seconds + 1);
      startPlaying();
      return;
    }
    setPhase('call');
    playRow(call, 0.38, 0.36);
    // On écoute dès que Croche a fini (le micro ignore le son de l'appli de toute façon).
    timers.current.push(window.setTimeout(startPlaying, call.length * 380 + 500));
  };
  useEffect(() => {
    if (libre) return;
    const t = window.setTimeout(go, 400);
    return () => clearTimeout(t);
  }, []);

  const { mic: micState, retry } = useListener({
    active: phase === 'play' && !ans.locked,
    onNote: (m) => {
      notesRef.current = [...notesRef.current, m];
      lastNote.current = performance.now();
      setNotes(notesRef.current);
    }
  });

  return (
    <>
      {phase === 'ready' ? (
        <button class="btn go big" onClick={go}>
          🥁 Commencer
        </button>
      ) : null}
      {phase === 'call' ? <div class="count">🐦 Croche joue…</div> : null}
      {phase === 'play' ? <div class="count">{libre ? `${left} s` : 'À toi !'}</div> : null}
      <Keyboard from={53} to={77} groups="both" />
      {phase === 'play' && mic ? (
        <div class="row" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: '6px', minHeight: '34px' }} aria-label={`${notes.length} notes`}>
          {notes.slice(-16).map((m, k) => (
            <span key={k} class="pill" style={{ background: isBlack(m) ? '#1f2a5a' : colorOf(m), color: '#fff' }}>
              {nameOf(m)}
            </span>
          ))}
        </div>
      ) : null}
      {phase === 'play' && mic ? <ListenState mic={micState} retry={retry} /> : null}
      {phase === 'play' && !mic ? (
        <button class="btn go" onClick={finish}>
          J’ai fini ▶
        </button>
      ) : null}
      {phase === 'check' && !ans.locked ? (
        <SelfCheck onOk={() => ans.answer(true, 'Bravo, artiste !')} onNo={() => ans.answer(false, 'On réessaie la prochaine fois !')} okLabel="✅ Il a joué sa musique" noLabel="❌ Pas encore" />
      ) : null}
      {!libre && phase === 'play' ? (
        <button class="btn small" onClick={() => playRow(call, 0.38, 0.36)}>
          ▶ Réécouter la question
        </button>
      ) : null}
      <Feedback fb={ans.fb} />
    </>
  );
}
