// Partitura de ejemplo que se carga al abrir la app: un groove de rock de 2 compases con un tresillo al final.
import { emptyScore, type Note, type Piece, type Score } from './partitura';

const n = (piece: Piece, position: number, duration: number): Note => ({
  piece,
  position,
  duration,
  articulation: 'normal',
});

export function exampleScore(): Score {
  const score = emptyScore(100, 2);

  // Compás 1: hi-hat en corcheas, bombo en 1 y 3, caja en 2 y 4.
  const hats = Array.from({ length: 8 }, (_, i) => n('hihat-closed', i * 24, 24));
  score.measures[0].notes = [...hats, n('kick', 0, 48), n('snare', 48, 48), n('kick', 96, 48), n('snare', 144, 48)];
  score.measures[0].notes.find((x) => x.piece === 'snare' && x.position === 144)!.articulation = 'accent';

  // Compás 2: crash en el 1, hi-hat hasta el 3 y un tresillo de toms en el 4.
  const hats2 = [24, 48, 72, 96, 120].map((p) => n('hihat-closed', p, 24));
  score.measures[1].notes = [
    n('crash', 0, 24),
    n('kick', 0, 48),
    ...hats2,
    n('snare', 48, 48),
    n('kick', 96, 48),
    n('tom-high', 144, 16),
    n('tom-mid', 160, 16),
    n('tom-floor', 176, 16),
  ];
  return score;
}
