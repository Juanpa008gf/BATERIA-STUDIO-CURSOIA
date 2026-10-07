// RF-14.2, RF-14.4, RF-14.5, RF-16 — la toma se escribe en la partitura (AC-26, AC-28, AC-29, AC-32, AC-35, AC-36).
import { describe, expect, it } from 'vitest';
import { applyTake, coveredMeasures } from '../src/toma';
import { makeScore, note, U } from './ayudas';

const base = { grid: 'semicorchea' as const };

describe('RF-14.2 · cada golpe es una nota normal', () => {
  it('AC-26: bombo a 0 ms y caja a 510 ms quedan en los tiempos 1 y 2 del compás 1', () => {
    const score = makeScore(120, [[]]);
    const out = applyTake(
      score,
      { ...base, measures: 1 },
      [
        { piece: 'kick', timeMs: 0 },
        { piece: 'snare', timeMs: 510 },
      ],
      2000,
    );

    expect(out.measures[0].notes).toEqual([
      expect.objectContaining({ piece: 'kick', position: 0, articulation: 'normal' }),
      expect.objectContaining({ piece: 'snare', position: U.negra, articulation: 'normal' }),
    ]);
  });
});

describe('RF-14.4 · reemplaza lo escrito en los compases de la toma', () => {
  it('AC-28: un compás con bombo en el 1, grabado con caja en el 3, queda solo con la caja', () => {
    const score = makeScore(120, [[note('kick', 0)]]);
    const out = applyTake(score, { ...base, measures: 1 }, [{ piece: 'snare', timeMs: 1000 }], 2000);

    expect(out.measures[0].notes).toHaveLength(1);
    expect(out.measures[0].notes[0]).toMatchObject({ piece: 'snare', position: 2 * U.negra });
  });

  it('no toca los compases que la toma no cubre', () => {
    const score = makeScore(120, [[note('kick', 0)], [note('snare', 0)]]);
    const out = applyTake(score, { ...base, measures: 1 }, [{ piece: 'crash', timeMs: 0 }], 2000);

    expect(out.measures[0].notes.map((n) => n.piece)).toEqual(['crash']);
    expect(out.measures[1].notes.map((n) => n.piece)).toEqual(['snare']);
  });
});

describe('RF-14.5 · añade los compases que faltan', () => {
  it('AC-29: partitura de 2 compases, toma de 4 compases: queda de 4', () => {
    const score = makeScore(120, [[], []]);
    // Un golpe en el compás 4 (a 6 s) para que la toma llegue hasta ahí.
    const out = applyTake(score, { ...base, measures: 4 }, [{ piece: 'kick', timeMs: 6000 }], 8000);

    expect(out.measures).toHaveLength(4);
    expect(out.measures[3].notes[0]).toMatchObject({ piece: 'kick', position: 0 });
  });

  it('nunca pasa de 128 compases', () => {
    const score = makeScore(120, [[]]);
    const out = applyTake(score, { ...base, measures: 128 }, [{ piece: 'kick', timeMs: 0 }], 999999999);
    expect(out.measures.length).toBeLessThanOrEqual(128);
  });
});

describe('RF-16 · terminar la toma conserva los golpes', () => {
  it('AC-36: toma de 4 compases detenida en el compás 2: cubre 2 compases y conserva lo tocado', () => {
    const score = makeScore(120, [[], [], [], []]);
    const config = { ...base, measures: 4 };
    expect(coveredMeasures(score, config, 3000)).toBe(2); // 3 s = compás 2 a 120 BPM

    const out = applyTake(score, config, [{ piece: 'kick', timeMs: 0 }, { piece: 'snare', timeMs: 2500 }], 3000);
    expect(out.measures[0].notes).toHaveLength(1);
    expect(out.measures[1].notes).toHaveLength(1);
    expect(out.measures[2].notes).toHaveLength(0);
  });

  it('AC-35: al completar los compases pedidos, cubre todos', () => {
    const score = makeScore(120, [[]]);
    expect(coveredMeasures(score, { ...base, measures: 1 }, 2000)).toBe(1);
  });
});

describe('RF-15.1 · una toma sin golpes no escribe nada', () => {
  it('AC-32: pasan 3 s sin golpes y la partitura queda igual', () => {
    const score = makeScore(120, [[note('kick', 0)]]);
    const out = applyTake(score, { ...base, measures: 1 }, [], 3000);
    expect(out).toBe(score);
  });
});
