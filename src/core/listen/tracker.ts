// Transforme une suite de mesures (toutes les ~50 ms) en événements « nouvelle note ».
// Une attaque nette (le son remonte d'un coup) annonce une nouvelle note, même si c'est la même hauteur :
// la note est alors confirmée sur les mesures qui suivent (la fenêtre d'analyse contient encore l'ancienne note).
import { PitchResult } from './detect';

export interface NoteEvent {
  midi: number;
  /** Instant de la mesure qui a confirmé la note (ms). */
  t: number;
}

export class NoteTracker {
  private candidate: number | null = null;
  private count = 0;
  private current: number | null = null;
  /** Niveaux des 3 dernières mesures : une attaque peut monter en deux mesures. */
  private recent: number[] = [];
  private silent = 0;
  private frame = 0;
  private lastAttack = -99;

  constructor(
    public gate = 0.006,
    private minClarity = 0.85,
    private stableFrames = 2
  ) {}

  /**
   * Renvoie un événement quand une nouvelle note est confirmée.
   * onset : niveau sur une fenêtre courte (≈ 20 ms), plus nette pour voir une attaque ; par défaut, level.
   */
  push(pitch: PitchResult | null, level: number, t: number, gate = this.gate, onset = level): NoteEvent | null {
    this.frame++;
    // Une attaque : au moins 3 mesures après la précédente (une attaque s'étale sur 2 mesures).
    const low = this.recent.length ? Math.min(...this.recent) : Infinity;
    const attack = onset > low * 1.3 && onset - low > gate && level > gate * 2 && this.frame - this.lastAttack >= 3;
    // Après une attaque, on oublie les niveaux d'avant : sinon la note qui sonne passerait pour une nouvelle attaque.
    if (attack) this.recent = [];
    else this.recent.push(onset);
    if (this.recent.length > 3) this.recent.shift();
    if (attack) {
      this.lastAttack = this.frame;
      this.current = null;
      this.candidate = null;
      this.count = 0;
    }
    if (level < gate || !pitch || pitch.clarity < this.minClarity || Math.abs(pitch.midi - Math.round(pitch.midi)) > 0.4) {
      this.candidate = null;
      this.count = 0;
      if (level < gate && ++this.silent >= 2) this.current = null;
      return null;
    }
    this.silent = 0;
    const m = Math.round(pitch.midi);
    if (m === this.candidate) this.count++;
    else {
      this.candidate = m;
      this.count = 1;
    }
    if (this.count >= this.stableFrames && m !== this.current) {
      this.current = m;
      return { midi: m, t };
    }
    return null;
  }

  reset() {
    this.candidate = null;
    this.count = 0;
    this.current = null;
  }
}
