// Espace parents (on y entre en maintenant le bouton) : prénom, voix, micro, objectif du jour, remise à zéro.
import { useEffect, useRef, useState } from 'preact/hooks';
import { resetProgress, setSettings, totalStars, maxStars, useStore, stickers, bonusStickers } from '../core/progress';
import { go } from '../ui/bits';
import { canSpeak, speak } from '../core/speak';
import { MIC_MESSAGES, micGate, readNote, startMic, useMicLoop, useMicRelease, useMicState } from '../core/listen/mic';
import { nameOf } from '../core/music';
import { MORE_EXERCISES, STEPS } from '../content/steps';

/** Un bouton qu'il faut maintenir 1,5 s : l'enfant ne tombe pas dans les réglages par hasard. */
export function HoldButton({ onDone }: { onDone: () => void }) {
  const [p, setP] = useState(0);
  const timer = useRef(0);
  const startT = useRef(0);
  const stop = () => {
    clearInterval(timer.current);
    setP(0);
  };
  const begin = (e: Event) => {
    e.preventDefault();
    startT.current = performance.now();
    clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      const x = (performance.now() - startT.current) / 1500;
      setP(Math.min(1, x));
      if (x >= 1) {
        stop();
        onDone();
      }
    }, 30);
  };
  useEffect(() => () => clearInterval(timer.current), []);
  return (
    <button class="btn small hold" onPointerDown={begin} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onContextMenu={(e) => e.preventDefault()}>
      ⚙️ Parents <span class="hint">(maintenir)</span>
      <i style={{ width: `${p * 100}%` }} />
    </button>
  );
}

