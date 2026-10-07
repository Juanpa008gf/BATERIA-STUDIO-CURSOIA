// Notación: convierte las notas de un compás en figuras y silencios por voz (RF-04, RF-05, RNF-05).
// Es lógica pura, sin VexFlow: los silencios siempre se derivan de las notas, nunca se guardan.
import { measureUnits, type Measure, type Note, type Piece, type TimeSignature, UNITS } from './partitura';

export type VoiceName = 'hands' | 'feet';

/** RF-04.2: los pies llevan bombo e hi-hat con pie; las manos, todo lo demás. */
export function voiceOf(piece: Piece): VoiceName {
  return piece === 'kick' || piece === 'hihat-pedal' ? 'feet' : 'hands';
}

export interface NotatedEvent {
  kind: 'note' | 'rest';
  position: number;
  /** Unidades que ocupa la figura dibujada. */
  units: number;
  /** Solo en las notas: las que suenan juntas en este instante. */
  notes: Note[];
  /** Índice de la negra si la figura pertenece a un tresillo de corcheas (3 en el espacio de 2). */
  triplet: number | null;
}

export interface MeasureNotation {
  /** Compás sin ninguna nota: se dibuja un único silencio de compás completo (AC-08). */
  wholeRest: boolean;
  hands: NotatedEvent[] | null;
  feet: NotatedEvent[] | null;
}

const ATOMS = [UNITS.whole, UNITS.half, UNITS.quarter, UNITS.eighth, UNITS.sixteenth];
const CELL = UNITS.quarter;
const TRIPLET = UNITS.eighthTriplet;

/** Duración de VexFlow para una figura de `units` unidades. */
export function vexDuration(units: number): string {
  switch (units) {
    case UNITS.whole:
      return 'w';
    case UNITS.half:
      return 'h';
    case UNITS.quarter:
      return 'q';
    case UNITS.eighth:
    case TRIPLET:
      return '8';
    default:
      return '16';
  }
}

function tripletCells(positions: number[], total: number): Set<number> {
  const cells = new Set<number>();
  for (const p of positions) {
    const cell = Math.floor(p / CELL);
    // Una celda de negra incompleta al final del compás no puede llevar tresillo.
    if (p % UNITS.sixteenth !== 0 && (cell + 1) * CELL <= total) cells.add(cell);
  }
  return cells;
}

function notateVoice(notes: Note[], total: number, triplets: Set<number>): NotatedEvent[] {
  const events: NotatedEvent[] = [];

  /** Rellena [from, to) con silencios alineados a su propio tamaño. */
  function fillRests(from: number, to: number) {
    let pos = from;
    while (pos < to) {
      const cell = Math.floor(pos / CELL);
      if (triplets.has(cell)) {
        events.push({ kind: 'rest', position: pos, units: TRIPLET, notes: [], triplet: cell });
        pos += TRIPLET;
        continue;
      }
      // Un silencio común no puede cruzar a una celda de tresillo.
      const limit = triplets.has(cell + 1) ? Math.min(to, (cell + 1) * CELL) : to;
      const atom = ATOMS.find((a) => pos % a === 0 && pos + a <= limit);
      if (!atom) break;
      events.push({ kind: 'rest', position: pos, units: atom, notes: [], triplet: null });
      pos += atom;
    }
  }

  const onsets = [...new Set(notes.map((n) => n.position))].sort((a, b) => a - b);
  let cursor = 0;
  onsets.forEach((onset, i) => {
    fillRests(cursor, onset);
    const available = (onsets[i + 1] ?? total) - onset;
    const chord = notes.filter((n) => n.position === onset);
    const wanted = Math.min(available, ...chord.map((n) => n.duration));
    const cell = Math.floor(onset / CELL);
    const inTriplet = triplets.has(cell);
    const limit = triplets.has(cell + 1) ? Math.min(wanted, (cell + 1) * CELL - onset) : wanted;
    const units = inTriplet ? TRIPLET : (ATOMS.find((a) => onset % a === 0 && a <= limit) ?? UNITS.sixteenth);
    events.push({ kind: 'note', position: onset, units, notes: chord, triplet: inTriplet ? cell : null });
    fillRests(onset + units, onset + available);
    cursor = onset + available;
  });
  fillRests(cursor, total);
  return events;
}

export function notateMeasure(measure: Measure, ts: TimeSignature): MeasureNotation {
  const total = measureUnits(ts);
  // Una nota fuera del compás (por haber cambiado el compás) no se dibuja, pero tampoco se borra.
  const inside = measure.notes.filter((n) => n.position < total);
  if (inside.length === 0) return { wholeRest: true, hands: null, feet: null };

  // El tresillo se decide por voz: una voz que solo tiene silencios en esa negra no dibuja un tresillo de silencios.
  const voice = (name: VoiceName) => {
    const own = inside.filter((n) => voiceOf(n.piece) === name);
    return own.length
      ? notateVoice(
          own,
          total,
          tripletCells(
            own.map((n) => n.position),
            total,
          ),
        )
      : null;
  };
  return { wholeRest: false, hands: voice('hands'), feet: voice('feet') };
}
