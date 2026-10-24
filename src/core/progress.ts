// Progression de l'enfant, sur l'appareil : leçons lues, étoiles par exercice, jours de pratique, réglages.
import { useEffect, useState } from 'preact/hooks';
import { load, save } from './storage';
import { STEPS } from '../content/steps';
import type { Exercise, Step } from '../content/types';

export interface Progress {
  lessons: Record<string, boolean>;
  /** Meilleur nombre d'étoiles (0 à 3) par exercice ; ≥ 1 = réussi. */
  stars: Record<string, number>;
  /** Exercices réussis par jour (« 2026-10-24 » → nombre). */
  days: Record<string, number>;
}
export interface Settings {
  name: string;
  /** Écoute au piano : micro, ou validation à la main (sans micro). */
  listen: 'micro' | 'sans';
  /** Lire les consignes à voix haute dès qu'elles s'affichent. */
  voice: boolean;
  /** Exercices réussis visés par jour. */
  daily: number;
}

const EMPTY: Progress = { lessons: {}, stars: {}, days: {} };
const DEFAULT_SETTINGS: Settings = { name: '', listen: 'micro', voice: false, daily: 3 };

let progress: Progress = load('progress', EMPTY);
let settings: Settings = load('settings', DEFAULT_SETTINGS);
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());

export const getProgress = () => progress;
export const getSettings = () => settings;

export function setSettings(s: Partial<Settings>) {
  settings = { ...settings, ...s };
  save('settings', settings);
  emit();
}

export const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function markLesson(id: string) {
  if (progress.lessons[id]) return;
  progress = { ...progress, lessons: { ...progress.lessons, [id]: true } };
  save('progress', progress);
  emit();
}

/** Enregistre un résultat ; renvoie ce qui vient d'être gagné (nouvelles étoiles, autocollant). */
export function recordResult(ex: Exercise, stars: number): { newStars: number; sticker?: string } {
  const before = progress.stars[ex.id] ?? 0;
  const step = STEPS.find((s) => s.exercises.some((e) => e.id === ex.id));
  const wasDone = step ? stepDone(step) : false;
  const d = today();
  progress = {
    ...progress,
    stars: { ...progress.stars, [ex.id]: Math.max(before, stars) },
    days: stars > 0 ? { ...progress.days, [d]: (progress.days[d] ?? 0) + 1 } : progress.days
  };
  save('progress', progress);
  emit();
  const sticker = step && !wasDone && stepDone(step) ? step.sticker : undefined;
  return { newStars: Math.max(0, stars - before), sticker };
}

export function resetProgress() {
  progress = EMPTY;
  save('progress', progress);
  emit();
}

// ---------------------------------------------------------------- Lecture

export const starsOf = (id: string, p = progress) => p.stars[id] ?? 0;
export const totalStars = (p = progress) => Object.values(p.stars).reduce((s, n) => s + n, 0);
export const maxStars = () => STEPS.reduce((s, st) => s + st.exercises.length * 3, 0);

export function stepDone(s: Step, p = progress) {
  return s.lessons.every((l) => p.lessons[l.id]) && s.exercises.every((e) => (p.stars[e.id] ?? 0) > 0);
}
/** Part de l'étape faite (0..1) : leçons lues et exercices réussis. */
export function stepShare(s: Step, p = progress) {
  const n = s.lessons.length + s.exercises.length;
  const done = s.lessons.filter((l) => p.lessons[l.id]).length + s.exercises.filter((e) => (p.stars[e.id] ?? 0) > 0).length;
  return done / n;
}
export const stickers = (p = progress) => STEPS.filter((s) => stepDone(s, p)).map((s) => s.sticker);

export type Next = { type: 'lesson'; step: Step; id: string; title: string } | { type: 'exercise'; step: Step; ex: Exercise } | null;

/** La prochaine chose à faire : dans l'ordre du parcours, la première leçon non lue ou le premier exercice non réussi. */
export function nextThing(p = progress): Next {
  for (const s of STEPS) {
    const l = s.lessons.find((x) => !p.lessons[x.id]);
    if (l) return { type: 'lesson', step: s, id: l.id, title: l.title };
    const e = s.exercises.find((x) => !(p.stars[x.id] > 0));
    if (e) return { type: 'exercise', step: s, ex: e };
  }
  return null;
}

/** L'exercice qui suit dans l'étape (pour « Suivant »). */
export function after(ex: Exercise): Exercise | undefined {
  for (const s of STEPS) {
    const i = s.exercises.findIndex((e) => e.id === ex.id);
    if (i >= 0) return s.exercises[i + 1];
  }
  return undefined;
}

/** Jours de suite avec au moins un exercice réussi (aujourd'hui compte s'il y en a, sinon on part d'hier). */
export function streak(p = progress, now = new Date()): number {
  const d = new Date(now);
  if (!p.days[today(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (p.days[today(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
export const doneToday = (p = progress) => p.days[today()] ?? 0;

/** Rafraîchit un composant à chaque changement de progression ou de réglage. */
export function useStore() {
  const [, set] = useState(0);
  useEffect(() => {
    const f = () => set((x) => x + 1);
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  }, []);
  return { progress, settings };
}

/** Étoiles d'un quiz : réussi à partir de `need`, 3 étoiles sans faute. */
export function quizStars(score: number, n: number, need: number): number {
  if (score < need) return 0;
  if (score >= n) return 3;
  return score >= Math.ceil((need + n) / 2) ? 2 : 1;
}
/** Étoiles d'une chanson ou d'une suite, selon les fautes. */
export function playStars(mistakes: number, notes: number): number {
  const ok = Math.max(1, Math.round(notes / 8));
  if (mistakes <= Math.max(1, Math.round(notes / 25))) return 3;
  if (mistakes <= 2 * ok) return 2;
  if (mistakes <= 4 * ok) return 1;
  return 0;
}
