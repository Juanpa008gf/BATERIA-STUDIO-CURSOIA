// Feedback de timing del Modo Práctica (RF-29.1 a RF-29.4).
import { noteTimeMs, type Piece, type Score } from './partitura';

export type HitColor = 'green' | 'yellow' | 'red';

export const GREEN_MAX_MS = 100;
export const YELLOW_MAX_MS = 250;

export interface PracticeHit {
  piece: Piece;
  /** Instante del golpe en ms desde el inicio de la partitura, medido con el reloj de audio. */
  timeMs: number;
}

export interface HitResult {
  expectedPiece: Piece | null;
  /** Positivo si el golpe llega tarde, negativo si llega adelantado. */
  deviationMs: number;
  color: HitColor;
  /** Nota esperada con la que se comparó, para poder marcarla en la partitura. */
  expected: { measure: number; position: number } | null;
}

// Evita que el error de punto flotante cambie de lado un desvío justo en el borde (100 o 250 ms).
const round = (ms: number) => Math.round(ms * 1e6) / 1e6;

interface Candidate {
  piece: Piece;
  measure: number;
  position: number;
  distance: number;
  deviation: number;
}

export function evaluateHit({ score, hit }: { score: Score; hit: PracticeHit }): HitResult {
  const candidates: Candidate[] = score.measures.flatMap((m, measure) =>
    m.notes.map((n) => {
      const deviation = round(hit.timeMs - noteTimeMs(score.tempo, score.timeSignature, measure, n.position));
      return { piece: n.piece, measure, position: n.position, distance: Math.abs(deviation), deviation };
    }),
  );

  // RF-29.1: manda la más cercana; a igual distancia, la de la misma pieza que el golpe.
  let best: Candidate | undefined;
  for (const c of candidates) {
    const better =
      !best ||
      c.distance < best.distance ||
      (c.distance === best.distance && c.piece === hit.piece && best.piece !== hit.piece);
    if (better) best = c;
  }

  if (!best) return { expectedPiece: null, deviationMs: 0, color: 'red', expected: null };

  const samePiece = best.piece === hit.piece;
  const color: HitColor = !samePiece || best.distance > YELLOW_MAX_MS ? 'red' : best.distance > GREEN_MAX_MS ? 'yellow' : 'green';
  return {
    expectedPiece: best.piece,
    deviationMs: best.deviation,
    color,
    expected: { measure: best.measure, position: best.position },
  };
}
