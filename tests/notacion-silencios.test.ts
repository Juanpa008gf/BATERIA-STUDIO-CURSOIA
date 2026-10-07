// RF-04.1, RF-04.2, RNF-05 — los silencios se derivan de las notas y cada voz cierra el compás exacto
// (AC-07, AC-08, AC-09, AC-89).
import { describe, expect, it } from 'vitest';
import { quantizeTake } from '../src/grabacion';
import { notateMeasure, type NotatedEvent } from '../src/notacion';
import { measureUnits } from '../src/partitura';
import { note, U } from './ayudas';

const ts44 = { numerator: 4, denominator: 4 };
const suma = (voz: NotatedEvent[] | null) => (voz ?? []).reduce((s, e) => s + e.units, 0);
const resumen = (voz: NotatedEvent[] | null) => (voz ?? []).map((e) => `${e.kind}:${e.position}:${e.units}`);

describe('RF-04.1 · silencios derivados', () => {
  it('AC-07: una negra de caja en el tiempo 1 deja silencio de negra y de blanca', () => {
    const n = notateMeasure({ notes: [note('snare', 0)] }, ts44);
    expect(resumen(n.hands)).toEqual(['note:0:48', 'rest:48:48', 'rest:96:96']);
  });

  it('AC-07: con otra negra en el tiempo 4, los silencios pasan a ser dos negras', () => {
    const n = notateMeasure({ notes: [note('snare', 0), note('snare', 3 * U.negra)] }, ts44);
    expect(resumen(n.hands)).toEqual(['note:0:48', 'rest:48:48', 'rest:96:48', 'note:144:48']);
  });

  it('AC-08: un compás sin notas tiene un único silencio de compás completo', () => {
    expect(notateMeasure({ notes: [] }, ts44)).toEqual({ wholeRest: true, hands: null, feet: null });
  });
});

describe('RF-04.2 · dos voces', () => {
  it('AC-09: hi-hat en corcheas y bombo en 1 y 3: manos sin silencios, pies con silencio en 2 y 4', () => {
    const hats = Array.from({ length: 8 }, (_, i) => note('hihat-closed', i * U.corchea, U.corchea));
    const n = notateMeasure({ notes: [...hats, note('kick', 0), note('kick', 2 * U.negra)] }, ts44);

    expect(n.hands?.every((e) => e.kind === 'note')).toBe(true);
    expect(resumen(n.feet)).toEqual(['note:0:48', 'rest:48:48', 'note:96:48', 'rest:144:48']);
  });

  it('el hi-hat con pie va a la voz de pies', () => {
    const n = notateMeasure({ notes: [note('hihat-pedal', 0)] }, ts44);
    expect(n.hands).toBeNull();
    expect(n.feet?.[0].notes[0].piece).toBe('hihat-pedal');
  });
});

describe('RNF-05 · cada voz completa el compás exactamente', () => {
  it('AC-89: tresillos junto a semicorcheas', () => {
    const notes = [
      note('hihat-closed', 0, U.semicorchea),
      note('hihat-closed', 12, U.semicorchea),
      note('hihat-closed', 24, U.semicorchea),
      note('hihat-closed', 36, U.semicorchea),
      note('snare', 48, 16),
      note('snare', 64, 16),
      note('snare', 80, 16),
      note('kick', 96),
    ];
    const n = notateMeasure({ notes }, ts44);
    expect(suma(n.hands)).toBe(measureUnits(ts44));
    expect(suma(n.feet)).toBe(measureUnits(ts44));
    // Los tres golpes del tresillo quedan en la misma celda.
    expect(n.hands?.filter((e) => e.kind === 'note' && e.triplet === 1)).toHaveLength(3);
  });

  it('AC-89: un compás escrito por una toma grabada', () => {
    const hits = [
      { piece: 'kick' as const, timeMs: 0 },
      { piece: 'hihat-closed' as const, timeMs: 130 },
      { piece: 'snare' as const, timeMs: 510 },
      { piece: 'snare' as const, timeMs: 700 },
      { piece: 'kick' as const, timeMs: 1010 },
    ];
    const notes = quantizeTake({ tempo: 120, timeSignature: ts44, measures: 1, grid: 'semicorchea', hits });
    const n = notateMeasure({ notes }, ts44);
    expect(suma(n.hands)).toBe(measureUnits(ts44));
    expect(suma(n.feet)).toBe(measureUnits(ts44));
  });

  it.each([
    [{ numerator: 3, denominator: 4 }],
    [{ numerator: 6, denominator: 8 }],
    [{ numerator: 7, denominator: 8 }],
    [{ numerator: 2, denominator: 2 }],
  ])('compás %j con una nota al comienzo', (ts) => {
    const n = notateMeasure({ notes: [note('snare', 0)] }, ts);
    expect(suma(n.hands)).toBe(measureUnits(ts));
  });
});
