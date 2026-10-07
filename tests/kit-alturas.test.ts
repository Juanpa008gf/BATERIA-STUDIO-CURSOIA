// RF-02.1, RF-02.2 — cada pieza del kit en su altura convencional (AC-03).
import { describe, expect, it } from 'vitest';
import { PIECE_STAFF } from '../src/kit';
import { PIECES } from '../src/partitura';

describe('RF-02 · el kit completo en el pentagrama', () => {
  it('las 13 piezas del kit tienen posición', () => {
    expect(PIECES).toHaveLength(13);
    for (const piece of PIECES) expect(PIECE_STAFF[piece].key).toBeTruthy();
  });

  // Clave de sol: líneas e4 g4 b4 d5 f5; espacios f4 a4 c5 e5.
  it.each([
    ['kick', 'f/4'], // 1.er espacio
    ['snare', 'c/5'], // 3.er espacio
    ['tom-high', 'e/5'], // 4.º espacio
    ['tom-mid', 'd/5'], // 4.ª línea
    ['tom-floor', 'a/4'], // 2.º espacio
    ['hihat-closed', 'g/5/x2'], // espacio sobre el pentagrama, cruz
    ['hihat-open', 'g/5/x2'], // ídem, con "o" encima
    ['hihat-pedal', 'd/4/x2'], // espacio bajo el pentagrama, cruz
    ['ride', 'f/5/x2'], // 5.ª línea, cruz
    ['ride-bell', 'f/5/d2'], // 5.ª línea, rombo
    ['crash', 'a/5/x2'], // 1.ª línea adicional superior
    ['china', 'b/5/x2'], // espacio sobre la 1.ª adicional
    ['splash', 'c/6/x2'], // 2.ª línea adicional superior
  ] as const)('%s va en %s', (piece, key) => {
    expect(PIECE_STAFF[piece].key).toBe(key);
  });

  it('solo el hi-hat abierto lleva la "o"', () => {
    expect(PIECES.filter((p) => PIECE_STAFF[p].openMark)).toEqual(['hihat-open']);
  });
});
