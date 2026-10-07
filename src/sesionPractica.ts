// Lógica del Modo Práctica que no es el color del golpe: qué nota viene y cuáles se omitieron (RF-28, RF-29.5).
import { noteTimeMs, type Piece, type Score } from './partitura';
import { YELLOW_MAX_MS } from './practica';

export interface ExpectedNote {
  measure: number;
  position: number;
  /** Instante en ms desde el inicio de la partitura. */
  timeMs: number;
  /** Piezas que suenan juntas en ese instante. */
  pieces: Piece[];
}

/** Todas las notas esperadas, agrupadas por instante y en orden. */
export function expectedNotes(score: Score): ExpectedNote[] {
  const groups = new Map<string, ExpectedNote>();
  score.measures.forEach((m, measure) => {
    for (const n of m.notes) {
      const key = `${measure}:${n.position}`;
      const group = groups.get(key);
      if (group) group.pieces.push(n.piece);
      else {
        const timeMs = noteTimeMs(score.tempo, score.timeSignature, measure, n.position);
        groups.set(key, { measure, position: n.position, timeMs, pieces: [n.piece] });
      }
    }
  });
  return [...groups.values()].sort((a, b) => a.timeMs - b.timeMs);
}

/** RF-28: la próxima nota esperada es la primera que todavía no llegó. */
export function nextExpected(score: Score, nowMs: number): ExpectedNote | null {
  return expectedNotes(score).find((n) => n.timeMs > nowMs) ?? null;
}

/**
 * RF-29.5: una nota esperada se omite si ningún golpe cayó a 250 ms o menos de su instante
 * y ya pasaron 250 ms desde él.
 */
export function omittedNotes(score: Score, hitTimesMs: number[], nowMs: number): ExpectedNote[] {
  return expectedNotes(score).filter(
    (n) =>
      nowMs - n.timeMs >= YELLOW_MAX_MS && !hitTimesMs.some((h) => Math.abs(h - n.timeMs) <= YELLOW_MAX_MS),
  );
}
