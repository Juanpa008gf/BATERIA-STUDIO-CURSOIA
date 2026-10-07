import type { Note, Piece, Score } from '../src/partitura';

// La negra vale 48 unidades de grilla (RNF-04).
export const U = { redonda: 192, blanca: 96, negra: 48, corchea: 24, semicorchea: 12 } as const;

export function note(piece: Piece, position: number, duration: number = U.negra): Note {
  return { piece, position, duration, articulation: 'normal' };
}

// Una partitura 4/4 a `tempo` BPM; cada elemento de `measures` son las notas de un compás.
export function makeScore(tempo: number, measures: Note[][]): Score {
  return { tempo, timeSignature: { numerator: 4, denominator: 4 }, measures: measures.map((notes) => ({ notes })) };
}
