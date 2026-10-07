// Cómo una toma grabada se escribe en la partitura (RF-14.2, RF-14.4, RF-14.5, RF-16.3).
import { quantizeTake, type Grid, type Hit } from './grabacion';
import { measureMs, MAX_MEASURES, type Score } from './partitura';

export interface TakeConfig {
  /** Compases de la toma, de 1 a 128 (RF-14.1). */
  measures: number;
  grid: Grid;
}

/**
 * Compases que cubrió una toma que terminó a los `elapsedMs`: los completos más el que quedó a medias.
 * Si termina sola, cubre todos los pedidos; si se detiene antes, solo hasta donde llegó (RF-16.2).
 */
export function coveredMeasures(score: Score, config: TakeConfig, elapsedMs: number): number {
  const perMeasure = measureMs(score.timeSignature, score.tempo);
  return Math.min(config.measures, Math.max(1, Math.ceil(elapsedMs / perMeasure)));
}

/**
 * Escribe los golpes de la toma en la partitura:
 * - cada golpe es una nota normal, cuantizada a la grilla (RF-14.2, RF-14.3);
 * - reemplaza lo que había en los compases de la toma (RF-14.4);
 * - añade los compases que falten, hasta el tope de 128 (RF-14.5);
 * - lo que no cae en esos compases queda como estaba, y los golpes ya escritos se conservan (RF-16.3).
 * Sin golpes no cambia nada: la toma que nunca arrancó no borra la partitura.
 */
export function applyTake(score: Score, config: TakeConfig, hits: Hit[], elapsedMs: number): Score {
  if (hits.length === 0) return score;

  const covered = Math.min(MAX_MEASURES, coveredMeasures(score, config, elapsedMs));
  const notes = quantizeTake({
    tempo: score.tempo,
    timeSignature: score.timeSignature,
    measures: covered,
    grid: config.grid,
    hits,
  });

  const measures = score.measures.map((m) => ({ notes: [...m.notes] }));
  while (measures.length < covered) measures.push({ notes: [] });
  for (let i = 0; i < covered; i++) measures[i] = { notes: [] };
  for (const { measure, ...note } of notes) measures[measure].notes.push(note);

  return { ...score, measures };
}
