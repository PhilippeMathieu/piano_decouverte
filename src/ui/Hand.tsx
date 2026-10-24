// Une main vue de dessus, doigts numérotés (1 = pouce). Main gauche : en miroir.

/** Doigts de la main droite : position du bout, angle, longueur (repère 0..240). */
const FINGERS = [
  { x: 52, y: 128, a: -48, l: 70 }, // 1 pouce
  { x: 92, y: 52, a: -10, l: 92 }, // 2
  { x: 126, y: 40, a: 0, l: 100 }, // 3
  { x: 160, y: 50, a: 9, l: 94 }, // 4
  { x: 190, y: 76, a: 18, l: 78 } // 5
];

export function Hand({ hand, finger, labels }: { hand: 'd' | 'g'; finger?: number; labels?: string[] }) {
  const mirror = hand === 'g';
  return (
    <svg class="hand" viewBox="0 0 240 260" role="img" aria-label={(hand === 'd' ? 'Main droite' : 'Main gauche') + (finger ? `, doigt ${finger}` : '')}>
      <g transform={mirror ? 'translate(240 0) scale(-1 1)' : undefined}>
        {FINGERS.map((f, i) => (
          <rect
            key={i}
            class={'skin' + (finger === i + 1 ? ' lit' : '')}
            x={f.x - 15}
            y={f.y - 6}
            width={30}
            height={f.l + 30}
            rx={15}
            transform={`rotate(${f.a} ${f.x} ${f.y + f.l})`}
          />
        ))}
        <rect class="skin" x={62} y={128} width={140} height={112} rx={44} />
        {/* Le bas des doigts, posé sur la paume, sans trait. */}
        <rect x={72} y={130} width={120} height={30} rx={10} fill="var(--skin)" />
      </g>
      {FINGERS.map((f, i) => {
        const ang = (f.a * Math.PI) / 180;
        // Bout du doigt, après rotation autour de sa base.
        const dy = 14 - f.l;
        let tx = f.x - dy * Math.sin(ang);
        const ty = f.y + f.l + dy * Math.cos(ang);
        if (mirror) tx = 240 - tx;
        return (
          <text key={i} x={tx} y={ty + 9}>
            {labels?.[i] ?? i + 1}
          </text>
        );
      })}
    </svg>
  );
}
