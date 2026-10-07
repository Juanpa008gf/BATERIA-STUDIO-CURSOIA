// Cuantización de tomas grabadas (RF-14.3, RF-14.7, RF-17, RNF-06).
import { measureUnits, msPerUnit, type Note, type Piece, type TimeSignature, UNITS } from './partitura';

export type Grid = 'semicorchea' | 'tresillo' | 'corchea' | 'negra';

export const GRID_UNITS: Record<Grid, number> = {
  semicorchea: UNITS.sixteenth,
  tresillo: UNITS.eighthTriplet,
  corchea: UNITS.eighth,
  negra: UNITS.quarter,
};

export interface Hit {
  piece: Piece;
  /** Instante del golpe en ms desde el inicio de la toma. */
  timeMs: number;
}

export interface TakeOptions {
  tempo: number;
  timeSignature: TimeSignature;
  /** Cantidad de compases de la toma. */
  measures: number;
  grid: Grid;
  hits: Hit[];
}

export type QuantizedNote = Note & { measure: number };

/**
 * Cada golpe va al paso más cercano de la grilla (error máximo de medio paso).
 * Un golpe que redondea al final de la toma pertenece a un compás que no se grabó y se descarta.
 */
export function quantizeTake({ tempo, timeSignature, measures, grid, hits }: TakeOptions): QuantizedNote[] {
  const perMeasure = measureUnits(timeSignature);
  const step = GRID_UNITS[grid];
  const unitMs = msPerUnit(tempo);

  // RF-17.2: dos golpes de la misma pieza en el mismo paso son una sola nota.
  const seen = new Set<string>();
  const placed: { piece: Piece; absolute: number }[] = [];
  for (const hit of [...hits].sort((a, b) => a.timeMs - b.timeMs)) {
    const absolute = Math.round(hit.timeMs / unitMs / step) * step;
    if (absolute < 0 || absolute >= measures * perMeasure) continue;
    const key = `${hit.piece}@${absolute}`;
    if (seen.has(key)) continue;
    seen.add(key);
    placed.push({ piece: hit.piece, absolute });
  }

  // RF-14.7: la duración sale de la separación con el golpe siguiente; el último llega al fin de su compás.
  const onsets = [...new Set(placed.map((p) => p.absolute))].sort((a, b) => a - b);
  return placed.map(({ piece, absolute }) => {
    const measure = Math.floor(absolute / perMeasure);
    const measureEnd = (measure + 1) * perMeasure;
    const next = onsets.find((o) => o > absolute);
    const end = next === undefined ? measureEnd : Math.min(next, measureEnd);
    return { piece, measure, position: absolute - measure * perMeasure, duration: end - absolute, articulation: 'normal' };
  });
}
