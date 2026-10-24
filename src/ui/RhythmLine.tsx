// Un rythme écrit sur une seule ligne : noires, blanches, rondes, croches (liées par 2) et soupirs.
import { Beat } from '../core/rhythm';

export function RhythmLine({ beats, states, now, per = 4 }: { beats: Beat[]; states?: ('ok' | 'bad' | undefined)[]; now?: number; per?: number }) {
  const k = 3;
  const x0 = 1.2;
  let t = 0;
  let noteIdx = 0;
  const items = beats.map((b) => {
    const it = { b, x: x0 + t * k, t, i: b.rest ? -1 : noteIdx++ };
    t += b.dur;
    return it;
  });
  const width = x0 + t * k + 0.4;
  const Y = 3;
  const bars: number[] = [];
  for (let b = per; b < t; b += per) bars.push(x0 + b * k - 0.7);
  // Croches par deux, dans le même temps : une barre au lieu de deux crochets.
  const beamed = new Set<number>();
  const beams: [number, number][] = [];
  items.forEach((it, i) => {
    const nx = items[i + 1];
    if (it.b.dur === 0.5 && !it.b.rest && nx && nx.b.dur === 0.5 && !nx.b.rest && Number.isInteger(it.t) && !beamed.has(i)) {
      beamed.add(i).add(i + 1);
      beams.push([i, i + 1]);
    }
  });
  const color = (i: number) => (states?.[i] === 'ok' ? '#2fbf62' : states?.[i] === 'bad' ? '#ff6b6b' : '#1f2a5a');
  return (
    <svg class="staff" viewBox={`0 -1.6 ${width} 6.4`} role="img" aria-label="Rythme" style={{ maxWidth: `${Math.min(900, width * 34)}px` }}>
      <line class="line" x1={0.2} x2={width - 0.2} y1={Y} y2={Y} />
      {bars.map((x) => (
        <line key={x} class="bar" x1={x} x2={x} y1={Y - 1.6} y2={Y + 1.6} />
      ))}
      {items.map((it, i) => {
        const cx = it.x + 0.6;
        if (it.b.rest) {
          return (
            <path key={i} class="stem" fill="none" stroke-width={0.3} stroke-linejoin="round" d={`M${cx - 0.25} ${Y - 1.5} l 0.55 0.75 l -0.5 0.6 l 0.55 0.75 q -0.7 -0.3 -0.5 0.6`} />
          );
        }
        const c = color(it.i);
        const hollow = it.b.dur >= 2;
        const sx = cx + 0.58;
        return (
          <g key={i}>
            {now === it.i ? <rect class="now-mark" x={cx - 1.1} y={-1.4} width={2.2} height={6} rx={0.8} /> : null}
            {it.b.dur < 4 ? <line x1={sx} x2={sx} y1={Y} y2={Y - 3.2} stroke={c} stroke-width={0.14} /> : null}
            {it.b.dur === 0.5 && !beamed.has(i) ? <path fill="none" stroke={c} stroke-width={0.14} d={`M${sx} ${Y - 3.2} q 0.2 1 1 1.6 q 0.5 0.6 0.2 1.6`} /> : null}
            <ellipse
              cx={cx}
              cy={Y}
              rx={0.64}
              ry={0.46}
              transform={`rotate(-20 ${cx} ${Y})`}
              fill={hollow ? '#fff' : c}
              stroke={c}
              stroke-width={hollow ? 0.22 : 0}
            />
          </g>
        );
      })}
      {beams.map(([a, b]) => (
        <line key={a} x1={items[a].x + 0.6 + 0.58} x2={items[b].x + 0.6 + 0.58} y1={Y - 3.2} y2={Y - 3.2} stroke="#1f2a5a" stroke-width={0.42} />
      ))}
    </svg>
  );
}
