// Outils communs aux exercices : réponse avec retour, tirage sans répétition, écoute au piano.
import { useEffect, useRef, useState } from 'preact/hooks';
import { usesMic } from '../core/listen';
import { MIC_MESSAGES, MicState } from '../core/listen/mic';

export interface QProps<A> {
  act: A;
  qi: number;
  /** Mémoire partagée entre les questions d'un même exercice (pour ne pas reposer la même). */
  memo: Record<string, unknown>;
  done: (ok: boolean) => void;
}

const PRAISE = ['Bravo !', 'Super !', 'Génial !', 'Oui !', 'Bien joué !', 'Parfait !'];
export const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

/** Retour après une réponse : message, puis question suivante (plus de temps pour lire une erreur). */
export function useAnswer(done: (ok: boolean) => void) {
  const [fb, setFb] = useState<{ ok: boolean; msg: string } | null>(null);
  const t = useRef(0);
  useEffect(() => () => clearTimeout(t.current), []);
  const answer = (ok: boolean, msg?: string) => {
    if (fb) return;
    setFb({ ok, msg: msg ?? (ok ? praise() : 'Oups !') });
    t.current = window.setTimeout(() => done(ok), ok ? 900 : 1900);
  };
  return { fb, answer, locked: !!fb };
}

export function Feedback({ fb }: { fb: { ok: boolean; msg: string } | null }) {
  return (
    <div class={'feedback' + (fb ? (fb.ok ? ' ok' : ' bad') : '')} role="status" aria-live="polite">
      {fb?.msg ?? ''}
    </div>
  );
}

/** Tirage au hasard, jamais deux fois de suite le même (clé = nom de la mémoire). */
export function pick<T>(memo: Record<string, unknown>, key: string, pool: T[], same: (a: T, b: T) => boolean = (a, b) => a === b): T {
  const last = memo[key] as T | undefined;
  const options = pool.length > 1 && last !== undefined ? pool.filter((x) => !same(x, last)) : pool;
  const v = options[Math.floor(Math.random() * options.length)];
  memo[key] = v;
  return v;
}
export const shuffle = <T,>(a: T[]): T[] => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/** État de l'écoute au piano, sous la consigne. */
export function ListenState({ mic, retry }: { mic: MicState; retry: () => void }) {
  if (!usesMic()) return <div class="listen-state">✋ Sans micro : dis si c’est réussi.</div>;
  if (mic === 'on')
    return (
      <div class="listen-state">
        <span class="ear" /> J’écoute ton piano…
      </div>
    );
  if (mic === 'asking') return <div class="listen-state">{MIC_MESSAGES.asking}</div>;
  return (
    <div class="listen-state">
      <span class="ear off" /> {mic === 'off' ? 'Le micro est coupé.' : MIC_MESSAGES[mic]}
      <button class="btn small" onClick={retry}>
        🎤 Écouter
      </button>
    </div>
  );
}

/** Sans micro : quelqu'un dit si c'est juste. */
export function SelfCheck({ onOk, onNo, okLabel = '✅ Réussi', noLabel = '❌ Raté' }: { onOk: () => void; onNo: () => void; okLabel?: string; noLabel?: string }) {
  return (
    <div class="answers">
      <button class="btn ok" onClick={onOk}>
        {okLabel}
      </button>
      <button class="btn no" onClick={onNo}>
        {noLabel}
      </button>
    </div>
  );
}
