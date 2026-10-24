// Une main vue de dessus, doigts numérotés (1 = pouce). Main gauche : en miroir.

/** Main droite (repère 240 × 260) : 4 doigts droits, le pouce penché vers la gauche. */
const FINGERS = [
  { cx: 86, top: 22, w: 30 }, // 2
  { cx: 120, top: 6, w: 31 }, // 3
  { cx: 154, top: 18, w: 30 }, // 4
  { cx: 186, top: 48, w: 27 } // 5
];
const BASE_Y = 160;
const THUMB = { x: 78, y: 200, len: 96, w: 32, angle: -48 };

export function Hand({ hand, finger, labels }: { hand: 'd' | 'g'; finger?: number; labels?: string[] }) {
  const mirror = hand === 'g';
  const mx = (x: number) => (mirror ? 240 - x : x);
  const cls = (n: number) => 'skin' + (finger === n ? ' lit' : '');
  // Bout du pouce : le vecteur (0, -longueur) tourné de l'angle (sens SVG).
  const a = (THUMB.angle * Math.PI) / 180;
  const tip = (d: number) => ({ x: THUMB.x + d * Math.sin(a), y: THUMB.y - d * Math.cos(a) });
  const t = tip(THUMB.len - 20);
  const label = (n: number) => labels?.[n - 1] ?? String(n);
  return (
    <svg class="hand" viewBox="0 0 240 260" role="img" aria-label={(hand === 'd' ? 'Main droite' : 'Main gauche') + (finger ? `, doigt ${finger} en jaune` : '')}>
      <g transform={mirror ? 'translate(240 0) scale(-1 1)' : undefined}>
        <rect
          class={cls(1)}
          x={THUMB.x - THUMB.w / 2}
          y={THUMB.y - THUMB.len}
          width={THUMB.w}
          height={THUMB.len + 10}
          rx={THUMB.w / 2}
          transform={`rotate(${THUMB.angle} ${THUMB.x} ${THUMB.y})`}
        />
        {FINGERS.map((f, i) => (
          <rect key={i} class={cls(i + 2)} x={f.cx - f.w / 2} y={f.top} width={f.w} height={BASE_Y - f.top + 20} rx={f.w / 2} />
        ))}
        <path class="skin" d="M70 150 Q70 136 88 138 L190 138 Q204 138 202 158 L198 214 Q192 252 148 254 L116 254 Q76 252 72 214 Z" />
      </g>
      <text x={mx(t.x)} y={t.y + 9}>
        {label(1)}
      </text>
      {FINGERS.map((f, i) => (
        <text key={i} x={mx(f.cx)} y={f.top + 30}>
          {label(i + 2)}
        </text>
      ))}
    </svg>
  );
}
