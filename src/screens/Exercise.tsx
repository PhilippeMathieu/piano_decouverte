// Un exercice : consigne et objectif, les questions (ou la chanson), puis les étoiles.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Act, Exercise } from '../content/types';
import { STEPS, exerciseById } from '../content/steps';
import { after, finalStars, getSettings, playStars, quizStars, recordResult, setSettings, useStore } from '../core/progress';
import { Say, WhereTag, go } from '../ui/bits';
import { Mascot } from '../ui/Mascot';
import { QProps } from '../ex/common';
import { Beats, Contour, Contrast, Find, Finger, Groups, HighLow, Mood, Name, Read, WhichChord, WhichSong } from '../ex/screen';
import { Echo, Improv } from '../ex/create';
import { Rhythm, RhythmEar } from '../ex/rhythm';
import { Chord, Guided, Play } from '../ex/piano';
import { audio, stopAll } from '../core/sound';
import { useMicRelease } from '../core/listen/mic';
import { useWakeLock } from '../ui/wakeLock';
import { hush } from '../core/speak';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QUIZ: Partial<Record<Act['kind'], (p: QProps<any>) => preact.JSX.Element>> = {
  groups: Groups,
  find: Find,
  name: Name,
  highlow: HighLow,
  contour: Contour,
  mood: Mood,
  whichsong: WhichSong,
  finger: Finger,
  read: Read,
  beats: Beats,
  rhythm: Rhythm,
  rhythmear: RhythmEar,
  play: Play,
  chords: Chord,
  contrast: Contrast,
  whichchord: WhichChord,
  echo: Echo,
  improv: Improv
};

export const goalText = (ex: Exercise) => {
  if (ex.goal) {
    if (ex.act.kind === 'improv') return ex.act.mode === 'libre' ? 'Jouer au moins 8 notes, sur les noires' : `${ex.goal.need} réponses sur ${ex.goal.n}`;
    const unit = ex.act.kind === 'rhythm' ? 'rythmes réussis' : ex.act.kind === 'echo' ? 'échos réussis' : 'bonnes réponses';
    return `${ex.goal.need} ${unit} sur ${ex.goal.n}`;
  }
  if (ex.perfect) return 'Jouer sans faute';
  return ex.act.kind === 'chords' ? 'Jouer tous les accords' : ex.act.kind === 'song' ? 'Jouer la chanson jusqu’au bout' : 'Jouer toutes les notes';
};

