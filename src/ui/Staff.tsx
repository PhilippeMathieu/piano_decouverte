// Portée en SVG : clé de sol, clé de fa ou les deux ; notes seules ou avec leurs durées (chansons).
import { GLYPHS } from './staffGlyphs';
import { Clef, colorOf, nameOf, staffY } from '../core/music';

export interface StaffItem {
  notes: number[];
  /** Durée en temps (noire = 1) : utilisée si `rhythm`. */
  dur?: number;
  /** Début en temps : par défaut, à la suite de l'élément précédent de la même portée. */
  t?: number;
  /** Portée de la note (grande portée) : par défaut sol à partir du do du milieu. */
  staff?: Clef;
  state?: 'now' | 'done' | 'bad';
  finger?: number;
}

export interface StaffProps {
  clef: Clef | 'grand';
  items: StaffItem[];
  rhythm?: boolean;
  /** Temps par mesure : barres de mesure (avec `rhythm`). */
  beats?: number;
  /** Première barre de mesure (en temps, depuis le début affiché) : levée, ou phrase qui commence en cours de mesure. */
  firstBar?: number;
  /** Têtes de notes dans la couleur de la note. */
  colored?: boolean;
  /** Nom des notes sous la portée. */
  names?: boolean;
  label?: string;
  /** Largeur minimale (en interlignes), pour garder la même échelle d'un écran à l'autre. */
  minWidth?: number;
}

const FA_TOP = 8; // grande portée : la ligne du haut de la clé de fa
const X0 = 4.4;

export function Staff(p: StaffProps) {
  const grand = p.clef === 'grand';
  const staffOf = (it: StaffItem): Clef => it.staff ?? (p.clef === 'fa' ? 'fa' : p.clef === 'sol' ? 'sol' : it.notes[0] < 60 ? 'fa' : 'sol');
  const top = (c: Clef) => (grand && c === 'fa' ? FA_TOP : 0);
  const minDur = Math.min(1, ...p.items.map((i) => i.dur ?? 1));
  const k = p.rhythm ? (minDur < 1 ? 3.1 : 2.3) : 2.8;

  // Positions : au temps (rythme) ou à intervalles réguliers.
  const clock: Record<Clef, number> = { sol: 0, fa: 0 };
  const placed = p.items.map((it, i) => {
    const c = staffOf(it);
    let x: number;
    if (p.rhythm) {
      const t = it.t ?? clock[c];
      clock[c] = t + (it.dur ?? 1);
      x = X0 + t * k;
    } else x = X0 + i * k;
    return { it, c, x };
  });
  const end = p.rhythm ? Math.max(clock.sol, clock.fa) : p.items.length;
  const width = Math.max(p.minWidth ?? 0, X0 + end * k + 0.8);
  const y0 = -3.6;
  const height = (grand ? FA_TOP + 4 : 4) + (p.names ? 6.2 : 4.4) - y0;

  const bars: number[] = [];
  if (p.rhythm && p.beats) for (let b = p.firstBar || p.beats; b < end - 0.01; b += p.beats) bars.push(X0 + b * k - 0.55);

  const lines = (c: Clef) =>
    [0, 1, 2, 3, 4].map((l) => <line key={c + l} class="line" x1={0.2} x2={width - 0.2} y1={top(c) + l} y2={top(c) + l} />);

  return (
    <svg class="staff" viewBox={`0 ${y0} ${width} ${height}`} role="img" aria-label={p.label ?? 'Portée'}>
      {p.clef !== 'fa' ? lines('sol') : null}
      {p.clef !== 'sol' ? lines('fa') : null}
      {p.clef !== 'fa' ? <path class="ink" transform={`translate(0.8 3)`} d={GLYPHS.gClef.d} /> : null}
      {p.clef !== 'sol' ? <path class="ink" transform={`translate(0.8 ${top('fa') + 1})`} d={GLYPHS.fClef.d} /> : null}
      {grand ? <line class="bar" x1={0.2} x2={0.2} y1={0} y2={FA_TOP + 4} /> : null}
      {bars.map((x) => (
        <line key={x} class="bar" x1={x} x2={x} y1={grand ? 0 : 0} y2={grand ? FA_TOP + 4 : 4} />
      ))}
      {placed.map(({ it, c, x }, i) => (
        <Note key={i} it={it} clef={c} x={x} top={top(c)} rhythm={!!p.rhythm} colored={!!p.colored} names={!!p.names && !grand} />
      ))}
    </svg>
  );
}

