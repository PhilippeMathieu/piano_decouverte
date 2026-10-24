import { describe, expect, it } from 'vitest';
import { NoteTracker } from './tracker';

const P = (midi: number, clarity = 0.95) => ({ midi, freq: 0, clarity });

describe('suivi des notes', () => {
  it('confirme une note après deux mesures stables, puis la suivante', () => {
    const tr = new NoteTracker(0.01);
    expect(tr.push(P(60), 0.05, 0)).toBeNull();
    expect(tr.push(P(60.1), 0.05, 50)).toEqual({ midi: 60, t: 50 });
    expect(tr.push(P(60), 0.04, 100)).toBeNull();
    expect(tr.push(P(62), 0.035, 150)).toBeNull();
    expect(tr.push(P(62), 0.03, 200)).toEqual({ midi: 62, t: 200 });
  });
  it('ignore le silence et les mesures peu fiables', () => {
    const tr = new NoteTracker(0.01);
    expect(tr.push(P(60), 0.002, 0)).toBeNull();
    expect(tr.push(P(60, 0.5), 0.05, 50)).toBeNull();
    expect(tr.push(P(60.5), 0.05, 100)).toBeNull();
  });
  it('une note rejouée compte une fois, même si l’attaque dure deux mesures', () => {
    const tr = new NoteTracker(0.01);
    const lv = [0.07, 0.06, 0.05, 0.03, 0.02, 0.015, 0.037, 0.073, 0.063, 0.05, 0.04];
    const got = lv.map((l, i) => tr.push(P(64), l, i * 50)).filter(Boolean);
    expect(got).toHaveLength(2);
  });
});
