// Lire une consigne à voix haute (voix française de l'appareil).

let voice: SpeechSynthesisVoice | null = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('fr'));
  // Préférer une voix française de France, et les voix « améliorées » d'Apple quand il y en a.
  voice = vs.find((v) => /fr-FR/i.test(v.lang) && /enhanced|premium|amélior/i.test(v.name)) ?? vs.find((v) => /fr-FR/i.test(v.lang)) ?? vs[0] ?? null;
}
if (typeof speechSynthesis !== 'undefined') {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export const canSpeak = () => typeof speechSynthesis !== 'undefined';

/** Texte lisible : sans émojis ni symboles, « 2ᵉ » → « 2e », ♯ → dièse. */
export function forSpeech(text: string): string {
  return text
    .replace(/♯/g, ' dièse')
    .replace(/♭/g, ' bémol')
    .replace(/ʳᵉ/g, 're')
    .replace(/ᵉ/g, 'e')
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speak(text: string) {
  if (!canSpeak()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(forSpeech(text));
  u.lang = 'fr-FR';
  if (voice) u.voice = voice;
  u.rate = 0.95;
  u.pitch = 1.05;
  speechSynthesis.speak(u);
}
export const hush = () => canSpeak() && speechSynthesis.cancel();
