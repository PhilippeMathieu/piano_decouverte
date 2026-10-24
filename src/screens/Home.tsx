// Accueil : bonjour, la prochaine chose à faire, et le chemin des 10 étapes.
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { STEPS } from '../content/steps';
import { doneToday, nextThing, stepDone, stepShare, streak, totalStars, useStore } from '../core/progress';
import { WhereTag, go } from '../ui/bits';
import { Mascot } from '../ui/Mascot';
import { audio } from '../core/sound';
import { goalText } from './Exercise';
import { HoldButton } from './Parents';

export function Home() {
  const { progress, settings } = useStore();
  const next = nextThing(progress);
  const days = streak(progress);
  const today = doneToday(progress);
  const current = next?.step.id ?? 0;
  return (
    <div class="page">
      <div class="top">
        <div class="hello" style={{ flex: 1, minWidth: 0 }}>
          <Mascot mood="hello" />
          <div class="bubble">{settings.name ? `Bonjour ${settings.name} !` : 'Bonjour !'}</div>
        </div>
        <span class="pill" aria-label={`${totalStars(progress)} étoiles`}>
          ⭐ {totalStars(progress)}
        </span>
        {days > 0 ? (
          <span class="pill" aria-label={`${days} jours de suite`}>
            🔥 {days}
          </span>
        ) : null}
      </div>

      <div class="home">
        <div class="next">
          <div class="card">
            {next ? (
              <>
                <div class="next-what">
                  <div class="next-icon" style={{ background: next.step.color }}>
                    {next.type === 'lesson' ? '📖' : next.step.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div class="sub">
                      Étape {next.step.id} · {next.type === 'lesson' ? 'Leçon' : 'Exercice'}
                    </div>
                    <h2>{next.type === 'lesson' ? next.title : next.ex.title}</h2>
                  </div>
                </div>
                {next.type === 'exercise' ? (
                  <div class="row" style={{ flexWrap: 'wrap' }}>
                    <WhereTag where={next.ex.where} />
                    <span class="hint">🎯 {goalText(next.ex)}</span>
                  </div>
                ) : null}
                <button
                  class="btn go big wide"
                  onClick={() => {
                    audio();
                    go(next.type === 'lesson' ? `#/lecon/${next.id}` : `#/exercice/${next.ex.id}`);
                  }}
                >
                  C’est parti !
                </button>
              </>
            ) : (
              <div class="stack" style={{ justifyItems: 'center', textAlign: 'center' }}>
                <div class="big-emoji">🏆</div>
                <h2>Tout le chemin est fini !</h2>
                <p>Rejoue tes chansons préférées pour gagner toutes les étoiles.</p>
              </div>
            )}
          </div>
          <div class="today" aria-label={`Aujourd’hui : ${Math.min(today, settings.daily)} exercices réussis sur ${settings.daily}`}>
            Aujourd’hui
            <div class="today-dots">
              {Array.from({ length: settings.daily }, (_, k) => (
                <span key={k} class={k < today ? 'on' : ''} />
              ))}
            </div>
            {today >= settings.daily ? '🎉' : ''}
          </div>
          <div class="row" style={{ flexWrap: 'wrap' }}>
            <button class="btn small" onClick={() => go('#/autocollants')}>
              📒 Mes autocollants
            </button>
            <span class="spacer" />
            <HoldButton onDone={() => go('#/parents')} />
          </div>
        </div>

        <Path current={current} />
      </div>
    </div>
  );
}

/** Le chemin : des pierres reliées par une route qui serpente. */
function Path({ current }: { current: number }) {
  const { progress } = useStore();
  const box = useRef<HTMLDivElement>(null);
  const [road, setRoad] = useState('');
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const draw = () => {
      const b = el.getBoundingClientRect();
      const pts = [...el.querySelectorAll('.stone')].map((s) => {
        const r = s.getBoundingClientRect();
        return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top];
      });
      if (pts.length < 2) return;
      let d = `M${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1];
        const [x1, y1] = pts[i];
        const my = (y0 + y1) / 2;
        d += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
      }
      setRoad(d);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div class="path" ref={box}>
      <svg class="road" aria-hidden="true">
        <path d={road} />
        <path class="dash" d={road} />
      </svg>
      <div class="stops">
        {STEPS.map((s) => {
          const done = stepDone(s, progress);
          const share = stepShare(s, progress);
          return (
            <button key={s.id} class={'stop' + (s.id === current ? ' current' : '')} onClick={() => go(`#/etape/${s.id}`)}>
              <span class="stone" style={{ '--c': s.color } as Record<string, string>}>
                <span class="num">{s.id}</span>
                {s.icon}
                {done ? <span class="done">{s.sticker}</span> : null}
              </span>
              <span class="stop-label">
                <b>{s.title}</b>
                <span class="meter" aria-label={`${Math.round(share * 100)} % fait`}>
                  <i style={{ width: `${share * 100}%` }} />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
