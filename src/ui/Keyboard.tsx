// Clavier de piano à l'écran : touches qui brillent, noms, doigts, groupes de noires, touches à toucher.
import { colorOf, isBlack, nameOf } from '../core/music';

export interface KeyboardProps {
  from: number;
  to: number;
  /** Touches qui brillent dans la couleur de leur note. */
  marks?: number[];
  /** Les marques clignotent doucement (la note à jouer). */
  glow?: boolean;
  /** Marque neutre (gris + flèche) : pour ne pas donner la réponse par la couleur. */
  neutral?: boolean;
  names?: boolean | number[];
  colors?: boolean;
  groups?: 2 | 3 | 'both';
  fingers?: Record<number, number>;
  /** Touches en vert (juste) ou rouge (faux) un instant. */
  flash?: { midi: number; ok: boolean } | null;
  onPress?: (midi: number) => void;
  flat?: boolean;
  label?: string;
}

const WW = 1;
const WH = 4.4;
const BW = 0.62;
const BH = 2.75;
/** Décalage de chaque touche noire par rapport à la fente entre deux blanches (comme sur un vrai piano). */
const BLACK_SHIFT: Record<number, number> = { 1: -0.08, 3: 0.08, 6: -0.1, 8: 0, 10: 0.1 };

export function Keyboard(p: KeyboardProps) {
  const whites: number[] = [];
  for (let m = p.from; m <= p.to; m++) if (!isBlack(m)) whites.push(m);
  const xOfWhite = new Map(whites.map((m, i) => [m, i * WW]));
  const blacks: { m: number; x: number }[] = [];
  for (let m = p.from; m <= p.to; m++) {
    if (!isBlack(m)) continue;
    const left = xOfWhite.get(m - 1);
    if (left === undefined) continue;
    blacks.push({ m, x: left + WW - BW / 2 + (BLACK_SHIFT[m % 12] ?? 0) });
  }
  const width = whites.length * WW;
  const marks = new Set(p.marks ?? []);
  const named = (m: number) => p.names === true ? !isBlack(m) : Array.isArray(p.names) && p.names.includes(m);
  const flashCls = (m: number) => (p.flash && p.flash.midi === m ? (p.flash.ok ? ' key-ok' : ' key-bad') : '');
  const press = (m: number) => (e: PointerEvent) => {
    if (!p.onPress) return;
    e.preventDefault();
    p.onPress(m);
  };

  // Groupes de noires entourés : 2 (do♯ ré♯) ou 3 (fa♯ sol♯ la♯).
  const groups: { x: number; w: number }[] = [];
  if (p.groups) {
    for (let i = 0; i < blacks.length; i++) {
      const pc = blacks[i].m % 12;
      const want2 = p.groups === 2 || p.groups === 'both';
      const want3 = p.groups === 3 || p.groups === 'both';
      if (pc === 1 && want2 && blacks[i + 1]?.m % 12 === 3) groups.push({ x: blacks[i].x, w: blacks[i + 1].x + BW - blacks[i].x });
      if (pc === 6 && want3 && blacks[i + 2]?.m % 12 === 10) groups.push({ x: blacks[i].x, w: blacks[i + 2].x + BW - blacks[i].x });
    }
  }

  return (
    <svg class="kb" viewBox={`-0.1 -0.6 ${width + 0.2} ${WH + 1.5}`} role="img" aria-label={p.label ?? 'Clavier de piano'}>
      {whites.map((m) => {
        const x = xOfWhite.get(m)!;
        const lit = marks.has(m);
        const c = colorOf(m);
        return (
          <g key={m} class={p.onPress ? 'tap' : ''} onPointerDown={press(m)}>
            <rect class={'w' + flashCls(m)} x={x} y={0} width={WW} height={WH} rx={0.12} style={lit ? { fill: p.neutral ? '#c3cbe0' : c } : undefined} />
            {lit && p.neutral ? <path class="pointer" d={`M${x + 0.2} -0.55 h0.6 l-0.3 0.45 z`} fill="#1f2a5a" /> : null}
            {lit && p.glow ? <rect x={x} y={0} width={WW} height={WH} rx={0.12} fill="#fff" class="glow" opacity={0} /> : null}
            {p.colors && !lit ? <rect x={x + 0.1} y={WH - 0.35} width={WW - 0.2} height={0.22} rx={0.11} fill={c} /> : null}
            {named(m) ? (
              <text x={x + WW / 2} y={WH - 0.62} font-size={0.42} fill={lit ? '#fff' : c} stroke={lit ? 'none' : '#1f2a5a'} stroke-width={lit ? 0 : 0.012}>
                {nameOf(m)}
              </text>
            ) : null}
            {p.fingers?.[m] ? <Finger x={x + WW / 2} y={WH + 0.42} n={p.fingers[m]} /> : null}
          </g>
        );
      })}
      {groups.map((g, i) => (
        <rect key={i} class="group" x={g.x - 0.12} y={-0.18} width={g.w + 0.24} height={BH + 0.36} rx={0.25} />
      ))}
      {blacks.map(({ m, x }) => {
        const lit = marks.has(m);
        return (
          <g key={m} class={p.onPress ? 'tap' : ''} onPointerDown={press(m)}>
            <rect class={'b' + flashCls(m)} x={x} y={0} width={BW} height={BH} rx={0.08} style={lit ? { fill: p.neutral ? '#8a94b8' : colorOf(m - 1) } : undefined} />
            {lit && p.glow ? <rect x={x} y={0} width={BW} height={BH} rx={0.08} fill="#fff" class="glow" opacity={0} /> : null}
            {named(m) ? (
              <text x={x + BW / 2} y={-0.18} font-size={0.36} fill="#1f2a5a">
                {nameOf(m, p.flat)}
              </text>
            ) : null}
            {p.fingers?.[m] ? <Finger x={x + BW / 2} y={BH + 0.45} n={p.fingers[m]} /> : null}
          </g>
        );
      })}
    </svg>
  );
}

function Finger({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={0.34} fill="#1f2a5a" />
      <text x={x} y={y + 0.15} font-size={0.42} fill="#fff">
        {n}
      </text>
    </g>
  );
}
