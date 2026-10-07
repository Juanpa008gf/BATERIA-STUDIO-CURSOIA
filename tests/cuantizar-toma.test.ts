// RF-14.3 @CRITICO — cuantizar los golpes de la toma a la grilla elegida (AC-26, RNF-06).
import { describe, expect, it } from 'vitest';
import { quantizeTake, type Grid } from '../src/grabacion';
import { U } from './ayudas';

const base = { tempo: 120, timeSignature: { numerator: 4, denominator: 4 }, measures: 1 };

describe('RF-14.3 · cuantización de la toma', () => {
  it('AC-26: bombo a 0 ms y caja a 510 ms con grilla de semicorchea (paso de 125 ms)', () => {
    const notes = quantizeTake({
      ...base,
      grid: 'semicorchea',
      hits: [
        { piece: 'kick', timeMs: 0 },
        { piece: 'snare', timeMs: 510 },
      ],
    });

    expect(notes).toHaveLength(2);
    expect(notes[0]).toMatchObject({ piece: 'kick', measure: 0, position: 0, articulation: 'normal' });
    expect(notes[1]).toMatchObject({ piece: 'snare', measure: 0, position: U.negra, articulation: 'normal' });
  });

  // El RF nombra cuatro grillas; el AC-26 solo cubre la semicorchea. Estos casos cubren el resto.
  // A 120 BPM la negra dura 500 ms.
  const casos: { grid: Grid; pasoUnidades: number; golpes: [number, number][] }[] = [
    { grid: 'semicorchea', pasoUnidades: 12, golpes: [[60, 0], [64, 12], [510, 48]] },
    { grid: 'tresillo', pasoUnidades: 16, golpes: [[80, 0], [170, 16], [330, 32]] },
    { grid: 'corchea', pasoUnidades: 24, golpes: [[120, 0], [260, 24], [740, 72]] },
    { grid: 'negra', pasoUnidades: 48, golpes: [[240, 0], [480, 48], [760, 96]] },
  ];

  describe.each(casos)('grilla $grid (paso de $pasoUnidades unidades)', ({ grid, golpes }) => {
    it.each(golpes)('golpe a %i ms queda en la posición %i', (timeMs, position) => {
      const [n] = quantizeTake({ ...base, grid, hits: [{ piece: 'snare', timeMs }] });
      expect(n).toMatchObject({ measure: 0, position });
    });
  });

  it('un golpe del compás 2 queda en measure 1, con la posición relativa a ese compás', () => {
    const [n] = quantizeTake({
      ...base,
      measures: 2,
      grid: 'negra',
      hits: [{ piece: 'kick', timeMs: 2000 + 500 }], // compás de 2000 ms
    });
    expect(n).toMatchObject({ measure: 1, position: U.negra });
  });

  // RNF-06: error máximo de medio paso.
  it.each(casos)('RNF-06: grilla $grid, el error nunca pasa de medio paso', ({ grid, pasoUnidades }) => {
    const msPorUnidad = 500 / U.negra;
    for (let timeMs = 0; timeMs < 1990; timeMs += 7) {
      const [n] = quantizeTake({ ...base, grid, hits: [{ piece: 'snare', timeMs }] });
      const errorMs = Math.abs(n.position * msPorUnidad - timeMs);
      expect(errorMs).toBeLessThanOrEqual((pasoUnidades * msPorUnidad) / 2 + 1e-9);
    }
  });
});
