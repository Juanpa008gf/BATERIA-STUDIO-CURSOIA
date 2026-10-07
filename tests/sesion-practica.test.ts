// RF-28, RF-29.5 — nota esperada destacada y notas omitidas (AC-65, AC-70).
import { describe, expect, it } from 'vitest';
import { nextExpected, omittedNotes } from '../src/sesionPractica';
import { makeScore, note, U } from './ayudas';

// 2 compases a 120 BPM (compás = 2 s) con notas en los tiempos 1 y 3 de cada uno.
const dosCompases = makeScore(120, [
  [note('kick', 0), note('snare', 2 * U.negra)],
  [note('kick', 0), note('snare', 2 * U.negra)],
]);

// AC-66: 1 compás, bombo en el tiempo 1 (0 ms) y caja en el tiempo 3 (1000 ms).
const unCompas = makeScore(120, [[note('kick', 0), note('snare', 2 * U.negra)]]);

describe('RF-28 · próxima nota esperada', () => {
  it('AC-65: pasó la nota del tiempo 1 y no llegó la del tiempo 3: se destaca la del tiempo 3', () => {
    const next = nextExpected(dosCompases, 400);
    expect(next).toMatchObject({ measure: 0, position: 2 * U.negra, pieces: ['snare'] });
  });

  it('antes de empezar, la próxima es la del tiempo 1 del compás 1', () => {
    expect(nextExpected(dosCompases, -1)).toMatchObject({ measure: 0, position: 0 });
  });

  it('pasando el último compás no hay próxima', () => {
    expect(nextExpected(dosCompases, 3900)).toBeNull();
  });

  it('las piezas simultáneas se agrupan en una sola nota esperada', () => {
    const score = makeScore(120, [[note('kick', 0), note('hihat-closed', 0)]]);
    expect(nextExpected(score, -1)?.pieces).toEqual(['kick', 'hihat-closed']);
  });
});

describe('RF-29.5 · nota omitida', () => {
  it('AC-70: tocando solo el bombo, a los 250 ms de la caja ésta queda omitida y el bombo no', () => {
    const omitidas = omittedNotes(unCompas, [0], 1000 + 250);
    expect(omitidas).toHaveLength(1);
    expect(omitidas[0]).toMatchObject({ position: 2 * U.negra, pieces: ['snare'] });
  });

  it('antes de que pasen 250 ms todavía no se marca', () => {
    expect(omittedNotes(unCompas, [0], 1000 + 249)).toHaveLength(0);
  });

  it('un golpe a 250 ms o menos de la nota la salva, aunque sea de otra pieza', () => {
    expect(omittedNotes(unCompas, [0, 1250], 1000 + 300)).toHaveLength(0);
  });

  it('un golpe a más de 250 ms no la salva', () => {
    expect(omittedNotes(unCompas, [0, 1251], 2000).map((n) => n.position)).toEqual([2 * U.negra]);
  });
});
