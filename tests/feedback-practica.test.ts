// RF-29.1 a RF-29.4 @CRITICO — emparejar cada golpe con la nota esperada, medir el desvío y colorear
// (AC-66, AC-67, AC-68, AC-69).
import { describe, expect, it } from 'vitest';
import { evaluateHit } from '../src/practica';
import { makeScore, note, U } from './ayudas';

// AC-66: 1 compás a 120 BPM, bombo en el tiempo 1 (0 ms) y caja en el tiempo 3 (1000 ms).
const score = makeScore(120, [[note('kick', 0), note('snare', 2 * U.negra)]]);

describe('RF-29.1 a RF-29.4 · feedback de timing', () => {
  describe('AC-66 · color y desvío según la tabla (bombo vs. nota de bombo en el tiempo 1)', () => {
    it.each([
      [0, 0, 'green'],
      [100, 100, 'green'],
      [-100, -100, 'green'],
      [101, 101, 'yellow'],
      [-150, -150, 'yellow'],
      [250, 250, 'yellow'],
      [-250, -250, 'yellow'],
      [251, 251, 'red'],
      [-251, -251, 'red'],
    ])('golpe a %i ms → desvío %i ms, %s', (timeMs, deviationMs, color) => {
      const r = evaluateHit({ score, hit: { piece: 'kick', timeMs } });

      expect(r.expectedPiece).toBe('kick');
      expect(r.deviationMs).toBe(deviationMs);
      expect(r.color).toBe(color);
    });
  });

  it('AC-67: bombo en el tiempo del crash, con 0 ms de desvío, es rojo por pieza distinta', () => {
    const conCrash = makeScore(120, [[note('crash', 0)]]);
    const r = evaluateHit({ score: conCrash, hit: { piece: 'kick', timeMs: 0 } });

    expect(r.expectedPiece).toBe('crash');
    expect(r.deviationMs).toBe(0);
    expect(r.color).toBe('red');
  });

  it('AC-68: a igual distancia de dos notas, se compara con la de la misma pieza (bombo, +500 ms)', () => {
    const r = evaluateHit({ score, hit: { piece: 'kick', timeMs: 500 } });

    expect(r.expectedPiece).toBe('kick');
    expect(r.deviationMs).toBe(500);
    expect(r.color).toBe('red');
  });

  it('RF-29.1: a igual distancia, la misma pieza gana también cuando es la nota posterior', () => {
    const r = evaluateHit({ score, hit: { piece: 'snare', timeMs: 500 } });

    expect(r.expectedPiece).toBe('snare');
    expect(r.deviationMs).toBe(-500);
  });

  it('RF-29.1: la nota más cercana manda aunque sea de otra pieza', () => {
    // Caja a 900 ms: la más cercana es la caja (1000 ms) → -100 ms, verde.
    const r1 = evaluateHit({ score, hit: { piece: 'snare', timeMs: 900 } });
    expect(r1).toMatchObject({ expectedPiece: 'snare', deviationMs: -100, color: 'green' });

    // Bombo a 900 ms: la más cercana sigue siendo la caja → pieza distinta → rojo.
    const r2 = evaluateHit({ score, hit: { piece: 'kick', timeMs: 900 } });
    expect(r2).toMatchObject({ expectedPiece: 'snare', deviationMs: -100, color: 'red' });
  });

  it('AC-69: caja a 600 ms, sin ninguna nota esperada a menos de 250 ms, es roja', () => {
    const r = evaluateHit({ score, hit: { piece: 'snare', timeMs: 600 } });

    expect(r.color).toBe('red');
  });
});
