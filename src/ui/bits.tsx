// Petits éléments communs : étoiles, étiquette piano/écran, consigne lue à voix haute.
import { useEffect } from 'preact/hooks';
import type { Where } from '../content/types';
import { canSpeak, speak } from '../core/speak';
import { getSettings } from '../core/progress';

export function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return (
    <span class="stars" aria-label={`${n} étoile${n > 1 ? 's' : ''} sur ${of}`}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} class={i < n ? '' : 'off'}>
          ⭐
        </span>
      ))}
    </span>
  );
}

export function WhereTag({ where }: { where: Where }) {
  return where === 'piano' ? <span class="tag piano">🎹 Au piano</span> : <span class="tag ecran">📱 Sans piano</span>;
}

/** La consigne, avec un bouton pour l'entendre ; lue d'office si le réglage « voix » est actif. */
export function Say({ text, auto = true }: { text: string; auto?: boolean }) {
  useEffect(() => {
    if (auto && getSettings().voice) speak(text);
  }, [text]);
  return (
    <div class="say">
      <p>{text}</p>
      {canSpeak() ? (
        <button class="btn round small" aria-label="Écouter la consigne" onClick={() => speak(text)}>
          🔊
        </button>
      ) : null}
    </div>
  );
}

export const go = (hash: string) => {
  location.hash = hash;
};