function Note({ it, clef, x, top, rhythm, colored, names }: { it: StaffItem; clef: Clef; x: number; top: number; rhythm: boolean; colored: boolean; names: boolean }) {
  const dur = rhythm ? (it.dur ?? 1) : 4;
  const cx = x + 0.6;
  const ys = it.notes.map((m) => staffY(m, clef));
  const faded = it.state === 'done' ? 0.4 : 1;
  if (!it.notes.length) return <Rest x={cx} y={top + 2} dur={dur} />;
  const hollow = dur >= 2;
  const mid = ys.reduce((a, b) => a + b, 0) / ys.length;
  const up = mid >= 2;
  const stemX = up ? cx + 0.58 : cx - 0.58;
  const yTip = up ? Math.min(...ys) - 3.3 : Math.max(...ys) + 3.3;
  const yBase = up ? Math.max(...ys) : Math.min(...ys);
  const ledgers = new Set<number>();
  for (const y of ys) {
    for (let l = -1; l >= y; l--) ledgers.add(l);
    for (let l = 5; l <= y; l++) ledgers.add(l);
  }
  return (
    <g opacity={faded}>
      {it.state === 'now' ? <rect class="now-mark" x={cx - 1.15} y={top - 2.6} width={2.3} height={9.2} rx={0.9} /> : null}
      {[...ledgers].map((l) => (
        <line key={l} class="line" x1={cx - 1} x2={cx + 1} y1={top + l} y2={top + l} />
      ))}
      {dur < 4 ? <line class="stem" x1={stemX} x2={stemX} y1={top + yBase} y2={top + yTip} /> : null}
      {dur === 0.5 ? (
        <path class="stem" fill="none" d={up ? `M${stemX} ${top + yTip} q 0.2 1 1 1.6 q 0.5 0.6 0.2 1.6` : `M${stemX} ${top + yTip} q 0.2 -1 1 -1.6 q 0.5 -0.6 0.2 -1.6`} />
      ) : null}
      {it.notes.map((m, j) => {
        const y = top + ys[j];
        const fill = it.state === 'bad' ? '#ff6b6b' : colored ? colorOf(m) : '#1f2a5a';
        return (
          <g key={m}>
            <ellipse
              cx={cx}
              cy={y}
              rx={0.62}
              ry={0.44}
              transform={`rotate(-20 ${cx} ${y})`}
              fill={hollow ? '#fff' : fill}
              stroke={hollow ? fill : '#1f2a5a'}
              stroke-width={hollow ? 0.2 : colored ? 0.06 : 0}
            />
            {dur === 1.5 || dur === 3 ? <circle cx={cx + 1.05} cy={Number.isInteger(ys[j]) ? y - 0.5 : y} r={0.17} fill="#1f2a5a" /> : null}
            {names ? (
              <text x={cx} y={7.4} font-size={1.2} fill={colorOf(m)} stroke="#1f2a5a" stroke-width={0.03}>
                {nameOf(m)}
              </text>
            ) : null}
          </g>
        );
      })}
      {it.finger ? (
        <text x={cx} y={top + Math.min(-1.8, Math.min(...ys) - 1.3, up ? yTip - 0.4 : 99)} font-size={1.3} fill="#1f2a5a">
          {it.finger}
        </text>
      ) : null}
    </g>
  );
}

/** Silences : soupir (1 temps), demi-pause (2), pause (4). */
function Rest({ x, y, dur }: { x: number; y: number; dur: number }) {
  if (dur >= 4) return <rect class="ink" x={x - 0.6} y={y - 1} width={1.2} height={0.5} />;
  if (dur >= 2) return <rect class="ink" x={x - 0.6} y={y - 0.5} width={1.2} height={0.5} />;
  return <path class="stem" fill="none" stroke-width={0.28} stroke-linejoin="round" d={`M${x - 0.25} ${y - 1.5} l 0.55 0.75 l -0.5 0.6 l 0.55 0.75 q -0.7 -0.3 -0.5 0.6`} />;
}
