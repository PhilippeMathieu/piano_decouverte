// Une leçon : quelques cartes à lire (ou à écouter), avec un clavier, une portée, une main ou un rythme.
import { useEffect, useState } from 'preact/hooks';
import { lessonById } from '../content/steps';
import type { Play, Slide } from '../content/types';
import { markLesson } from '../core/progress';
import { Say, go } from '../ui/bits';
import { Keyboard } from '../ui/Keyboard';
import { Staff } from '../ui/Staff';
import { Hand } from '../ui/Hand';
import { RhythmLine } from '../ui/RhythmLine';
import { Mascot } from '../ui/Mascot';
import { Missing } from './Exercise';
import { parseRhythm } from '../core/rhythm';
import { playMood, playNote, playRow, playTune, stopAll } from '../core/sound';
import { songById } from '../content/songs';
import { playRhythm } from '../ex/rhythm';
import { hush } from '../core/speak';

function doPlay(p: Play) {
  stopAll();
  if ('notes' in p) playRow(p.notes, p.gap ?? 0.6);
  else if ('chord' in p) playNote(p.chord, 1.4);
  else if ('rhythm' in p) playRhythm(parseRhythm(p.rhythm), 72);
  else if ('mood' in p) playMood(60, p.mood === 'triste');
  else {
    const s = songById(p.song);
    playTune(s.tune, s.bpm, { left: s.left });
  }
}

function SlideView({ s }: { s: Slide }) {
  return (
    <div class="slide">
      <Say text={s.text} />
      {s.big ? <div class="big-emoji">{s.big}</div> : null}
      {s.kb ? <Keyboard {...s.kb} glow={!!s.kb.marks?.length} onPress={(m) => playNote(m, 0.8)} /> : null}
      {s.staff ? (
        <div style={{ width: s.staff.notes.length > 3 ? 'min(100%, 640px)' : 'min(100%, 380px)' }}>
          <Staff
            clef={s.staff.clef}
            items={s.staff.clef === 'grand' ? s.staff.notes.map((n) => ({ notes: [n], t: 0 })) : s.staff.notes.map((n) => ({ notes: [n] }))}
            colored={s.staff.names}
            names={s.staff.names}
            minWidth={14}
          />
        </div>
      ) : null}
      {s.hand ? <Hand {...s.hand} /> : null}
      {s.rhythm ? (
        <div style={{ width: 'min(100%, 640px)', display: 'grid', justifyItems: 'center' }}>
          <RhythmLine beats={parseRhythm(s.rhythm)} />
        </div>
      ) : null}
      {s.play ? (
        <div class="slide-plays">
          {s.play.map((p, i) => (
            <button key={i} class="btn" onClick={() => doPlay(p)}>
              ▶ {p.label ?? 'Écoute'}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LessonView({ id }: { id: string }) {
  const l = lessonById(id);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(
    () => () => {
      stopAll();
      hush();
    },
    []
  );
  useEffect(() => {
    stopAll();
    hush();
  }, [i]);
  if (!l) return <Missing />;
  const back = () => go(`#/etape/${l.step}`);
  const last = i === l.slides.length - 1;
  return (
    <div class="ex">
      <div class="ex-top">
        <button class="btn round" aria-label="Retour à l’étape" onClick={back}>
          ✕
        </button>
        <div class="title">{l.title}</div>
        <span class="tag ecran">📖 Leçon</span>
      </div>
      <div class="dots">
        {l.slides.map((_, k) => (
          <span key={k} class={k < i || done ? 'ok' : k === i ? 'now' : ''} />
        ))}
      </div>
      {done ? (
        <div class="result">
          <Mascot mood="happy" />
          <h1>Leçon finie !</h1>
          <div class="answers">
            <button class="btn" onClick={() => (setDone(false), setI(0))}>
              🔁 Relire
            </button>
            <button class="btn go big" onClick={back}>
              Continuer ▶
            </button>
          </div>
        </div>
      ) : (
        <SlideView key={i} s={l.slides[i]} />
      )}
      {!done ? (
        <div class="answers">
          <button class="btn" disabled={i === 0} onClick={() => setI(i - 1)} aria-label="Carte précédente">
            ◀
          </button>
          <button
            class="btn go big"
            onClick={() => {
              if (last) {
                markLesson(l.id);
                setDone(true);
              } else setI(i + 1);
            }}
          >
            {last ? 'J’ai compris !' : 'Suite ▶'}
          </button>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
