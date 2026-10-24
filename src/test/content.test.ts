import { describe, expect, it } from 'vitest';
import { ALL_EXERCISES, CHORDS, STEPS, lessonById } from '../content/steps';
import { SONGS } from '../content/songs';
import { parseTune, staffY, nameOf, midiOf, withFingers } from '../core/music';
import { guideOf, accepts, rangeOf } from '../ex/piano';
import { goalText } from '../screens/Exercise';

describe('notes et chansons', () => {
  it('lit une mélodie écrite', () => {
    const t = parseTune("do ré mi2 | sol, do' fa+c -2 do/mi/sol4 sib");
    expect(t.map((e) => e.notes)).toEqual([[60], [62], [64], [55], [72], [66], [], [60, 64, 67], [70]]);
    expect(t.map((e) => e.dur)).toEqual([1, 1, 2, 1, 1, 0.5, 2, 4, 1]);
  });
  it('refuse une note illisible', () => {
    expect(() => parseTune('do rx')).toThrow();
  });
  it('place les notes sur la portée', () => {
    expect(staffY(64, 'sol')).toBe(4); // mi : ligne du bas
    expect(staffY(60, 'sol')).toBe(5); // do : ligne supplémentaire
    expect(staffY(67, 'sol')).toBe(3); // sol : 2e ligne
    expect(staffY(53, 'fa')).toBe(1); // fa : 4e ligne (entre les points)
    expect(staffY(48, 'fa')).toBe(2.5); // do 3 : 2e interligne
  });
  it('nomme les notes', () => {
    expect(nameOf(61)).toBe('do♯');
    expect(nameOf(61, true)).toBe('ré♭');
    expect(midiOf('la', 3)).toBe(57);
  });
  it.each(SONGS.map((s) => [s.title, s] as const))('%s : phrases, doigts et mesures cohérents', (_, s) => {
    const notes = s.tune.filter((e) => e.notes.length);
    expect(s.phrases.reduce((a, b) => a + b, 0)).toBe(notes.length);
    const fingered = notes.filter((e) => e.finger !== undefined).length;
    expect([0, notes.length]).toContain(fingered);
    // Chaque phrase tombe juste sur les mesures (levée comprise pour l'anniversaire).
    const beats = s.tune.reduce((a, e) => a + e.dur, 0);
    if (s.id !== 'anniv') expect(beats % s.beats).toBe(0);
    if (s.left) expect(s.left.reduce((a, e) => a + e.dur, 0)).toBe(beats);
    // Tout tient sur un piano d'enfant, et dans ce que le micro entend bien.
    for (const e of notes) for (const m of e.notes) expect(m).toBeGreaterThanOrEqual(48);
  });
  it('doigts donnés un par note', () => {
    expect(() => withFingers(parseTune('do ré'), '1 2')).not.toThrow();
  });
});

describe('parcours', () => {
  it('10 étapes, identifiants uniques', () => {
    expect(STEPS).toHaveLength(10);
    const ids = [...ALL_EXERCISES.map((e) => e.id), ...STEPS.flatMap((s) => s.lessons.map((l) => l.id))];
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(STEPS.map((s) => s.sticker)).size).toBe(10);
  });
  it('chaque exercice a un objectif possible ou se joue en une fois', () => {
    for (const e of ALL_EXERCISES) {
      if (e.goal) expect(e.goal.need).toBeLessThanOrEqual(e.goal.n);
      else expect(['sequence', 'song', 'chords']).toContain(e.act.kind);
      expect(goalText(e)).toBeTruthy();
    }
  });
  it('les exercices au piano sont marqués, les autres non', () => {
    for (const e of ALL_EXERCISES) {
      const pianoKind = ['play', 'sequence', 'song', 'chords'].includes(e.act.kind) || (e.act.kind === 'rhythm' && e.act.input === 'piano');
      expect(e.where, e.id).toBe(pianoKind ? 'piano' : 'ecran');
    }
  });
  it('chaque étape commence par comprendre et finit par des exercices des deux sortes ou presque', () => {
    for (const s of STEPS) {
      expect(s.lessons.length).toBeGreaterThan(0);
      expect(s.exercises.some((e) => e.where === 'piano')).toBe(true);
    }
  });
  it('les leçons se retrouvent', () => {
    expect(lessonById('l2-do')?.step).toBe(2);
  });
  it('les accords et chansons cités existent', () => {
    for (const e of ALL_EXERCISES) {
      if (e.act.kind === 'chords') for (const c of e.act.chords) expect(CHORDS[c]).toBeDefined();
      if (e.act.kind === 'song' || e.act.kind === 'sequence' || e.act.kind === 'chords') {
        const g = guideOf(e.act);
        expect(g.steps.length).toBeGreaterThan(2);
        const r = rangeOf(g.steps.flatMap((s) => s.notes));
        expect(r.to - r.from).toBeGreaterThanOrEqual(16);
      }
    }
  });
  it('les doigts des suites suivent la position de do', () => {
    const g = guideOf({ kind: 'sequence', tune: 'do ré mi fa sol2 | do, ré, mi,2', hand: 'd' });
    expect(g.steps.map((s) => s.finger)).toEqual([1, 2, 3, 4, 5, 5, 4, 3]);
    expect(g.clef).toBe('grand');
  });
  it('les cibles au piano', () => {
    expect(accepts({ say: '', pcs: [0] }, 48)).toBe(true);
    expect(accepts({ say: '', pcs: [0] }, 62)).toBe(false);
    expect(accepts({ say: '', below: 53 }, 50)).toBe(true);
    expect(accepts({ say: '', below: 53 }, 60)).toBe(false);
    expect(accepts({ say: '', pcs: [0], below: 60 }, 60)).toBe(false);
  });
});