export function Parents() {
  const { settings, progress } = useStore();
  const [confirm, setConfirm] = useState(false);
  const done = STEPS.filter((s) => stickers(progress).includes(s.sticker)).length;
  return (
    <div class="page" style={{ maxWidth: '720px' }}>
      <div class="top">
        <button class="btn round" aria-label="Retour" onClick={() => go('#/')}>
          ←
        </button>
        <h1>Espace parents</h1>
      </div>
      <div class="stack">
        <div class="card form">
          <div class="field">
            <label for="name">Prénom de l’enfant</label>
            <input id="name" type="text" value={settings.name} maxLength={20} autocomplete="off" onInput={(e) => setSettings({ name: (e.target as HTMLInputElement).value })} />
          </div>
          <div class="field">
            <span class="label">Écoute au piano</span>
            <div class="seg">
              <button class="btn small" aria-pressed={settings.listen === 'micro'} onClick={() => setSettings({ listen: 'micro' })}>
                🎤 Micro
              </button>
              <button class="btn small" aria-pressed={settings.listen === 'sans'} onClick={() => setSettings({ listen: 'sans' })}>
                ✋ Sans micro
              </button>
            </div>
            <p class="hint">Micro : l’iPad entend les notes et avance seul. Sans micro : un adulte valide chaque réponse.</p>
          </div>
          <div class="field">
            <span class="label">Lire les consignes à voix haute</span>
            <div class="seg">
              <button class="btn small" aria-pressed={settings.voice} onClick={() => setSettings({ voice: true })}>
                🔊 Oui
              </button>
              <button class="btn small" aria-pressed={!settings.voice} onClick={() => setSettings({ voice: false })}>
                Non
              </button>
              {canSpeak() ? (
                <button class="btn small ghost" onClick={() => speak('Bonjour ! Joue la note qui brille.')}>
                  Essayer la voix
                </button>
              ) : null}
            </div>
            <p class="hint">Le bouton 🔊 à côté de chaque consigne marche dans tous les cas.</p>
          </div>
          <div class="field">
            <span class="label">Objectif du jour</span>
            <div class="seg">
              {[2, 3, 5].map((n) => (
                <button key={n} class="btn small" aria-pressed={settings.daily === n} onClick={() => setSettings({ daily: n })}>
                  {n} exercices
                </button>
              ))}
            </div>
          </div>
        </div>

        <MicTest />

        <div class="card stack">
          <h3>Progrès</h3>
          <p>
            {done} étape{done > 1 ? 's' : ''} finie{done > 1 ? 's' : ''} sur {STEPS.length} · {totalStars(progress)} étoiles sur {maxStars()}.
          </p>
          <p class="hint">Tout est enregistré sur cet appareil seulement (pas de compte).</p>
          {confirm ? (
            <div class="row" style={{ flexWrap: 'wrap' }}>
              <span>Effacer toutes les étoiles et leçons ?</span>
              <button
                class="btn small no"
                onClick={() => {
                  resetProgress();
                  setConfirm(false);
                }}
              >
                Oui, effacer
              </button>
              <button class="btn small" onClick={() => setConfirm(false)}>
                Non
              </button>
            </div>
          ) : (
            <button class="btn small" style={{ justifySelf: 'start' }} onClick={() => setConfirm(true)}>
              Recommencer à zéro…
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Tester le micro : niveau et note entendue. */
function MicTest() {
  const mic = useMicState();
  const [lvl, setLvl] = useState(0);
  const [note, setNote] = useState<string>('');
  useMicRelease();
  useMicLoop(mic === 'on', () => {
    const r = readNote();
    if (!r) return;
    setLvl(Math.min(1, r.level / (micGate() * 8)));
    if (r.pitch && r.pitch.clarity > 0.85) setNote(nameOf(Math.round(r.pitch.midi)));
  }, 80);
  return (
    <div class="card stack">
      <h3>Tester le micro</h3>
      {mic === 'on' ? (
        <>
          <div class="level" aria-label="Niveau du micro">
            <i style={{ width: `${lvl * 100}%` }} />
          </div>
          <p>
            Note entendue : <b style={{ fontSize: '1.4rem' }}>{note || '—'}</b>
          </p>
          <p class="hint">Joue quelques notes au piano : le nom doit s’afficher. Si rien ne s’affiche, rapproche l’iPad ou joue plus fort.</p>
        </>
      ) : (
        <>
          {mic !== 'off' ? <p class="hint">{MIC_MESSAGES[mic]}</p> : null}
          <button class="btn small" style={{ justifySelf: 'start' }} onClick={() => void startMic()}>
            🎤 Démarrer le test
          </button>
        </>
      )}
    </div>
  );
}

export function Stickers() {
  const { progress } = useStore();
  const got = stickers(progress);
  const bonus = bonusStickers(progress);
  return (
    <div class="page">
      <div class="top">
        <button class="btn round" aria-label="Retour" onClick={() => go('#/')}>
          ←
        </button>
        <h1>Mes autocollants</h1>
        <span class="pill">
          {got.length} / {STEPS.length}
        </span>
      </div>
      <p style={{ marginBottom: '16px' }}>Finis une étape pour gagner son autocollant.</p>
      <div class="sticker-book">
        {STEPS.map((s) => {
          const has = got.includes(s.sticker);
          return (
            <button key={s.id} class={'sticker-slot' + (has ? '' : ' empty')} style={{ border: 0 }} onClick={() => go(`#/etape/${s.id}`)}>
              <span>{s.sticker}</span>
              {s.title}
            </button>
          );
        })}
      </div>
      <h2 style={{ margin: '26px 0 6px' }}>
        Autocollants spéciaux <span class="pill">{bonus.length} / {MORE_EXERCISES.length}</span>
      </h2>
      <p style={{ marginBottom: '16px' }}>Réussis un défi ou une chanson bonus (« Pour aller plus loin ») pour les gagner.</p>
      <div class="sticker-book">
        {MORE_EXERCISES.map((e) => {
          const has = bonus.includes(e.bonus!);
          return (
            <button key={e.id} class={'sticker-slot' + (has ? '' : ' empty')} style={{ border: 0 }} onClick={() => go(`#/exercice/${e.id}`)}>
              <span>{e.bonus}</span>
              {e.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
