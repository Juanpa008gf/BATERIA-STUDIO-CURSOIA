// Salida de audio sobre Web Audio. Por ahora solo aporta el reloj: los sonidos llegan con el paso de sonido.
import type { AudioSink } from './reproductor';

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
  const context = () => (ctx ??= new AudioContext({ latencyHint: 'interactive' }));
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
    playNote() {},
    playClick() {},
    cancelPending() {},
  };
}
