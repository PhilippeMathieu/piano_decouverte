import { describe, expect, it } from 'vitest';
import { judge, makePattern, meterOf, onsets, parseRhythm, total } from '../core/rhythm';
import { judgeImprov, makeEcho } from '../ex/create';
import { bonusStickers, finalStars, getProgress, nextThing, playStars, quizStars, recordResult, resetProgress, stepDone, streak, Progress } from '../core/progress';
import { STEPS, exerciseById } from '../content/steps';
import { forSpeech } from '../core/speak';

describe('rythme', () => {
  it('lit un rythme et ses attaques', () => {
    const r = parseRhythm('1 -1 2 | .5 .5 1 2');
    expect(total(r)).toBe(8);
    expect(onsets(r)).toEqual([0, 2, 4, 4.5, 5, 6]);
  });
  it('des rythmes de 2 mesures, avec ce qu’on vient d’apprendre', () => {
    for (const level of [1, 2, 3, 4]) {
      for (let i = 0; i < 50; i++) expect(total(parseRhythm(makePattern(level)))).toBe(8);
    }
    for (let i = 0; i < 30; i++) expect(makePattern(4)).toContain('.5');
  });
  it('la valse : 2 mesures de 3 temps, sans mesure de 4', () => {
    expect(meterOf(5)).toBe(3);
    for (let i = 0; i < 50; i++) expect(total(parseRhythm(makePattern(5)))).toBe(6);
  });
  it('le contretemps : 2 mesures de 4 temps, avec une note pointée ou à contretemps', () => {
    for (let i = 0; i < 50; i++) {
      const p = parseRhythm(makePattern(6));
      expect(total(p)).toBe(8);
      expect(onsets(p).some((o) => o % 1 !== 0)).toBe(true);
    }
  });
  it('juge les coups avec une tolérance d’enfant', () => {
    expect(judge([0, 1, 2], [0.1, 0.95, 2.18]).ok).toBe(true);
    expect(judge([0, 1, 2], [0.1, 1.4, 2]).ok).toBe(false);
    expect(judge([0, 1], [0, 0.5, 1, 1.5, 1.7]).ok).toBe(false); // trop de coups
    expect(judge([0, 1], [0, 0.5, 1]).ok).toBe(true); // un coup de trop, pardonné
  });
});

describe('écho et improvisation', () => {
  it('l’écho ne répète jamais deux fois la même note de suite', () => {
    for (let i = 0; i < 50; i++) {
      const e = makeEcho([61, 63, 66], 4);
      expect(e).toHaveLength(4);
      for (let k = 1; k < e.length; k++) expect(e[k]).not.toBe(e[k - 1]);
    }
  });
  it('une réponse improvisée : assez de notes, surtout noires', () => {
    expect(judgeImprov([61, 63, 66], 3).ok).toBe(true);
    expect(judgeImprov([61, 63], 3).ok).toBe(false);
    expect(judgeImprov([60, 62, 64, 66], 3).ok).toBe(false);
    expect(judgeImprov([60, 61, 63, 66, 68], 3).ok).toBe(true); // une blanche par erreur, pardonnée
    expect(judgeImprov([], 3).msg).toContain('rien entendu');
  });
});

describe('étoiles', () => {
  it('quiz : réussi à partir de l’objectif, 3 étoiles sans faute', () => {
    expect(quizStars(7, 10, 8)).toBe(0);
    expect(quizStars(8, 10, 8)).toBe(1);
    expect(quizStars(9, 10, 8)).toBe(2);
    expect(quizStars(10, 10, 8)).toBe(3);
  });
  it('chanson : selon les fautes', () => {
    expect(playStars(0, 22)).toBe(3);
    expect(playStars(1, 22)).toBe(3);
    expect(playStars(5, 22)).toBe(2);
    expect(playStars(12, 22)).toBe(1);
    expect(playStars(13, 22)).toBe(0);
    expect(playStars(999, 5)).toBe(0);
  });
  it('la prochaine chose à faire suit le parcours', () => {
    const p: Progress = { lessons: {}, stars: {}, days: {} };
    expect(nextThing(p)).toMatchObject({ type: 'lesson', id: 'l1-touches' });
    p.lessons = { 'l1-touches': true, 'l1-grave-aigu': true };
    expect(nextThing(p)).toMatchObject({ type: 'exercise', ex: { id: 'e1-g2' } });
    p.stars = { 'e1-g2': 0 };
    expect(nextThing(p)).toMatchObject({ type: 'exercise', ex: { id: 'e1-g2' } });
  });
  it('jours de suite', () => {
    const p: Progress = { lessons: {}, stars: {}, days: { '2026-10-22': 1, '2026-10-23': 2 } };
    expect(streak(p, new Date(2026, 9, 24))).toBe(2); // pas encore joué aujourd'hui : la série tient
    expect(streak({ ...p, days: { ...p.days, '2026-10-24': 1 } }, new Date(2026, 9, 24))).toBe(3);
    expect(streak(p, new Date(2026, 9, 26))).toBe(0);
  });
});

describe('pour aller plus loin', () => {
  it('un défi réussi donne son autocollant spécial, une seule fois, sans finir l’étape', () => {
    resetProgress();
    const ex = exerciseById('m1-g3')!;
    expect(recordResult(ex, 0).bonus).toBeUndefined();
    expect(recordResult(ex, 3).bonus).toBe('🚀');
    expect(recordResult(ex, 3).bonus).toBeUndefined();
    expect(bonusStickers(getProgress())).toEqual(['🚀']);
    expect(stepDone(STEPS[0], getProgress())).toBe(false);
    resetProgress();
  });
  it('sans faute : 2 étoiles ne suffisent pas', () => {
    const ex = exerciseById('m3-agile')!;
    expect(finalStars(ex, 2)).toBe(0);
    expect(finalStars(ex, 3)).toBe(3);
    expect(finalStars(exerciseById('e3-monte')!, 2)).toBe(2);
  });
  it('le parcours ignore les exercices en option', () => {
    const p: Progress = { lessons: {}, stars: {}, days: {} };
    for (const s of STEPS) {
      for (const l of s.lessons) p.lessons[l.id] = true;
      for (const e of s.exercises) p.stars[e.id] = 1;
    }
    expect(nextThing(p)).toBeNull();
    expect(STEPS.every((s) => stepDone(s, p))).toBe(true);
  });
});

describe('voix', () => {
  it('lit sans émojis ni symboles', () => {
    expect(forSpeech('Joue une note grave 🐘')).toBe('Joue une note grave');
    expect(forSpeech('La 2ᵉ note, la 1ʳᵉ ligne, do♯')).toBe('La 2e note, la 1re ligne, do dièse');
  });
});
