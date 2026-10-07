// Sonidos de batería sintetizados con Web Audio, uno distinto por pieza (RF-21.2).
// Es un sonido provisorio: el kit de samples reales llega con el servidor (RF-21.1).
// Cada voz recibe el contexto y el destino, así se puede renderizar tanto en vivo como sin conexión.
import type { Piece } from './partitura';

/** Nodos que arrancó una voz, para poder cortarlos al detener. */
export type Voice = AudioScheduledSourceNode[];

let noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>();

function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  let buffer = noiseCache.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseCache.set(ctx, buffer);
  }
  return buffer;
}

/** Envolvente: ataque corto y caída exponencial hasta el silencio. */
function envelope(ctx: BaseAudioContext, out: AudioNode, time: number, peak: number, decay: number): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(Math.max(peak, 0.0002), time + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, time + decay);
  g.connect(out);
  return g;
}

function noise(ctx: BaseAudioContext, time: number, decay: number, filter: BiquadFilterNode, voice: Voice) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.connect(filter);
  src.start(time, Math.random() * 0.5);
  src.stop(time + decay + 0.02);
  voice.push(src);
}

function filter(ctx: BaseAudioContext, type: BiquadFilterType, frequency: number, q = 0.7): BiquadFilterNode {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = frequency;
  f.Q.value = q;
  return f;
}

function tone(
  ctx: BaseAudioContext,
  out: AudioNode,
  voice: Voice,
  time: number,
  type: OscillatorType,
  from: number,
  to: number,
  sweep: number,
  decay: number,
  peak: number,
) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, time);
  osc.frequency.exponentialRampToValueAtTime(to, time + sweep);
  osc.connect(envelope(ctx, out, time, peak, decay));
  osc.start(time);
  osc.stop(time + decay + 0.02);
  voice.push(osc);
}

/** Un platillo: ruido filtrado más parciales metálicos inarmónicos. */
function cymbal(
  ctx: BaseAudioContext,
  out: AudioNode,
  voice: Voice,
  time: number,
  gain: number,
  { high, decay, level, partials }: { high: number; decay: number; level: number; partials: number[] },
) {
  const f = filter(ctx, 'highpass', high);
  f.connect(envelope(ctx, out, time, gain * level, decay));
  noise(ctx, time, decay, f, voice);
  for (const freq of partials) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;
    const band = filter(ctx, 'bandpass', 9000, 1.2);
    osc.connect(band);
    band.connect(envelope(ctx, out, time, gain * level * 0.12, decay * 0.8));
    osc.start(time);
    osc.stop(time + decay + 0.02);
    voice.push(osc);
  }
}

const METAL = [205, 307, 411, 523, 617, 811];

/** Programa el sonido de `piece` en `time` (s del reloj del contexto). `gain` 1 es el nivel de referencia. */
export function playPiece(ctx: BaseAudioContext, out: AudioNode, piece: Piece, time: number, gain = 1): Voice {
  const voice: Voice = [];
  switch (piece) {
    case 'kick':
      tone(ctx, out, voice, time, 'sine', 150, 42, 0.11, 0.42, gain * 0.82);
      tone(ctx, out, voice, time, 'triangle', 90, 50, 0.05, 0.12, gain * 0.25);
      break;
    case 'snare': {
      const f = filter(ctx, 'highpass', 1400);
      f.connect(envelope(ctx, out, time, gain * 0.55, 0.2));
      noise(ctx, time, 0.2, f, voice);
      tone(ctx, out, voice, time, 'triangle', 220, 160, 0.06, 0.11, gain * 0.4);
      break;
    }
    case 'hihat-closed': {
      const f = filter(ctx, 'highpass', 7500);
      f.connect(envelope(ctx, out, time, gain * 0.38, 0.05));
      noise(ctx, time, 0.05, f, voice);
      break;
    }
    case 'hihat-pedal': {
      const f = filter(ctx, 'highpass', 5500);
      f.connect(envelope(ctx, out, time, gain * 0.3, 0.075));
      noise(ctx, time, 0.075, f, voice);
      break;
    }
    case 'hihat-open': {
      const f = filter(ctx, 'highpass', 7000);
      f.connect(envelope(ctx, out, time, gain * 0.36, 0.45));
      noise(ctx, time, 0.45, f, voice);
      break;
    }
    case 'tom-high':
      tone(ctx, out, voice, time, 'sine', 260, 170, 0.18, 0.4, gain * 0.9);
      break;
    case 'tom-mid':
      tone(ctx, out, voice, time, 'sine', 190, 120, 0.2, 0.5, gain * 0.9);
      break;
    case 'tom-floor':
      tone(ctx, out, voice, time, 'sine', 135, 80, 0.24, 0.65, gain * 0.95);
      break;
    case 'crash':
      cymbal(ctx, out, voice, time, gain, { high: 3500, decay: 1.5, level: 0.42, partials: METAL });
      break;
    case 'china':
      cymbal(ctx, out, voice, time, gain, { high: 4500, decay: 0.95, level: 0.4, partials: METAL.map((p) => p * 1.18) });
      break;
    case 'splash':
      cymbal(ctx, out, voice, time, gain, { high: 5500, decay: 0.55, level: 0.36, partials: METAL.map((p) => p * 1.35) });
      break;
    case 'ride':
      cymbal(ctx, out, voice, time, gain, { high: 6500, decay: 0.8, level: 0.2, partials: METAL.slice(0, 4) });
      tone(ctx, out, voice, time, 'sine', 3100, 3000, 0.1, 0.25, gain * 0.05);
      break;
    case 'ride-bell':
      for (const [freq, level] of [[760, 0.3], [1180, 0.22], [2050, 0.18]] as const) {
        tone(ctx, out, voice, time, 'sine', freq, freq * 0.99, 0.3, 0.9, gain * level);
      }
      cymbal(ctx, out, voice, time, gain, { high: 7000, decay: 0.5, level: 0.1, partials: [] });
      break;
  }
  return voice;
}
