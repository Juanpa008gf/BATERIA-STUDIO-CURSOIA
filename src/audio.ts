// Salida de audio sobre Web Audio: el reloj, los sonidos de la batería y el corte al detener.
import type { Piece } from './partitura';
import type { AudioSink } from './reproductor';
import { playPiece, type Voice } from './sonidos';

export interface WebAudioSink extends AudioSink {
  /** El navegador exige un gesto del usuario para arrancar el audio: se llama desde el clic en Play. */
  resume(): Promise<void>;
  /**
   * Instante del reloj de audio (s) que corresponde a una marca de tiempo de un evento (performance.now).
   * Así el desvío de un golpe se mide contra el reloj de audio y no contra el de la interfaz.
   */
  audioTimeAt(performanceMs: number): number;
}

export function createWebAudioSink(): WebAudioSink {
  let ctx: AudioContext | null = null;
  let out: AudioNode | null = null;
  const active = new Set<AudioScheduledSourceNode>();

  function context(): AudioContext {
    if (!ctx) {
      ctx = new AudioContext({ latencyHint: 'interactive' });
      // Un compresor suave evita que varias piezas simultáneas saturen.
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.ratio.value = 4;
      const master = ctx.createGain();
      master.gain.value = 0.85;
      master.connect(compressor);
      compressor.connect(ctx.destination);
      out = master;
    }
    return ctx;
  }

  return {
    get currentTime() {
      return context().currentTime;
    },
    async resume() {
      await context().resume();
    },
    audioTimeAt(performanceMs) {
      return context().currentTime - (performance.now() - performanceMs) / 1000;
    },
    playNote(piece: Piece, time: number, gain = 1) {
      if (gain <= 0) return;
      const c = context();
      const voice: Voice = playPiece(c, out!, piece, time, gain);
      for (const node of voice) {
        active.add(node);
        node.addEventListener('ended', () => {
          active.delete(node);
          node.disconnect();
        });
      }
    },
    playClick() {},
    cancelPending() {
      for (const node of active) {
        try {
          node.stop();
        } catch {
          // Todavía no había arrancado o ya terminó.
        }
      }
      active.clear();
    },
  };
}
