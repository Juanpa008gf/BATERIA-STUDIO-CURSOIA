// Dibujo de la partitura con VexFlow: un compás por sistema, clave de percusión, dos voces (RF-01, RF-02, RF-04, RF-05).
import {
  Annotation,
  Articulation,
  Beam,
  Formatter,
  Fraction,
  GraceNote,
  GraceNoteGroup,
  Modifier,
  Parenthesis,
  Renderer,
  Stave,
  StaveNote,
  Tuplet,
  Voice,
} from 'vexflow';
import { PIECE_STAFF } from './kit';
import { notateMeasure, vexDuration, type NotatedEvent } from './notacion';
import { measureUnits, type Score } from './partitura';

export interface Anchor {
  unit: number;
  x: number;
}

export interface MeasureLayout {
  /** Coordenada y de la parte superior y de la inferior del sistema, para el indicador de posición. */
  top: number;
  bottom: number;
  /** Posiciones horizontales conocidas dentro del compás, de la unidad 0 al final del compás. */
  anchors: Anchor[];
}

export interface Layout {
  width: number;
  height: number;
  measures: MeasureLayout[];
}

const ROW_HEIGHT = 190;
const ABOVE = 75; // espacio sobre la 1.ª línea: stems, crash, splash, tresillos
const STAVE_X = 10;

function buildNote(event: NotatedEvent, stemDown: boolean): StaveNote {
  if (event.kind === 'rest') {
    return new StaveNote({ keys: [stemDown ? 'd/4' : 'b/4'], duration: `${vexDuration(event.units)}r`, clef: 'percussion' });
  }
  const keys = event.notes.map((n) => PIECE_STAFF[n.piece].key);
  const note = new StaveNote({
    keys,
    duration: vexDuration(event.units),
    clef: 'percussion',
    stemDirection: stemDown ? -1 : 1,
  });
  const sorted = note.getKeys();
  event.notes.forEach((n) => {
    const index = sorted.indexOf(PIECE_STAFF[n.piece].key);
    if (index < 0) return;
    if (PIECE_STAFF[n.piece].openMark) {
      note.addModifier(new Annotation('o').setVerticalJustification(Annotation.VerticalJustify.TOP), index);
    }
  });
  if (event.notes.some((n) => n.articulation === 'accent')) {
    note.addModifier(new Articulation('a>').setPosition(Modifier.Position.ABOVE));
  }
  if (event.notes.every((n) => n.articulation === 'ghost')) {
    Parenthesis.buildAndAttach([note]);
  }
  const flam = event.notes.find((n) => n.articulation === 'flam');
  if (flam) {
    const grace = new GraceNote({ keys: [PIECE_STAFF[flam.piece].key], duration: '8', slash: true });
    note.addModifier(new GraceNoteGroup([grace], true));
  }
  return note;
}

interface DrawnVoice {
  voice: Voice;
  notes: StaveNote[];
  events: NotatedEvent[];
}

function buildVoice(events: NotatedEvent[], stemDown: boolean): DrawnVoice {
  const notes = events.map((e) => buildNote(e, stemDown));
  const voice = new Voice({ numBeats: 4, beatValue: 4 }).setMode(Voice.Mode.SOFT);
  voice.addTickables(notes);
  return { voice, notes, events };
}

export function renderScore(container: HTMLElement, score: Score, width: number): Layout {
  container.innerHTML = '';
  const rows = score.measures.length;
  const height = rows * ROW_HEIGHT + 20;
  const renderer = new Renderer(container as HTMLDivElement, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const ctx = renderer.getContext();
  const total = measureUnits(score.timeSignature);
  const layout: Layout = { width, height, measures: [] };

  score.measures.forEach((measure, i) => {
    const staveY = i * ROW_HEIGHT + ABOVE;
    const stave = new Stave(STAVE_X, staveY, width - STAVE_X * 2);
    stave.addClef('percussion');
    if (i === 0) stave.addTimeSignature(`${score.timeSignature.numerator}/${score.timeSignature.denominator}`);
    stave.setContext(ctx).draw();
    ctx.save();
    ctx.setFont('sans-serif', 11);
    ctx.fillText(String(i + 1), STAVE_X + 2, staveY - 14);
    ctx.restore();

    const notation = notateMeasure(measure, score.timeSignature);
    const startX = stave.getNoteStartX();
    const endX = stave.getNoteEndX();
    const anchors: Anchor[] = [];

    if (notation.wholeRest) {
      // AC-08: un único silencio de compás completo.
      const rest = new StaveNote({ keys: ['b/4'], duration: 'wr', clef: 'percussion', alignCenter: true });
      const voice = new Voice({ numBeats: 4, beatValue: 4 }).setMode(Voice.Mode.SOFT);
      voice.addTickables([rest]);
      new Formatter().joinVoices([voice]).format([voice], endX - startX - 20);
      voice.draw(ctx, stave);
      anchors.push({ unit: 0, x: startX }, { unit: total, x: endX });
    } else {
      const voices: DrawnVoice[] = [];
      if (notation.hands) voices.push(buildVoice(notation.hands, false));
      if (notation.feet) voices.push(buildVoice(notation.feet, true));

      const beams: Beam[] = [];
      const tuplets: Tuplet[] = [];
      for (const v of voices) {
        // Primero los tresillos: cambian la duración de sus notas y de eso dependen las barras.
        const byCell = new Map<number, StaveNote[]>();
        v.events.forEach((e, k) => {
          if (e.triplet === null) return;
          byCell.set(e.triplet, [...(byCell.get(e.triplet) ?? []), v.notes[k]]);
        });
        for (const cellNotes of byCell.values()) {
          if (cellNotes.length === 3) tuplets.push(new Tuplet(cellNotes, { numNotes: 3, notesOccupied: 2 }));
        }
        const denominator = Math.min(score.timeSignature.denominator, 4);
        beams.push(...Beam.generateBeams(v.notes, { groups: [new Fraction(1, denominator)], maintainStemDirections: true }));
      }

      const all = voices.map((v) => v.voice);
      new Formatter().joinVoices(all).format(all, endX - startX - 30, { alignRests: true });
      all.forEach((v) => v.draw(ctx, stave));
      beams.forEach((b) => b.setContext(ctx).draw());
      tuplets.forEach((t) => t.setContext(ctx).draw());

      const seen = new Map<number, number>();
      for (const v of voices) {
        v.events.forEach((e, k) => {
          if (!seen.has(e.position)) seen.set(e.position, v.notes[k].getAbsoluteX());
        });
      }
      [...seen.entries()]
        .sort((a, b) => a[0] - b[0])
        .forEach(([unit, x]) => anchors.push({ unit, x }));
      if (anchors[0].unit !== 0) anchors.unshift({ unit: 0, x: startX });
      anchors.push({ unit: total, x: endX });
    }

    layout.measures.push({ top: staveY - ABOVE + 15, bottom: staveY + ROW_HEIGHT - ABOVE - 25, anchors });
  });

  return layout;
}

/** Posición horizontal de un instante del compás, interpolando entre las notas dibujadas. */
export function xAtUnit(measure: MeasureLayout, unit: number): number {
  const a = measure.anchors;
  for (let i = 0; i < a.length - 1; i++) {
    if (unit <= a[i + 1].unit) {
      const span = a[i + 1].unit - a[i].unit;
      const t = span === 0 ? 0 : (unit - a[i].unit) / span;
      return a[i].x + t * (a[i + 1].x - a[i].x);
    }
  }
  return a[a.length - 1].x;
}
