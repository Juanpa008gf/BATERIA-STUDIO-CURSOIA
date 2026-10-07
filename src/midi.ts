// Mapeo General MIDI de percusión y lectura de mensajes (RF-11.1, RF-17.3). Sin dependencias del navegador.
import type { Piece } from './partitura';

/** RF-11.1: notas 35–59 del General MIDI. Las que no son parte del kit (pandereta, cencerro...) no se mapean. */
export const GM_DRUM_MAP: Readonly<Record<number, Piece>> = {
  35: 'kick', // Acoustic Bass Drum
  36: 'kick', // Bass Drum 1
  37: 'snare', // Side Stick (el cross-stick queda para una versión posterior)
  38: 'snare', // Acoustic Snare
  40: 'snare', // Electric Snare
  41: 'tom-floor', // Low Floor Tom
  42: 'hihat-closed',
  43: 'tom-floor', // High Floor Tom
  44: 'hihat-pedal',
  45: 'tom-mid', // Low Tom
  46: 'hihat-open',
  47: 'tom-mid', // Low-Mid Tom
  48: 'tom-high', // Hi-Mid Tom
  49: 'crash', // Crash Cymbal 1
  50: 'tom-high', // High Tom
  51: 'ride', // Ride Cymbal 1
  52: 'china', // Chinese Cymbal
  53: 'ride-bell',
  55: 'splash',
  57: 'crash', // Crash Cymbal 2
  59: 'ride', // Ride Cymbal 2
};

export interface MidiHit {
  /** Nota MIDI, 0–127. */
  note: number;
  /** Canal, 1–16. */
  channel: number;
  /** Intensidad, 1–127. */
  velocity: number;
}

/**
 * RF-17.3: solo un "note on" con intensidad mayor que cero es un golpe.
 * Soltar el pad (note off, o note on con intensidad 0) y cualquier otro mensaje devuelven null.
 */
export function parseMidiMessage(data: ArrayLike<number>): MidiHit | null {
  if (data.length < 3) return null;
  const status = data[0];
  if ((status & 0xf0) !== 0x90) return null;
  const velocity = data[2];
  if (velocity === 0) return null;
  return { note: data[1] & 0x7f, channel: (status & 0x0f) + 1, velocity: velocity & 0x7f };
}

export function pieceForNote(note: number, map: Readonly<Record<number, Piece>> = GM_DRUM_MAP): Piece | null {
  return map[note] ?? null;
}