export function ExerciseView({ id }: { id: string }) {
  const ex = exerciseById(id);
  const [phase, setPhase] = useState<'intro' | 'run' | 'done'>('intro');
  const [run, setRun] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [outcome, setOutcome] = useState<{ stars: number; sticker?: string; detail: string } | null>(null);
  const memo = useRef<Record<string, unknown>>({});
  const { settings } = useStore();
  useMicRelease();
  useWakeLock(phase === 'run' && ex?.where === 'piano');
  useEffect(
    () => () => {
      stopAll();
      hush();
    },
    []
  );
  if (!ex) return <Missing />;
  const step = STEPS.find((s) => s.id === ex.step)!;
  const isPerf = !ex.goal;

  const start = () => {
    audio();
    setResults([]);
    setOutcome(null);
    memo.current = {};
    setRun((r) => r + 1);
    setPhase('run');
  };
  const end = (raw: number, detail: string) => {
    const stars = finalStars(ex, raw);
    const r = recordResult(ex, stars);
    setOutcome({ stars, sticker: r.sticker ?? r.bonus, detail });
    setPhase('done');
  };
  const onAnswer = (ok: boolean) => {
    const next = [...results, ok];
    setResults(next);
    const g = ex.goal!;
    const score = next.filter(Boolean).length;
    // Fini dès que tout est joué, ou que l'objectif ne peut plus être atteint… on va quand même au bout : c'est un enfant.
    if (next.length >= g.n) end(quizStars(score, g.n, g.need), `${score} sur ${g.n}`);
  };

  const Q = QUIZ[ex.act.kind];
  const back = () => go(`#/etape/${step.id}`);

  return (
    <div class="ex">
      <div class="ex-top">
        <button class="btn round" aria-label="Retour à l’étape" onClick={back}>
          ✕
        </button>
        <div class="title">{ex.title}</div>
        <WhereTag where={ex.where} />
      </div>
      {phase === 'run' && ex.goal ? (
        <div class="dots" aria-label={`Question ${results.length + 1} sur ${ex.goal.n}`}>
          {Array.from({ length: ex.goal.n }, (_, k) => (
            <span key={k} class={k < results.length ? (results[k] ? 'ok' : 'bad') : k === results.length ? 'now' : ''} />
          ))}
        </div>
      ) : (
        <div />
      )}

      {phase === 'intro' ? (
        <div class="stage">
          <Say text={ex.say} />
          <div class="row" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <span class="pill">🎯 {goalText(ex)}</span>
          </div>
          {ex.where === 'piano' ? (
            <div class="card stack" style={{ maxWidth: '560px', textAlign: 'center' }}>
              <p>Pose l’iPad sur le pupitre du piano.</p>
              <div class="seg" style={{ justifyContent: 'center' }}>
                <button class="btn small" aria-pressed={settings.listen === 'micro'} onClick={() => setSettings({ listen: 'micro' })}>
                  🎤 Le micro écoute
                </button>
                <button class="btn small" aria-pressed={settings.listen === 'sans'} onClick={() => setSettings({ listen: 'sans' })}>
                  ✋ Sans micro
                </button>
              </div>
              <p class="hint">{settings.listen === 'micro' ? 'L’appli entend les notes et avance toute seule.' : 'Quelqu’un dit à chaque fois si c’est réussi.'}</p>
            </div>
          ) : null}
          <button class="btn go big" onClick={start}>
            C’est parti !
          </button>
        </div>
      ) : null}

      {phase === 'run' ? (
        <div class="stage" key={run}>
          {isPerf ? null : <Say text={ex.say} auto={results.length === 0} />}
          {isPerf ? (
            <Guided
              act={ex.act as Extract<Act, { kind: 'sequence' | 'song' | 'chords' }>}
              finish={(m, n) => end(playStars(m, n), m >= 999 ? '' : m === 0 ? 'Sans faute !' : `${m} faute${m > 1 ? 's' : ''}`)}
            />
          ) : Q ? (
            <Q key={results.length} act={ex.act} qi={results.length} memo={memo.current} done={onAnswer} />
          ) : null}
        </div>
      ) : null}

      {phase === 'done' && outcome ? (
        <Result ex={ex} outcome={outcome} again={start} next={after(ex)} back={back} />
      ) : null}
      <div />
    </div>
  );
}

function Result({ ex, outcome, again, next, back }: { ex: Exercise; outcome: { stars: number; sticker?: string; detail: string }; again: () => void; next?: Exercise; back: () => void }) {
  const name = getSettings().name;
  const won = outcome.stars > 0;
  return (
    <div class="result">
      <Mascot mood={won ? 'happy' : 'think'} />
      <h1>{won ? (outcome.stars === 3 ? `Parfait${name ? ', ' + name : ''} !` : `Bravo${name ? ' ' + name : ''} !`) : 'Presque !'}</h1>
      <div class="result-stars" aria-label={`${outcome.stars} étoile${outcome.stars > 1 ? 's' : ''}`}>
        {[0, 1, 2].map((k) => (
          <span key={k} class={k < outcome.stars ? '' : 'off'}>
            ⭐
          </span>
        ))}
      </div>
      <p style={{ fontSize: '1.2rem' }}>
        {outcome.detail}
        {won ? '' : ` · objectif : ${goalText(ex)}. On réessaie ?`}
      </p>
      {outcome.sticker ? (
        <div class="sticker-won">
          <span>{outcome.sticker}</span>
          <b>{ex.bonus && outcome.sticker === ex.bonus ? 'Autocollant spécial !' : 'Nouvel autocollant !'}</b>
        </div>
      ) : null}
      <div class="answers">
        <button class={'btn' + (won ? '' : ' go big')} onClick={again}>
          🔁 Recommencer
        </button>
        {won && next ? (
          <button class="btn go big" onClick={() => go(`#/exercice/${next.id}`)}>
            Suivant ▶
          </button>
        ) : (
          <button class={'btn' + (won ? ' go big' : '')} onClick={back}>
            {won ? 'Retour à l’étape' : 'Plus tard'}
          </button>
        )}
      </div>
    </div>
  );
}

export function Missing() {
  return (
    <div class="page stack" style={{ justifyItems: 'center', textAlign: 'center' }}>
      <Mascot mood="oops" />
      <h2>Cette page n’existe plus.</h2>
      <button class="btn go" onClick={() => go('#/')}>
        Retour au chemin
      </button>
    </div>
  );
}

