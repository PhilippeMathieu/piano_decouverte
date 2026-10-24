import { describe, expect, it } from 'vitest';
import { judge, makePattern, onsets, parseRhythm, total } from '../core/rhythm';
import { nextThing, playStars, quizStars, streak, Progress } from '../core/progress';
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
  it('juge les coups avec une tolérance d’enfant', () => {
    expect(judge([0, 1, 2], [0.1, 0.95, 2.18]).ok).toBe(true);
    expect(judge([0, 1, 2], [0.1, 1.4, 2]).ok).toBe(false);
    expect(judge([0, 1], [0, 0.5, 1, 1.5, 1.7]).ok).toBe(false); // trop de coups
    expect(judge([0, 1], [0, 0.5, 1]).ok).toBe(true); // un coup de trop, pardonné
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

describe('voix', () => {
  it('lit sans émojis ni symboles', () => {
    expect(forSpeech('Joue une note grave 🐘')).toBe('Joue une note grave');
    expect(forSpeech('La 2ᵉ note, la 1ʳᵉ ligne, do♯')).toBe('La 2e note, la 1re ligne, do dièse');
  });
});
