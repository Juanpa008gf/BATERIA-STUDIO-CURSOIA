// Salida de audio sobre Web Audio. Por ahora solo aporta el reloj: los sonidos llegan con el paso de sonido.
import type { AudioSink } from './reproductor';

export interface WebAudioSink extends AudioSink {
  /** El navegador exige un gesto del usuario para arrancar el audio: se llama desde el clic en Play. */
  resume(): Promise<void>;
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
    playNote() {},
    playClick() {},
    cancelPending() {},
  };
}
