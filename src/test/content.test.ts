import { describe, expect, it } from 'vitest';
import { ALL_EXERCISES, CHORDS, MORE_EXERCISES, STEPS, exerciseById, lessonById } from '../content/steps';
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
    if (!s.pickup) expect(beats % s.beats).toBe(0);
    if (s.left) expect(s.left.reduce((a, e) => a + e.dur, 0)).toBe(beats);
    // Avec levée : la levée plus des mesures entières.
    if (s.pickup) expect((beats - s.pickup) % s.beats === 0 || beats % s.beats === 0).toBe(true);
    if (s.nuances) expect(s.nuances).toHaveLength(s.phrases.length);
    // Tout tient sur un piano d'enfant, et dans ce que le micro entend bien.
    for (const e of notes) for (const m of e.notes) expect(m).toBeGreaterThanOrEqual(48);
  });
  it('doigts donnés un par note', () => {
    expect(() => withFingers(parseTune('do ré'), '1 2')).not.toThrow();
  });
});

describe('parcours', () => {
  it('18 étapes, identifiants et autocollants uniques', () => {
    expect(STEPS).toHaveLength(18);
    expect(STEPS.map((s) => s.id)).toEqual(Array.from({ length: 18 }, (_, i) => i + 1));
    const ids = [...ALL_EXERCISES.map((e) => e.id), ...MORE_EXERCISES.map((e) => e.id), ...STEPS.flatMap((s) => s.lessons.map((l) => l.id))];
    expect(new Set(ids).size).toBe(ids.length);
    const stickers = [...STEPS.map((s) => s.sticker), ...MORE_EXERCISES.map((e) => e.bonus)];
    expect(new Set(stickers).size).toBe(stickers.length);
  });
  it('pour aller plus loin : dans chaque étape, avec un autocollant spécial, hors parcours', () => {
    for (const s of STEPS) expect(s.more?.length, `étape ${s.id}`).toBeGreaterThan(0);
    for (const e of MORE_EXERCISES) {
      expect(e.bonus, e.id).toBeTruthy();
      expect(exerciseById(e.id)?.id).toBe(e.id);
      expect(ALL_EXERCISES.some((x) => x.id === e.id)).toBe(false);
    }
  });
  it('le compte des étapes 11 à 18', () => {
    const late = STEPS.filter((s) => s.id > 10);
    expect(late.flatMap((s) => s.lessons)).toHaveLength(17);
    expect(late.flatMap((s) => s.exercises)).toHaveLength(37);
  });
  it('chaque exercice a un objectif possible ou se joue en une fois', () => {
    for (const e of [...ALL_EXERCISES, ...MORE_EXERCISES]) {
      if (e.goal) expect(e.goal.need).toBeLessThanOrEqual(e.goal.n);
      else expect(['sequence', 'song', 'chords']).toContain(e.act.kind);
      expect(goalText(e)).toBeTruthy();
    }
  });
  it('les exercices au piano sont marqués, les autres non', () => {
    for (const e of [...ALL_EXERCISES, ...MORE_EXERCISES]) {
      const pianoKind =
        ['play', 'sequence', 'song', 'chords', 'improv'].includes(e.act.kind) || ((e.act.kind === 'rhythm' || e.act.kind === 'echo') && e.act.input === 'piano');
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
    for (const e of [...ALL_EXERCISES, ...MORE_EXERCISES]) {
      if (e.act.kind === 'chords') for (const c of e.act.chords) expect(CHORDS[c]).toBeDefined();
      if (e.act.kind === 'song' || e.act.kind === 'sequence' || e.act.kind === 'chords') {
        const g = guideOf(e.act);
        expect(g.steps.length).toBeGreaterThan(2);
        const r = rangeOf(g.steps.flatMap((s) => s.notes));
        expect(r.to - r.from).toBeGreaterThanOrEqual(16);
        // Les doigts des suites : un par note, ou aucun.
        if (e.act.kind === 'sequence') expect(g.steps.every((s) => s.finger !== undefined), e.id).toBe(true);
      }
    }
  });
  it('les chansons citées dans les leçons existent', () => {
    for (const s of STEPS)
      for (const l of s.lessons)
        for (const sl of l.slides)
          for (const p of sl.play ?? []) if ('song' in p) expect(SONGS.some((x) => x.id === p.song), p.song).toBe(true);
  });
  it('les chansons en sol ont bien leur fa dièse, et Tetris tient dans la position de la', () => {
    const notes = (id: string) => SONGS.find((s) => s.id === id)!.tune.flatMap((e) => e.notes);
    expect(notes('anniv-sol')).toContain(66);
    expect(notes('lune-sol')).toContain(66);
    expect(notes('anniv-sol')).not.toContain(65);
    expect(new Set(notes('tetris'))).toEqual(new Set([69, 71, 72, 74, 76]));
  });
  it('les accords de main gauche bougent peu', () => {
    const moved = (a: number[], b: number[]) => a.reduce((s, m, i) => s + Math.abs(m - b[i]), 0);
    expect(moved(CHORDS['Do-g'], CHORDS['Fa-g'])).toBeLessThanOrEqual(3);
    expect(moved(CHORDS['Do-g'], CHORDS['Sol-g'])).toBeLessThanOrEqual(3);
    expect(CHORDS['Sol-g'].map((m) => m % 12).sort((a, b) => a - b)).toEqual([2, 7, 11]);
  });
  it('les doigts de la maison de sol', () => {
    const g = guideOf({ kind: 'sequence', tune: "sol la si do' ré'2", hand: 'd', fingers: '1 2 3 4 5' });
    expect(g.steps.map((s) => s.finger)).toEqual([1, 2, 3, 4, 5]);
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
