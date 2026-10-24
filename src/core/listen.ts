// Écouter le piano de l'enfant au micro : notes jouées une à une, ou accord tenu.
import { useEffect, useRef } from 'preact/hooks';
import { micGate, readChord, readNote, startMic, useMicLoop, useMicState } from './listen/mic';
import { checkChord } from './listen/detect';
import { NoteTracker } from './listen/tracker';
import { appPlaying } from './sound';
import { getSettings } from './progress';

export interface ListenOpts {
  active: boolean;
  /** Une nouvelle note entendue (MIDI). */
  onNote?: (midi: number) => void;
  /** Accord attendu (classes de hauteur) : onChord quand il est entendu deux fois de suite. */
  chord?: number[];
  onChord?: () => void;
}

/** Vrai si l'on écoute au micro (sinon, l'exercice se valide à la main). */
export const usesMic = () => getSettings().listen === 'micro';

/** Le micro reste ouvert d'une question à l'autre ; l'écran d'exercice le coupe en partant (useMicRelease). */
export function useListener(o: ListenOpts) {
  const mic = useMicState();
  const on = o.active && usesMic();
  const tracker = useRef(new NoteTracker());
  const chordHits = useRef(0);
  const ref = useRef(o);
  ref.current = o;

  useEffect(() => {
    if (!on) return;
    void startMic();
  }, [on]);

  useMicLoop(on, () => {
    if (appPlaying()) {
      tracker.current.reset();
      chordHits.current = 0;
      return;
    }
    const cur = ref.current;
    if (cur.chord) {
      const r = readChord();
      if (!r?.analysis) {
        chordHits.current = 0;
        return;
      }
      const c = checkChord(r.analysis.chroma, cur.chord, [], r.analysis.soft);
      chordHits.current = c.ok ? chordHits.current + 1 : 0;
      if (chordHits.current >= 2) {
        chordHits.current = -8; // pas de double validation pendant que l'accord résonne
        cur.onChord?.();
      }
      return;
    }
    const r = readNote();
    if (!r) return;
    const ev = tracker.current.push(r.pitch, r.level, performance.now(), micGate(), r.onset);
    if (ev) cur.onNote?.(ev.midi);
  }, 50);

  return { mic, retry: () => void startMic() };
}
