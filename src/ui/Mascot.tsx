// Croche, la mascotte : une note de musique toute ronde, avec son crochet en guise de houppe.

export type Mood = 'hello' | 'happy' | 'oops' | 'think';

export function Mascot({ mood = 'hello' }: { mood?: Mood }) {
  return (
    <svg class="mascot" viewBox="0 0 120 120" role="img" aria-label="Croche, la mascotte">
      {/* Hampe et crochet */}
      <path d="M78 50 V12" stroke="#1f2a5a" stroke-width="7" stroke-linecap="round" />
      <path d="M78 12 q 4 14 20 20 q 10 6 6 20" fill="none" stroke="#1f2a5a" stroke-width="7" stroke-linecap="round" />
      {/* Corps : la tête de note */}
      <ellipse cx="56" cy="72" rx="40" ry="34" fill="#1f2a5a" transform="rotate(-14 56 72)" />
      <ellipse cx="46" cy="60" rx="12" ry="6" fill="#fff" opacity="0.16" transform="rotate(-24 46 60)" />
      {/* Yeux */}
      {mood === 'happy' ? (
        <>
          <path d="M34 70 q 7 -8 14 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" />
          <path d="M60 64 q 7 -8 14 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" />
        </>
      ) : (
        <>
          <circle cx="41" cy="68" r="9" fill="#fff" />
          <circle cx="67" cy="62" r="9" fill="#fff" />
          <circle cx={mood === 'think' ? 44 : 43} cy={mood === 'think' ? 64 : 70} r="4.5" fill="#1f2a5a" />
          <circle cx={mood === 'think' ? 70 : 69} cy={mood === 'think' ? 58 : 64} r="4.5" fill="#1f2a5a" />
        </>
      )}
      {/* Joues */}
      <ellipse cx="32" cy="84" rx="6" ry="4" fill="#ff8fa3" />
      <ellipse cx="80" cy="76" rx="6" ry="4" fill="#ff8fa3" />
      {/* Bouche */}
      {mood === 'oops' ? (
        <ellipse cx="58" cy="86" rx="5" ry="6" fill="#ffc93c" />
      ) : mood === 'think' ? (
        <path d="M50 88 h14" stroke="#ffc93c" stroke-width="4.5" stroke-linecap="round" />
      ) : (
        <path d={mood === 'happy' ? 'M44 82 q 14 18 28 -4 z' : 'M48 84 q 10 9 20 -3'} fill={mood === 'happy' ? '#ffc93c' : 'none'} stroke="#ffc93c" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
      )}
    </svg>
  );
}
