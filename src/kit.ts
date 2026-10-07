// Cada pieza del kit en su altura convencional del pentagrama (RF-02.2, AC-03).
import type { Piece } from './partitura';

export interface PieceStaff {
  /** Clave de VexFlow: nota/octava/cabeza. Las alturas son las de la clave de sol, que usa la clave neutra. */
  key: string;
  /** Hi-hat abierto: cruz con una "o" encima. */
  openMark?: boolean;
  label: string;
}

export const PIECE_STAFF: Record<Piece, PieceStaff> = {
  kick: { key: 'f/4', label: 'Bombo' }, // 1.er espacio
  snare: { key: 'c/5', label: 'Caja' }, // 3.er espacio
  'tom-high': { key: 'e/5', label: 'Tom agudo' }, // 4.º espacio
  'tom-mid': { key: 'd/5', label: 'Tom medio' }, // 4.ª línea
  'tom-floor': { key: 'a/4', label: 'Tom de piso' }, // 2.º espacio
  'hihat-closed': { key: 'g/5/x2', label: 'Hi-hat cerrado' }, // espacio sobre el pentagrama
  'hihat-open': { key: 'g/5/x2', openMark: true, label: 'Hi-hat abierto' },
  'hihat-pedal': { key: 'd/4/x2', label: 'Hi-hat con pie' }, // espacio bajo el pentagrama
  ride: { key: 'f/5/x2', label: 'Ride' }, // 5.ª línea
  'ride-bell': { key: 'f/5/d2', label: 'Campana del ride' }, // 5.ª línea, rombo
  crash: { key: 'a/5/x2', label: 'Crash' }, // 1.ª línea adicional superior
  china: { key: 'b/5/x2', label: 'China' }, // espacio sobre la 1.ª adicional
  splash: { key: 'c/6/x2', label: 'Splash' }, // 2.ª línea adicional superior
};
