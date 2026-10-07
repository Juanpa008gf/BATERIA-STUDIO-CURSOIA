// RF-11.1, RF-17.3 — mapeo General MIDI por defecto y mensajes que no son un golpe (AC-22, AC-27).
import { describe, expect, it } from 'vitest';
import { GM_DRUM_MAP, parseMidiMessage, pieceForNote } from '../src/midi';

describe('RF-11.1 · mapeo General MIDI', () => {
  it('AC-22: la nota 36 cuenta como bombo y la 38 como caja', () => {
    expect(pieceForNote(36)).toBe('kick');
    expect(pieceForNote(38)).toBe('snare');
  });

  it('solo mapea notas del rango 35–59', () => {
    for (const note of Object.keys(GM_DRUM_MAP).map(Number)) {
      expect(note).toBeGreaterThanOrEqual(35);
      expect(note).toBeLessThanOrEqual(59);
    }
    expect(pieceForNote(60)).toBeNull();
    expect(pieceForNote(0)).toBeNull();
  });
});

describe('RF-13 · lectura de un golpe', () => {
  it('note on en el canal 10 con intensidad 100', () => {
    expect(parseMidiMessage([0x99, 38, 100])).toEqual({ note: 38, channel: 10, velocity: 100 });
  });
});

describe('RF-17.3 · mensajes que no son un golpe', () => {
  it.each([
    ['soltar el pad (note off)', [0x89, 38, 64]],
    ['note on con intensidad cero', [0x99, 38, 0]],
    ['control change', [0xb9, 7, 100]],
    ['mensaje incompleto', [0x99, 38]],
  ])('%s no escribe nada', (_, data) => {
    expect(parseMidiMessage(data)).toBeNull();
  });
});
