// Modelo de la partitura y la grilla rítmica. Sin dependencias de UI, audio ni servidor.

export const FORMAT_VERSION = 1;

export const PIECES = [
  'kick',
  'snare',
  'hihat-closed',
  'hihat-open',
  'hihat-pedal',
  'tom-high',
  'tom-mid',
  'tom-floor',
  'crash',
  'ride',
  'ride-bell',
  'china',
  'splash',
] as const;
export type Piece = (typeof PIECES)[number];

export type Articulation = 'normal' | 'accent' | 'ghost' | 'flam';

// RNF-04: la negra vale 48 unidades enteras (divisible por 4 y por 3).
export const UNITS = { whole: 192, half: 96, quarter: 48, eighth: 24, sixteenth: 12, eighthTriplet: 16 } as const;
export const UNITS_PER_QUARTER = UNITS.quarter;

export interface Note {
  piece: Piece;
  /** Unidades de grilla desde el inicio del compás. */
  position: number;
  /** Unidades de grilla. */
  duration: number;
  articulation: Articulation;
}

export interface Measure {
  notes: Note[];
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface Score {
  tempo: number;
  timeSignature: TimeSignature;
  measures: Measure[];
}

export const MIN_TEMPO = 30;
export const MAX_TEMPO = 260;
export const MAX_MEASURES = 128;
export const NUMERATORS = Array.from({ length: 16 }, (_, i) => i + 1);
export const DENOMINATORS = [2, 4, 8, 16] as const;

/** Unidades de grilla de un pulso (una negra en x/4, una corchea en x/8...). */
export function unitsPerBeat(ts: TimeSignature): number {
  return UNITS.whole / ts.denominator;
}

export function measureUnits(ts: TimeSignature): number {
  return ts.numerator * unitsPerBeat(ts);
}

/** El tempo se expresa en negras por minuto. */
export function msPerUnit(tempo: number): number {
  return 60000 / UNITS_PER_QUARTER / tempo;
}

export function measureMs(ts: TimeSignature, tempo: number): number {
  return (measureUnits(ts) * 60000) / (UNITS_PER_QUARTER * tempo);
}

/** RF-18.3: fuera de 30–260 se fija en el límite más cercano. */
export function clampTempo(tempo: number): number {
  if (Number.isNaN(tempo)) return MIN_TEMPO;
  return Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, Math.round(tempo)));
}

/** Instante de una nota, en ms desde el inicio de la partitura. Aritmética entera para no acumular error. */
export function noteTimeMs(tempo: number, ts: TimeSignature, measure: number, position: number): number {
  return ((measure * measureUnits(ts) + position) * 60000) / (UNITS_PER_QUARTER * tempo);
}

export function emptyScore(tempo = 120, measures = 1, ts: TimeSignature = { numerator: 4, denominator: 4 }): Score {
  return { tempo, timeSignature: ts, measures: Array.from({ length: measures }, () => ({ notes: [] })) };
}
