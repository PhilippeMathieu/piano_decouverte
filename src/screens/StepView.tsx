// Une étape : ses leçons, puis ses exercices (avec ou sans piano), et leurs étoiles.
import { STEPS } from '../content/steps';
import { starsOf, stepDone, useStore } from '../core/progress';
import { Stars, WhereTag, go } from '../ui/bits';
import { Missing, goalText } from './Exercise';

export function StepView({ id }: { id: number }) {
  const { progress } = useStore();
  const s = STEPS.find((x) => x.id === id);
  if (!s) return <Missing />;
  const prev = STEPS.find((x) => x.id === id - 1);
  const next = STEPS.find((x) => x.id === id + 1);
  return (
    <div class="page">
      <div class="top">
        <button class="btn round" aria-label="Retour au chemin" onClick={() => go('#/')}>
          ←
        </button>
        <div class="step-head" style={{ margin: 0, flex: 1, minWidth: 0 }}>
          <div class="stone" style={{ '--c': s.color } as Record<string, string>}>
            {s.icon}
          </div>
          <div>
            <div class="hint">Étape {s.id}</div>
            <h1>{s.title}</h1>
          </div>
        </div>
        {stepDone(s, progress) ? <span class="pill" title="Autocollant gagné">{s.sticker}</span> : null}
      </div>

      <div class="section-title">📖 Comprendre</div>
      <div class="tiles">
        {s.lessons.map((l) => {
          const read = progress.lessons[l.id];
          return (
            <button key={l.id} class={'tile' + (read ? ' read' : '')} onClick={() => go(`#/lecon/${l.id}`)}>
              <b>{l.title}</b>
              <span class="goal">
                {l.slides.length} cartes {read ? '· lue ✓' : ''}
              </span>
            </button>
          );
        })}
      </div>

      <div class="section-title">🎯 Exercices</div>
      <div class="tiles">
        {s.exercises.map((e) => (
          <button key={e.id} class="tile" onClick={() => go(`#/exercice/${e.id}`)}>
            <div class="row">
              <WhereTag where={e.where} />
              <span class="spacer" />
              <Stars n={starsOf(e.id, progress)} />
            </div>
            <b>{e.title}</b>
            <span class="goal">🎯 {goalText(e)}</span>
          </button>
        ))}
      </div>

      {s.more?.length ? (
        <>
          <div class="section-title">🚀 Pour aller plus loin</div>
          <p class="hint" style={{ margin: '-4px 0 10px' }}>
            En option : défis et chansons bonus. Chacun donne un autocollant spécial.
          </p>
          <div class="tiles">
            {s.more.map((e) => {
              const got = starsOf(e.id, progress) > 0;
              return (
                <button key={e.id} class="tile more" onClick={() => go(`#/exercice/${e.id}`)}>
                  <div class="row">
                    <WhereTag where={e.where} />
                    <span class="spacer" />
                    <span class={'bonus' + (got ? '' : ' off')} title={got ? 'Autocollant gagné' : 'Autocollant à gagner'}>
                      {e.bonus}
                    </span>
                  </div>
                  <b>{e.title}</b>
                  <span class="goal">🎯 {goalText(e)}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <div class="row" style={{ marginTop: '26px' }}>
        {prev ? (
          <button class="btn small" onClick={() => go(`#/etape/${prev.id}`)}>
            ◀ {prev.title}
          </button>
        ) : null}
        <span class="spacer" />
        {next ? (
          <button class="btn small" onClick={() => go(`#/etape/${next.id}`)}>
            {next.title} ▶
          </button>
        ) : null}
      </div>
    </div>
  );
}
