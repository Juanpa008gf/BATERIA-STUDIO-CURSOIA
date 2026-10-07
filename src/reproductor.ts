// Reproductor: programa notas contra el reloj de audio (RNF-01) y arranca siempre en el compás 1 (RF-19.1).
import { measureMs, measureUnits, msPerUnit, unitsPerBeat, type Piece, type Score } from './partitura';

/** Salida de audio inyectable: en la app es Web Audio; en los tests, un registro. */
export interface AudioSink {
  /** Reloj de audio en segundos (AudioContext.currentTime). */
  readonly currentTime: number;
  playNote(piece: Piece, time: number): void;
  /** Click del metrónomo; `accent` marca el primer tiempo del compás. */
  playClick(time: number, accent: boolean): void;
  cancelPending(): void;
}

export interface PlayerPosition {
  /** Compás, desde 1. */
  measure: number;
  /** Tiempo dentro del compás, desde 1. */
  beat: number;
  /** Unidades de grilla desde el inicio del compás (fraccionario). */
  unit: number;
}

export interface Player {
  play(): void;
  stop(): void;
  /** Programa lo que cae dentro de la ventana de anticipación. Se llama cada pocos ms. */
  tick(): void;
  position(): PlayerPosition;
  isPlaying(): boolean;
  setLoop(loop: boolean): void;
  setScore(score: Score): void;
}

export const LOOKAHEAD_S = 0.12;

interface PlayerOptions {
  score: Score;
  audio: AudioSink;
  loop?: boolean;
  lookaheadS?: number;
}

interface Event {
  piece: Piece;
  offsetS: number;
}

function buildEvents(score: Score): { events: Event[]; totalS: number } {
  const perMeasure = measureUnits(score.timeSignature);
  const unitS = msPerUnit(score.tempo) / 1000;
  const events: Event[] = [];
  score.measures.forEach((m, i) => {
    for (const n of m.notes) {
      // Una nota fuera del compás (por haber cambiado el compás) no suena, pero tampoco se borra.
      if (n.position >= perMeasure) continue;
      events.push({ piece: n.piece, offsetS: (i * perMeasure + n.position) * unitS });
    }
  });
  events.sort((a, b) => a.offsetS - b.offsetS);
  return { events, totalS: (measureMs(score.timeSignature, score.tempo) * score.measures.length) / 1000 };
}

export function createPlayer(options: PlayerOptions): Player {
  const { audio } = options;
  const lookahead = options.lookaheadS ?? LOOKAHEAD_S;
  let score = options.score;
  let loop = options.loop ?? false;
  let { events, totalS } = buildEvents(score);

  let playing = false;
  let startTime = 0;
  let iteration = 0;
  let cursor = 0;
  let frozen: PlayerPosition = { measure: 1, beat: 1, unit: 0 };

  function positionAt(elapsedS: number): PlayerPosition {
    const perMeasure = measureUnits(score.timeSignature);
    const unitS = msPerUnit(score.tempo) / 1000;
    const inScore = loop ? elapsedS % totalS : Math.min(elapsedS, totalS - 1e-9);
    const units = Math.max(0, inScore) / unitS;
    const measureIndex = Math.min(score.measures.length - 1, Math.floor(units / perMeasure));
    const unit = units - measureIndex * perMeasure;
    return {
      measure: measureIndex + 1,
      beat: Math.min(score.timeSignature.numerator, Math.floor(unit / unitsPerBeat(score.timeSignature)) + 1),
      unit,
    };
  }

  function halt() {
    if (playing) frozen = positionAt(audio.currentTime - startTime);
    playing = false;
    audio.cancelPending();
  }

  return {
    play() {
      audio.cancelPending();
      startTime = audio.currentTime;
      iteration = 0;
      cursor = 0;
      playing = true;
      frozen = { measure: 1, beat: 1, unit: 0 };
    },
    stop: halt,
    tick() {
      if (!playing) return;
      const now = audio.currentTime;
      while (true) {
        if (cursor >= events.length) {
          if (!loop) break;
          iteration++;
          cursor = 0;
          if (events.length === 0) break;
          continue;
        }
        const ev = events[cursor];
        // El instante sale del inicio de la reproducción, nunca del evento anterior: no hay error acumulado.
        const time = startTime + iteration * totalS + ev.offsetS;
        if (time >= now + lookahead) break;
        cursor++;
        if (time >= now) audio.playNote(ev.piece, time);
      }
      if (!loop && now - startTime >= totalS) halt();
    },
    position() {
      return playing ? positionAt(audio.currentTime - startTime) : frozen;
    },
    isPlaying: () => playing,
    setLoop(value) {
      loop = value;
    },
    setScore(next) {
      score = next;
      ({ events, totalS } = buildEvents(next));
      halt();
    },
  };
}
