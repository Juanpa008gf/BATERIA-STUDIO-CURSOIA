// RF-14.7, RF-17.1, RF-17.2 — duración de cada nota, golpes simultáneos y golpes repetidos (AC-31, AC-38, AC-39).
import { describe, expect, it } from 'vitest';
import { quantizeTake } from '../src/grabacion';
import { U } from './ayudas';

const base = { tempo: 120, timeSignature: { numerator: 4, denominator: 4 }, measures: 1 };

describe('RF-14.7 · la duración sale de la separación con el golpe siguiente', () => {
  it('AC-31: bombo en el tiempo 1 y caja en el 3: blanca y blanca hasta el final del compás', () => {
    const notes = quantizeTake({
      ...base,
      grid: 'negra',
      hits: [
        { piece: 'kick', timeMs: 0 },
        { piece: 'snare', timeMs: 1000 },
      ],
    });

    expect(notes).toHaveLength(2);
    expect(notes[0]).toMatchObject({ piece: 'kick', position: 0, duration: 2 * U.negra });
    expect(notes[1]).toMatchObject({ piece: 'snare', position: 2 * U.negra, duration: 2 * U.negra });
  });

  it('el último golpe dura hasta el final del compás en que cae', () => {
    const [n] = quantizeTake({ ...base, grid: 'negra', hits: [{ piece: 'snare', timeMs: 1500 }] });
    expect(n).toMatchObject({ position: 3 * U.negra, duration: U.negra });
  });
});

describe('RF-17.1 · golpes simultáneos', () => {
  it('AC-38: bombo y hi-hat con 5 ms de diferencia quedan como dos notas en el mismo paso', () => {
    const notes = quantizeTake({
      ...base,
      grid: 'semicorchea',
      hits: [
        { piece: 'kick', timeMs: 0 },
        { piece: 'hihat-closed', timeMs: 5 },
      ],
    });

    expect(notes).toHaveLength(2);
    expect(notes.map((n) => n.position)).toEqual([0, 0]);
    expect(notes.map((n) => n.piece).sort()).toEqual(['hihat-closed', 'kick']);
  });
});

describe('RF-17.2 · golpes de la misma pieza en el mismo paso', () => {
  it('AC-39: dos golpes de caja con 20 ms de diferencia dentro del mismo paso son una sola nota', () => {
    const notes = quantizeTake({
      ...base,
      grid: 'semicorchea',
      hits: [
        { piece: 'snare', timeMs: 500 },
        { piece: 'snare', timeMs: 520 },
      ],
    });

    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({ piece: 'snare', position: U.negra });
  });

  it('en pasos distintos siguen siendo dos notas', () => {
    const notes = quantizeTake({
      ...base,
      grid: 'semicorchea',
      hits: [
        { piece: 'snare', timeMs: 500 },
        { piece: 'snare', timeMs: 640 },
      ],
    });
    expect(notes).toHaveLength(2);
  });
});
